# experiments/p1-h — F1-05 Sigma.js + Graphology benchmark (throwaway Phase 1 tooling)

P1-H workspace (`docs/PHASE_1_TASK_PACKAGES.md` P1-H / spec `docs/phase1-plan/F1-05-knowledge-graph.md`). Evidence tooling, not product code.

## Layout

- `src/main.ts` — benchmark page: deterministic seeded generator (scale-free-ish, avg degree ≈ 3.5, categories + relationship types per `DATABASE_DESIGN.md` §14), scripted pan/zoom FPS measurement, search/filter/progressive-add/FA2 instrumentation, label modes, optional soak. URL params: `?size=&labels=&autostart=1&env=&soak=`.
- `src-tauri/` — minimal WebView2 host shell (zero IPC commands; embeds `../dist`). Build: `cargo build --release` (toolchain on `D:\dev-caches`).
- `harness/cdp-matrix.mjs` — lifecycle-owning matrix runner (launches Edge or the shell with `--remote-debugging-port`, runs every configuration, saves JSON per run). `front.ps1` keeps the target window topmost (Chromium throttles rAF for occluded windows). `cdp-run.mjs` — single-run driver.
- `results/` — one JSON per configuration (machine-recorded; see `docs/phase1-results/F1-05/RESULTS.md`).

## Running (requires the display — do not run while the owner is using the screen)

```bash
npm install --cache "D:\dev-caches\npm-cache"   # pinned: sigma 3.0.2, graphology 0.25.4, fa2 0.10.1
npx vite build
npx vite preview --host 127.0.0.1 --port 4173 --strictPort &   # serve dist/
# browser leg (8 configs + optional soak):
node harness/cdp-matrix.mjs --mode browser --out results --per-run-timeout 150 [--soak 10]
# webview2 leg (uses the compiled shell):
node harness/cdp-matrix.mjs --mode webview2 --out results --per-run-timeout 150 [--soak 10]
```

## Status (2026-11-13)

- Page + shell + harness: complete.
- Browser leg: 4/8 configurations measured (1k-labels0, 5k both, 20k-labels0 — vsync-locked ≈60 FPS at 20k).
- **Remaining runs blocked on display availability** (owner was actively using the machine; window-raising automation was stopped deliberately). Finish with the commands above when the screen is free.
- Mobile leg: deferred with P1-B.
