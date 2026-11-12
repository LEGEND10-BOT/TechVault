#!/usr/bin/env node
// CDP driver for the F1-05 benchmark: connects to a Chromium-based target (Edge/Chrome or
// WebView2 via --remote-debugging-port), navigates to a benchmark URL, waits for
// document.title === "BENCH_DONE", then saves window.__RESULTS to a JSON file.
// Dependency-free (Node built-in WebSocket, Node >= 22).
//
// Usage: node cdp-run.mjs --port 9223 --url "http://127.0.0.1:4173/?size=5000&labels=1&autostart=1&env=browser" --out results/browser-5k-labels1.json [--timeout 120]

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--port") args.port = parseInt(argv[++i], 10);
    else if (argv[i] === "--url") args.url = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--timeout") args.timeout = parseInt(argv[++i], 10);
    else throw new Error(`unknown arg ${argv[i]}`);
  }
  if (!args.port || !args.url || !args.out) throw new Error("--port, --url, --out required");
  args.timeout = args.timeout || 180;
  return args;
}

const args = parseArgs(process.argv);

async function getTargetWsUrl(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await res.json();
  const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  if (!page) throw new Error("no page target found");
  return page;
}

let msgId = 0;
const pending = new Map();
let ws;

function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

async function main() {
  const target = await getTargetWsUrl(args.port);
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: args.url });
  const started = Date.now();
  let results = null;
  while (Date.now() - started < args.timeout * 1000) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const evalRes = await send("Runtime.evaluate", {
        expression: `document.title`,
        returnByValue: true,
      });
      if (evalRes?.result?.value === "BENCH_DONE") {
        const res = await send("Runtime.evaluate", {
          expression: `JSON.stringify(window.__RESULTS)`,
          returnByValue: true,
        });
        results = JSON.parse(res.result.value);
        break;
      }
    } catch {
      // page may be mid-navigation; retry
    }
  }
  if (!results) throw new Error(`benchmark did not finish within ${args.timeout}s`);
  mkdirSync(dirname(args.out), { recursive: true });
  writeFileSync(args.out, JSON.stringify(results, null, 2));
  console.log(`saved: ${args.out}`);
  const m = results.meta || {};
  console.log(`size=${m.size} labels=${m.labels_mode} env=${m.env_tag} fps_20s_median=${results.fps_20s?.medianMs}ms p5=${results.fps_20s?.p5Ms}ms firstRender=${results.first_render?.ms}ms`);
  ws.close();
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
