#!/usr/bin/env node
// F1-05 browser/WebView2 matrix runner. Owns the full lifecycle: launches the target
// (Edge/Chrome or the p1-h WebView2 shell), connects once via CDP, runs every
// configuration sequentially, saves each result, then closes the target.
// Dependency-free (Node >= 22 built-in WebSocket).
//
// Usage:
//   node cdp-matrix.mjs --mode browser --out ../results
//   node cdp-matrix.mjs --mode webview2 --out ../results
//   node cdp-matrix.mjs --mode browser --sizes 5000 --labels 0,1   (subset)

import { spawn, execSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

function parseArgs(argv) {
  const a = { port: 9229, sizes: "1000,5000,20000,50000", labels: "0,1", "per-run-timeout": 200, soak: 0 };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--mode") a.mode = argv[++i];
    else if (argv[i] === "--out") a.out = argv[++i];
    else if (argv[i] === "--port") a.port = parseInt(argv[++i], 10);
    else if (argv[i] === "--sizes") a.sizes = argv[++i];
    else if (argv[i] === "--labels") a.labels = argv[++i];
    else if (argv[i] === "--per-run-timeout") a["per-run-timeout"] = parseInt(argv[++i], 10);
    else if (argv[i] === "--soak") a.soak = parseInt(argv[++i], 10);
    else throw new Error(`unknown arg ${argv[i]}`);
  }
  if (!a.mode || !a.out) throw new Error("--mode and --out required");
  return a;
}
const args = parseArgs(process.argv);

const PAGE_URL_BASE = "http://127.0.0.1:4173/";
const SHELL_EXE = "D:\\TechVault\\experiments\\p1-h\\src-tauri\\target\\release\\p1-h-shell.exe";

function launchTarget() {
  if (args.mode === "browser") {
    const edgePaths = [
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    const exe = edgePaths.find((p) => existsSync(p));
    if (!exe) throw new Error("Edge not found");
    const profile = join(process.env.TEMP || "C:\\Windows\\Temp", `p1h-${args.mode}-profile`);
    if (existsSync(profile)) { try { rmSync(profile, { recursive: true, force: true }); } catch {} }
    const child = spawn(exe, [
      `--remote-debugging-port=${args.port}`,
      `--user-data-dir=${profile}`,
      "--window-size=1200,800", "--window-position=10,10",
      "--no-first-run", "--no-default-browser-check", "--disable-extensions",
      "about:blank",
    ], { stdio: "ignore", detached: false });
    return child;
  }
  // WebView2 leg: launch the Tauri shell with the WebView2 CDP port env var
  if (!existsSync(SHELL_EXE)) throw new Error(`shell not built: ${SHELL_EXE}`);
  const child = spawn(SHELL_EXE, [], {
    stdio: "ignore", detached: false,
    env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${args.port}` },
  });
  return child;
}

async function waitForEndpoint(port, timeoutMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function getPageWsUrl(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(3000) });
  const targets = await res.json();
  const pages = targets.filter((t) => t.type === "page");
  // prefer the about:blank / shell page (skip extension/other pages)
  const page = pages.find((t) => (t.url === "about:blank" || t.url.includes("tauri://") || t.url.includes("127.0.0.1:4173"))) || pages[pages.length - 1];
  if (!page) throw new Error("no page target");
  return page;
}

let msgId = 0;
const pending = new Map();
let ws;
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject, at: Date.now() });
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`CDP ${method} timed out`)); } }, 8000);
  });
}

function evalWithTimeout(expression, timeoutMs = 6000) {
  return Promise.race([
    send("Runtime.evaluate", { expression, returnByValue: true }).then((r) => r.result?.value),
    new Promise((resolve) => setTimeout(() => resolve(undefined), timeoutMs)),
  ]);
}

async function runOne(url, outPath, timeoutS) {
  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, 1200));
  const visible = await waitUntilVisible();
  if (!visible) console.log("  WARNING: page not visible; rAF may be throttled");
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutS * 1000) {
    await new Promise((r) => setTimeout(r, 2000));
    const title = await evalWithTimeout("document.title");
    if (title === "BENCH_DONE") {
      const json = await evalWithTimeout("JSON.stringify(window.__RESULTS)", 10000);
      if (!json) throw new Error("results missing after DONE");
      writeFileSync(outPath, json);
      const r = JSON.parse(json);
      console.log(`saved ${outPath} | fps_median=${r.fps_20s?.medianMs}ms p5=${r.fps_20s?.p5Ms}ms worst1s=${r.fps_20s?.worstSecondFps}fps firstRender=${r.first_render?.ms}ms gen=${r.generation?.ms}ms fa2=${r.forceatlas2_pass?.ms ?? r.forceatlas2_pass?.error}ms`);
      return true;
    }
    if (typeof title === "string" && title.includes("graph benchmark")) {
      const status = await evalWithTimeout("(document.getElementById('status')||{}).textContent||''").catch(() => "");
      process.stdout.write(`  …${status}\n`);
    }
  }
  console.log(`TIMEOUT: ${url}`);
  return false;
}

// Chromium throttles requestAnimationFrame for occluded/hidden windows, which stalls the
// benchmark at its first rAF. Keep the target window topmost + foreground for every run.
const FRONT_PS = join(import.meta.dirname || ".", "front.ps1");
function bringTargetToFront() {
  const procName = args.mode === "webview2" ? "p1-h-shell" : "msedge";
  try {
    const out = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${FRONT_PS}" -ProcName ${procName}`, { timeout: 15000, encoding: "utf8" });
    console.log(`[front] ${String(out).trim()}`);
  } catch (e) {
    console.log(`[front] failed: ${String(e.message || e).slice(0, 100)}`);
  }
}

async function waitUntilVisible(timeoutMs = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const vis = await evalWithTimeout("document.visibilityState", 3000);
    if (vis === "visible") return true;
    bringTargetToFront();
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

async function main() {
  mkdirSync(args.out, { recursive: true });
  const child = launchTarget();
  try {
    const up = await waitForEndpoint(args.port, 30000);
    if (!up) throw new Error("debug endpoint never came up");
    const page = await getPageWsUrl(args.port);
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); p.resolve(m.result); }
    };
    await send("Page.enable");
    await send("Runtime.enable");

    const sizes = args.sizes.split(",").map((s) => parseInt(s, 10));
    const labels = args.labels.split(",").map((s) => parseInt(s, 10));
    const tag = args.mode === "webview2" ? "webview2" : "edge-browser";
    let pass = 0, fail = 0;
    for (const size of sizes) {
      for (const lb of labels) {
        bringTargetToFront();
        await new Promise((r) => setTimeout(r, 300));
        const name = `${tag}-${size}-labels${lb}`;
        const url = `${PAGE_URL_BASE}?size=${size}&labels=${lb}&autostart=1&env=${tag}`;
        try {
          const ok = await runOne(url, join(args.out, `${name}.json`), args["per-run-timeout"]);
          ok ? pass++ : fail++;
        } catch (e) {
          console.log(`RUN-ERROR ${name}: ${String(e.message || e).slice(0, 160)}`);
          fail++;
        }
      }
    }
    if (args.soak > 0) {
      bringTargetToFront();
      const name = `${tag}-soak${args.soak}min-20000-labels1`;
      const url = `${PAGE_URL_BASE}?size=20000&labels=1&autostart=1&env=${tag}&soak=${args.soak}`;
      try {
        const ok = await runOne(url, join(args.out, `${name}.json`), args.soak * 60 + 120);
        ok ? pass++ : fail++;
      } catch (e) {
        console.log(`RUN-ERROR ${name}: ${String(e.message || e).slice(0, 160)}`);
        fail++;
      }
    }
    console.log(`matrix done: pass=${pass} fail=${fail}`);
  } finally {
    try { ws?.close(); } catch {}
    try { execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: "ignore" }); } catch {}
  }
}

main().catch((e) => { console.error("FATAL:", e.message || e); process.exit(1); });
