/*
 * Zoom store (owner G1 directive): Ctrl+Plus/Ctrl+Minus/Ctrl+0 zoom,
 * manual controls, approved bounds, persistence through the centralized
 * settings store. The window keydown listener intercepts ONLY the zoom
 * combinations — normal typing, text fields, and other shortcuts are never
 * touched (checked before any handling, and handled events are explicitly
 * preventDefault-ed so the WebView never applies its own conflicting zoom).
 */
import { applyZoom } from "#lib/services/zoom";
import { settingsStore } from "#lib/stores/settings.svelte";

import {
	DEFAULT_ZOOM,
	MAX_ZOOM,
	MIN_ZOOM,
	clampZoom
} from "#lib/types/settings";

const ZOOM_STEP = 0.1;

/** Keys that zoom in (Plus requires Shift on many layouts; '=' is the unshifted key). */
const ZOOM_IN_KEYS = new Set(["+", "=", "Add"]);
/** Keys that zoom out. */
const ZOOM_OUT_KEYS = new Set(["-", "_", "Subtract"]);
/** Keys that reset zoom to 100 %. */
const ZOOM_RESET_KEYS = new Set(["0"]);

class ZoomStore {
	/** The active zoom scale factor. */
	zoom: number = $state(DEFAULT_ZOOM);
	/** True when the last apply attempt failed (surface in the Settings UI). */
	lastApplyFailed = $state(false);

	#onKeydown: ((event: KeyboardEvent) => void) | null = null;

	/**
	 * Apply the persisted zoom (loading the settings snapshot if needed) and
	 * install the keyboard shortcuts. A failed apply is recorded but never
	 * blocks startup.
	 */
	async init(): Promise<void> {
		if (!settingsStore.loaded) {
			await settingsStore.load();
		}
		this.zoom = clampZoom(settingsStore.snapshot.appearance.zoom);
		const applied = await applyZoom(this.zoom);
		this.lastApplyFailed = !applied;
		this.#installKeydown();
	}

	/** Zoom in one step (bounded). */
	async zoomIn(): Promise<void> {
		await this.#set(this.zoom + ZOOM_STEP);
	}

	/** Zoom out one step (bounded). */
	async zoomOut(): Promise<void> {
		await this.#set(this.zoom - ZOOM_STEP);
	}

	/** Reset to 100 %. */
	async reset(): Promise<void> {
		await this.#set(DEFAULT_ZOOM);
	}

	/** Set a specific zoom value (clamped), apply it, and persist it. */
	async #set(value: number): Promise<void> {
		const clamped = clampZoom(value);
		if (clamped === this.zoom) return;
		this.zoom = clamped;
		const applied = await applyZoom(this.zoom);
		this.lastApplyFailed = !applied;
		// Persist through the centralized store; a persistence failure keeps
		// the applied zoom but the caller (Settings UI) can surface it.
		await settingsStore.updateAppearance({ zoom: this.zoom });
	}

	#installKeydown(): void {
		if (typeof window === "undefined" || this.#onKeydown !== null) return;
		this.#onKeydown = (event: KeyboardEvent) => {
			// Never touch events someone else already handled, or any
			// non-Ctrl combination (typing, AltGr, Cmd+…, etc.).
			// Shift is allowed: physical "Ctrl + Plus" is Ctrl+Shift+= on
			// most layouts (the '+' is the shifted '=' key).
			if (event.defaultPrevented) return;
			if (!event.ctrlKey || event.altKey || event.metaKey) return;

			const key = event.key;
			if (ZOOM_IN_KEYS.has(key)) {
				event.preventDefault();
				void this.zoomIn();
			} else if (ZOOM_OUT_KEYS.has(key)) {
				event.preventDefault();
				void this.zoomOut();
			} else if (ZOOM_RESET_KEYS.has(key) && !event.shiftKey) {
				event.preventDefault();
				void this.reset();
			}
		};
		window.addEventListener("keydown", this.#onKeydown);
	}

	/** Remove the keyboard shortcuts (test seam; not used in production). */
	dispose(): void {
		if (this.#onKeydown !== null && typeof window !== "undefined") {
			window.removeEventListener("keydown", this.#onKeydown);
			this.#onKeydown = null;
		}
	}
}

/** Singleton zoom store used by the shell and Settings UI. */
export const zoom = new ZoomStore();

// Exported for unit tests only.
export const __zoomTesting = { ZOOM_STEP, ZOOM_IN_KEYS, ZOOM_OUT_KEYS, ZOOM_RESET_KEYS };
