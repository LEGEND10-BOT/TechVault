# Phase 1 Feasibility — Shared Overview, Prerequisites and Measurement Protocol

**Project:** TechVault
**Document status:** Active specification — drafted by A3, reviewed and promoted to `docs/phase1-plan/` by the Main Controller (2026-11-12); awaiting owner approval to execute (Phase 0 exit gate)
**Version:** 1.0
**Date:** 2026-11-12
**Audience:** Phase 1 executors and the project owner

This file is shared context for the six Phase 1 task packages stored in this directory:

| ID | File | Topic |
|---|---|---|
| F1-01 | `F1-01-tauri-desktop-android.md` | Tauri 2 desktop and Android compatibility |
| F1-02 | `F1-02-video-playback.md` | Video playback and platform player compatibility |
| F1-03 | `F1-03-whisper-cpp.md` | Whisper.cpp desktop and Android feasibility |
| F1-04 | `F1-04-resource-identity-database.md` | Resource identity, deduplication and database integration |
| F1-05 | `F1-05-knowledge-graph.md` | Knowledge graph performance and mobile feasibility |
| F1-06 | `F1-06-extraction-golden-dataset.md` | Resource extraction accuracy and golden dataset preparation |

**Relationship to `docs/PHASE_1_TASK_PACKAGES.md` (A1, promoted 2026-11-12):**
that document is the packaging/ownership layer; these F1-0X specifications are the per-experiment
technical content (steps, criteria, fallbacks, evidence). Cross-walk of IDs (reconciled by the
Main Controller, 2026-11-12):

| A1 package | This directory | Note |
|---|---|---|
| P1-ENV | Overview §4 | Toolchain install order and rationale |
| P1-A / P1-B | F1-01a / F1-01b | |
| P1-E | F1-02 | |
| P1-C / P1-D | F1-03a / F1-03b | |
| P1-F | F1-04 | |
| P1-H | F1-05 | |
| P1-G | F1-06 | |
| P1-I | Security-relevant checks embedded in F1-01/02/03/06 (see §2 flags) | Resolved: P1-I remains a separate package (MASTER_BRAIN workstream H), fed by the embedded checks |
| P1-J | Overview §5 (shared measurement protocol) | Resolved: P1-J remains a separate package (MASTER_BRAIN workstream I), executing this protocol on the reference machine |
| — | Prototype directory | Resolved: `experiments/p1-<id>/` (packaging-document convention) is standard; this overview's earlier `poce/` suggestion is superseded |

Review status: Main Controller review passed (P0-T04, 2026-11-12); owner approval to execute is the Phase 0 exit gate.

---

## 1. Phase 1 Objective

Validate the riskiest technical decisions of the approved architecture with small, throwaway
proofs of concept and reproducible measurements, before large-scale implementation begins
(`docs/DEVELOPMENT_ROADMAP.md` §5; `docs/MASTER_BRAIN.md` Part O, Phase 1).

Phase 1 is **not** application development. Every experiment here produces evidence, not
product code. Prototypes live outside the production source tree (see §7) and may be deleted
after results are recorded.

## 2. Source-Documents Coverage Map (union, with one-document-only flags)

The two source lists differ slightly. Every Phase 1 item is mapped below. Items that appear in
only one source document are flagged `ONE-SOURCE-FLAG` for the Main Controller / owner instead
of being dropped.

| Experiment | DEVELOPMENT_ROADMAP §5 | MASTER_BRAIN Part O Phase 1 | Notes / flags |
|---|---|---|---|
| F1-01a Tauri desktop PoC | 5.1 | (Phase 0 items 2, 3, 14, 15) | `ONE-SOURCE-FLAG`: the basic desktop build sits in roadmap §5.1 but in MASTER_BRAIN Part O it is listed under Phase 0. Phase 0 was executed documentation-only (roadmap §4 forbids generating the full application in Phase 0), so the deferred build validation lands in F1-01. Controller should confirm this reconciliation. |
| F1-01b Tauri Android PoC | 5.2 | Workstream A | Direct match. |
| F1-02 Video playback | 5.4 | Workstream B | Direct match. |
| F1-03a Whisper.cpp desktop | 5.3 | Workstream C | Direct match. |
| F1-03b Whisper.cpp Android | 5.3 (last bullet: "Android feasibility") | Workstream D | Part O splits desktop/Android into two workstreams; roadmap merges them. Covered as sub-parts of one package. |
| F1-04 Database + identity/dedup | 5.5 | Workstream E | Part O workstream E says "SQLite schema and migration tests"; roadmap 5.5 additionally lists resource identity, duplicate candidates, merge preview/rollback/undo. The union is covered in F1-04. |
| F1-05 Knowledge graph | 5.7 | Workstream G | Direct match. |
| F1-06 Extraction accuracy + golden dataset | 5.6 | Workstream F | Direct match. |
| — Security baseline | (absent) | Workstream H | `ONE-SOURCE-FLAG`: appears **only** in MASTER_BRAIN Part O. Not one of the six mandated packages. Interim handling: security-relevant checks are embedded where they naturally occur (F1-01 file-access scope, F1-02 URL/redirect rules, F1-03 temp-file cleanup, F1-06 API-key handling and prompt-injection case). Controller/owner should decide whether a dedicated `F1-07` security-baseline spec is added. |
| — Low-resource hardware benchmark | (absent) | Workstream I | `ONE-SOURCE-FLAG`: appears **only** in MASTER_BRAIN Part O. Interim handling: implemented as the shared measurement protocol in §5 below plus the hardware baseline capture that every experiment must perform. Controller/owner should confirm this is sufficient or request a dedicated spec. |

## 3. Decisions, Risks and Pending Items Addressed

Approved decisions respected by all experiments: D-001 (desktop-first, Android in parallel),
D-002 (transcript retention), D-003/D-004 (OpenRouter default, optional providers), D-005
(managed access — **design only, out of Phase 1 scope**), D-006 (no cloud sync), D-010
(Android minimum version decided after testing), D-011/D-012 (UI system and logo — not
exercised in Phase 1).

Pending items (P-IDs) and recommendations (R-IDs) referenced throughout the task packages:

- P-001 Tauri Android feasibility, P-002 final stack, P-003 Android fallback strategy
- P-004 video playback strategy, P-005 connector coverage, P-006 FFmpeg packaging
- P-007 canonical identity model, P-008 merge thresholds, P-009 AI confidence thresholds,
  P-010 extraction caps, P-011 resource history policy
- P-012 SQLite configuration (FTS5, JSON1, WAL, migrations), P-013 sqlite-vec, P-014 encryption
- P-022 performance budgets, P-023 minimum Android version, P-027 source size limits
- R-001..R-004 stack recommendations, R-005 Resource/Mention separation, R-006 merge history,
  R-007 Whisper.cpp, R-008 Sigma.js/Graphology (benchmark-gated), R-012 capability-based
  playback backends, R-013 golden dataset, R-017 simplified mobile graph, R-021 per-feature
  resource budgets, R-022 Flutter fallback (contingency only)

Any numeric target in the task packages is a **PLANNING TARGET**, to be confirmed or corrected
by measurement. No target in this directory is a measured fact or an approved budget.

## 4. Environment Prerequisites (verified missing, must be installed)

Verified environment facts (Main Controller, 2026-11-11):

- Windows machine, Git 2.56 present, repository initialized on `main` with **no commits yet**.
- **Missing:** Node.js/npm, Rust toolchain (rustc/cargo/rustup), Java/JDK, Android SDK/NDK, adb.
- The approved logo asset is not yet in the repository (irrelevant to Phase 1 experiments).

Recommended install order and rationale (all choices are recommendations under AGENTS.md §6,
subject to owner approval; record exact installed versions in the hardware/software baseline):

| # | Component | Recommendation | Why this order / choice |
|---|---|---|---|
| 1 | Visual Studio Build Tools 2022 | "Desktop development with C++" workload | Provides MSVC compiler/linker + Windows SDK required by the Rust MSVC toolchain. Must precede rustup so the default host toolchain resolves. Tauri docs list Microsoft C++ Build Tools as a Windows prerequisite. |
| 2 | WebView2 Runtime | Verify presence; install Evergreen runtime if absent | Tauri on Windows renders through Microsoft Edge WebView2. Normally preinstalled on current Windows 10/11; verify, do not blindly install. |
| 3 | Rust via rustup | `stable-x86_64-pc-windows-msvc` | Official Rust installer; MSVC host matches step 1. Needed by F1-01, F1-03, F1-04. |
| 4 | Node.js LTS | Current LTS (22.x) with bundled npm | Needed by Vite/Svelte 5/Tauri CLI and the F1-05/F1-06 benchmark harnesses. LTS only, no odd-numbered releases. |
| 5 | JDK 17 | Temurin 17 LTS, set `JAVA_HOME` | Tauri Android tooling requires JDK 17 and a JDK-provided keytool. Android Studio bundles its own JBR, but a stable `JAVA_HOME` avoids drift. |
| 6 | Android Studio | Default install, then SDK + NDK (side-by-side) via SDK Manager | Single supported way to obtain Android SDK/NDK and device drivers. Set `ANDROID_HOME`, `NDK_HOME`. |
| 7 | Rust Android targets | `aarch64-linux-android` (minimum), optionally `armv7`, `x86_64`, `i686` | Cross-compilation targets for `cargo tauri android`. aarch64 first: covers virtually all modern physical devices. |
| 8 | adb verification | `adb devices` against the test device with USB debugging | Confirms device access before any Android experiment starts. |

Additional per-experiment prerequisites (fixtures, devices, accounts) are listed inside each
task package. Anything labelled **OWNER-PROVIDED** requires explicit owner action before that
experiment can start.

Hardware baseline (first measurement of every experiment, per §5): the owner machine's CPU is
Intel Core i5-6300U; **RAM capacity is unknown and must be captured before any memory-sensitive
experiment (especially F1-03) draws conclusions.**

## 5. Shared Measurement Protocol

Applies to every experiment (AGENTS.md §11; MASTER_BRAIN Part K; TESTING_STRATEGY §12).

1. **Hardware/software baseline (once, stored in the results folder):**
   - CPU model, core/thread count, clock; **total installed RAM (the known unknown)**;
     GPU; disk type (HDD/SSD/NVMe) and free space; Windows version/build; WebView2 version;
     power plan (record if on battery vs mains).
   - Android test device(s): model, SoC, RAM, storage, Android API level, WebView version.
2. **Timings:** cold vs warm where the distinction applies (app start, model load). Minimum
   5 runs for micro-benchmarks, report median and p95. Record the timing method used.
3. **Memory:** Windows — working set and private bytes of the relevant process (Process
   Explorer / `Get-Process`). Android — `adb shell dumpsys meminfo <package>` (record
   PSS Total and peak where available).
4. **CPU:** sampled utilization during the measured operation (Task Manager / Process
   Explorer / `adb shell top`), recorded as approximate percentage on the fixed hardware,
   not as a portable number.
5. **Disk and sizes:** installer size, installed footprint, APK/AAB size, model file sizes,
   temporary media growth — measured on disk, not estimated.
6. **Version pinning:** record exact versions of Rust, Node, Tauri CLI, key crates, npm
   packages, whisper.cpp commit, model files (including quantization), and device firmware.
   Unversioned results are not acceptable evidence.
7. **Reproducibility:** every experiment keeps the minimal scripts/fixtures needed to re-run
   it; another contributor must be able to reproduce the numbers from the recorded versions.
8. **No secrets in artifacts:** logs, screenshots and result files must never contain API keys
   or tokens. Redact before storing (TESTING_STRATEGY §11).
9. **Honest reporting:** failed or skipped measurements are recorded as such. Never present a
   planning target as a measured result.

## 6. Results-Record Template (every experiment fills one)

Store one `RESULTS.md` per experiment in `docs/phase1-results/F1-0X/` (location is a
**proposal** — confirm with owner) using this template:

```
# F1-0X Results — <title>
Date(s) executed:            Executor:
Environment: (versions table, reference hardware/device, power state)
Protocol deviations:         (any departure from the task spec — must be explained)

## Measurements
| Metric | Method | Runs | Median | p95 | Notes |

## Raw evidence index
| Artifact | File | (log / screenshot / db / apk / csv — filenames, no secrets)

## Acceptance criteria evaluation
| Criterion | Target | Measured | Pass / Fail / N-A |

## Outcome and recommendation
(verified facts vs assumptions, explicitly separated)
Open questions for the owner:
Affected P-IDs / R-IDs:
```

## 7. Workspace, Scope and Safety Rules for Phase 1

- Prototypes and harnesses live under `experiments/p1-<id>/` in the repository (standardized by
  the Main Controller, 2026-11-12; Proposed pending owner approval at P0-T05). Do **not** build
  them into `src/` or `src-tauri/` — those are reserved for the real application in later phases.
- No full application implementation. No production UI, no navigation, no settings screens.
- No redesign of the approved database (`docs/DATABASE_DESIGN.md`); F1-04 prototypes the
  documented schema and produces evidence for its explicitly pending §27 items only.
- No replacement of the approved stack unless a genuine blocker is demonstrated and the owner
  approves; Flutter (R-022) is a contingent fallback proposal, never a default.
- No managed-gateway implementation (D-005 direction approved, R-010 design pending, belongs
  to a later phase). F1-06 uses owner-provided BYOK credentials only.
- No cloud sync, no connectors beyond reading public pages where an experiment requires it,
  no bundling of large models, no telemetry.
- Treat all downloaded fixtures and external content as untrusted data (AGENTS.md §9).
- Git: commit the task specs and results records (never secrets or large binaries) on `main`
  or a `phase/1-feasibility` branch per roadmap §13; the repository currently has zero
  commits, so the first commit should precede experiment work.

## 8. Sequencing, Parallelism and Effort

```
F1-01a desktop  ──┬──> F1-01b android ──┐
                  └──> F1-02 (desktop half) ──┐
F1-03a whisper desktop (independent)          ├──> F1-03b android whisper (needs device setup from F1-01b)
F1-04 database/identity (independent)         │
F1-05 graph browser-bench (independent) ──────┤
F1-06 dataset prep (independent) ──> F1-06 run (needs OpenRouter key)
```

- Immediately parallelizable once prerequisites are installed: F1-03a, F1-04, F1-05
  (browser-only half), F1-06 dataset preparation.
- F1-01a precedes F1-01b (Android init expects a working desktop project); F1-01b precedes
  the Android halves of F1-02, F1-03b, F1-05.
- Effort estimates (S ≤ half day, M ≤ 2 days, L ≥ 3 days) are per task package and include
  writing the results record: F1-01 M (a: S–M, b: M–L), F1-02 M, F1-03 M–L, F1-04 M–L,
  F1-05 M, F1-06 L.

## 9. Owner Approvals Needed Before Phase 1 Starts

1. Approve these six task packages (and the two `ONE-SOURCE-FLAG` handling decisions in §2).
2. Approve the toolchain installation list in §4 on the owner machine.
3. Provide/authorize an **Android test device** (physical, USB-debuggable; ideally one
   mid-range device, optionally one low-RAM device) for F1-01b/F1-02/F1-03b/F1-05.
4. Provide an **OpenRouter API key** and a spend cap for F1-06 (rough order of magnitude: a
   few USD for tens of test requests — an estimate, not a quote).
5. Provide or authorize the **test media corpus** (local sample videos with known codecs;
   curated public URLs) for F1-02/F1-03/F1-06.
6. Confirm the results storage location proposal (`docs/phase1-results/`) and the prototype
   scratch directory.
7. Confirm that RAM capacity of the reference machine will be captured as the first
   measurement step (it is currently unknown).
