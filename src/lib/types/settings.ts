/*
 * Typed mirrors of the Rust settings contracts (`src-tauri/src/domain/settings.rs`).
 * Wire shapes are asserted by the settings contract tests (frontend suite +
 * Rust unit tests on the same JSON).
 */

/** Zoom bounds — mirrored from the Rust constants (`domain/settings.rs`). */
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2.0;
export const DEFAULT_ZOOM = 1.0;

/** Clamp a zoom value into the approved bounds (mirrors `clamp_zoom`). */
export function clampZoom(value: number): number {
	if (Number.isNaN(value)) return MIN_ZOOM;
	return Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)) * 100) / 100;
}

/** User-selectable theme preference (mirrors `ThemePreference`). */
export type ThemePreference = "system" | "dark" | "light";

/** Appearance category settings (mirrors `AppearanceSettings`). */
export interface AppearanceSettings {
	theme: ThemePreference;
	/** UI zoom scale factor; clamped to [MIN_ZOOM, MAX_ZOOM]. */
	zoom: number;
}

/** Root typed settings snapshot (mirrors `AppSettings`). */
export interface AppSettings {
	appearance: AppearanceSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
	appearance: { theme: "system", zoom: DEFAULT_ZOOM }
};
