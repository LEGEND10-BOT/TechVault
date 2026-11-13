# F1-03 — Whisper.cpp Desktop and Android Feasibility

**Project:** TechVault
**Task ID:** F1-03 (sub-parts F1-03a desktop, F1-03b Android)
**Document status:** Proposed task specification, awaiting owner approval
**Version:** 1.0
**Shared context:** read `00-PHASE1-OVERVIEW.md` first.

**Source mapping:** DEVELOPMENT_ROADMAP §5.3 (Whisper.cpp validation, including the "Android
feasibility" bullet); MASTER_BRAIN Part O workstreams C (desktop) and D (Android), which the
roadmap merges into one item. Related MASTER_BRAIN Part F (transcription) and Part Q Q-15.

**Decisions / pending items addressed:** R-007 (Whisper.cpp — approved direction, pending
implementation validation), D-002 (transcript retention — validates that transcription output
is good enough to retain), P-006 (FFmpeg/audio-decode packaging, partially — see scope note),
P-022 (performance budgets), P-027 (source duration limits input), P-023 (Android version
evidence).

---

## 1. Objective

Measure whether whisper.cpp can transcribe real-length audio on the reference desktop
hardware (Intel Core i5-10310U, 32 GB RAM (owner-confirmed 2026-11-12; supersedes earlier i5-10310U reference)) at acceptable speed, memory and
timestamp quality for the models the architecture designates (Tiny through Medium as the
normal initial range, `docs/ARCHITECTURE.md` §7.4), and whether interrupted runs can preserve
partial results. Separately, establish whether whisper.cpp runs at all on the Android test
device and under what model/memory constraints. Output: a model-selection table per platform
with measured realtime factor, memory, and quality observations — the evidence base for the
default model choice and for P-027 duration guidance.

## 2. Technical Questions

Verified facts (from the official whisper.cpp repository — re-verify at execution time):

- whisper.cpp ships an official Android example app (`examples/whisper.android`) built on a
  JNI wrapper (`libwhisperjni.so`); models are copied to the device and picked by the app.
  (github.com/ggml-org/whisper.cpp)
- Standard converted GGML model sizes are approximately: tiny ~75 MB, base ~142 MB,
  small ~466 MB, medium ~1.5 GB (quantized variants exist and are smaller). These are
  upstream-published figures, not measurements on our hardware — we must measure load time
  and RAM ourselves.
- whisper.cpp consumes 16 kHz mono WAV input; other formats require a decode step upstream.
- The library streams incremental segment output via callbacks, which is the mechanism to
  validate for partial-result preservation.

Questions this experiment must answer by evidence:

1. Desktop: build/integration path — CLI binary directly, or a Rust binding crate? (Both are
   candidates; the binding choice is a documented dependency recommendation for Phase 2, not
   a decision made here.)
2. Desktop: realtime factor (processing seconds / audio seconds; RTF <= 1.0 means at least real-time) per model (tiny, base,
   small; medium only if RAM allows) on the i5-10310U, for clear-speech and noisy fixtures.
3. Desktop: peak RAM and CPU per model (planning inputs for P-022 and for the unknown-RAM
   question).
4. Timestamp quality: are segment timestamps accurate enough to support evidence links to
   video positions (MASTER_BRAIN D3)?
5. Interruption: when the process is cancelled mid-file, are already-emitted segments
   recoverable (written out / captured via callback)?
6. Android: does the official example app run on the test device; what are model load time,
   realtime factor and memory (PSS) for tiny and base; does the app survive backgrounding?
7. Audio decode (scoped): converting a common input (e.g. MP4/AAC) to 16 kHz WAV on desktop
   via a local FFmpeg binary — confirm the pipeline shape and record time; full FFmpeg
   packaging/licensing (P-006) remains a later decision, not resolved here.

## 3. Dependencies

- F1-03a is independent of other experiments (needs Git, CMake, and a C++ compiler/toolchain such as MSVC; Rust and the Tauri shell are NOT required — a plain whisper.cpp CLI harness suffices).
- F1-03b needs F1-01b (device + Android toolchain ready) and Android Studio.
- **OWNER-PROVIDED:** audio fixtures — ideally derived from the F1-02 media corpus or
  separately supplied: (a) clear single-speaker technical speech 5–10 min, (b) noisy/multi-
  speaker sample, (c) mixed-language or accented sample, (d) one corrupted/unsupported file
  for error behavior. Fixtures must be owner-authorized or public/creative-commons material
  (TESTING_STRATEGY §4.2 governance).
- Prerequisite gate: reference machine RAM must be captured (overview §5) BEFORE drawing any
  memory conclusions — medium model feasibility is RAM-bound.

## 4. Test Environment

- Reference Windows machine, mains power; whisper.cpp at a pinned commit; models from the
  official sources with checksums recorded.
- Android test device; official whisper.android example at the same pinned commit; models
  pushed via adb; `dumpsys meminfo` for memory.
- Harness location: scratch directory (overview §7), no product integration.

## 5. Minimal Proof of Concept

F1-03a — Desktop:

1. Build whisper.cpp (CLI) at a pinned commit; record build log and binary size.
2. Download tiny, base, small (and medium only if RAM measurement permits) with quantization
   variants noted; record sizes and checksums.
3. Prepare fixtures as 16 kHz mono WAV (record the conversion commands; for one MP4 fixture
   use a local FFmpeg binary and record elapsed decode time — P-006 scoping evidence).
4. Run each model × each fixture; log wall time, segments emitted, peak process memory,
   CPU sample; compute realtime factor.
5. Interruption test: terminate mid-run (graceful cancel via wrapper and hard kill); inspect
   what partial output survives and how.
6. If a Rust binding is exercised (optional but recommended for integration evidence), run
   the same fixture set through the binding and compare results with the CLI.

F1-03b — Android:

1. Build and install the official whisper.android example; push tiny and base models.
2. Transcribe the same fixtures (adapted to the example app's accepted input); record load
   time, transcription time (realtime factor), PSS memory, and any crashes.
3. Background the app mid-transcription; observe process survival/kill behavior (documented
   limitation, not something to engineer around in Phase 1).

Out of scope: integrating whisper into the Tauri app, model download UI, streaming live
transcription, speaker diarization, any product feature. F1-03b uses the upstream example
app as-is.

## 6. Expected Deliverables

- Model-selection table (per platform): model, size, load time, realtime factor (clear and
  noisy fixtures), peak RAM, CPU notes, timestamp observations, partial-result behavior.
- Fixture manifest with provenance and licenses.
- Build logs, run logs, meminfo outputs, interruption test notes.
- Recommendation (labeled as recommendation): default desktop model, feasible Android
  models, and whether Android transcription is viable at all — each mapped to a P-ID.
- Completed results record.

## 7. Measurable Acceptance Criteria

Planning targets — validate by measurement; memory-dependent criteria are explicitly
"measure then decide with owner":

| # | Criterion | Target |
|---|---|---|
| A1 | whisper.cpp builds on Windows from a pinned commit | Pass required (hard criterion) |
| A2 | Tiny and base produce usable transcripts (readable text, correct technical terms mostly present) on the clear fixture | Qualitative pass judged against the fixture's known content; recorded with examples |
| A3 | Realtime factor, desktop, base model, clear fixture | PLANNING TARGET RTF ≤ 1.0 (at least realtime); if > 1.0, tiny-only defaults or longer-runtime disclosure become owner decisions |
| A4 | Peak RAM per model recorded; smallest model meeting A3 stays within a budget the owner accepts given measured RAM | Measure then decide with owner (P-022) |
| A5 | Partial segments preserved after mid-run cancellation (callback/written file) | Pass required for the "preserve partial results" invariant (MASTER_BRAIN C7) — if impossible via tested path, document exact limitation |
| A6 | Corrupted/unsupported input fails with a clear error, no crash of the host process (in binding scenario) | Pass required |
| A7 | Android example app installs and transcribes with tiny model on test device | Pass required for Android viability |
| A8 | Android base model: realtime factor and PSS recorded; no OOM crash on device | Measure then decide with owner |
| A9 | Timestamp spot-check: ≥ 8 of 10 sampled segment starts within ±2 s of true position on the clear fixture | PLANNING TARGET for evidence linking quality |

## 8. Failure Conditions

- whisper.cpp cannot be built/run on Windows at a pinned upstream commit after documented
  attempts.
- No model reaches acceptable transcript quality AND reasonable speed simultaneously
  (quality fails A2 while only slow models are fast enough, or vice versa).
- Partial-result preservation impossible through the tested integration paths.
- Android: tiny model cannot complete transcription on the test device (crash/OOM) — Android
  transcription declared non-viable for that device class pending owner decision.
- RAM discovery: measured machine RAM too low even for base — this is a finding that
  reshapes defaults, not a task failure; escalate with evidence.

## 9. Fallback Options

- Within whisper.cpp (no new approval needed): choose smaller/quantized models; restrict
  transcription to desktop; expose per-machine model guidance. These are capability
  configurations of the approved direction (R-007).
- Slower-than-realtime desktop results: queue-based background processing is the documented
  product pattern (MASTER_BRAIN F3 — processing approach); runtime expectations are
  disclosed to users. Owner confirms defaults.
- Alternative engines (faster-whisper/CTranslate2, Vosk, sherpa-onnx, cloud STT): NOT
  authorized fallbacks. R-007 names whisper.cpp; any replacement is a new proposal with
  evidence, requiring owner approval and a decision-log entry (contingent proposal only).
- Android transcription non-viability: mobile transcription becomes a documented limitation
  (transcripts synced from desktop remain usable on mobile) — product-scope confirmation
  from owner required.

## 10. Evidence and Source References

- whisper.cpp repository and README (models, build): https://github.com/ggml-org/whisper.cpp
- Official Android example: https://github.com/ggml-org/whisper.cpp/tree/master/examples/whisper.android
- Model size figures (tiny ~75 MB … medium ~1.5 GB): whisper.cpp README / model sources —
  treat as upstream claims; measure locally.
- Project documents: `docs/ARCHITECTURE.md` §7.4, §13; `docs/MASTER_BRAIN.md` Part F;
  `docs/TESTING_STRATEGY.md` §7; `docs/DEVELOPMENT_ROADMAP.md` §5.3; `docs/DECISION_LOG.md`
  D-002, P-006, P-022, P-023, P-027, R-007.

**Effort:** F1-03a M; F1-03b M–L. F1-03a parallelizable immediately.
**Costs/owner approvals:** fixture corpus (overview §9 item 5); device access; no API costs.


## 11. Owner authorization update (D-020, 2026-11-13)

The owner selected R-025 Option A. Execute F1-03a desktop-only using the runner at `experiments/p1-c/`. F1-03b Android remains outside this authorization because P1-B is deferred and P1-D remains held. The current session did not execute Windows build/transcription tests; the runner's output must be reviewed and the results recorded before P1-C can be marked complete.
