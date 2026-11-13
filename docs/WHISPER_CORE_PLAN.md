# TechVault Whisper Core — Architecture and Integration Plan

**Document status:** Active — Phase 1 closure deliverable (owner directive 82417, 2026-11-13; recommendation R-024)
**Version:** 1.0
**Scope:** architecture and verification planning for whisper.cpp integration ("Whisper Core"). **No code, no model downloads, no dependency additions** — the transcription foundation itself is Phase 2 scope (`DEVELOPMENT_ROADMAP.md` §6.6, decision D-016); the feasibility experiment is package P1-C (owner selected **R-025 Option A** and authorized desktop-only execution under D-020; runtime evidence remains pending).

---

## 1. Architecture (planned, not implemented)

### 1.1 Components (all inside the desktop application process model; no background services)

| Component | Responsibility |
|---|---|
| **Transcription job** | Cancellable job in the approved job lifecycle (`ARCHITECTURE.md` job model); owns progress reporting and cancellation tokens |
| **Whisper engine adapter** | Thin wrapper around whisper.cpp (pinned upstream commit) — CLI-binary invocation or a Rust binding crate; the choice is a documented Phase 2 dependency recommendation (F1-03 §2 Q1), never a silent substitution of R-007 |
| **Audio decode step** | Converts source media to 16 kHz mono WAV (whisper.cpp input contract, F1-03 §2) using a local FFmpeg binary; decode is scoped per job (P-006 packaging/licensing is a separate later decision) |
| **Model manager** | Registry of available models (tiny ~75 MB, base ~142 MB, small ~466 MB, medium ~1.5 GB — upstream figures, to be measured); selection UI range **Tiny → Medium**; larger models only as an optional advanced capability gated on measured hardware; per-model metadata (size, checksum, quantization variant) |
| **Model downloader** | Download **on explicit user consent only** (per model), to the configurable model directory (default `D:\Models\whisper\` per the D-drive policy, D-019 §7); checksum verification; resumable download; no automatic downloads |
| **Transcript store** | Persisted per D-002 (transcripts retained by default, user-deletable); timestamps retained for evidence linking |
| **Temp media handler** | Decoded WAV and any extracted audio live in `D:\Temp\` (configurable), deleted after job completion/failure/cancellation; **original videos are never permanently stored** (D-002) |
| **Resource monitor** | CPU/RAM sampling around each transcription job (P-022 methodology: private bytes primary, working set supplementary); results recorded per job |
| **Error recovery** | Corrupt/unsupported input → clear typed error, no host crash (F1-03 A6); partial segments preserved on cancellation/interruption (streaming segment callbacks; F1-03 A5) |

### 1.2 Constraint compliance (directive 82417 §4)

| Constraint | Plan |
|---|---|
| No permanent original-video storage by default | Only derived transcripts persist; decoded audio is temp + cleanup (§1.1) |
| No automatic model downloads without consent | Downloader requires explicit per-model consent; consent state recorded |
| Model files separate from project files | `D:\Models\whisper\` default (configurable in settings); never inside `D:\TechVault` |
| Model storage configurable on D: | Settings key `model_directory`, default on D: |
| No unnecessary background services | Transcription runs as cancellable in-app jobs only; no daemons, no polling |
| Lightweight architecture preserved | Engine invoked per job; nothing resident between jobs; low-resource default = Tiny/Base selection guidance from measured RTF (P1-C evidence) |

### 1.3 Functional coverage (directive 82417 §4 checklist)

whisper.cpp integration · local transcription · model management · download-on-demand · Tiny→Medium selection (+ larger optional, hardware-gated) · language selection and auto-detection (whisper.cpp language parameter; UI exposes both) · segment timestamps (evidence-link quality target: F1-03 A9 ±2 s) · progress reporting (job progress from segment callbacks) · cancellation (cooperative cancel + hard-kill fallback with partial preservation) · error recovery (typed failures, retry-safe) · temporary media handling + cleanup (§1.1) · CPU/RAM monitoring (§1.1) · low-resource operation (model guidance from measured realtime factors; default to Tiny/Base on low-spec machines).

## 2. Verification status (honest separation, directive 82417 §4)

| Verification tier | Status | Evidence / prerequisite |
|---|---|---|
| 1. **Architecture verification** (this plan vs requirements) | **COMPLETE (this document)** — every directive §4 item is mapped (§1.2/§1.3); aligned with F1-03 spec, D-016 Phase 2 placement, D-002 retention, R-007 engine choice, D-drive policy | This document; cross-checked against `docs/phase1-plan/F1-03-whisper-cpp.md` |
| 2. **Build & compatibility verification** (whisper.cpp builds on Windows at a pinned commit; binding vs CLI decision evidence) | **COMPLETE** — built on Windows 2026-11-13 at pinned commit `371b5a7` (`371b5a75…4727b` verified; MSVC 19.44/CMake 3.31.6); CLI feasibility path used, Rust binding comparison remains optional (F1-03a A1 PASS) | `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md` §4; build log `results/logs/p1c-run-console.log` |
| 3. **Actual transcription verification** (usable transcripts, timestamps, interruption/partial preservation, error behavior) | **COMPLETE except A5** — tiny/base/small/medium transcribed correctly (A2 PASS); timestamps spot-check PASS (A9); corrupted input rejected cleanly (A6 PASS); **A5 cancellation NOT_RUN** (needs owner-authorized ≥90 s fixture) | `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md`; per-model stdout/stderr in `results/logs/` |
| 4. **Performance benchmarking** (RTF per model, peak RAM/CPU — the P-022/P-027 inputs) | **MEASURED (11 s fixture)** — corrected RTF: tiny 0.234 / base 0.292 / small 0.892 / **medium 2.589 (non-real-time finding)**; peak private 681–2583 MB; **definitive long-fixture RTF pending** (owner 5–10 min fixture) | `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md` §4; CPU-only confirmed (`no GPU found`); models under `D:\Models\whisper\`; Private Bytes primary per D-019 |

Tiers 2–3 are measured as of the 2026-13 Windows execution (D-020); the only open items are A5 cancellation, the definitive long-fixture RTF, and optional multilingual quality — all owner-fixture-gated.

## 3. P1-C / P1-D resolution record (R-025, D-020)

**Current status:** The owner selected **Option A** under D-020: P1-C desktop-only was authorized **and executed 2026-11-13** (build + 4-model transcription + corrected RTF + corrupted-input; evidence in `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md`). P1-D remains **HELD**; P1-B remains **DEFERRED**. Remaining open: A5 cancellation probe and definitive long-duration RTF (owner-authorized fixture); Urdu/multilingual untested.

**Options considered; Option A is selected:**

| Option | What happens | Evidence gained | Cost/impact |
|---|---|---|---|
| **A — Execute P1-C now (desktop only)** | Release the hold for F1-03a only: build whisper.cpp at a pinned commit, download tiny/base (+small/medium if RAM permits) with consent, run the F1-03a matrix on owner-authorized fixtures | Feasibility evidence (RTF/RAM/timestamps/partial-preservation) BEFORE Phase 2 transcription work begins — de-risks Phase 2 §6.6 exactly as D-016 intended | whisper.cpp checkout + build (~GB source tree on D:\DevTools or D:\dev-caches), 1–2 model downloads (~75–466 MB to D:\Models), fixture corpus needed (owner-provided or CC-licensed); P1-D stays held |
| **B — Formally defer P1-C to Phase 2** | Record the hold as an owner-approved deferral; Phase 2 §6.6 begins with the feasibility matrix as its first task | None now; Phase 2 planning absorbs the risk | No Phase 1 cost; Phase 2 transcription foundation starts with unmeasured RTF/RAM (D-016's de-risking intent is not fulfilled before the phase that consumes it) |
| **C — Partial verification (build-only)** | Release the hold only for tier 2 (build + pinned-commit record), no model downloads, no transcription | A1 evidence cheaply (does whisper.cpp even build on this toolchain?) | Build time + ~1 GB source tree; still leaves tiers 3–4 open |

**Selected:** Option A, per D-020. **P1-D (Android) remains held** because it additionally requires the Android toolchain and test device (P1-B track, deferred).

**Execution prerequisites:** Windows CMake/MSVC/Git toolchain; explicit model download consent is satisfied by the owner launching the runner; owner-authorized long-form fixture for A5 and meaningful multilingual quality testing. Source/build cache is directed to `D:\Builds\whisper.cpp-p1c`; models to `D:\Models\whisper\`.

---

**End of WHISPER_CORE_PLAN.md**


## 4. Owner decision update — D-020 (2026-11-13)

R-025 Option A is now selected: run the P1-C desktop feasibility experiment only. The execution package is `experiments/p1-c/`. P1-D remains HELD and P1-B remains DEFERRED. The architecture in this document is adopted as the Phase 2 reference design (R-024), but the adapter choice, model defaults, and runtime expectations remain evidence-dependent. No product integration or background service is authorized in this Phase 1 pass.
