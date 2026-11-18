/*
 * Centralized settings store (UI state only — architecture §2.2). The single
 * owner of the loaded settings snapshot; theme and zoom read and write
 * through it so concurrent appearance updates can never overwrite each
 * other with stale snapshots (both go through `updateAppearance`).
 */
import { fetchSettings, saveSettings } from "#lib/services/settings";

import type { AppearanceSettings, AppSettings } from "#lib/types/settings";
import { DEFAULT_SETTINGS } from "#lib/types/settings";

class SettingsStore {
	/** The last-known persisted snapshot (defaults until the first load). */
	snapshot: AppSettings = $state(DEFAULT_SETTINGS);
	/** True once the persisted snapshot has been loaded. */
	loaded = $state(false);

	/**
	 * Load the persisted snapshot (or defaults on failure — a preference
	 * file must never block or crash the shell).
	 */
	async load(): Promise<void> {
		const envelope = await fetchSettings();
		if (envelope.ok) {
			this.snapshot = envelope.data;
		}
		// On a failed read the store keeps defaults (first-run behavior) —
		// never crash or block the shell over a preference file.
		this.loaded = true;
	}

	/**
	 * Merge a partial appearance patch into the snapshot, apply it locally
	 * immediately, and persist the full snapshot. Returns false when
	 * persistence failed (the local application stays; the caller decides
	 * how to surface the failure).
	 */
	async updateAppearance(patch: Partial<AppearanceSettings>): Promise<boolean> {
		this.snapshot = {
			...this.snapshot,
			appearance: { ...this.snapshot.appearance, ...patch }
		};
		const envelope = await saveSettings(this.snapshot);
		return envelope.ok;
	}
}

/** Singleton settings store used by the appearance stores and Settings UI. */
export const settingsStore = new SettingsStore();
