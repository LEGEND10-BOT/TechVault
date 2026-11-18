#!/usr/bin/env node
/*
 * scripts/measure-first-render — G1 M1-P2 evidence (PHASE_2_M1_PERFORMANCE_BUDGET.md §3).
 *
 * Measures, on the built release executable, two distinct clocks, reported
 * separately because they answer different questions:
 *
 *   1. t_boot  — process spawn -> WebView page target for tauri.localhost
 *                (process + WebView2 initialization; environmental).
 *   2. t_shell — in-page navigation-start -> main workspace h1 present
 *                (the SPA's own first render of the shell; the M1-P2
 *                "first-render (shell interactive)" quantity).
 *
 * t_shell is read from the Navigation Timing API inside the page
 * (domContentLoadedEventEnd) at the moment the shell content is confirmed
 * present over CDP — no polling latency is added to the in-page clock.
 *
 * Run protocol (OD-7): N runs (default 5), median + max reported; all runs
 * are warm (the WebView2 user-data profile persists between runs).
 * This script MEASURES ONLY — the M1-P2 guard (<=300 ms warm-machine) is
 * applied in the report against the t_shell median.
 *
 * Usage: node scripts/measure-first-render.mjs <path-to-TechVault.exe> [runs] [cdpPort]
 */

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const exePath = process.argv[2];
const runs = Number(process.argv[3] ?? 5);
const cdpPort = Number(process.argv[4] ?? 9353);
if (!exePath) {
	console.error("usage: node scripts/measure-first-render.mjs <exe> [runs] [cdpPort]");
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

async function measureOnce() {
	const start = process.hrtime.bigint();
	const child = spawn(exePath, [], {
		env: {
			...process.env,
			WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${cdpPort}`
		},
		stdio: "ignore"
	});
	try {
		// 1. wait for the app page target (spawn -> webview document).
		for (;;) {
			if (child.exitCode !== null || child.signalCode !== null) {
				throw new Error("application exited before the shell rendered");
			}
			const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
			if (elapsedMs > 30000) throw new Error("shell did not render within 30 s");
			try {
				const targets = await getJson(`http://127.0.0.1:${cdpPort}/json`);
				const page = targets?.find(
					(t) => t.type === "page" && (t.url ?? "").startsWith("http://tauri.localhost")
				);
				if (page) {
					const tBoot = Math.round(elapsedMs);
					// 2. attach and wait for the shell content, then read the
					//    in-page navigation timing (page-relative first render).
					const ws = new WebSocket(page.webSocketDebuggerUrl);
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
						(await (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result)
							?.result?.value;
					await send("Runtime.enable");

					const tShellStart = Number(process.hrtime.bigint() - start) / 1e6;
					let shellInteractive = null;
					for (;;) {
						const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
						if (elapsedMs > 30000) throw new Error("shell content never appeared");
						const hasShell = await evalJs(
							`document.querySelector('#main-workspace h1')?.textContent ?? null`
						);
						if (hasShell) {
							const nav = await evalJs(
								`(() => { const n = performance.getEntriesByType('navigation')[0]; return n ? Math.round(n.domContentLoadedEventEnd) : null; })()`
							);
							shellInteractive = nav;
							break;
						}
						await sleep(10);
					}
					ws.close();
					return {
						t_boot_ms: tBoot,
						t_shell_attach_ms: Math.round(tShellStart),
						t_shell_page_relative_ms: shellInteractive
					};
				}
			} catch (err) {
				if (err instanceof Error && err.message.startsWith("shell")) throw err;
				/* CDP endpoint not up yet */
			}
			await sleep(10);
		}
	} finally {
		try {
			child.kill();
		} catch {}
	}
}

const samples = [];
for (let i = 1; i <= runs; i++) {
	const result = await measureOnce();
	samples.push(result);
	console.log(
		`run ${i}: t_boot ${result.t_boot_ms} ms | shell confirmed at attach+${result.t_shell_attach_ms} ms | page-relative first render ${result.t_shell_page_relative_ms} ms`
	);
	await sleep(2000);
}

const median = (arr) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
console.log("");
console.log(
	JSON.stringify(
		{
			tool: "scripts/measure-first-render.mjs",
			metrics: {
				t_boot: "spawn -> WebView page target for tauri.localhost (process + WebView2 init; environmental)",
				t_shell_page_relative:
					"navigation-start -> domContentLoadedEventEnd read when the shell h1 is confirmed present (the M1-P2 first-render quantity)"
			},
			runs,
			boot_samples_ms: samples.map((s) => s.t_boot_ms),
			boot_median_ms: median(samples.map((s) => s.t_boot_ms)),
			shell_page_relative_samples_ms: samples.map((s) => s.t_shell_page_relative_ms),
			shell_page_relative_median_ms: median(samples.map((s) => s.t_shell_page_relative_ms)),
			note: "measure-only; M1-P2 guard (<=300 ms warm) applied in the report against the shell page-relative median"
		},
		null,
		2
	)
);
