# P1-J Results — Low-Resource Hardware Benchmark (consolidation)

**Date:** 2026-11-13
**Executor:** Implementation/verification agent (owner directive 2026-11-13, D-019)
**Environment (reference machine, owner-confirmed):** Windows 11 Pro (Build 26200), Intel Core i5-10310U @ 1.70 GHz (4C/8T), 32 GB DDR4-2667, single NVMe SSD (Samsung MZVLB512HAJQ 512 GB; C:/D:/E:), GPU Intel UHD Graphics (driver 31.0.101.2140), mains power.

**Status: PARTIAL — all measurements possible without P1-C/P1-D are consolidated here; transcription-dependent items are NOT RUN (owner hold, D-019).**

This record applies the shared measurement protocol (`PHASE_0_EXECUTION_PLAN.md` §7) to the evidence produced by the executed Phase 1 packages. All numbers come from the cited raw records — nothing re-measured, nothing estimated.

## Protocol coverage

| Protocol item | Result | Value (measured) | Source record |
|---|---|---|---|
| Cold/warm startup | **PASS (warm)** — proxy method (window handle); first-ever launch recorded | warm median **74.5 ms** (15-run proxy); first-ever **10.5 s** (one-time WebView2 profile init + AV scan) | F1-01 RESULTS |
| Idle RAM | **PASS under D-019 metric** — decision D-019 adopts **private bytes** as the primary metric with the 150 MB planning target | app process **5.1 MB** private; full process tree **135.97 MB private** (target ≤ 150 MB → **within target**); tree working set 327.14 MB recorded as supplementary diagnostic | F1-01 RESULTS |
| Search latency | **PASS** | FTS5 MATCH median **0.005 ms** @ 5k rows, **0.009 ms** @ 20k (p95 0.014–0.025 ms) | F1-04 RESULTS |
| Graph render performance | **PASS (browser leg)** | scripted pan/zoom ≈ **60 FPS median at 20k nodes/35k edges** (Edge/WebView2 engine, reference iGPU); filter re-render 125 ms; first render 193 ms | F1-05 RESULTS (WebView2-leg confirmation pending display time) |
| Installer / installed size | **PASS** | NSIS 1.51 MB, MSI 2.23 MB, installed 4.90 MB | F1-01 RESULTS |
| Video playback overhead | **RECORDED (noisy)** | video-page heap delta measured **−8.3 MB** (GC variance dominates; not a stable signal — re-measure in the visible-window confirmation run) | F1-02 RESULTS |
| CPU during transcription | **NOT RUN** | requires P1-C (held per owner, D-019) | — |
| Transcription speed / model size | **NOT RUN** | requires P1-C (held) | — |
| Peak RAM under active workload | **NOT RUN** | no active-workload application exists in Phase 1 (PoCs are idle validation shells); belongs to Phase 2 re-measure | — |
| Disk growth during processing | **N/A** | no processing pipeline exists in Phase 1 | — |
| IPC latency | supplementary **PASS** | 1.60 ms median (200 calls) | F1-01 RESULTS |

## Impact of approved holds on this record

- P1-C/P1-D (Whisper.cpp) held per owner (D-019): the transcription CPU/speed/model-size items of the protocol cannot run. This is an **owner-approved hold**, documented as such — not a gap caused by execution failure.
- Phase 1 exit-criteria effect: roadmap §5.3 (Whisper validation) has no evidence while the hold stands; the Gate-1 review must either release the hold or record its continuation as an owner-approved deferral (see `docs/PHASE_1_GATE1_READINESS.md`).

## Raw evidence index

| Artifact | File |
|---|---|
| Startup/RAM raw measurements | `experiments/p1-a/results/measurements.json` |
| Identity/FTS5 raw results | `experiments/p1-f/results/p1-f-results.json` |
| Graph benchmark raw runs | `experiments/p1-h/results/*.json` |
| Playback test raw run | `experiments/p1-e/results/webview2-playback.json` |

**Affected P-IDs / R-IDs:** P-022 (**resolved by D-019** — metric defined; numeric per-feature budgets set from these measurements in Phase 2), R-021 (per-feature budgets input).

---

**End of P1-J RESULTS.md**
