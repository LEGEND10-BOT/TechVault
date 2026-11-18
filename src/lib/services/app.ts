import { invokeEnvelope } from "./ipc";

import type { IpcEnvelope } from "#lib/types/ipc";
import type { AppInfo, PingRequest, PingResponse } from "#lib/types/app";

/** `app_info` — static application identity for the smoke view. */
export function fetchAppInfo(): Promise<IpcEnvelope<AppInfo>> {
	return invokeEnvelope<AppInfo>("app_info");
}

/** `ping` — typed request/response round-trip used by the M0 smoke view. */
export function ping(req: PingRequest): Promise<IpcEnvelope<PingResponse>> {
	return invokeEnvelope<PingResponse>("ping", { req });
}

/**
 * Deliberately oversized `ping` payload used by the smoke view's error-path
 * check: exercises the typed validation error through the real IPC boundary.
 */
export function pingErrorProbe(): Promise<IpcEnvelope<PingResponse>> {
	return ping({ message: "x".repeat(1001) });
}
