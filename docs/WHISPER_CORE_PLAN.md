# TechVault Whisper Core — Architecture and Integration Plan

**Document status:** Active — Phase 1 closure deliverable (owner directive 82417, 2026-11-13; recommendation R-024)
**Version:** 1.0
**Scope:** architecture and verification planning for whisper.cpp integration ("Whisper Core"). **No code, no model downloads, no dependency additions** — the transcription foundation itself is Phase 2 scope (`DEVELOPMENT_ROADMAP.md` §6.6, decision D-016); the feasibility experiment is package P1-C (currently **HELD** by owner, D-018/D-019 — status unchanged by this document).

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
| 2. **Build & compatibility verification** (whisper.cpp builds on Windows at a pinned commit; binding vs CLI decision evidence) | **NOT PERFORMED — requires P1-C release** (F1-03a A1) | P1-C held by owner (D-019); needs whisper.cpp checkout + build + optional binding crate — heavy dependency work explicitly excluded while held |
| 3. **Actual transcription verification** (usable transcripts, timestamps, interruption/partial preservation, error behavior) | **NOT PERFORMED — requires P1-C release + owner-authorized fixtures** (F1-03a A2/A5/A6/A9; fixtures are OWNER-PROVIDED per F1-03 §3) | Same hold |
| 4. **Performance benchmarking** (RTF per model, peak RAM/CPU — the P-022/P-027 inputs) | **NOT PERFORMED — requires P1-C release + model downloads with consent** (F1-03a A3/A4) | Same hold; model files would go to `D:\Models\whisper\` |

Nothing in tiers 2–4 is claimed, implied, or marked passed. The prerequisite for all three is an explicit owner decision releasing P1-C (see §3).

## 3. P1-C / P1-D resolution recommendation (owner decision required — R-025)

**Current status (unchanged):** P1-C (Whisper desktop validation) and P1-D (Whisper Android) are **HELD** by owner decisions D-018/D-019. This document does not change them.

**Options for the owner at Gate 1:**

| Option | What happens | Evidence gained | Cost/impact |
|---|---|---|---|
| **A — Execute P1-C now (desktop only)** | Release the hold for F1-03a only: build whisper.cpp at a pinned commit, download tiny/base (+small/medium if RAM permits) with consent, run the F1-03a matrix on owner-authorized fixtures | Feasibility evidence (RTF/RAM/timestamps/partial-preservation) BEFORE Phase 2 transcription work begins — de-risks Phase 2 §6.6 exactly as D-016 intended | whisper.cpp checkout + build (~GB source tree on D:\DevTools or D:\dev-caches), 1–2 model downloads (~75–466 MB to D:\Models), fixture corpus needed (owner-provided or CC-licensed); P1-D stays held |
| **B — Formally defer P1-C to Phase 2** | Record the hold as an owner-approved deferral; Phase 2 §6.6 begins with the feasibility matrix as its first task | None now; Phase 2 planning absorbs the risk | No Phase 1 cost; Phase 2 transcription foundation starts with unmeasured RTF/RAM (D-016's de-risking intent is not fulfilled before the phase that consumes it) |
| **C — Partial verification (build-only)** | Release the hold only for tier 2 (build + pinned-commit record), no model downloads, no transcription | A1 evidence cheaply (does whisper.cpp even build on this toolchain?) | Build time + ~1 GB source tree; still leaves tiers 3–4 open |

**Recommendation (labeled as such):** **Option A** if the owner intends Phase 2 to start soon — the D-016 rationale (Phase 1 validates before Phase 2 builds) argues for desktop feasibility evidence before the transcription foundation. Option C is the minimal-risk middle ground if fixture sourcing is the blocker. **P1-D (Android) is recommended to remain held/deferred regardless** — it additionally requires the Android toolchain and test device (P1-B track, deferred).

**Prerequisites if released:** fixture corpus (owner-authorized or CC-licensed — F1-03 §3), consent for model downloads to `D:\Models\whisper\`, whisper.cpp source location on D: (`D:\DevTools\whisper-src` or `D:\dev-caches\build-sources`).

---

**End of WHISPER_CORE_PLAN.md**
