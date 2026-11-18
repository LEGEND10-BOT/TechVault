/*
 * Settings service — typed invoke wrappers for the `settings_get`/`settings_set`
 * command family (G1 Appearance category; later gates add categories through
 * the same typed snapshot).
 */
import { invokeEnvelope } from "./ipc";

import type { IpcEnvelope } from "#lib/types/ipc";
import type { AppSettings } from "#lib/types/settings";

/** `settings_get` — read the typed settings snapshot. */
export function fetchSettings(): Promise<IpcEnvelope<AppSettings>> {
	return invokeEnvelope<AppSettings>("settings_get");
}

/** `settings_set` — validate + atomically persist the settings snapshot. */
export function saveSettings(
	settings: AppSettings
): Promise<IpcEnvelope<AppSettings>> {
	return invokeEnvelope<AppSettings>("settings_set", { settings });
}
