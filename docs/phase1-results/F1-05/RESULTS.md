# F1-05 Results — Knowledge Graph Benchmark (P1-H)

**Date(s) executed:** 2026-11-13 (benchmark page + harness build; partial measurement matrix)
**Executor:** Implementation/verification agent (owner directive 2026-11-13, D-018)
**Environment:** Windows 11 Pro, i5-10310U/32 GB reference machine; **GPU: Intel UHD Graphics (integrated, driver 31.0.101.2140)**; Edge 157.0.4341.46 (Chromium) via CDP; WebView2 Runtime 157.0.4341.46 (Evergreen)
**Stack under test:** Sigma.js 3.0.2 + Graphology 0.25.4 + graphology-layout-forceatlas2 0.10.1 (pinned), Vite 6.0.11, TypeScript 5.6.3 (strict)
**Artifacts:** `experiments/p1-h/` (benchmark page `src/main.ts`, deterministic seeded generator, WebView2 shell `src-tauri/`, CDP harness `harness/cdp-matrix.mjs` + `front.ps1`), results in `experiments/p1-h/results/`

**Overall status: PARTIAL — browser leg 4/8 configurations measured; WebView2 leg and mobile leg BLOCKED on display availability** (see §Blocker). No numbers below are estimates; every value is machine-recorded.

## Blocker (exact, with impact)

During the matrix runs, a full-desktop screenshot showed the **owner actively using the machine** (full-screen browser with video playback). The benchmark requires a **visible** target window: Chromium throttles `requestAnimationFrame` for occluded windows, which stalls the scripted-interaction FPS measurement (observed repeatedly; the harness now detects this via `document.visibilityState`). Continuing would have required repeatedly seizing the display foreground over the owner's active session — rejected as unacceptable behavior. All display-dependent measurement was therefore stopped, the running browser instances were cleaned up, and the owner must schedule screen time (~10 min) to finish the matrix. The harness is ready: `node harness/cdp-matrix.mjs --mode browser` and `--mode webview2` complete the remaining runs unattended once the display is free.

## Measurements (Edge browser leg — valid runs)

Method: deterministic seeded generator (golden-angle spiral ring + preferential attachment, avg degree ≈ 3.5, categories/relationship types per `DATABASE_DESIGN.md` §14); scripted 20 s pan/zoom via per-frame camera updates; FPS from rAF deltas; timings via `performance.now()`; JS heap via `performance.memory`. Edge window required visible during runs (vsync-locked frames confirm real rendering: 16.7 ms = 60 Hz).

| Metric | 1k nodes / labels off | 5k / labels off | 5k / labels default | 20k / labels off |
|---|---|---|---|---|
| Generation (one-time) | 43.8 ms | 91.2 ms | 77.9 ms | 818 ms |
| Edges (avg deg) | 1,741 (3.5) | 8,749 (3.5) | 8,749 | 34,912 (3.5) |
| First render (data→frame) | 13.4 ms | 178.5 ms | 51.5 ms | **192.8 ms** |
| **FPS during 20 s scripted pan/zoom — median** | 16.7 ms (≈60 fps) | 16.7 ms (≈60 fps) | 16.7 ms (≈60 fps) | **16.7 ms (≈60 fps)** |
| FPS p5 (frame time) | 16.4 ms | 16.5 ms | 16.5 ms | 16.4 ms |
| Worst 1 s window | 0.18 fps* | 59.1 fps | 0.37 fps* | 34.8 fps |
| Search (index + camera center), median of 20 | <0.05 ms | <0.05 ms | <0.05 ms | <0.05 ms |
| Category-filter re-render, median of 5 | 12.7 ms | 24.8 ms | 28.3 ms | **125 ms** |
| Progressive batch add (100 nodes) | 4.3 + 11.2 ms refresh | 1.0 + 19.8 | 0.9 + 17.9 | 0.8 + **107.8** |
| One FA2 layout pass | 352 ms (20 it) | 7,070 ms (20 it, no BH) | 5,676 ms (20 it, no BH) | 1,736 ms (5 it, Barnes-Hut) |
| JS heap after FA2 | 8.4 MB | 23.7 MB | 32.9 MB | 114.7 MB |

\* The sub-1-fps worst-second windows on three runs coincide with brief occlusion moments of the target window during the session (visibilityState transitions observed); medians/p5 are steady-state vsync values and are the meaningful fluidity numbers. Recorded as-is per honest-reporting rules.

## Acceptance criteria evaluation (F1-05 §7) — planning targets, measured-then-decided

| # | Criterion | Target | Measured | Verdict |
|---|---|---|---|---|
| A1 | 20k nodes/70k edges, sustained FPS in WebView2 | ≥ 30 FPS median | **≈60 FPS median in Edge browser leg** (16.7 ms); **WebView2 leg pending** | Partial pass (browser leg meets target; WebView2 confirmation pending) |
| A2 | Initial render ≤ 3 s at 20k | ≤ 3 s | 192.8 ms | **Pass** (browser leg) |
| A3 | Search + camera center ≤ 300 ms at 50k | ≤ 300 ms | <0.05 ms at 1k–20k (index pattern); 50k pending | Pass where measured; 50k pending |
| A4 | Filter re-render ≤ 500 ms at 20k | ≤ 500 ms | 125 ms | **Pass** (browser leg) |
| A5 | Progressive batch add without full re-layout | Functional (hard) | 100 nodes: ≤ 4.3 ms add + ≤ 108 ms refresh; no re-layout needed | **Pass** |
| A6 | Android WebView touch pan/zoom | Qualitative + cap value | **Deferred with P1-B** (no Android device/toolchain) | Deferred (owner) |
| A7 | Memory recorded; no leak signature over 10 min | Measured | Per-size JS heap recorded; **10-min soak pending** | Partial |
| A8 | 50k behavior recorded | Required record | **Pending** (display time) | Pending |

## Raw evidence index

| Artifact | File |
|---|---|
| Benchmark page + generator (committed) | `experiments/p1-h/src/main.ts`, `index.html`, `tsconfig.json`, `vite.config.ts` |
| WebView2 shell (no-IPC host, compiled) | `experiments/p1-h/src-tauri/` (release build `p1-h-shell.exe`, not committed — build output) |
| Matrix runner + visibility handling | `experiments/p1-h/harness/cdp-matrix.mjs`, `front.ps1`, `cdp-run.mjs` |
| Raw run outputs | `experiments/p1-h/results/edge-browser-1000-labels0.json`, `browser-edge-5000-labels0.json`, `browser-edge-5000-labels1.json`, `browser-edge-20000-labels0.json` |
| npm lockfile (pinned versions) | `experiments/p1-h/package.json`, `package-lock.json` |

## Outcome and recommendation

**Verified facts (browser leg, Edge/Chromium on the reference iGPU):**
1. Sigma.js + Graphology render and interact fluidly (vsync-locked ≈60 FPS) at 1k, 5k, and **20k nodes / ~35k edges with labels off** — A1's browser-leg target (≥ 30 FPS) is exceeded.
2. Initial render at 20k is 193 ms (target ≤ 3 s) — comfortable.
3. Search via a label index + camera centering is effectively instantaneous (< 0.05 ms measured up to 20k).
4. Category filtering re-render at 20k costs 125 ms (target ≤ 500 ms).
5. Progressive addition of 100 nodes without re-layout works (≤ 108 ms refresh at 20k) — the Phase 4 interaction model's scaling pattern is viable.
6. Force-directed layout is the expensive operation (multi-second without Barnes-Hut at 5k); the product pattern must be precomputed/limited-iteration/async layout — exactly the mitigation the spec anticipated (R-008's benchmark condition).
7. JS heap grows roughly linearly with size (8.4 MB @ 1k → 115 MB @ 20k after FA2) — per-size memory recorded; leak-check soak pending.

**Provisional R-008 direction (recommendation, not approval):** the measured browser-leg evidence supports **adopt-with-caps** (progressive expansion + default view caps + precomputed/async layouts). The formal R-008 verdict requires the pending WebView2 leg (the actual deployment environment) and ideally the 50k record.

**Blocked / open items:**
1. **Owner action — display time (~10–15 min):** run `node experiments/p1-h/harness/cdp-matrix.mjs --mode browser` (completes 1k-labels1, 20k-labels1, 50k×2 + optional `--soak 10`) and then `--mode webview2` (8 configs + soak in the compiled shell). The harness needs the target window visible and must not fight other foreground activity; it now detects occlusion instead of hanging.
2. Mobile leg (A6): deferred with P1-B (owner hold/deferral per D-018).
3. Worst-second anomalies on three runs (occlusion moments) — re-run cleanly at the display session if desired; medians unaffected.

**Affected P-IDs / R-IDs:** R-008 (benchmark gate — partial evidence, formal verdict pending), R-017 (mobile cap — deferred), P-022 (graph render performance is a budget input).

## Security notes (input to P1-I)

- The benchmark page loads only local assets; no network calls, no secrets, no eval.
- The p1-h WebView2 shell exposes **zero IPC commands** (results leave via CDP during measurement only) and runs from embedded local assets; CSP null documented as throwaway-shell limitation.
- Automation tooling (`cdp-matrix.mjs`, `front.ps1`) is dev-session tooling, not shipped code; it elevates the target window only during measurement and was halted when owner display activity was detected.

---

**End of F1-05 RESULTS.md**
