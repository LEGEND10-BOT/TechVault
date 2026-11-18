/*
 * Zoom store tests (owner G1 correction C): keyboard shortcuts (including
 * correct handling with focused text inputs — typing is never intercepted),
 * bounds clamping, reset, manual controls, WebView application, and
 * persistence through the centralized settings store.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const applyZoom = vi.hoisted(() => vi.fn(async () => true));
const saveSettings = vi.hoisted(() => vi.fn());
const fetchSettings = vi.hoisted(() => vi.fn());

vi.mock("#lib/services/zoom", () => ({ applyZoom }));
vi.mock("#lib/services/settings", () => ({ fetchSettings, saveSettings }));

import { settingsStore } from "../../src/lib/stores/settings.svelte";
import { zoom } from "../../src/lib/stores/zoom.svelte";
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "../../src/lib/types/settings";

function okSettings(appearance: Record<string, unknown> = {}) {
	return {
		ok: true as const,
		data: { appearance: { theme: "system", zoom: 1, ...appearance } }
	};
}

/** Dispatch a Ctrl+key keyboard event on the given element. */
function ctrlKey(key: string, target: Element | null = document.body): KeyboardEvent {
	const event = new KeyboardEvent("keydown", {
		key,
		ctrlKey: true,
		bubbles: true,
		cancelable: true
	});
	(target ?? document.body).dispatchEvent(event);
	return event;
}

beforeEach(() => {
	applyZoom.mockClear();
	applyZoom.mockResolvedValue(true);
	saveSettings.mockReset();
	saveSettings.mockResolvedValue(okSettings());
	fetchSettings.mockReset();
	zoom.dispose();
	document.body.innerHTML = "";
});

describe("zoom bounds and manual controls", () => {
	it("init applies the persisted zoom level through the WebView API", async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: 1.25 }));
		settingsStore.loaded = false;
		await zoom.init();
		expect(zoom.zoom).toBe(1.25);
		expect(applyZoom).toHaveBeenCalledWith(1.25);
	});

	it("zoomIn steps by 0.1 and never exceeds the maximum", async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: MAX_ZOOM }));
		settingsStore.loaded = false;
		await zoom.init();
		await zoom.zoomIn();
		expect(zoom.zoom).toBe(MAX_ZOOM);
		expect(saveSettings).not.toHaveBeenCalled(); // no change → no write

		fetchSettings.mockResolvedValue(okSettings({ zoom: 1.9 }));
		settingsStore.loaded = false;
		await zoom.init();
		await zoom.zoomIn();
		expect(zoom.zoom).toBe(MAX_ZOOM);
	});

	it("zoomOut steps down and never goes below the minimum", async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: MIN_ZOOM }));
		settingsStore.loaded = false;
		await zoom.init();
		await zoom.zoomOut();
		expect(zoom.zoom).toBe(MIN_ZOOM);

		fetchSettings.mockResolvedValue(okSettings({ zoom: 0.55 }));
		settingsStore.loaded = false;
		await zoom.init();
		await zoom.zoomOut();
		expect(zoom.zoom).toBe(MIN_ZOOM);
	});

	it("reset returns to 100 percent and persists", async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: 1.5 }));
		settingsStore.loaded = false;
		saveSettings.mockResolvedValue(okSettings({ zoom: 1 }));
		await zoom.init();
		await zoom.reset();
		expect(zoom.zoom).toBe(DEFAULT_ZOOM);
		expect(applyZoom).toHaveBeenLastCalledWith(DEFAULT_ZOOM);
		expect(saveSettings).toHaveBeenCalledWith(
			expect.objectContaining({ appearance: expect.objectContaining({ zoom: DEFAULT_ZOOM }) })
		);
	});

	it("records a failed WebView application instead of throwing", async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: 1 }));
		settingsStore.loaded = false;
		applyZoom.mockResolvedValue(false);
		await zoom.init();
		expect(zoom.lastApplyFailed).toBe(true);
		// A later successful apply clears the flag.
		applyZoom.mockResolvedValue(true);
		await zoom.zoomIn();
		expect(zoom.lastApplyFailed).toBe(false);
	});
});

describe("zoom keyboard shortcuts", () => {
	beforeEach(async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: 1 }));
		settingsStore.loaded = false;
		saveSettings.mockResolvedValue(okSettings({ zoom: 1 }));
		await zoom.init();
	});

	it("Ctrl+= zooms in (unshifted plus key)", async () => {
		ctrlKey("=");
		await vi.waitFor(() => expect(zoom.zoom).toBe(1.1));
	});

	it("Ctrl++ (shifted plus) zooms in", async () => {
		ctrlKey("+");
		await vi.waitFor(() => expect(zoom.zoom).toBe(1.1));
	});

	it("Ctrl+- zooms out", async () => {
		ctrlKey("-");
		await vi.waitFor(() => expect(zoom.zoom).toBe(0.9));
	});

	it("Ctrl+0 resets to 100 percent", async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: 1.5 }));
		settingsStore.loaded = false;
		await zoom.init();
		ctrlKey("0");
		await vi.waitFor(() => expect(zoom.zoom).toBe(1));
	});

	it("shortcuts work while a text input is focused and never touch normal typing", async () => {
		document.body.innerHTML = `<input id="probe" type="text" />`;
		const input = document.getElementById("probe") as HTMLInputElement;
		input.focus();

		// Typing characters and editing shortcuts are NOT intercepted.
		const typed = new KeyboardEvent("keydown", { key: "0", bubbles: true, cancelable: true });
		input.dispatchEvent(typed);
		expect(typed.defaultPrevented).toBe(false);
		const ctrlS = new KeyboardEvent("keydown", {
			key: "s",
			ctrlKey: true,
			bubbles: true,
			cancelable: true
		});
		input.dispatchEvent(ctrlS);
		expect(ctrlS.defaultPrevented).toBe(false);

		// The zoom shortcut still fires globally (with the input focused).
		ctrlKey("=", input);
		await vi.waitFor(() => expect(zoom.zoom).toBe(1.1));
	});

	it("zoom shortcuts are clamped at the bounds", async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: MAX_ZOOM }));
		settingsStore.loaded = false;
		await zoom.init();
		ctrlKey("=");
		await vi.waitFor(() => expect(saveSettings).not.toHaveBeenCalled());
		expect(zoom.zoom).toBe(MAX_ZOOM);
	});

	it("shift+Ctrl+- (underscore key) also zooms out; non-Ctrl combos are ignored", async () => {
		const shifted = new KeyboardEvent("keydown", {
			key: "_",
			ctrlKey: true,
			shiftKey: true,
			bubbles: true,
			cancelable: true
		});
		document.body.dispatchEvent(shifted);
		await vi.waitFor(() => expect(zoom.zoom).toBe(0.9));

		const noCtrl = new KeyboardEvent("keydown", { key: "=", bubbles: true, cancelable: true });
		document.body.dispatchEvent(noCtrl);
		expect(noCtrl.defaultPrevented).toBe(false);
		expect(zoom.zoom).toBe(0.9); // unchanged
	});
});
