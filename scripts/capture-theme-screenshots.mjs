#!/usr/bin/env node
/*
 * scripts/capture-theme-screenshots — G1 evidence tooling (owner correction
 * pass PHASE 4): captures the shell's Dashboard view in both themes via the
 * WebView CDP (Page.captureScreenshot) — no foreground seizure, no
 * interaction with the desktop beyond the app's own window.
 *
 * The light-theme capture toggles ONLY the html.light class inside the page
 * (visual proof) — it does NOT write the theme preference, so the capture
 * never mutates persisted settings.
 *
 * Usage: node scripts/capture-theme-screenshots.mjs <exe> <outDir> [cdpPort]
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const exePath = process.argv[2];
const outDir = process.argv[3];
const cdpPort = Number(process.argv[4] ?? 9371);
if (!exePath || !outDir) {
	console.error("usage: node scripts/capture-theme-screenshots.mjs <exe> <outDir> [cdpPort]");
	process.exit(2);
}

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

const child = spawn(exePath, [], {
	env: {
		...process.env,
		WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${cdpPort}`
	},
	stdio: "ignore"
});

let ws;
try {
	// Wait for the app page target (skip the transient about:blank target).
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

	// Wait for the shell content before capturing.
	for (let i = 0; i < 100; i++) {
		const shell = await evalJs(`document.querySelector('#main-workspace h1')?.textContent ?? null`);
		if (shell) break;
		await sleep(100);
	}
	await sleep(1500); // settle (settings load, fonts)

	// Capture parameters: an explicit clip at the CSS viewport with
	// captureBeyondViewport forces a full-viewport paint — a plain surface
	// capture of an occluded window (the window may open behind other
	// windows on an in-use desktop) returns stale/partial black content.
	const viewport = await evalJs(
		`JSON.stringify({ w: window.innerWidth, h: window.innerHeight })`
	);
	const { w: vw, h: vh } = JSON.parse(viewport);
	const captureParams = {
		format: "png",
		captureBeyondViewport: true,
		clip: { x: 0, y: 0, width: vw, height: vh, scale: 1 }
	};

	/**
	 * Deterministically set the theme class and VERIFY the computed token
	 * before capturing — the persisted user preference may be either theme
	 * (it is the owner's choice, never overwritten here; the class toggle
	 * is visual-only).
	 */
	async function setTheme(mode) {
		await evalJs(
			`document.documentElement.classList.toggle('light', ${mode === "light"}); 'ok'`
		);
		await sleep(300);
		const bg = await evalJs(`getComputedStyle(document.body).backgroundColor`);
		const expected = mode === "light" ? "rgb(250, 250, 250)" : "rgb(11, 11, 13)";
		if (bg !== expected) {
			throw new Error(
				`theme verification failed for ${mode}: body bg ${bg}, expected ${expected}`
			);
		}
	}

	mkdirSync(outDir, { recursive: true });

	// 1. Dark theme (primary direction) — verified.
	await setTheme("dark");
	const dark = await send("Page.captureScreenshot", captureParams);
	writeFileSync(join(outDir, "g1-dashboard-dark.png"), Buffer.from(dark.result.data, "base64"));
	console.log("captured: g1-dashboard-dark.png (verified dark tokens)");

	// 2. Light theme — verified (class toggle only; no settings write).
	await setTheme("light");
	const light = await send("Page.captureScreenshot", captureParams);
	writeFileSync(join(outDir, "g1-dashboard-light.png"), Buffer.from(light.result.data, "base64"));
	console.log("captured: g1-dashboard-light.png (verified light tokens)");

	// 3. Settings (vertical internal navigation) in dark.
	await setTheme("dark");
	// Navigate through a real link click for a guaranteed client-side
	// transition (the SPA router reacts to clicks, not pushState alone).
	const clicked = await evalJs(`(() => {
		const link = document.querySelector('a[href="/settings"]');
		if (!link) return 'no-link';
		link.click();
		return 'clicked';
	})()`);
	console.log("settings navigation:", clicked);
	await sleep(1200);
	const settings = await send("Page.captureScreenshot", captureParams);
	writeFileSync(
		join(outDir, "g1-settings-dark.png"),
		Buffer.from(settings.result.data, "base64")
	);
	console.log("captured: g1-settings-dark.png");
} finally {
	try {
		ws?.close();
	} catch {}
	try {
		child.kill();
	} catch {}
}
