#!/usr/bin/env node
/*
 * scripts/verify-dev-hmr — development-configuration verification (D-022 / M0).
 *
 * Run while `tauri dev` is up with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS
 * pointing CDP at <cdpPort>. Verifies:
 *   1. the dev app page is served from the dev server origin,
 *   2. the Tauri IPC works in dev (invoke app_info),
 *   3. the M0 smoke view rendered,
 *   4. an HMR update to src/app.css is received and applied live
 *      (the caller performs the actual file edit between two runs of
 *      `--probe-hmr <marker>`; phase 1 = record baseline, phase 2 = assert).
 *
 * Usage:
 *   node scripts/verify-dev-hmr.mjs <cdpPort> baseline
 *   node scripts/verify-dev-hmr.mjs <cdpPort> assert <css-marker>
 */

import { setTimeout as sleep } from "node:timers/promises";

const port = Number(process.argv[2] ?? 9334);
const mode = process.argv[3] ?? "baseline";
const marker = process.argv[4] ?? "";

async function getJson(url, timeoutMs = 3000) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, { signal: ctrl.signal });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}

function cdpCall(cdp, method, params) {
	const id = ++cdp.nextId;
	return new Promise((resolve, reject) => {
		const onMessage = (ev) => {
			const msg = JSON.parse(ev.data);
			if (msg.id === id) {
				cdp.ws.removeEventListener("message", onMessage);
				if (msg.error) reject(new Error(msg.error.message));
				else resolve(msg.result);
			}
		};
		cdp.ws.addEventListener("message", onMessage);
		cdp.ws.send(JSON.stringify({ id, method, params }));
	});
}

async function evaluate(cdp, expression) {
	const res = await cdpCall(cdp, "Runtime.evaluate", {
		expression,
		awaitPromise: true,
		returnByValue: true
	});
	return res?.result?.value;
}

let targets = null;
for (let i = 0; i < 60 && !targets; i++) {
	await sleep(500);
	try {
		targets = await getJson(`http://127.0.0.1:${port}/json`);
	} catch {
		/* not ready */
	}
}
if (!targets) {
	console.error("verify-dev-hmr: CDP endpoint did not appear");
	process.exit(2);
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
	ws.addEventListener("open", () => resolve(), { once: true });
	ws.addEventListener("error", () => reject(new Error("ws error")), { once: true });
});
const cdp = { ws, nextId: 0 };

if (mode === "baseline") {
	const origin = page.url ?? "";
	const ipc = String(
		await evaluate(
			cdp,
			`window.__TAURI_INTERNALS__ ? window.__TAURI_INTERNALS__.invoke('app_info').then((v) => 'IPC_OK:' + v.data.app_name + ':' + v.data.build_profile).catch((e) => 'IPC_ERR: ' + String(e)) : 'NO_TAURI_INTERNALS'`
		)
	);
	const rendered = await evaluate(cdp, `document.querySelector('h1')?.textContent ?? '(no h1)'`);
	const checks = await evaluate(
		cdp,
		`Array.from(document.querySelectorAll('span.rounded-card')).map((e) => e.textContent.trim()).join(',')`
	);
	console.log(JSON.stringify({ origin, ipc, rendered, checks }, null, 2));
	const ok =
		origin.includes("localhost:1420") &&
		ipc.startsWith("IPC_OK:TechVault:debug") &&
		rendered === "TechVault" &&
		checks === "OK,OK,OK";
	ws.close();
	console.log(ok ? "verify-dev-hmr baseline: PASS" : "verify-dev-hmr baseline: FAIL");
	process.exit(ok ? 0 : 1);
}

if (mode === "assert") {
	// The HMR-applied stylesheet must contain the marker rule.
	let found = false;
	for (let i = 0; i < 20 && !found; i++) {
		await sleep(500);
		found = await evaluate(
			cdp,
			`Array.from(document.styleSheets).some((s) => { try { return Array.from(s.cssRules).some((r) => r.cssText.includes('${marker}')); } catch { return false; } })`
		);
	}
	console.log(
		found
			? `verify-dev-hmr hmr-assert: PASS (marker '${marker}' applied live)`
			: `verify-dev-hmr hmr-assert: FAIL (marker '${marker}' never appeared)`
	);
	ws.close();
	process.exit(found ? 0 : 1);
}

console.error("unknown mode");
process.exit(2);
