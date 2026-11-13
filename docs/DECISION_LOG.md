# TechVault Decision Log

**Document status:** Prepared Draft  
**Version:** 1.0  
**Project:** TechVault  
**Purpose:** Maintain a traceable record of important project decisions, approvals, rejected proposals, and unresolved questions.

---

## 1. Why This Document Exists

TechVault will evolve across multiple development phases, AI coding sessions, reviewers, and contributors.

Without a central decision record, the project risks:

- Reopening decisions that were already approved.
- Treating suggestions as confirmed requirements.
- Accidentally removing important functionality.
- Making incompatible architectural changes.
- Losing the reasoning behind technical choices.
- Allowing one development phase to contradict another.

This document is the project's central decision register.

## 2. Decision Status Definitions

| Status | Meaning |
|---|---|
| Approved | Explicitly accepted by the project owner |
| Proposed | Recommended but not yet approved |
| Pending | Requires investigation, evidence, or owner decision |
| Rejected | Considered and explicitly declined |
| Superseded | Replaced by a later approved decision |

A proposal does not become approved through repetition, implementation, or an AI-generated recommendation.

## 3. Decision-Making Rules

1. Important architecture, database, security, and product-scope changes must be recorded.
2. Owner approval must be explicit.
3. Every major decision must include its reason and impact.
4. Technical assumptions must be labelled as assumptions.
5. Experimental results must be recorded separately from opinions.
6. A decision may be changed, but its previous record must remain.
7. No phase may silently override an approved requirement.
8. A recommendation that conflicts with an approved requirement must explain the conflict.
9. Security, privacy, and data-integrity decisions require particular care.
10. AI coding agents must consult this document before proposing significant structural changes.

## 4. Approved Decisions

The following decisions have been explicitly approved by the project owner.

### D-001: Desktop-first development

**Status:** Approved

**Decision:** Build the initial application for desktop. Evaluate Android compatibility in parallel.

**Reason:** Desktop is the first practical target, but Android should not become an expensive architectural rewrite later.

**Impact:**
- Keep core business logic independent of the desktop UI.
- Validate Tauri 2 Android feasibility early.
- Do not promise Android parity before testing.

**Affected documents:** `MASTER_BRAIN.md`, `ARCHITECTURE.md`, `DEVELOPMENT_ROADMAP.md`

### D-002: Transcript retention

**Status:** Approved

**Decision:** Save transcripts by default. The user must be able to delete them.

**Reason:** Transcripts support evidence, search, resource discovery, and notebook research.

**Impact:**
- Define transcript deletion behavior.
- Avoid permanent original-video storage by default.
- Explain retention and deletion behavior in the UI.

**Affected documents:** `MASTER_BRAIN.md`, `DATABASE_DESIGN.md`, `SECURITY.md`

### D-003: Default AI provider

**Status:** Approved

**Decision:** OpenRouter is the default AI provider direction.

**Reason:** A provider abstraction makes it easier to use different models without tying the application to one vendor.

**Impact:**
- Implement a provider interface.
- Keep model selection configurable.
- Avoid hard-coding provider-specific behavior throughout the application.

**Affected documents:** `API_POLICY.md`, `ARCHITECTURE.md`

### D-004: Optional alternative providers

**Status:** Approved

**Decision:** Other providers may be added as optional alternatives, including Gemini, GLM, Ollama, and compatible providers.

**Reason:** Flexibility, local processing options, and future provider choice.

**Impact:**
- Provider support must be capability-based.
- Not every provider is required in the first release.
- Exact supported models remain a separate decision.

**Affected documents:** `API_POLICY.md`

### D-005: Managed default API access

**Status:** Approved in principle, implementation details pending

**Decision:** TechVault should provisionally provide default API access so a new user does not necessarily need to supply their own API key.

**Reason:** Reduce setup complexity.

**Impact:**
- The default key must never be embedded in the desktop application.
- Managed requests must go through a protected server-side gateway.
- Quotas, authentication, rate limits, cost controls, and abuse prevention are required.
- Exact hosting, billing, free quota, and account policy remain pending.

**Affected documents:** `API_POLICY.md`, `SECURITY.md`

### D-006: No cloud sync in initial release

**Status:** Approved

**Decision:** Cloud synchronization is not part of the initial release.

**Reason:** Keep the first version local-first and reduce infrastructure complexity.

**Impact:**
- Prioritize local storage.
- Implement practical export and import.
- Design data structures so synchronization can be considered later without promising it now.

**Affected documents:** `MASTER_BRAIN.md`, `DATABASE_DESIGN.md`, `DEVELOPMENT_ROADMAP.md`

### D-007: Export and import before cloud sync

**Status:** Approved

**Decision:** Provide export/import as the initial data portability approach.

**Reason:** Users need control over their research data without requiring cloud infrastructure.

**Impact:**
- Define supported export formats.
- Test backup and restore.
- Document import conflict handling.

**Affected documents:** `DATABASE_DESIGN.md`, `SECURITY.md`, `DEVELOPMENT_ROADMAP.md`

### D-008: Related AI suggestions

**Status:** Approved

**Decision:** Related AI resource suggestions are enabled by default.

**Reason:** Discovering useful connected resources is part of the product's research value.

**Impact:**
- Clearly distinguish suggestions from explicitly mentioned resources.
- Preserve discovery type and evidence.
- Provide controls to review and manage suggestions.

**Affected documents:** `MASTER_BRAIN.md`, `DATABASE_DESIGN.md`, `API_POLICY.md`

### D-009: Open-source licensing

**Status:** Pending legal review, direction approved

**Decision:** The project is intended to become open source, but the exact license will be selected after reviewing dependencies and legal implications.

**Reason:** Dependency licenses and distribution obligations must be understood before choosing a license.

**Impact:**
- Maintain a dependency inventory.
- Review transitive dependency licenses.
- Do not assume Apache-2.0 or another license is already selected.

**Affected documents:** `SECURITY.md`, `DEVELOPMENT_ROADMAP.md`

### D-010: Android minimum version

**Status:** Pending testing, decision approach approved

**Decision:** Select the minimum supported Android version after compatibility and hardware testing.

**Reason:** Avoid choosing a minimum version based on assumptions.

**Impact:**
- Test actual target devices.
- Evaluate Tauri Android compatibility.
- Record the final minimum version after evidence is available.

**Affected documents:** `ARCHITECTURE.md`, `DEVELOPMENT_ROADMAP.md`, `TESTING_STRATEGY.md`

### D-011: UI design system

**Status:** Approved

**Decision:** Use the owner-provided developer-first design system.

**Key characteristics:**
- Dark-primary visual direction with light theme support.
- Violet accent palette.
- Compact, high-density research workspace.
- Subtle borders and restrained cards.
- Geist Sans/Inter typography direction.
- Geist Mono/JetBrains Mono for technical metadata.
- Tailwind CSS variables.
- Shadcn-style component patterns.
- Lucide icons.
- Responsive desktop and mobile layouts.

**Reason:** Establish a consistent visual identity and avoid arbitrary UI decisions during development.

**Impact:** UI implementation should follow `UI_DESIGN_SYSTEM.md`.

### D-012: Approved logo

**Status:** Approved

**Decision:** Retain the supplied shield and T logo unchanged.

**Reason:** The owner has approved the existing logo.

**Impact:**
- Do not redesign it without permission.
- Use the supplied original asset.
- Verify the actual asset file is available before integrating it.

### D-013: General/Master Control chat boundary

**Status:** Approved

**Decision:** This conversation is the general project-control space.

**Reason:** Keep project coordination separate from actual implementation tasks.

**Impact:**
- Discuss requirements, architecture, approvals, and phase coordination here.
- Perform implementation in the dedicated phase task or development environment.
- Do not claim that a discussion here has changed files in the local project.

### D-014: Phase 0 scope definition (resolves audit finding F-01)

- **Status:** Approved
- **Date:** 2026-11-12
- **Source:** Owner ruling via Main Controller coordination session; A2 audit finding F-01 (Critical)
- **Context:** `MASTER_BRAIN.md` Part O defined Phase 0 as including Tauri/Svelte initialization and a first Windows build, while `DEVELOPMENT_ROADMAP.md` §4 and `PHASE_HANDOFF.md` §5 define Phase 0 as documentation/foundation only. Both cannot govern simultaneously.
- **Options considered:** roadmap §4 documentation-only; MASTER_BRAIN Part O build-included; split with a separate build task.
- **Decision:** The roadmap §4 documentation-only definition of Phase 0 governs. No application implementation occurs in Phase 0.
- **Rationale:** Matches the owner's standing instruction; the environment currently lacks Node/Rust toolchains; the first build is already Phase 1 package P1-A.
- **Evidence:** A2 audit finding F-01; verified repository state (documentation only, zero commits).
- **Impact:** MASTER_BRAIN Part O Phase 0 items 2–5, 14–15 are deferred to Phase 1 package P1-A (toolchain/init verification, first build, size recording) and Phase 2 (production structure); item 7 (logo) awaits asset delivery (D-012). An alignment note is added to MASTER_BRAIN Part O.
- **Affected documents:** `MASTER_BRAIN.md` (Part O note), `DEVELOPMENT_ROADMAP.md` (§4 note), `docs/PHASE_0_EXECUTION_PLAN.md` (OI-01)
- **Next action:** none — implemented in the 2026-11-12 reconciliation pass.

### D-015: Initial source-adapter priority (resolves audit finding F-02)

- **Status:** Approved
- **Date:** 2026-11-12
- **Source:** Owner ruling via Main Controller coordination session; A2 audit finding F-02 (High)
- **Context:** `ARCHITECTURE.md` §7.1 listed Facebook video links first with YouTube/Instagram as future adapters, conflicting with `MASTER_BRAIN.md` Part B2 tiers (YouTube metadata/captions, GitHub, Reddit, Medium in Tier 1; Facebook in Tier 2).
- **Options considered:** MASTER_BRAIN B2 tiers govern; ARCHITECTURE §7.1 list governs.
- **Decision:** MASTER_BRAIN Part B2 tiers govern the initial adapter priority: Tier 1 = generic websites, GitHub public repositories, YouTube metadata and permitted captions, Reddit public content, Medium accessible articles; Tier 2 = Facebook, Instagram, TikTok, X/Twitter, Telegram (conditional); Tier 3 = user-assisted (local uploads, pasted transcripts/descriptions, imported text).
- **Rationale:** The Master Brain is the product constitution; the tiers reflect the product's video-research purpose; capability-based support is preserved.
- **Evidence:** A2 audit finding F-02.
- **Impact:** `ARCHITECTURE.md` §7.1 is aligned to the tier model in the 2026-11-12 reconciliation pass. Phase 1 playback validation (F1-02) and Phase 2 source-management scope follow this priority.
- **Affected documents:** `ARCHITECTURE.md` (§7.1)
- **Next action:** none — implemented.

### D-016: Transcription integration phase placement (resolves audit finding F-03)

- **Status:** Approved
- **Date:** 2026-11-12
- **Source:** Owner ruling via Main Controller coordination session; A2 audit finding F-03 (High)
- **Context:** `DEVELOPMENT_ROADMAP.md` §6.6 placed the local transcription foundation (Whisper.cpp integration, model management, transcript storage/deletion) in Phase 2; `MASTER_BRAIN.md` Part O and `PHASE_HANDOFF.md` §5 placed "Transcription integration" in Phase 3.
- **Options considered:** Phase 2 foundation; Phase 3 with AI integration.
- **Decision:** Transcription foundation is built in Phase 2 (per roadmap §6.6); Phase 3 consumes transcripts for AI extraction and research features.
- **Rationale:** Transcripts are core data-layer functionality tied to D-002 (retention/deletion) and the Phase 2 database work; Phase 1 already validates Whisper.cpp (packages P1-C/P1-D), de-risking a Phase 2 integration.
- **Evidence:** A2 audit finding F-03.
- **Impact:** `MASTER_BRAIN.md` Part O Phase 2/3 work lists and `PHASE_HANDOFF.md` §5 Phase 2/3 lists are aligned in the 2026-11-12 reconciliation pass.
- **Affected documents:** `MASTER_BRAIN.md` (Part O Phase 2, Phase 3), `PHASE_HANDOFF.md` (§5)
- **Next action:** none — implemented.

### D-017: Phase 1 feasibility work approved (Phase 0 exit gate, P0-T11)

- **Status:** Approved
- **Date:** 2026-11-12
- **Source:** Owner ruling via Main Controller coordination session (roadmap §4 exit criterion)
- **Context:** Roadmap §4 requires owner approval of Phase 1 feasibility work before Phase 0 closes.
- **Decision:** Phase 1 feasibility work is approved. The Phase 1 scope of record is packages P1-ENV and P1-A..P1-J (`docs/PHASE_1_TASK_PACKAGES.md`) with the experiment specifications in `docs/PHASE_1_FEASIBILITY_PLAN.md` and `docs/phase1-plan/` (F1-01..F1-06).
- **Rationale:** All roadmap §4 exit criteria are met after decisions D-014..D-016; the feasibility plan passed Main Controller review (P0-T04).
- **Evidence:** A2 audit (no unresolved critical contradiction after D-014..D-016); Main Controller review of the feasibility plan; owner approval recorded 2026-11-12.
- **Impact:** Execution starts after the T02 reconciliation, the baseline Git commit (P0-T06), and toolchain installation (P0-T07 / P1-ENV). Spend-bearing items (OpenRouter test key, Android SDK/emulator downloads) and owner-provided resources (test device, media corpus) still require per-item authorization at Gate 0 (`PHASE_1_TASK_PACKAGES.md` §4). All numeric targets remain planning targets until measured.
- **Affected documents:** `docs/PHASE_1_TASK_PACKAGES.md`, `docs/PHASE_1_FEASIBILITY_PLAN.md`, `docs/PHASE_0_EXECUTION_PLAN.md` (P0-T11)
- **Next action:** P0-T06 baseline commit, then P1-ENV.

### D-018: Phase 0 closure authorization and Phase 1 execution priorities (2026-11-13 owner directive)

- **Status:** Approved
- **Date:** 2026-11-13
- **Owner:** Project owner (execution directive "Phase 0 Closure + Phase 1 Completion Sprint")
- **Source:** Owner directive delivered to the implementation/verification agent; verified repository state (commits `1f815b7`, `196b3bc` on `main`)
- **Context:** Phase 0 work was complete in substance but the closure was never formally recorded; handover statements conflicted about P1-B/P1-C/P1-D status; the owner directed a completion sprint instead of further planning.
- **Decision (recorded as directed by the owner):**
  1. Phase 0 is authorized to close once the mandatory roadmap §4 exit criteria are verified satisfied; P0-T08 (logo asset delivery) remains an owner-input item and is not an exit criterion.
  2. P0-T05 repository conventions are approved (§6 of `PHASE_0_EXECUTION_PLAN.md`, including `experiments/p1-<id>/` and `docs/phase1-results/` locations).
  3. P1-B (Tauri Android PoC) remains deferred — Android SDK/NDK and a test device remain undelivered/unauthorized (Gate 0 inputs).
  4. P1-C/P1-D (Whisper.cpp desktop/Android validation) are **on hold** by owner direction. They remain Phase 1 items (D-016 placement unchanged); the hold is a pause, not a move to Phase 2.
  5. Phase 1 execution priority: **P1-G, then P1-H**, then other eligible packages in dependency order.
  6. The directive also records an owner direction "Cloud Rust approved" (verbatim). Interpretation — Rust toolchain use authorized in the Z.ai Cloud workspace — is noted but unconfirmed in detail; it has no operational effect on the Desktop workspace (`D:\TechVault`) work recorded here.
  7. Standing rules re-affirmed: no paid API usage without owner-supplied credentials and an explicit spend cap; no external Git push; one active workspace at a time.
- **Rationale:** Owner explicitly authorized closure and set execution priorities; repeated planning cycles were rejected by the owner.
- **Evidence:** Owner directive text (2026-11-13); Git history (`1f815b7` Phase 0 baseline, `196b3bc` P1-A); `docs/phase1-results/F1-01/RESULTS.md`.
- **Impact:** `docs/PHASE_0_CLOSURE.md` created; Phase 0 statuses reconciled; Phase 1 execution proceeds with P1-G dataset+harness (API run phase blocked pending owner key/spend cap per item 7) and P1-H benchmark; P1-B/C/D not executed.
- **Affected documents:** `docs/PHASE_0_CLOSURE.md`, `docs/PHASE_0_EXECUTION_PLAN.md`, `docs/PHASE_1_STATUS_MATRIX.md`, `docs/PHASE_HANDOFF.md`, `docs/CHANGELOG.md`
- **Next action:** Execute P1-G (dataset + harness) and P1-H (benchmark) per directive; record blocked items honestly.

### D-019: Owner decisions on P-022, Phase 1 holds, live-API timing, and provider capability (2026-11-13)

- **Status:** Approved
- **Date:** 2026-11-13
- **Owner:** Project owner (Phase 1 execution-continuation directive)
- **Source:** Owner directive "Phase 1 Execution Continuation"; decisions recorded verbatim as instructed
- **Context:** Remaining Phase 1 execution needed explicit rulings on the RAM-budget metric, held packages, live-API timing, and the intended provider capability model after an API-key exposure incident.
- **Decision (recorded exactly as directed by the owner):**
  1. **P-022: Option A APPROVED** — private bytes are the primary RAM-budget metric with the **150 MB planning target**; working-set measurements remain supplementary diagnostic information. (Resolves the decision request in `docs/phase1-results/F1-01/CLOSURE-ADDENDUM.md` D2.)
  2. **P1-C: HOLD — do not execute.**
  3. **P1-D: HOLD — do not execute.**
  4. **P1-G live OpenRouter benchmark: LATER** — no live API calls and no API-quota consumption in the current execution; the completed dataset and mock harness are preserved.
  5. **OpenRouter SDK example (owner-provided):** establishes intended provider capability for general text-model and audio/TTS integration — it is **not** permission for live testing or spending. Text generation and TTS are documented as separate model capabilities using the same provider integration where supported (no separate credentials required); both stay configurable. Proposed model identifiers from the owner — `nvidia/nemotron-3.5-super-vl:free` (text) and `fish-audio/s2.1-pro-free:free` (TTS) — are proposals, not verified compatibility or permanent defaults; verify availability when live testing is explicitly authorized.
  6. **API-key incident (security):** the OpenRouter key exposed in a conversation is treated as **compromised**. It must not be copied, stored, tested, committed, logged, printed, or reused by any agent; the owner must revoke it and generate a replacement out-of-band. Replacement credentials are never requested in chat; documentation uses the placeholder `OPENROUTER_API_KEY`. BYOK credentials use secure OS credential storage; managed shared keys remain server-side and never enter the desktop application. No live API calls in this execution.
  7. **D-drive policy:** project-related applications, tools, caches, models, temporary files, and generated outputs live on D: (project repository `D:\TechVault` contains repository files only). Migration follows vendor-supported reinstall where safe; Windows-managed components stay documented on C:. (Implementation record: D-drive audit + actions in the Phase 1 continuation report and `docs/PHASE_1_STATUS_MATRIX.md`.)
- **Rationale:** Owner rulings resolve P-022 (previously owner-decision-required), confirm holds, defer spend-bearing work, and establish the credential-incident protocol.
- **Evidence:** Owner directive text (2026-11-13); verified repository state (HEAD `8817d3e` before this decision).
- **Impact:** `SECURITY.md` §6.4 and `API_POLICY.md` §12.1/§12.2/§8 updated; P-022 moves from Pending to resolved-by-decision in §6; P1-G run phase remains gated on a future explicit owner authorization; P1-C/P1-D remain held; D-drive migration tasks authorized with the documented safeguards.
- **Affected documents:** `docs/DECISION_LOG.md`, `docs/SECURITY.md`, `docs/API_POLICY.md`, `docs/PHASE_1_STATUS_MATRIX.md`, `docs/phase1-results/F1-01/CLOSURE-ADDENDUM.md` (P-022 outcome note)
- **Next action:** continue Phase 1 execution under these decisions; no live API usage.

## 5. Proposed Recommendations

These recommendations came from the technical review process or subsequent architecture planning. They are not automatically approved merely because they appear here.

| ID | Recommendation | Current status |
|---|---|---|
| R-001 | Use Tauri 2 for the desktop shell | Proposed, requires feasibility validation |
| R-002 | Use Rust for the UI-independent core | Proposed |
| R-003 | Use Svelte 5, Vite, and strict TypeScript | Proposed |
| R-004 | Use SQLite with FTS5 | Proposed |
| R-005 | Separate Resource and Mention entities | Strong recommendation, requires schema approval |
| R-006 | Preserve permanent merge history and support undo | Proposed |
| R-007 | Use Whisper.cpp for local transcription | Approved direction, implementation validation pending |
| R-008 | Use Sigma.js and Graphology for knowledge graph | Proposed, benchmark required |
| R-009 | Use OS secure credential storage for BYOK | Proposed |
| R-010 | Use a managed server-side API gateway | Required by D-005, design pending |
| R-011 | Keep embeddings out of the initial release | Proposed |
| R-012 | Use capability-based video playback backends | Proposed |
| R-013 | Use a golden dataset for extraction regression | Strong recommendation |
| R-014 | Add a Data Egress Ledger | Proposed |
| R-015 | Provide first-run Local, Cloud, and No AI choices | Proposed, exact modes need design |
| R-016 | Keep external connectors disconnected until authorized | Proposed security requirement |
| R-017 | Use a simplified mobile knowledge graph | Proposed |
| R-018 | Support Markdown, JSON, and CSV export where appropriate | Proposed |
| R-019 | Add backup and restore | Required product direction, detailed design pending |
| R-020 | Use a command palette | Proposed |
| R-021 | Establish per-feature resource budgets | Required before performance sign-off |
| R-022 | Use a Flutter fallback only if Tauri Android fails | Proposed contingency |
| R-023 | Adopt the extensible API configuration structure (`docs/API_CONFIGURATION.md` + `config/api/providers.schema.json` + `config/api/providers.placeholder.json`) as the Phase 1-closure configuration architecture: 5 provider adapters (OpenRouter default, Gemini, Z.ai/GLM, Ollama local, OpenAI-compatible) with capability flags, connection/validation status lifecycle, OS-keychain key references, placeholders only. **Reason:** directive 82417 establishes the configuration structure before keys exist. **Evidence:** offline structural validation PASS (5/5 records). **Impact:** configuration schema fixed before Phase 2/3 provider work; no code, no keys, no calls. **Cost:** none. **Risks:** schema may evolve at implementation (versioned). **Owner approval required:** adoption at Gate 1. **Status:** Proposed (2026-11-13) |
| R-024 | Adopt the Whisper Core architecture and integration plan (`docs/WHISPER_CORE_PLAN.md`) as the reference design for the Phase 2 transcription foundation (roadmap §6.6): job-model integration, model manager (Tiny→Medium; larger optional hardware-gated), consent-gated downloads to configurable `D:\Models\whisper\`, temp-media cleanup, CPU/RAM monitoring, no background services. **Reason:** directive 82417 brings Whisper Core into closure scope without changing P1-C/P1-D holds. **Evidence:** plan maps every required item; verification tiers 2–4 explicitly NOT performed. **Impact:** guides Phase 2 §6.6; P-006 decode decision still open. **Cost:** none now. **Risks:** binding-vs-CLI choice pending P1-C evidence. **Owner approval required:** adoption at Gate 1. **Status:** Proposed (2026-11-13) |
| R-025 | Resolve P1-C/P1-D holds at Gate 1 by choosing: (A) execute P1-C desktop-only now [recommended if Phase 2 starts soon], (B) formally defer P1-C to Phase 2, or (C) build-only partial verification. P1-D recommended to remain held/deferred regardless (needs Android toolchain + device). **Reason:** D-016's de-risking intent requires feasibility evidence before Phase 2 transcription work; the hold cannot be silently changed (D-019). **Evidence:** full option analysis with costs in `docs/WHISPER_CORE_PLAN.md` §3. **Impact:** determines whether Phase 2 §6.6 starts with measured RTF/RAM. **Cost:** A ≈ build + 1–2 model downloads (~75–466 MB) + fixtures; B/C minimal. **Risks:** A adds a heavy source tree to D:; B leaves Phase 2 de-risking unfulfilled. **Owner approval required:** yes — this is an owner decision, not an agent action. **Status:** Proposed decision request (2026-11-13) |

Recommendations must be reviewed against product scope, implementation cost, security, and measured feasibility.

## 6. Pending Decisions and Investigations

The following items must not be silently treated as settled.

### Architecture and platform

| ID | Pending item | Required next action |
|---|---|---|
| P-001 | Tauri 2 Android feasibility | Build a minimal Android proof of concept |
| P-002 | Final frontend/backend stack | Validate build, maintenance, and platform needs |
| P-003 | Android fallback strategy | Decide only after Tauri PoC results |
| P-004 | Video playback strategy | Test local, embed, and external playback capabilities |
| P-005 | Platform connector coverage | Define supported sources and limitations |
| P-006 | FFmpeg packaging and Android dependencies | Prototype and measure |

### Data and identity

| ID | Pending item | Required next action |
|---|---|---|
| P-007 | Canonical resource identity model | Approve stable identifiers and matching rules |
| P-008 | Automatic merge thresholds | Validate using representative identity cases |
| P-009 | AI confidence thresholds | Evaluate against the golden dataset |
| P-010 | Per-source extraction caps | Measure noise and recall before setting limits |
| P-011 | Resource version/history policy | Define meaningful change events |
| P-012 | SQLite configuration | Validate FTS5, JSON1, WAL, and migration behavior |
| P-013 | sqlite-vec adoption | Benchmark and justify before inclusion |
| P-014 | Database encryption | Evaluate threat model, performance, and recovery |

### AI and API

| ID | Pending item | Required next action |
|---|---|---|
| P-015 | Managed gateway hosting | Compare operational and security options |
| P-016 | Managed API authentication | Define user identity and authorization |
| P-017 | Free usage quota and billing | Approve sustainable usage policy |
| P-018 | Supported model list | Validate capability, cost, and reliability |
| P-019 | Per-task model overrides | Define settings and safe defaults |
| P-020 | Local-only processing modes | Define exactly what runs locally |
| P-021 | Data Egress Ledger | Decide whether and how to implement |

### Release and operations

| ID | Pending item | Required next action |
|---|---|---|
| P-022 | Performance budgets | **Resolved for the idle-RAM metric by decision D-019 (2026-11-13): primary metric = private bytes, 150 MB planning target; working set supplementary.** Numeric per-feature budgets continue to be set from measurements (roadmap §16) |
| P-023 | Minimum Android version | Test representative devices |
| P-024 | Open-source license | Complete legal and dependency review |
| P-025 | Update mechanism | Evaluate signing, verification, and rollback |
| P-026 | Release signing | Define platform-specific release process |
| P-027 | Source size/duration limits | Measure processing and storage behavior |
| P-028 | Telemetry policy | Preserve no-telemetry-by-default direction and review any optional diagnostics |



### D-020: Authorize P1-C desktop-only Whisper feasibility execution

- **Status:** Approved
- **Date:** 2026-11-13
- **Owner:** Project owner (explicit chat directive)
- **Source:** Owner instruction: “A: P1-C desktop Whisper verification abhi execute karo.”
- **Context:** P1-C was previously held in D-018 and R-025 requested a choice. The owner has now selected Option A.
- **Options considered:** R-025 A (desktop-only execution), B (defer to Phase 2), C (build-only partial).
- **Decision:** Execute P1-C desktop-only. P1-D remains HELD; no Android work is authorized by this decision. Use the existing approved whisper.cpp direction (R-007), not an alternative engine.
- **Rationale:** Obtain measured build, transcription, resource, timestamp and interruption evidence before Phase 2 transcription implementation.
- **Evidence:** Owner directive. Execution harness added at `experiments/p1-c/`. Actual Windows execution evidence is not present in this workspace; therefore P1-C is **AUTHORIZED / EXECUTION PACKAGE PREPARED**, not COMPLETE.
- **Impact:** Adds a standalone feasibility experiment only. No production application integration, no Phase 2 implementation, no background service. Models are downloaded only on explicit execution and stored under `D:\Models\whisper`.
- **Affected documents:** `docs/WHISPER_CORE_PLAN.md`, `docs/PHASE_1_STATUS_MATRIX.md`, `docs/PHASE_1_GATE1_READINESS.md`, `docs/PHASE_HANDOFF.md`, `docs/phase1-plan/F1-03-whisper-cpp.md`.
- **Dependencies:** Windows MSVC/CMake/Git toolchain; owner-authorized longer speech fixture for A5 and meaningful multilingual/quality testing.
- **Next action:** ~~Run `experiments/p1-c/Run-P1C-Desktop.ps1` on the Windows reference workstation~~ **DONE 2026-11-13** — executed on the Windows reference machine: build PASS at pinned commit `371b5a7` (`371b5a75…4727b`), tiny/base/small/medium transcription PASS, corrected RTF (base 0.292; medium 2.589 non-real-time), corrupted-input PASS. Evidence: `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md`, `P1-C-RUNNER-FIX-REPORT.md` (runner fixes verified 8/8), `P1-C-desktop-results.json` + logs. P1-C remains open only for A5 cancellation + definitive long-duration RTF (owner-authorized fixture) and optional multilingual quality.
- **Approval record:** Explicit owner instruction in this conversation, 2026-11-13.
- **Addendum (2026-11-13, execution):** the historical evidence line above ("Actual Windows execution evidence is not present") was true when recorded and is now superseded by the Windows execution same day. Original JSON `realtime_factor` fields are invalid (pre-fix WAV-duration parser defect); use the audit report's corrected figures.
- **Addendum (2026-11-13, D-REG-9 execution):** closure-state commit created — **hash `4dba5af`** on `main` ("phase-1: Gate-1 owner acceptance (D-021/D-REG-1) — Phase 1 closure package committed (D-REG-9)", 66 files, no push).

### R-023 / R-024 disposition (owner-delegated adoption)

- **R-023 API configuration structure:** Adopt the documented provider registry/schema as a Phase 2 reference design. This is configuration architecture only; no API keys, live calls, or provider adapters are authorized by this adoption.
- **R-024 Whisper Core plan:** Adopt `docs/WHISPER_CORE_PLAN.md` as the Phase 2 reference design, subject to P1-C desktop evidence. This does not authorize production transcription integration during Phase 1.

### D-021: Phase 1 Gate-1 acceptance approved by owner (D-REG-1) and closure-state commit authorized (D-REG-9)

- **Status:** Approved
- **Date:** 2026-11-13
- **Owner:** Project owner (explicit chat directive)
- **Source:** Owner directive finalizing the Phase 1 owner approval package (`docs/PHASE1-OWNER-APPROVAL-PACKAGE.md`)
- **Decision (recorded exactly as authorized):**
  1. **D-REG-1 APPROVED** — Phase 1 Gate-1 acceptance is approved with all remaining exceptions and deferred work transparently documented (P1-B DEFERRED; P1-D HELD; P1-G live benchmark LATER under D-019; P1-C A5 cancellation/long-duration RTF and Urdu quality pending owner fixture; P1-E A4 PARTIAL; P0-T08 logo pending for the Phase 2 shell; P1-A human file-picker click-through remains NOT RUN pending owner verification).
  2. **D-REG-9 AUTHORIZED** — the reviewed Phase 1 closure-package state is committed (one descriptive commit; no push).
  3. **API configuration stays disabled** — all providers remain disabled; no activation, live calls, or key generation/replacement. Disabled configuration does **not** revoke the previously exposed OpenRouter key: revocation remains a separate owner security action.
  4. **P1-A click-through** — automation investigated against the existing harness and WebView2 UIA capabilities; **not safely automatable in the session environment** (8+ documented attempts including a free-display retry; one non-reproducible historical success). Status remains **NOT RUN** with exact owner instructions in `docs/phase1-results/F1-01/CLOSURE-ADDENDUM.md` D1.
  5. **Outstanding work register** — recorded in `docs/PHASE1-REMAINING-ACTIONS.md` and the owner approval package; no incomplete item is promoted to PASS.
- **Evidence:** `docs/PHASE1-OWNER-APPROVAL-PACKAGE.md` (verification record + decision register); `docs/GATE1-FINAL-ACCEPTANCE-REPORT.md`; `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md`; regression suite results (runner-fix 8/8, P1-F 9/9, P1-G mock reproduced, svelte-check 0/0, security scan clean).
- **Impact:** Phase 1 is formally accepted by the owner (Gate-1 CLOSED by owner approval). Phase 2 planning/authorization proceeds per the recommended order; the deferrals and security action carry into Phase 2.
- **Affected documents:** `docs/DECISION_LOG.md`, `docs/PHASE1-OWNER-APPROVAL-PACKAGE.md`, `docs/PHASE1-REMAINING-ACTIONS.md`, `docs/PHASE_1_STATUS_MATRIX.md`, `docs/PHASE_HANDOFF.md`, `docs/CHANGELOG.md`.
- **Next action:** owner security action (revoke the exposed OpenRouter key); Phase 2 kickoff per the Gate-1 report §I when the owner initiates it.

## 7. Decision Record Template

Use this template for every significant new decision.

### D-XXX: [Decision title]

- **Status:** Proposed / Approved / Pending / Rejected / Superseded
- **Date:**
- **Owner:**
- **Source:** Owner request / Technical audit / Prototype / Security review / Other
- **Context:** What problem requires a decision?
- **Options considered:**
- **Decision:** What was selected?
- **Rationale:** Why was it selected?
- **Evidence:** Test results, documentation, audit findings, or measurements.
- **Impact:** Architecture, database, security, UI, performance, or scope.
- **Affected documents:**
- **Dependencies:**
- **Next action:**
- **Approval record:**

## 8. Change and Approval Procedure

When a new recommendation is raised:

1. Record it as Proposed or Pending.
2. Explain its benefits, disadvantages, and risks.
3. Identify affected documents and existing decisions.
4. Gather evidence where needed.
5. Present it to the project owner.
6. Record explicit approval or rejection.
7. Update affected project documents.
8. Record implementation only after the relevant phase begins.

When an approved decision changes:

1. Do not erase the old decision.
2. Mark it Superseded.
3. Create a new decision record.
4. Explain why the change is necessary.
5. Identify migration or compatibility consequences.
6. Update all affected documentation.

## 9. AI Agent Rules

Any AI coding or research agent working on TechVault must:

- Read this document before major design or implementation work.
- Respect Approved decisions.
- Clearly label proposals and assumptions.
- Never invent owner approval.
- Never silently remove an approved requirement.
- Report conflicts between requirements.
- Identify affected files before structural changes.
- Update this document only when a decision has actually been made.
- Never record an unverified technical assumption as a measured fact.

## 10. Current Decision Summary

**Approved direction:** Desktop-first, Android evaluation in parallel, local-first initial release, transcript retention with user deletion, OpenRouter default, optional providers, provisional managed API access, export/import before cloud sync, related AI suggestions enabled by default, approved UI design system, and unchanged supplied logo. Additionally (2026-11-12): Phase 0 executed documentation-only with MASTER_BRAIN Part O items deferred (D-014), MASTER_BRAIN B2 adapter tiers govern the initial adapter priority (D-015), transcription foundation is built in Phase 2 (D-016), and Phase 1 feasibility work is approved (D-017). Additionally (2026-11-13): Phase 0 closure authorized with repository conventions approved and Phase 1 priorities set to P1-G → P1-H; P1-B remains deferred; P1-C/P1-D were held by D-018. **D-020 supersedes the P1-C hold only:** P1-C desktop-only execution is now authorized under R-025 Option A; P1-D remains held. R-023 and R-024 are adopted as Phase 2 reference designs.

**Still requiring technical validation:** Tauri Android, video playback, final stack, database configuration, resource identity and merge thresholds, graph implementation, performance budgets, and release packaging.

**Still requiring owner decisions:** Exact managed API usage policy, licensing, Android minimum version, optional security/privacy features, and other items listed in Section 6.

---

**Maintenance rule:** Append new decisions. Do not rewrite project history. Keep this document synchronized with `MASTER_BRAIN.md`, affected technical documents, and the phase handoff.
