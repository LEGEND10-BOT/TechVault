#!/usr/bin/env node
/*
 * scripts/verify-zoom — runtime zoom verification (owner G1 correction C).
 *
 * Launches the release exe with WebView2 CDP debugging and verifies the
 * zoom feature end-to-end on the REAL application:
 *   1. Ctrl+Plus / Ctrl+Minus / Ctrl+0 keyboard shortcuts dispatch through
 *      CDP Input events (the same input pipeline as the physical keyboard)
 *      and the WebView zoom factor changes (detected via innerWidth, which
 *      shrinks as zoom grows over the same physical viewport).
 *   2. The applied zoom persists to the settings file (settings.json).
 *   3. Bounds hold: zoom out at the minimum / zoom in at the maximum does
 *      not change the factor further.
 *   4. Typing in a text input is not intercepted (the input keeps
 *      receiving plain characters while shortcuts still work globally).
 *
 * Usage: node scripts/verify-zoom.mjs <path-to-TechVault.exe> [cdpPort]
 * Exit 0 iff every probe passes.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const exePath = process.argv[2];
const cdpPort = Number(process.argv[3] ?? 9375);
if (!exePath) {
	console.error("usage: node scripts/verify-zoom.mjs <exe> [cdpPort]");
	process.exit(2);
}

const appDataDir = `${process.env.APPDATA}\\com.techvault.app`;
const settingsPath = `${appDataDir}\\settings.json`;

async function getJson(url, timeoutMs = 800) {
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

function readPersistedZoom() {
	try {
		const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
		return settings?.appearance?.zoom ?? null;
	} catch {
		return null;
	}
}

const results = [];
function check(name, pass, detail) {
	results.push(pass);
	console.log(`${pass ? "PASS" : "FAIL"}  ${name}  — ${detail}`);
}

const child = spawn(exePath, [], {
	env: {
		...process.env,
		WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${cdpPort}`
	},
	stdio: "ignore"
});

let ws;
try {
	let page = null;
	for (let i = 0; i < 120 && !page; i++) {
		await sleep(250);
		try {
			const targets = await getJson(`http://127.0.0.1:${cdpPort}/json`);
			page = targets.find(
				(t) => t.type === "page" && (t.url ?? "").startsWith("http://tauri.localhost")
			);
		} catch {
			/* not ready */
		}
	}
	if (!page) throw new Error("no tauri.localhost page target within 30 s");

	ws = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((res, rej) => {
		ws.addEventListener("open", res, { once: true });
		ws.addEventListener("error", rej, { once: true });
	});
	let id = 0;
	const pending = new Map();
	ws.addEventListener("message", (ev) => {
		const m = JSON.parse(ev.data);
		if (m.id && pending.has(m.id)) {
			pending.get(m.id)(m);
			pending.delete(m.id);
		}
	});
	const send = (method, params = {}) =>
		new Promise((res) => {
			const i = ++id;
			pending.set(i, res);
			ws.send(JSON.stringify({ id: i, method, params }));
		});
	const evalJs = async (expr) =>
		(await (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }))
			.result)?.result?.value;

	await send("Runtime.enable");
	await send("Page.enable");

	// Wait for the shell.
	for (let i = 0; i < 100; i++) {
		if (await evalJs(`!!document.querySelector('#main-workspace h1')`)) break;
		await sleep(100);
	}
	await sleep(800); // let layout/init settle

	const innerWidth = async () => Number(await evalJs("window.innerWidth"));

	/** Dispatch a Ctrl+<key> combo through the real input pipeline. */
	async function pressCombo(key, code, keyCode, extraModifiers = 0) {
		const modifiers = 2 | extraModifiers; // 2 = Ctrl
		await send("Input.dispatchKeyEvent", {
			type: "keyDown",
			modifiers,
			key,
			code,
			windowsVirtualKeyCode: keyCode,
			nativeVirtualKeyCode: keyCode
		});
		await send("Input.dispatchKeyEvent", {
			type: "keyUp",
			modifiers,
			key,
			code,
			windowsVirtualKeyCode: keyCode,
			nativeVirtualKeyCode: keyCode
		});
	}
	const ctrlPlus = () => pressCombo("+", "Equal", 187, 8); // +Shift: physical Ctrl+Plus
	const ctrlMinus = () => pressCombo("-", "Minus", 189);
	const ctrlZero = () => pressCombo("0", "Digit0", 48);

	// Baseline: reset to 100% first so the probe is deterministic.
	await ctrlZero();
	await sleep(600);
	const w0 = await innerWidth();

	// 1. Ctrl+Plus zooms in (viewport shrinks in CSS px).
	await ctrlPlus();
	await sleep(600);
	const w1 = await innerWidth();
	check(
		"ctrl+plus zooms in",
		w1 < w0,
		`innerWidth ${w0} -> ${w1} (CSS px shrink = zoom applied)`
	);

	// 2. Zoom persists to the settings file.
	await sleep(700); // allow the settings write to land
	const persisted = readPersistedZoom();
	check(
		"zoom persists to settings.json",
		persisted !== null && persisted > 1.0 && persisted <= 2.0,
		`persisted appearance.zoom = ${persisted}`
	);

	// 3. Ctrl+Minus zooms back out.
	await ctrlMinus();
	await sleep(600);
	const w2 = await innerWidth();
	check("ctrl+minus zooms out", w2 > w1, `innerWidth ${w1} -> ${w2}`);

	// 4. Ctrl+0 resets to 100%.
	await ctrlZero();
	await sleep(600);
	const w3 = await innerWidth();
	check("ctrl+0 resets to 100%", w3 === w0, `innerWidth ${w3} === baseline ${w0}`);

	// 5. Bounds: zoom out below the minimum changes nothing.
	//    (at 100% after reset; hammer zoom-out 8x — must not go below 50%)
	for (let i = 0; i < 8; i++) await ctrlMinus();
	await sleep(800);
	const wMin = await innerWidth();
	const persistedMin = readPersistedZoom();
	check(
		"minimum bound holds (50%)",
		persistedMin !== null && Math.abs(persistedMin - 0.5) < 0.001,
		`persisted zoom at bound = ${persistedMin} (innerWidth ${wMin})`
	);

	// 6. Bounds: zoom in above the maximum changes nothing (hammer 16x).
	for (let i = 0; i < 16; i++) await ctrlPlus();
	await sleep(800);
	const persistedMax = readPersistedZoom();
	check(
		"maximum bound holds (200%)",
		persistedMax !== null && Math.abs(persistedMax - 2.0) < 0.001,
		`persisted zoom at bound = ${persistedMax}`
	);

	// 7. Typing is never intercepted: focus the (disabled) search is not
	//    usable; instead verify with a synthetic input element in the page —
	//    the global listener must not preventDefault plain keys.
	const typingProbe = await evalJs(`(() => {
		const input = document.createElement('input');
		input.id = '__zoom_typing_probe__';
		document.body.appendChild(input);
		input.focus();
		const plain = new KeyboardEvent('keydown', { key: '0', bubbles: true, cancelable: true });
		input.dispatchEvent(plain);
		input.remove();
		return plain.defaultPrevented ? 'intercepted' : 'clean';
	})()`);
	check("typing is not intercepted", typingProbe === "clean", `plain keydown in an input: ${typingProbe}`);

	// 8. Reset to 100% so the app is left in a clean state.
	await ctrlZero();
	await sleep(600);
} finally {
	try {
		ws?.close();
	} catch {}
	try {
		child.kill();
	} catch {}
}

const failed = results.filter((r) => !r).length;
console.log("");
console.log(
	failed === 0
		? `verify-zoom: ALL ${results.length} RUNTIME CHECKS PASSED`
		: `verify-zoom: ${failed} of ${results.length} RUNTIME CHECKS FAILED`
);
process.exit(failed === 0 ? 0 : 1);
