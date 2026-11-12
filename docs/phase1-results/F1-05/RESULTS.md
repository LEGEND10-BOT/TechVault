# F1-05 Results — Knowledge Graph Benchmark (P1-H)

**Date(s) executed:** 2026-11-13 (build + browser leg 4/8 in the first session; **full matrix + WebView2 leg + 10-min soak completed in the owner-approved display session the same day**)
**Executor:** Implementation/verification agent (owner directives 2026-11-13, D-018/D-019)
**Environment:** Windows 11 Pro, i5-10310U/32 GB reference machine; **GPU: Intel UHD Graphics (integrated, driver 31.0.101.2140)**; Edge 157.0.4341.46 (Chromium) via CDP; **WebView2 Runtime 157.0.4341.46 hosting the dedicated p1-h shell**
**Stack under test:** Sigma.js 3.0.2 + Graphology 0.25.4 + graphology-layout-forceatlas2 0.10.1 (pinned), Vite 6.0.11, TypeScript 5.6.3 (strict)
**Artifacts:** `experiments/p1-h/` (benchmark page, deterministic seeded generator, WebView2 shell, CDP harness `harness/cdp-matrix.mjs` + `front.ps1`), results in `experiments/p1-h/results/` (24 JSON files: 8 Edge + 8 WebView2 + 2 soak-related + earlier-session runs)

**Overall status: COMPLETE (desktop legs) — full 8×2 matrix measured in both Edge and WebView2; 10-minute soak pass; mobile leg deferred with P1-B (owner).** Every number below is machine-recorded.

## Blocker resolution note

The first session stopped deliberately when a desktop screenshot showed the owner actively using the display (occluded-window rAF throttling was diagnosed and handled by the harness's `visibilityState` gate + topmost bring-to-front helper). In the owner-approved display session (2026-11-13), all remaining runs completed without occlusion artifacts — worst-1-second windows at 1k/5k are a clean 60.0 fps, confirming the earlier occlusion diagnosis.

## Measured matrix — WebView2 (deployment environment) and Edge (comparison), 2026-11-13

FPS values are medians of per-frame deltas during 20 s of scripted pan/zoom (16.7 ms ≈ 60 fps vsync). WebView2 shell has zero IPC; results leave via CDP.

| Config | WebView2 FPS median (frame ms) | WebView2 first render | Edge FPS median | Edge first render |
|---|---|---|---|---|
| 1k, labels off | 16.7 ms (60.0 fps worst-1s) | 11.3 ms | 16.7 ms | 13.4–17.2 ms |
| 1k, labels default | 16.7 ms (60.0 fps worst-1s) | 22.4 ms | 16.7 ms | — |
| 5k, labels off | 16.7 ms (60.0 fps worst-1s) | 49.5 ms | 16.7 ms | 50.1–178 ms |
| 5k, labels default | 16.7 ms (60.0 fps worst-1s) | 111.5 ms | 16.7 ms | 51.5 ms |
| **20k, labels off** | **16.7 ms (60 fps)** | 155.5 ms | 16.7 ms | 150–193 ms |
| **20k, labels default** | **16.7 ms (60 fps)** | 438.5 ms | 16.7 ms | 165.9 ms |
| **50k, labels off** | **16.8 ms (≈59.5 fps)** | 449.1 ms | 16.8 ms | 456.4 ms |
| **50k, labels default** | **16.8 ms (≈59.5 fps)** | 483.3 ms | 16.9 ms | 484.2 ms |

Interaction detail at 20k (WebView2): search (index + camera center) < 0.05 ms; category-filter re-render 125–155 ms; progressive 100-node batch add 0.8 ms + 107–258 ms refresh (no re-layout). At 50k: filter re-render **301.8 ms**, batch-add refresh 257.6 ms, JS heap after FA2 **142 MB**.

Force-directed layout (one pass, measured): 5k ≈ 4.1 s (20 iters, no Barnes-Hut), 20k ≈ 1.0 s (5 iters, Barnes-Hut), 50k ≈ 2.8–3.1 s (5 iters, Barnes-Hut) — confirms the product pattern must be **precomputed/async/limited-iteration layout** (exactly the mitigation F1-05 anticipated).

## 10-minute soak (A7) — WebView2, 20k nodes, default labels

589 one-second samples over 600 s of continuous scripted pan/zoom:
- JS heap 28.74 MB → 28.03 MB — **growth −0.7 MB: no leak signature**
- 1-second FPS samples: min 28, median 53, max 61 — sustained interactive rendering for the full 10 minutes

## Acceptance criteria evaluation (F1-05 §7) — final

| # | Criterion | Target | Measured | Verdict |
|---|---|---|---|---|
| A1 | 20k/70k sustained FPS in WebView2 | ≥ 30 FPS median | **60 FPS median** (16.7 ms), worst-1s 44.6–46.6 fps with labels | **PASS** |
| A2 | Initial render ≤ 3 s at 20k | ≤ 3 s | 155–439 ms | **PASS** |
| A3 | Search + camera center ≤ 300 ms at 50k | ≤ 300 ms | < 0.05 ms (index pattern; measured at all sizes incl. 50k) | **PASS** |
| A4 | Filter re-render ≤ 500 ms at 20k | ≤ 500 ms | 125–155 ms (20k); 301.8 ms (50k) | **PASS** |
| A5 | Progressive batch add without full re-layout | Functional (hard) | 100 nodes: ≤ 4.3 ms add + ≤ 258 ms refresh | **PASS** |
| A6 | Android WebView touch pan/zoom | Qualitative + cap | **Deferred with P1-B** (owner, D-018/D-019) | Deferred (owner) |
| A7 | Memory recorded; no leak over 10 min | Measured | Per-size heap recorded; **soak −0.7 MB growth over 10 min** | **PASS** |
| A8 | 50k behavior recorded | Required record | 59.5 fps median, first render 449–483 ms, filter 302 ms, heap 142 MB | **PASS** |

## Formal R-008 verdict (the benchmark gate): **ADOPT — with documented scaling patterns**

Sigma.js 3.0.2 + Graphology 0.25.4 meets every desktop acceptance target on the reference integrated GPU, in both the Edge comparison environment and the actual WebView2 deployment environment, up to 50k nodes/175k edges (≈60 FPS median). Adopted product patterns (evidence-backed, per R-008's own benchmark condition and R-017):
1. Progressive expansion via batched node addition (A5 pass; Phase 4 interaction model viable).
2. Default view caps unnecessary below 50k on the reference hardware; progressive loading recommended beyond that (50k remains fluid but is the documented upper bound tested).
3. Force-directed layout must be precomputed/async with limited iterations + Barnes-Hut ≥ 20k (sync full passes cost seconds).
4. Label density materially affects first render at 20k (156→439 ms) — label thinning by default at large sizes.
Mobile leg (A6) and the R-017 mobile cap remain **deferred with P1-B** (owner) — the desktop adoption does not decide mobile.

## Raw evidence index

| Artifact | File |
|---|---|
| Benchmark page + generator (committed) | `experiments/p1-h/src/main.ts`, `index.html`, `tsconfig.json`, `vite.config.ts` |
| WebView2 shell (no-IPC host; source committed, build artifact removed per approved cache cleanup — rebuildable via `cargo build --release`, `CARGO_TARGET_DIR` now on D:) | `experiments/p1-h/src-tauri/` |
| Matrix runner + visibility handling | `experiments/p1-h/harness/cdp-matrix.mjs`, `front.ps1`, `cdp-run.mjs` |
| Raw runs (Edge 8, WebView2 8, soak) | `experiments/p1-h/results/*.json` (incl. `webview2-soak10min-20000-labels1.json`) |

## Security notes (input to P1-I)

- The benchmark page loads only local assets; no network calls, no secrets, no eval.
- The p1-h WebView2 shell exposes **zero IPC commands** (results leave via CDP during measurement only); CSP null documented as throwaway-shell limitation.
- Automation tooling (`cdp-matrix.mjs`, `front.ps1`) is dev-session tooling, not shipped code.

---

**End of F1-05 RESULTS.md**
