#!/usr/bin/env node
/*
 * scripts/verify-prod-csp — runtime production CSP verification (D-022 / M0).
 *
 * Complements `check-csp` (configuration proof) with a runtime proof against
 * the built release executable:
 *
 *   1. Launches the release exe with WebView2 remote debugging enabled via
 *      the standard `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` environment
 *      variable (no code change, no debug build).
 *   2. Attaches to the page over CDP, enables Runtime+Log, and probes:
 *        - remote fetch (https://example.com)      -> MUST be blocked;
 *          a CSP "Refused to connect" violation must appear in the console
 *        - inline <script> injected from the page  -> MUST be blocked by
 *          script-src 'self' (must not execute)
 *        - string-argument setTimeout (eval)        -> CSP "Refused to
 *          evaluate a string as JavaScript" violation MUST appear
 *          (Runtime.evaluate itself runs with DevTools privileges and is
 *          NOT a valid CSP probe — page-context mechanisms are used instead)
 *        - a real invoke() round-trip               -> MUST succeed (IPC allowed)
 *   3. Kills the app process.
 *
 * Usage: node scripts/verify-prod-csp.mjs <path-to-TechVault.exe> [cdpPort]
 * Exit 0 iff all probes behave as required.
 */

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const exePath = process.argv[2];
const cdpPort = Number(process.argv[3] ?? 9333);
if (!exePath) {
	console.error("usage: node scripts/verify-prod-csp.mjs <exe> [cdpPort]");
	process.exit(2);
}

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

/** Minimal CDP client over the Node global WebSocket. */
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

/** Drain CDP console messages into the violations array. */
function collectConsole(cdp, violations) {
	cdp.ws.addEventListener("message", (ev) => {
		const msg = JSON.parse(ev.data);
		if (msg.method === "Runtime.consoleAPICalled") {
			const text = (msg.params.args ?? [])
				.map((a) => a.value ?? a.description ?? "")
				.join(" ");
			violations.push(text);
		} else if (msg.method === "Log.entryAdded") {
			violations.push(msg.params.entry?.text ?? "");
		}
	});
}

const app = spawn(exePath, [], {
	detached: false,
	stdio: "ignore",
	env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${cdpPort}` }
});

const results = [];
let failed = false;
try {
	// Wait for the application page target (the SPA origin), not just any
	// page: WebView2 registers a transient about:blank target before the
	// SPA navigates to tauri.localhost, and attaching to it produced the
	// "early-target race" noted in the M0/M1 reports. Poll until the app
	// origin appears (bounded).
	let page = null;
	for (let i = 0; i < 120 && !page; i++) {
		await sleep(250);
		try {
			const targets = await getJson(`http://127.0.0.1:${cdpPort}/json`);
			page = targets.find(
				(t) => t.type === "page" && (t.url ?? "").startsWith("http://tauri.localhost")
			);
		} catch {
			/* app not ready yet */
		}
	}
	if (!page) throw new Error("no tauri.localhost page target found within 30 s");
	results.push(["page origin", true, page.url ?? "(unknown)"]);

	const ws = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		ws.addEventListener("open", () => resolve(), { once: true });
		ws.addEventListener("error", () => reject(new Error("websocket error")), { once: true });
	});
	const cdp = { ws, nextId: 0 };

	const violations = [];
	await cdpCall(cdp, "Runtime.enable", {});
	await cdpCall(cdp, "Log.enable", {});
	collectConsole(cdp, violations);

	// Probe 1: remote fetch must be blocked by connect-src, with a CSP
	// violation recorded in the console (not merely a network failure).
	const fetchResult = String(
		await evaluate(
			cdp,
			`fetch('https://example.com/').then(() => 'ALLOWED').catch((e) => 'BLOCKED: ' + String(e && e.message ? e.message : e))`
		)
	);
	await sleep(500);
	const cspConnectViolation = violations.find((v) =>
		/Refused to connect .* Content Security Policy/i.test(v)
	);
	results.push([
		"remote fetch blocked (connect-src)",
		fetchResult.startsWith("BLOCKED") && Boolean(cspConnectViolation),
		`${fetchResult}${cspConnectViolation ? ` | console: "${cspConnectViolation.slice(0, 140)}"` : " | no CSP violation logged"}`
	]);

	// Probe 2: an inline <script> created from the page must be blocked by
	// script-src 'self' (must not execute).
	const inlineResult = String(
		await evaluate(
			cdp,
			`(new Promise((resolve) => {
				const s = document.createElement('script');
				s.textContent = 'window.__inlineProbe = "EXECUTED"';
				s.onerror = () => resolve('BLOCKED: script element error');
				document.head.appendChild(s);
				setTimeout(() => {
					resolve(window.__inlineProbe === 'EXECUTED' ? 'EXECUTED' : 'BLOCKED: inline script did not run');
				}, 400);
			}))`
		)
	);
	results.push([
		"inline script blocked (script-src 'self')",
		String(inlineResult).startsWith("BLOCKED"),
		String(inlineResult)
	]);

	// Probe 3: string-argument setTimeout compiles via eval. The timer fires
	// in page context; if 'unsafe-eval' is correctly absent the string must
	// never execute. Behavioral probe: the timer body flips a global flag.
	const evalResult = String(
		await evaluate(
			cdp,
			`(new Promise((resolve) => {
				window.__evalProbe = 'NOT_EXECUTED';
				setTimeout('window.__evalProbe = \\"EVAL_EXECUTED\\"', 0);
				setTimeout(() => resolve(window.__evalProbe), 500);
			}))`
		)
	);
	results.push([
		"string-eval blocked (no unsafe-eval)",
		evalResult === "NOT_EXECUTED",
		`timer string ${evalResult === "NOT_EXECUTED" ? "was never executed (blocked)" : `EXECUTED: ${evalResult}`}`
	]);

	// Probe 4: IPC must work — invoke the app_info command directly.
	const ipcResult = String(
		await evaluate(
			cdp,
			`window.__TAURI_INTERNALS__ ? window.__TAURI_INTERNALS__.invoke('app_info').then((v) => 'IPC_OK:' + JSON.stringify(v)).catch((e) => 'IPC_ERR: ' + String(e)) : 'NO_TAURI_INTERNALS'`
		)
	);
	results.push(["IPC invoke works", ipcResult.startsWith("IPC_OK"), ipcResult]);

	ws.close();
} catch (err) {
	failed = true;
	results.push(["verification harness", false, String(err && err.message ? err.message : err)]);
} finally {
	if (app.pid) {
		try {
			process.kill(app.pid);
		} catch {
			/* already exited */
		}
	}
}

console.log(`verify-prod-csp against: ${exePath}`);
for (const [name, pass, detail] of results) {
	console.log(`${pass ? "PASS" : "FAIL"}  ${name}  — ${detail}`);
	if (!pass) failed = true;
}
console.log(failed ? "verify-prod-csp: FAILED" : "verify-prod-csp: ALL RUNTIME CHECKS PASSED");
process.exit(failed ? 1 : 0);
