/*
 * The only place that talks to the Tauri runtime (PHASE_2_ARCHITECTURE.md §2.3:
 * services/ = typed frontend API over invoke(); the only place that calls Tauri).
 *
 * Every outcome is normalized into the typed IPC envelope so callers always
 * receive `{ ok: true, data } | { ok: false, error }` — never a thrown error
 * from the normal command path.
 */
import { invoke } from "@tauri-apps/api/core";

import { isIpcEnvelope, type AppError, type IpcEnvelope } from "#lib/types/ipc";

/**
 * Invoke a Tauri command and normalize the result into the typed envelope.
 *
 * - A well-formed response from the Rust side passes through unchanged.
 * - A malformed payload becomes an `internal` envelope error (contract breach).
 * - A transport-level rejection (unexpected, outside the envelope protocol)
 *   becomes an `internal` envelope error as well.
 */
export async function invokeEnvelope<T>(
	command: string,
	args?: Record<string, unknown>
): Promise<IpcEnvelope<T>> {
	try {
		const raw: unknown = await invoke(command, args);
		if (isIpcEnvelope<T>(raw)) {
			return raw;
		}
		return {
			ok: false,
			error: {
				code: "internal.ipc_malformed_response",
				category: "internal",
				message: `Command "${command}" returned a malformed IPC envelope.`
			}
		};
	} catch (cause) {
		return {
			ok: false,
			error: {
				code: "internal.ipc_transport_failure",
				category: "internal",
				message: `Command "${command}" failed at the IPC transport layer.`,
				details: transportDetail(cause)
			}
		};
	}
}

function transportDetail(cause: unknown): string {
	if (cause instanceof Error) return cause.message;
	return String(cause);
}

export type { AppError, IpcEnvelope };
