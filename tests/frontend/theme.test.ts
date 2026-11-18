/*
 * G1 theme store tests: preference resolution, persistence through the
 * centralized settings store, first-run system rule, and failure behavior.
 * The settings service is mocked; DOM class application is asserted
 * against document.documentElement.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { __testing, theme } from "../../src/lib/stores/theme.svelte";
import type { AppSettings } from "../../src/lib/types/settings";

const fetchSettings = vi.hoisted(() => vi.fn());
const saveSettings = vi.hoisted(() => vi.fn());

vi.mock("#lib/services/settings", () => ({
	fetchSettings,
	saveSettings
}));

function okSettings(appearance: Partial<AppSettings["appearance"]> = {}) {
	return {
		ok: true as const,
		data: {
			appearance: { theme: "system" as const, zoom: 1, ...appearance }
		}
	};
}

beforeEach(() => {
	fetchSettings.mockReset();
	saveSettings.mockReset();
	document.documentElement.classList.remove(__testing.LIGHT_CLASS);
	// Reset the singletons between tests (documented test seams).
	theme.initialized = false;
	theme.preference = "system";
	theme.resolved = "dark";
});

describe("theme resolution", () => {
	it("resolves system preference: no OS signal falls back to the dark primary direction", () => {
		expect(__testing.resolveTheme("system", null)).toBe("dark");
	});

	it("resolves system preference: light OS scheme yields the light theme", () => {
		expect(__testing.resolveTheme("system", false)).toBe("light");
	});

	it("resolves system preference: dark OS scheme yields dark", () => {
		expect(__testing.resolveTheme("system", true)).toBe("dark");
	});

	it("explicit preferences override the system scheme", () => {
		expect(__testing.resolveTheme("dark", false)).toBe("dark");
		expect(__testing.resolveTheme("light", true)).toBe("light");
	});
});

describe("theme.init", () => {
	it("applies the persisted dark preference and stores it", async () => {
		fetchSettings.mockResolvedValue(okSettings({ theme: "dark" }));
		await theme.init();
		expect(theme.preference).toBe("dark");
		expect(theme.resolved).toBe("dark");
		expect(document.documentElement.classList.contains(__testing.LIGHT_CLASS)).toBe(false);
	});

	it("applies the persisted light preference by toggling the class", async () => {
		fetchSettings.mockResolvedValue(okSettings({ theme: "light" }));
		await theme.init();
		expect(theme.preference).toBe("light");
		expect(theme.resolved).toBe("light");
		expect(document.documentElement.classList.contains(__testing.LIGHT_CLASS)).toBe(true);
	});

	it("falls back to system on first run (no stored preference needed)", async () => {
		fetchSettings.mockResolvedValue(okSettings());
		await theme.init();
		expect(theme.preference).toBe("system");
		// jsdom matchMedia stub reports a light system scheme → light applied.
		expect(theme.resolved).toBe("light");
		expect(document.documentElement.classList.contains(__testing.LIGHT_CLASS)).toBe(true);
	});

	it("a failed settings read never crashes init and stays on system", async () => {
		fetchSettings.mockResolvedValue({
			ok: false as const,
			error: { code: "storage.settings_read_failed", category: "storage", message: "x" }
		});
		await expect(theme.init()).resolves.toBeUndefined();
		expect(theme.preference).toBe("system");
		// System scheme (jsdom stub: light) — no crash, honest first-run rule.
		expect(theme.resolved).toBe("light");
	});
});

describe("theme.setPreference", () => {
	it("applies immediately and persists through settings_set", async () => {
		fetchSettings.mockResolvedValue(okSettings());
		await theme.init();
		saveSettings.mockResolvedValue(okSettings({ theme: "light" }));

		const persisted = await theme.setPreference("light");
		expect(persisted).toBe(true);
		expect(theme.resolved).toBe("light");
		expect(document.documentElement.classList.contains(__testing.LIGHT_CLASS)).toBe(true);
		expect(saveSettings).toHaveBeenCalledWith(
			expect.objectContaining({ appearance: expect.objectContaining({ theme: "light" }) })
		);
	});

	it("keeps the chosen theme applied when persistence fails", async () => {
		fetchSettings.mockResolvedValue(okSettings());
		await theme.init();
		saveSettings.mockResolvedValue({
			ok: false as const,
			error: { code: "storage.settings_write_failed", category: "storage", message: "x" }
		});

		const persisted = await theme.setPreference("light");
		expect(persisted).toBe(false);
		// The user's choice stays visually applied — a transient IPC failure
		// must not visually revert it.
		expect(theme.resolved).toBe("light");
		expect(document.documentElement.classList.contains(__testing.LIGHT_CLASS)).toBe(true);
	});
});
