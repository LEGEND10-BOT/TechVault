/*
 * Theme store (UI state only — `src/lib/stores/` per architecture §2.2).
 * Reads/writes the appearance snapshot through the centralized settings
 * store (which owns the snapshot; no stale-snapshot overwrites).
 *
 * Behavior per PHASE_2_M1_UI_SPECIFICATION.md §1 (G1) + the owner's
 * correction directive (neutral dark theme, preserved light/system):
 * - dark is the primary/default direction; `prefers-color-scheme` is
 *   respected on first run; the explicit choice persists across restarts.
 * - The `light` class on <html> is the only theme mechanism (A-6 rule:
 *   no inline styles; tokens flip via CSS custom properties in app.css).
 */
import { settingsStore } from "#lib/stores/settings.svelte";

import type { ThemePreference } from "#lib/types/settings";

export type ResolvedTheme = "dark" | "light";

const LIGHT_CLASS = "light"; // html.light → light tokens (app.css)
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";

function systemPrefersDark(): boolean | null {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
		return null;
	}
	try {
		return window.matchMedia(SYSTEM_QUERY).matches;
	} catch {
		return null;
	}
}

function applyTheme(resolved: ResolvedTheme): void {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle(LIGHT_CLASS, resolved === "light");
}

function resolveTheme(
	preference: ThemePreference,
	systemDark: boolean | null
): ResolvedTheme {
	if (preference === "dark") return "dark";
	if (preference === "light") return "light";
	// System preference; when the OS gives no signal, fall back to the
	// approved primary direction (dark).
	return systemDark === false ? "light" : "dark";
}

class ThemeStore {
	/** The persisted/user-selected preference (UI state). */
	preference: ThemePreference = $state("system");
	/** The theme actually applied to the document. */
	resolved: ResolvedTheme = $state("dark");
	/** True once the persisted preference has been loaded. */
	initialized = $state(false);

	#mediaQuery: MediaQueryList | null = null;
	#onSystemChange: (() => void) | null = null;

	/**
	 * Load the persisted snapshot through the settings store (or system on
	 * first run), apply it, and track system scheme changes while
	 * `preference` is `system`. Guarded by the public `initialized` flag
	 * (tests reset it to re-run init).
	 */
	async init(): Promise<void> {
		if (this.initialized) return;
		this.initialized = true;

		await settingsStore.load();
		this.preference = settingsStore.snapshot.appearance.theme;
		this.#installSystemListener();
		this.#resolveAndApply();
	}

	/**
	 * Change the preference, apply it immediately, and persist it through
	 * the settings store. Returns false when persistence failed (theme
	 * stays applied).
	 */
	async setPreference(preference: ThemePreference): Promise<boolean> {
		this.preference = preference;
		this.#resolveAndApply();
		this.#installSystemListener();
		return settingsStore.updateAppearance({ theme: preference });
	}

	#resolveAndApply(): void {
		this.resolved = resolveTheme(this.preference, systemPrefersDark());
		applyTheme(this.resolved);
	}

	#installSystemListener(): void {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return;
		}
		if (this.#mediaQuery === null) {
			try {
				this.#mediaQuery = window.matchMedia(SYSTEM_QUERY);
			} catch {
				return;
			}
		}
		if (this.#onSystemChange === null && this.#mediaQuery) {
			this.#onSystemChange = () => {
				if (this.preference === "system") this.#resolveAndApply();
			};
			this.#mediaQuery.addEventListener("change", this.#onSystemChange);
		}
	}
}

/** Singleton theme store used by the shell and Settings UI. */
export const theme = new ThemeStore();

// Exported for unit tests only.
export const __testing = { resolveTheme, applyTheme, LIGHT_CLASS };
