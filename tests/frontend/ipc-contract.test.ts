/*
 * TEST-01 (frontend half) — IPC envelope contract test.
 *
 * The canonical fixtures in tests/fixtures/ pin the exact serialized wire
 * shape of the typed IPC envelope. The Rust unit tests assert that the serde
 * structs serialize to / deserialize from these same files byte-for-value;
 * this suite asserts the TS types narrow them correctly.
 *
 * Mirrors: src/lib/types/ipc.ts  <->  src-tauri/src/ipc.rs
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
	isAppError,
	isIpcEnvelope,
	type AppError,
	type IpcEnvelope
} from "../../src/lib/types/ipc";
import type { PingRequest, PingResponse as PingResponseData } from "../../src/lib/types/app";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(here, "../fixtures");

function readFixture(name: string): unknown {
	return JSON.parse(readFileSync(resolve(fixturesDir, name), "utf8"));
}

describe("IPC envelope contract (success shape)", () => {
	const fixture = readFixture("ipc-envelope-success.json");

	it("narrows to a successful envelope with the pinned data", () => {
		expect(isIpcEnvelope<PingResponseData>(fixture)).toBe(true);
		const envelope = fixture as IpcEnvelope<PingResponseData>;
		expect(envelope.ok).toBe(true);
		if (envelope.ok) {
			expect(envelope.data.message).toBe("pong");
			expect(envelope.data.echoed).toBe("hello");
			expect(envelope.data.server_time_unix_ms).toBe(1763078400000);
		}
	});

	it("keeps the envelope shape identical to the Rust wire contract", () => {
		// Exact key sets — no additional or missing members on the wire.
		expect(Object.keys(fixture as object).sort()).toEqual(["data", "ok"]);
	});
});

describe("IPC envelope contract (error shape)", () => {
	const fixture = readFixture("ipc-envelope-error.json");

	it("narrows to a failed envelope with a typed error", () => {
		expect(isIpcEnvelope<PingResponseData>(fixture)).toBe(true);
		const envelope = fixture as IpcEnvelope<PingResponseData>;
		expect(envelope.ok).toBe(false);
		if (!envelope.ok) {
			const err: AppError = envelope.error;
			expect(err.code).toBe("validation.message_too_long");
			expect(err.category).toBe("validation");
			expect(err.message).toContain("1000");
			expect("details" in err).toBe(false);
		}
	});

	it("rejects an error object that lacks the category field", () => {
		const malformed = {
			ok: false,
			error: { code: "validation.message_too_long", message: "no category" }
		};
		expect(isIpcEnvelope(malformed)).toBe(false);
		expect(isAppError(malformed.error)).toBe(false);
	});
});

describe("IPC envelope narrowing rejects malformed payloads", () => {
	const cases: unknown[] = [
		null,
		undefined,
		42,
		"string",
		{},
		{ ok: "yes", data: {} },
		{ ok: true },
		{ ok: false },
		{ ok: false, error: null },
		{ data: {} }
	];

	it.each(cases.map((c) => [JSON.stringify(c) ?? String(c), c]))(
		"rejects %s",
		(_label, value) => {
			expect(isIpcEnvelope(value)).toBe(false);
		}
	);
});

describe("IPC request contract (TS -> Rust direction)", () => {
	it("matches the PingRequest shape the Rust command validates", () => {
		const fixture = readFixture("ipc-request-ping.json") as PingRequest;
		expect(typeof fixture).toBe("object");
		expect(typeof fixture.message).toBe("string");
	});
});
