/*
 * Typed IPC envelope — frontend mirror of `src-tauri/src/ipc.rs`.
 *
 * Wire contract (PHASE_2_ARCHITECTURE.md §2.4):
 *   { ok: true,  data: T }
 *   { ok: false, error: { code, category, message, details? } }
 *
 * The exact serialized shape is pinned by the canonical fixtures in
 * `tests/fixtures/` and asserted by contract tests on both sides
 * (tests/frontend/ipc-contract.test.ts and the Rust unit tests).
 */

export type ErrorCategory =
	| "validation"
	| "network"
	| "authentication_required"
	| "platform_restriction"
	| "media_decode"
	| "transcription"
	| "provider"
	| "database"
	| "storage"
	| "verification"
	| "internal";

export interface AppError {
	code: string;
	category: ErrorCategory;
	message: string;
	details?: unknown;
}

export type IpcEnvelope<T> =
	| { ok: true; data: T }
	| { ok: false; error: AppError };

/** Narrow an unknown wire value to an AppError (structural check only). */
export function isAppError(value: unknown): value is AppError {
	if (typeof value !== "object" || value === null) return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.code === "string" &&
		typeof v.category === "string" &&
		typeof v.message === "string"
	);
}

/**
 * Narrow an unknown wire value to an IpcEnvelope.
 * `T` is unconstrained here (runtime values arrive untyped); callers combine
 * this with per-command result types.
 */
export function isIpcEnvelope<T>(value: unknown): value is IpcEnvelope<T> {
	if (typeof value !== "object" || value === null) return false;
	const v = value as Record<string, unknown>;
	if (typeof v.ok !== "boolean") return false;
	if (v.ok === true) return "data" in v;
	return isAppError(v.error);
}
