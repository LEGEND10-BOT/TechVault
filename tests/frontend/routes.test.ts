/*
 * G1 route tests: the honest placeholder contract (explicit "later phase"
 * / "coming with data" states — never fake content) and the fully-real
 * Settings shell (vertical internal navigation per the owner's reference;
 * Appearance functional incl. zoom controls; Providers R-023 placeholder
 * per SEC-16; About identity).
 */
import { render, screen, waitFor, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchSettings = vi.hoisted(() => vi.fn());
const saveSettings = vi.hoisted(() => vi.fn());
const fetchAppInfo = vi.hoisted(() => vi.fn());
const applyZoom = vi.hoisted(() => vi.fn(async () => true));

// Mock with the same "#lib" specifiers the Svelte components import —
// vitest's mock registry must match the module as the importer resolves it.
vi.mock("#lib/services/settings", () => ({ fetchSettings, saveSettings }));
vi.mock("#lib/services/app", () => ({ fetchAppInfo }));
vi.mock("#lib/services/zoom", () => ({ applyZoom }));
vi.mock("$app/state", () => ({
	page: {
		get url() {
			return new URL("http://tauri.localhost/settings");
		}
	}
}));

import DashboardPage from "../../src/routes/+page.svelte";
import SettingsPage from "../../src/routes/settings/+page.svelte";
import { theme } from "../../src/lib/stores/theme.svelte";
import { zoom } from "../../src/lib/stores/zoom.svelte";

function okSettings(appearance: Record<string, unknown> = {}) {
	return {
		ok: true as const,
		data: { appearance: { theme: "system", zoom: 1, ...appearance } }
	};
}

beforeEach(() => {
	fetchSettings.mockReset();
	saveSettings.mockReset();
	fetchAppInfo.mockReset();
	applyZoom.mockClear();
	applyZoom.mockResolvedValue(true);
	document.documentElement.classList.remove("light");
	zoom.dispose();
	theme.initialized = false;
});

describe("Dashboard route", () => {
	it("renders an explicit coming-with-data placeholder (no fake content)", () => {
		render(DashboardPage);
		expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).not.toBeNull();
		expect(screen.getByText(/fills in as your library grows/i)).not.toBeNull();
		expect(screen.getByText(/coming with data/i)).not.toBeNull();
	});
});

describe("Settings route", () => {
	it("renders the three G1 sections as vertical internal navigation", async () => {
		fetchSettings.mockResolvedValue(okSettings());
		render(SettingsPage);
		const nav = screen.getByRole("navigation", { name: /settings sections/i });
		for (const label of ["Appearance", "Providers", "About"]) {
			expect(within(nav).getByRole("button", { name: new RegExp(`^${label}$`) })).not.toBeNull();
		}
		// The active section is marked.
		expect(
			within(nav)
				.getByRole("button", { name: /^Appearance$/ })
				.getAttribute("aria-current")
		).toBe("true");
	});

	it("the Providers section renders the R-023 disabled placeholder (SEC-16)", async () => {
		fetchSettings.mockResolvedValue(okSettings());
		render(SettingsPage);
		await userEvent.click(screen.getByRole("button", { name: /^Providers$/ }));
		expect(screen.getByText(/not configured — disabled/i)).not.toBeNull();
		expect(screen.getByText(/no API keys are stored or accepted/i)).not.toBeNull();
	});

	it("the About section shows the application identity from app_info", async () => {
		fetchSettings.mockResolvedValue(okSettings());
		fetchAppInfo.mockResolvedValue({
			ok: true as const,
			data: {
				app_name: "TechVault",
				version: "0.1.0",
				tauri_version: "2.12.5",
				os: "windows",
				arch: "x86_64",
				build_profile: "release",
				data_dir: "C:\\AppData\\com.techvault.app"
			}
		});
		render(SettingsPage);
		await userEvent.click(screen.getByRole("button", { name: /^About$/ }));
		await waitFor(() => {
			expect(screen.getByText("TechVault")).not.toBeNull();
		});
		expect(screen.getByText("0.1.0")).not.toBeNull();
		expect(screen.getByText(/techvault\.log/i)).not.toBeNull();
	});

	it("the About section shows a typed error state when app_info fails", async () => {
		fetchSettings.mockResolvedValue(okSettings());
		fetchAppInfo.mockResolvedValue({
			ok: false as const,
			error: { code: "internal.ipc_transport_failure", category: "internal", message: "IPC failed." }
		});
		render(SettingsPage);
		await userEvent.click(screen.getByRole("button", { name: /^About$/ }));
		await waitFor(() => {
			expect(screen.getByRole("alert")).not.toBeNull();
		});
		expect(screen.getByRole("button", { name: /retry/i })).not.toBeNull();
	});

	it("Appearance exposes the segmented theme control with the persisted selection", async () => {
		fetchSettings.mockResolvedValue(okSettings({ theme: "dark" }));
		await theme.init();
		render(SettingsPage);
		for (const label of ["Light", "Dark", "System"]) {
			expect(screen.getByRole("radio", { name: new RegExp(`^${label}$`) })).not.toBeNull();
		}
		const dark = screen.getByRole("radio", { name: /^Dark$/ }) as HTMLInputElement;
		expect(dark.checked).toBe(true);
	});

	it("choosing a theme persists through settings_set", async () => {
		fetchSettings.mockResolvedValue(okSettings({ theme: "dark" }));
		saveSettings.mockResolvedValue(okSettings({ theme: "light" }));
		await theme.init();
		render(SettingsPage);

		const light = screen.getByRole("radio", { name: /^Light$/ });
		await userEvent.click(light);
		await waitFor(() => {
			expect(saveSettings).toHaveBeenCalledWith(
				expect.objectContaining({ appearance: expect.objectContaining({ theme: "light" }) })
			);
		});
	});

	it("the Appearance section shows bounded zoom controls", async () => {
		fetchSettings.mockResolvedValue(okSettings({ zoom: 1 }));
		saveSettings.mockResolvedValue(okSettings({ zoom: 1.1 }));
		await zoom.init();
		render(SettingsPage);

		expect(screen.getByRole("button", { name: /zoom out/i })).not.toBeNull();
		expect(screen.getByRole("button", { name: /zoom in/i })).not.toBeNull();
		expect(screen.getByRole("button", { name: /reset zoom/i })).not.toBeNull();
		expect(screen.getByText("100%")).not.toBeNull();
		// At 100% (inside the 50–200% bounds): zoom-out/in are available;
		// only Reset is bounded off at the default.
		expect((screen.getByRole("button", { name: /zoom out/i }) as HTMLButtonElement).disabled).toBe(
			false
		);
		expect((screen.getByRole("button", { name: /zoom in/i }) as HTMLButtonElement).disabled).toBe(
			false
		);
		expect((screen.getByRole("button", { name: /reset zoom/i }) as HTMLButtonElement).disabled).toBe(
			true
		);

		// Manual control applies and persists.
		await userEvent.click(screen.getByRole("button", { name: /zoom in/i }));
		await waitFor(() => {
			expect(saveSettings).toHaveBeenCalledWith(
				expect.objectContaining({ appearance: expect.objectContaining({ zoom: 1.1 }) })
			);
		});
		expect(screen.getByText("110%")).not.toBeNull();
	});

	it("the Appearance section documents the zoom keyboard shortcuts", async () => {
		fetchSettings.mockResolvedValue(okSettings());
		render(SettingsPage);
		expect(screen.getByText(/ctrl \+ plus \/ ctrl \+ minus \/ ctrl \+ 0/i)).not.toBeNull();
	});
});
