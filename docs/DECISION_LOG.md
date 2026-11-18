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

### Phase 2 planning recommendations (OD-1..OD-12) — Proposed (2026-11-14)

- **Status:** all twelve are **Proposed**. They are recommended decisions documented in `docs/PHASE_2_OPEN_DECISIONS.md` (Rev 1.2) per the owner's planning directives (2026-11-13 kickoff; 2026-11-14 corrections; 2026-11-14 approval-semantics correction). **None is approved.** Each becomes a decision only through separate, explicit owner approval recorded in this log. Existing approved decisions (D-001..D-021) are unaffected.
- **Explicit exception recorded by the owner's 2026-11-14 directive:** the **OD-1 neutral-placeholder approach** (M1 shell ships with a neutral wordmark placeholder; no shield/T approximation; verbatim integration when the owner delivers the exact asset) is authorized as an interim measure. Actual logo asset delivery and full logo integration remain a pending owner action.
- **Gate effects (per the owner's readiness correction):** OD-6 (strict CSP, Proposed) and OD-8 (in-house primitives, Proposed) must be owner-approved before M0/M1 implementation is unconditional; OD-4 blocks M2; OD-2/OD-3 are M8 decisions only; OD-11 fixtures gate M8 closure.
- **Status update (2026-11-14, D-026):** the owner ruled on the M1 planning package — **OD-4 is approved WITH AMENDMENTS, OD-7's methodology is approved, and OD-9 is approved** (full record: D-026, §4; mandatory schema amendments in `PHASE_2_M1_DATABASE_DESIGN.md` v1.1). OD-1 (placeholder authorized; asset delivery pending), OD-2, OD-3, OD-5, OD-10, OD-11, OD-12 remain Proposed/owner-action exactly as recorded. M1 implementation authorization was explicitly not granted by D-026.

| ID | Recommended decision (summary — full detail in `PHASE_2_OPEN_DECISIONS.md`) | Status |
|---|---|---|
| OD-1 | Neutral placeholder in M1; exact approved shield/T asset integrated verbatim on delivery; placeholder approach explicitly authorized by owner directive 2026-11-14 | Proposed — asset delivery pending (owner action) |
| OD-2 | whisper.cpp CLI subprocess behind a Rust engine adapter; a binding only with measured justification | Proposed |
| OD-3 | FFmpeg optional bundled sidecar for 16 kHz mono PCM WAV; LGPL build preferred; exact build/licensing audited before distribution; never silent GPL; no Python/PyTorch | Proposed |
| OD-4 | Schema v1 with provenance classification (approved decision / Phase 1 evidence / new recommendation); WAL only after concurrency + backup tests; attachments entity; defined migration failure/recovery | **Approved WITH AMENDMENTS 2026-11-14 — D-026** (six mandatory amendments incorporated; `PHASE_2_M1_DATABASE_DESIGN.md` v1.1 governs) |
| OD-5 | YouTube URL sources + user-provided transcript/audio import; automated YouTube ingestion deferred | Proposed |
| OD-6 | Strict production CSP (no remote origins, no unsafe-eval, minimal WebView network, no disabled security checks); separate restricted development CSP; automated configuration checks proving production strictness | **Approved 2026-11-14 — D-022** |
| OD-7 | 150 MB idle private-bytes target retained (approved via D-019); complete-process-tree methodology; idle/startup/search/transcription recorded as separate workloads (methodology additions Proposed) | **Approved 2026-11-14 — D-026** (methodology now an enforceable gate; target D-019) |
| OD-8 | Lightweight in-house accessible Svelte 5 primitives (Tailwind + Lucide); no third-party UI framework | **Approved 2026-11-14 — D-023** |
| OD-9 | Type-specific configurable size limits; archive-bomb protection; safe parsing | **Approved 2026-11-14 — D-026** (defaults: 100 MB media / 20 MB documents / 5 MB pasted text; configurable logged overrides) |
| OD-10 | No bundled models; Base multilingual default; Small/Tiny/Medium options; consent-gated checksummed downloads outside the app dir; inventory/removal | Proposed |
| OD-11 | M8 closure requires long-duration, cancellation/recovery, and Urdu + English + mixed-language fixtures and tests | Proposed — fixture supply is an owner action |
| OD-12 | Owner revokes the exposed OpenRouter key; API activation blocked until secure provider configuration + explicit approval | Owner security action (standing since D-019/D-021) |

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

### D-022: OD-6 approved — strict production CSP, restricted development CSP, and automated verification (2026-11-14)

- **Status:** Approved
- **Date:** 2026-11-14
- **Owner:** Project owner (explicit chat directive)
- **Source:** Owner instruction: "I explicitly approve OD-6 and OD-8 as specified in the Phase 2 Owner Approval Pack and the corresponding architecture and milestone documents. 1. OD-6: Approved. Strict production CSP, restricted development CSP, and automated CSP verification." Recommendation documented in `docs/PHASE_2_OPEN_DECISIONS.md` (Rev 1.2), design in `docs/PHASE_2_ARCHITECTURE.md` §7.3, tasks in `docs/PHASE_2_MILESTONES.md` M0/M1/M10.
- **Context:** OD-6 was recorded **Proposed** in the Phase 2 planning package as the P1-I carry-forward resolution (PoC shells shipped `csp: null`) and gated unconditional M0 readiness. The independent audit assessed it PASS WITH CONDITIONS (production strictness to be proven on the real build).
- **Options considered:** approve as specified; amend; defer (not selected by the owner).
- **Decision:** OD-6 is **approved as specified**: (1) a strict **production CSP** — `default-src 'self'`; no remote script/style origins; no `unsafe-eval`; `connect-src` limited to self plus the required Tauri IPC allowances (`ipc:`, `http://ipc.localhost`); self-hosted fonts; no unnecessary WebView network access; certificate/security checks never disabled; only explicitly required local application resources; (2) a separately configured **restricted development CSP** carrying only the enumerated Vite/HMR allowances, with **no development exception carried into production builds**; (3) an **automated configuration check** (`scripts/check-csp`) proving production strictness and dev-allowance isolation, run at M0, M1, and M10.
- **Rationale:** closes the P1-I security carry-forward verifiably; separation of dev/prod policies prevents development exceptions leaking into production; negligible runtime cost.
- **Evidence:** design and acceptance criteria — `PHASE_2_ARCHITECTURE.md` §7.3, `PHASE_2_MILESTONES.md` M0/M1 (both configurations tested; devtools negative checks); audit findings SEC-01/02/03 in `docs/PHASE_2_INDEPENDENT_AUDIT_REPORT.md` §G-5.
- **Impact:** M0's approval gate is **cleared** — M0 is technically ready and approved-gated; implementation still requires **separate owner authorization** (explicitly withheld by the owner in the same instruction). CSP behavior on the real build remains NOT VERIFIED until M0 executes its tests. Traceability rows SEC-01/02/03 and OD-6 move to Approved (D-022).
- **Affected documents:** `docs/DECISION_LOG.md` (this entry + §5 register + §10 summary), `docs/PHASE_2_OPEN_DECISIONS.md`, `docs/PHASE_2_TRACEABILITY_MATRIX.md`, `docs/PHASE_2_MILESTONES.md`, `docs/PHASE_2_MASTER_PLAN.md`, `docs/PHASE_2_FINAL_READINESS_REPORT.md`, `docs/PHASE_HANDOFF.md` (§17), `docs/PHASE_2_OWNER_APPROVAL_PACK.md` (status note).
- **Dependencies:** none; M0-scoped dependency list unchanged.
- **Next action:** M0 awaits **separate** implementation authorization.
- **Approval record:** explicit owner instruction in this conversation, 2026-11-14.

### D-023: OD-8 approved — in-house Svelte 5 UI primitives with documented accessibility testing (2026-11-14)

- **Status:** Approved
- **Date:** 2026-11-14
- **Owner:** Project owner (explicit chat directive)
- **Source:** Owner instruction: "…2. OD-8: Approved. In-house Svelte 5 UI primitives with the documented accessibility testing requirements." Recommendation documented in `docs/PHASE_2_OPEN_DECISIONS.md` (Rev 1.2), specification in `docs/PHASE_2_ARCHITECTURE.md` §8.2/§8.3, test plan in `docs/PHASE_2_MILESTONES.md` M1.
- **Context:** OD-8 was recorded **Proposed** (the approved design direction D-011 names Radix primitives, which are React-only; the Svelte equivalent needed an explicit decision) and gated unconditional M1 readiness together with OD-6.
- **Options considered:** approve as specified; adopt a third-party library (bits-ui/melt-ui — previously not adopted per the owner's 2026-11-14 corrections directive); defer (not selected).
- **Decision:** OD-8 is **approved as specified**: lightweight **in-house accessible Svelte 5 primitives** (Tailwind + Lucide; WAI-ARIA Authoring Practices patterns; no third-party UI framework — `bits-ui`/`melt-ui` remain not adopted), covering button, card, badge, table, dialog, sheet, dropdown, tabs, toast, tooltip, input, with accessibility **proven by the explicit M1 test plan**: dialogs/sheets (focus moves into the opened surface; keyboard focus cannot escape a modal; Escape closes where appropriate; focus returns to the invoking control; background interaction disabled for modal surfaces); dropdowns/tabs (keyboard navigation per APG; correct ARIA roles and states; focus and selected state synchronized); all primitives (visible focus indicators; screen-reader labels; reduced-motion support; automated accessibility checks; manual keyboard walkthrough; **manual screen-reader smoke test with recorded results**). **ARIA attribute presence alone is never accepted as compliance evidence.**
- **Rationale:** minimal dependencies per AGENTS.md §6; exact fit to the approved design system; smaller bundle/supply-chain surface; accessibility made testable rather than asserted.
- **Evidence:** `PHASE_2_ARCHITECTURE.md` §8.2–§8.3; `PHASE_2_MILESTONES.md` M1 (automated per-primitive suites + manual walkthrough + screen-reader smoke test); audit findings UI-04/07–10 and TEST-09 in `docs/PHASE_2_INDEPENDENT_AUDIT_REPORT.md`.
- **Impact:** M1's approval gate is **cleared** — M1 remains gated on M0 completion and **separate owner authorization** (explicitly withheld in the same instruction). All accessibility claims remain NOT VERIFIED until M1 executes TEST-09. Traceability rows OD-8, UI-04/07/08/09, and TEST-09 move to Approved (D-023).
- **Affected documents:** same set as D-022.
- **Dependencies:** M1-scoped dependency additions only (`lucide-svelte`, `clsx`, `tailwind-merge`).
- **Next action:** M1 awaits M0 completion and **separate** implementation authorization.
- **Approval record:** explicit owner instruction in this conversation, 2026-11-14.

### D-024: DEV-CSP-1 resolved — development-only `script-src 'unsafe-inline'` accepted (Option D) (2026-11-14)

- **Status:** Approved
- **Date:** 2026-11-14
- **Owner:** Project owner (explicit instruction, "M0 Owner Decisions and Verification Record" directive)
- **Source:** `docs/PHASE_2_M0_CSP_DEVIATION_REVIEW.md` §6 Option D (recommended default); root-cause analysis in the same document §2–§3.
- **Context:** M0 implementation found the SvelteKit dev server always injects one inline bootstrap `<script>`; the D-022 development-CSP allowance list as originally worded (dev-server origin, HMR websocket, dev inline styles) did not cover it, so the dev app could not boot under a production-identical `script-src`. Post-review verified from installed sources that no alternative mechanism exists in the current toolchain: SvelteKit's dev server applies no CSP configuration (`kit.csp` is SSR/prerender-only) and Tauri injects a static meta CSP that cannot carry per-request nonces; a hash-pinned dev script is feasible but adds a recompute-on-upgrade maintenance trigger and was not selected.
- **Options considered:** (A) SvelteKit nonce — infeasible; (B) hash-pinned dev `script-src` — feasible, deferred as possible future hardening; (C) custom externalization middleware — rejected; (D) accept the development-only `unsafe-inline` — **selected by the owner**.
- **Decision:** DEV-CSP-1 is **accepted (Option D)**: `app.security.devCsp` may include `script-src 'self' 'unsafe-inline'` solely because the SvelteKit dev server injects an inline bootstrap script. The exception is **confined to the development CSP only**; the production `csp` remains strict (`script-src 'self'`, no `unsafe-inline`, no remote origins) and must never be weakened, modified, or relaxed. `scripts/check-csp` continues to enforce that no dev-only allowance (including this one) appears in the production CSP, and `scripts/verify-prod-csp.mjs` remains the runtime proof. The documented rationale and limitations (CSP review §2–§4) are preserved.
- **Rationale:** smallest safe exception; dev-machine-only surface (localhost dev server, no remote origins permitted in dev either); production strictness independently verified at runtime; no maintenance burden.
- **Evidence:** `docs/PHASE_2_M0_CSP_DEVIATION_REVIEW.md` (source-level analysis §2, options §3); `docs/phase2-results/m0/verify-prod-csp-output.txt` + `post-review-runtime-probe.txt` (production runtime proof); `docs/phase2-results/m0/check-csp-output.txt` (39/39 config checks incl. dev/prod isolation).
- **Impact:** Closes the DEV-CSP-1 condition on M0 criterion 10/16. Production CSP unchanged. Option B (hash pinning) remains available as a separately-authorized future hardening task.
- **Affected documents:** `docs/DECISION_LOG.md` (this entry + §10), `docs/PHASE_2_M0_CSP_DEVIATION_REVIEW.md` (§7 decision record), `docs/PHASE_2_M0_POST_REVIEW.md` (register), `docs/PHASE_2_M0_IMPLEMENTATION_REPORT.md` (addendum), `docs/PHASE_2_TRACEABILITY_MATRIX.md` (§10), `docs/PHASE_2_MILESTONES.md` (M0 status), `docs/PHASE_HANDOFF.md` (§19), `docs/CHANGELOG.md`.
- **Dependencies:** D-022 (governs both CSP policies; unchanged).
- **Next action:** none for M0; re-verify CSP config + runtime at M1 and M10 as already scheduled.

- **Re-confirmation addendum (2026-11-14):** the owner re-approved this decision verbatim in the "Automated Final Verification & Closure Readiness" directive ("DEV-CSP-1: Accept Option D. unsafe-inline is permitted ONLY in the development CSP. Production CSP must remain strict."). Production CSP confirmed free of `unsafe-inline`, `unsafe-eval`, and unnecessary remote sources by `scripts/check-csp` (39/39) and the runtime probes — no new decision ID issued; this entry stands.

- **Re-confirmation addendum (2026-11-14):** the owner re-approved this decision verbatim in the "Automated Final Verification & Closure Readiness" directive ("npm audit: Defer the SvelteKit 3.x upgrade until the M1 dependency review"). The five existing low-severity findings and their dispositions stand unchanged; no upgrade or override performed — no new decision ID issued; this entry stands.
- **Approval record:** explicit owner instruction in this conversation, 2026-11-14.

### D-025: npm-audit findings disposition — SvelteKit 3.x upgrade deferred to the M1 dependency review (2026-11-14)

- **Status:** Approved
- **Date:** 2026-11-14
- **Owner:** Project owner (explicit instruction, "M0 Owner Decisions and Verification Record" directive)
- **Source:** `docs/PHASE_2_M0_DEPENDENCY_AUDIT.md` §4 (disposition recommendations).
- **Context:** `npm audit` at M0 reported 5 low-severity findings (4 advisories: GHSA-pfhg-q3qv-9q6r and GHSA-27mw-82g8-phjj in `@sveltejs/kit` 2.70.4; GHSA-pxg6-pf52-xh8x in `cookie` 0.6.0; GHSA-gcqx-w48m-w2h4 in `deepmerge` 4.3.1 — no patched deepmerge release exists). All live in dev/build/server code paths the TechVault production static SPA does not execute. The only complete fix is the breaking `@sveltejs/kit` 3.2.0 major (+ `@sveltejs/adapter-static` 4.0.1), outside the approved M0 dependency review.
- **Options considered:** upgrade now (rejected); cookie override now (rejected); defer with a planned review milestone (selected).
- **Decision:** the SvelteKit 3.x major upgrade is **deferred to the M1 dependency review**, where it is evaluated together with M1's planned additions (`lucide-svelte`, `clsx`, `tailwind-merge`). **No upgrade is performed now; no cookie overrides or other dependency changes are applied now.** The existing audit findings and their documented risk assessment (dependency audit §2–§3) are preserved unchanged. The formal `npm audit`/`cargo audit` gates at M10 are unaffected.
- **Rationale:** non-exploitable in the shipped architecture, low severity, and the natural evaluation point for a breaking toolchain upgrade is the milestone that already touches frontend dependencies.
- **Evidence:** `docs/PHASE_2_M0_DEPENDENCY_AUDIT.md` (per-finding analysis); `npm audit --json` output summarized there.
- **Impact:** M1 dependency review gains one standing agenda item: assess kit 3.2.0 / adapter-static 4.0.1 compatibility and, if adopted, run the full regression pass (svelte-check, vitest, dev HMR verification, release build, CSP config + runtime checks). `deepmerge` upstream is re-checked at every toolchain upgrade and at M10.
- **Affected documents:** same set as D-024 (with `PHASE_2_M0_DEPENDENCY_AUDIT.md` in place of the CSP review).
- **Dependencies:** none beyond the M1 dependency review itself.
- **Next action:** carry the kit-3 assessment into the M1 dependency review; no action before then.
- **Approval record:** explicit owner instruction in this conversation, 2026-11-14.

### Owner authorization addendum (unnumbered) — M0 exit-gate launch-confirmation waiver (2026-11-14)

- **Type:** Owner authorization addendum — **deliberately unnumbered**: this is not a project decision record and no decision ID was created, reused, or fabricated for it. It is associated with the M0 exit gate (`PHASE_2_MILESTONES.md` M0 field 10) only.
- **Date:** 2026-11-14
- **Owner:** Project owner (explicit instruction, "TechVault Phase 2 M0: Owner Waiver Recording & Formal Final Closure")
- **Authorization:** the owner **explicitly waives the M0 owner-operated launch confirmation requirement**, accepting the existing automated evidence in its place: automated NSIS installation, automated application launch, window and application identity verification, smoke-test indicators, IPC functionality and permission-denial verification, and automated uninstall verification.
- **Accuracy record (owner-stated, binding on all documentation):** the owner personally performed **installation and uninstallation using a command**; the owner did **NOT** personally perform the complete smoke-test checklist. No documentation may claim a complete owner-operated smoke-test checklist. (The owner-supplied screenshot from the earlier verification session remains on file as objective evidence of the app's displayed self-check output; guide §8 has been corrected accordingly.)
- **Scope:** **M0 only.** This waiver does **not** apply to M1 or any future milestone; owner-verification requirements in later milestones stand unmodified.
- **Effect on the M0 exit gate** ("automated suite green + owner launch confirmation + baseline recorded"): satisfied — automated suite green [A]; launch confirmation satisfied through this explicit waiver with the accepted automated evidence [O-authorization]; baseline recorded [A]. Preserved conditions: the documented production-CSP `style-src` console event (the console is **not** clean — one CSP-enforcement entry from the Svelte 5 runtime) and the D-025 kit-3 deferral.
- **Preserved decisions:** D-021, D-024, and D-025 are unchanged in historical meaning; this addendum creates no decision ID and alters none.
- **Evidence:** `docs/PHASE_2_M0_FINAL_VERIFICATION.md`; `docs/PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md` §8/§9/§10; `docs/PHASE_2_M0_CLOSURE_REPORT.md`.
- **Record:** explicit owner instruction in this conversation, 2026-11-14.

### D-026: M1 planning package approved — gate plan, schema v1 (amended), CSP strategy, storage, search, and performance rulings (DP-01..DP-13)

- **Status:** Approved — recorded exactly as ruled: nine rulings **APPROVED**, three **APPROVED WITH AMENDMENTS**, one **DEFERRED** (the distinction is preserved in every ruling below and in the affected documents).
- **Date:** 2026-11-14
- **Owner:** Project owner (explicit directive "TechVault M1: Record Owner-Approved Decisions and Reconcile Audit Findings")
- **Source:** Owner ruling on the M1 blueprint package (`docs/PHASE_2_M1_*` v1.0), the owner approval pack (`docs/PHASE_2_M1_OWNER_APPROVAL_PACK.md`, DP-01..DP-13), and the independent audit (`docs/PHASE_2_M1_INDEPENDENT_AUDIT.md` — verdict PASS WITH CONDITIONS; findings F-1..F-6, H-1..H-3, A-1..A-12).
- **Context:** the M1 blueprint and approval pack packaged thirteen decisions for owner ruling. The independent audit confirmed the prior findings, corrected two (F-1 resolution completeness; F-4 recommendation ordering), and raised four Medium (A-1 undo-after-edit; A-2 source-deletion semantics; A-3 not-the-same persistence; A-4 directory relocation) and seven Low findings. The owner has now ruled on every packaged decision and mandated the audit amendments into the planning documents.
- **Options considered:** per-decision alternatives are recorded in `PHASE_2_M1_OWNER_APPROVAL_PACK.md` §5 (DP-01..DP-13) and remain part of the ruling record.
- **Decision (recorded exactly as authorized by the owner's directive §A–§F):**
  1. **DP-01: APPROVED** — adopt the M1 G1–G12 gate plan and the Rev 1.3 re-mapping (blueprint ref M1-OD-1); Rev 1.3 M-numbers remain the historical record.
  2. **DP-02: APPROVED** — post-M1 order: web ingestion Tier 1a (with the SSRF suite), then the Whisper foundation (OD-2/OD-3/OD-10/OD-11 gates unchanged), then Phase 2 hardening/closure (blueprint ref M1-OD-2).
  3. **DP-03 + OD-4: APPROVED WITH AMENDMENTS** — schema v1 approved subject to all six mandatory amendments (directive §B, incorporated into `PHASE_2_M1_DATABASE_DESIGN.md` v1.1): F-1 merge unions tags, keeps the primary's row on duplicate conflicts, and includes tag rows in the merge undo snapshot; A-1 undo detects post-merge edits and returns a typed conflict rather than silently overwriting; A-2 explicit source-deletion confirmation with mention/evidence cascade semantics preserving resource traceability; A-3 `resource_identity_decisions` persists not-the-same decisions and suppresses future candidate generation; A-8 deterministic category slug generation with collision handling; A-11 verification-status changes are user-controlled and create `resource_history` entries. **No migration files created; no schema implemented.**
  4. **DP-04: APPROVED WITH AMENDMENTS** (directive §C) — production CSP remains strict under D-022 and the D-024 dev-only exception is unchanged; a short, time-boxed investigation of the Svelte runtime style-src event is conducted; if the runtime event cannot reasonably be eliminated, it is documented and accepted as a known condition; an enforceable application coding rule prohibits `style:` directives and `style=` attributes in application components, enforced by extended automated CSP checks; **no production hash allowance is introduced and CSP is not weakened — any such change requires separate owner authorization.**
  5. **DP-05: APPROVED** — UUID-based attachment storage (per-attachment files keyed by UUIDv7; no content-addressed store in M1).
  6. **DP-06: APPROVED** — orphan quarantine with a 30-day grace period and user-visible reporting.
  7. **DP-07 / OD-9: APPROVED** — intake limits: 100 MB media, 20 MB documents, 5 MB pasted text; configurable logged overrides.
  8. **DP-08: APPROVED** — bounded in-house metadata sniffer (no `infer` dependency in M1).
  9. **DP-09: DEFERRED** — the TVDP-1 export/import format decision is **required before G11**; G1–G10 are unaffected.
  10. **DP-10: APPROVED WITH AMENDMENTS** (directive §D) — search defaults approved with FTS5 `remove_diacritics` pinned to **2**; the G8 probe extended with Arabic/Urdu harakat behavior testing; actual observed behavior recorded; honest multilingual limitations preserved; no unsupported claims of Urdu stemming or advanced multilingual search.
  11. **DP-11: APPROVED** — retain system fonts; no Geist bundling in M1.
  12. **DP-12: APPROVED** — Kit 3 adoption only after a complete green regression pass; an adoption outcome is recorded as its own decision record.
  13. **DP-13 / OD-7: APPROVED** — the process-tree methodology and five-workload performance criteria are enforceable gates.
  Additionally (directive §E): F-2 cross-reference corrections before G1; F-3 dedicated test for the default cross-volume copy path; A-4 verified attachment-directory relocation before G3 with DB relocation not offered in M1; A-5 tokenizer configuration corrected and pinned; A-6 no-inline-style rule enforced; A-7 full-replacement restore behavior defined before G10; A-9 accepted text-encoding matrix defined before G4; A-10 backup/export behavior with active jobs defined before G10; A-12 empty transcript tables retained as a documented intentional design choice; remaining audit test-coverage requirements incorporated into the gate specifications.
- **Rationale:** the owner accepted the audited blueprint with the independent audit's amendments made mandatory; the schema surface must be final before migration 001 exists; CSP strictness (D-022) and the D-024 dev-only exception are preserved verbatim; honesty rules (no invented measurements, no unsupported language claims) continue to bind.
- **Evidence:** `docs/PHASE_2_M1_MASTER_BLUEPRINT.md`; `PHASE_2_M1_OWNER_APPROVAL_PACK.md`; `PHASE_2_M1_INDEPENDENT_AUDIT.md`; verification greps recorded in the audit (§2, §3).
- **Impact:** the M1 planning approval gates are **cleared** — G2's OD-4/DP-03 gate is cleared (with the mandatory amendments), G4's OD-9 gate is cleared, and performance criteria operate in gate mode. **M1 implementation remains a separate owner authorization that has NOT been granted.** No gate is marked implemented or passed; nothing here authorizes source, configuration, dependency, migration, or schema changes. Documents reconciled to v1.1 as listed under Affected documents; original audit findings and history preserved.
- **Affected documents:** `DECISION_LOG.md` (this entry, §5 register updates for OD-4/OD-7/OD-9, §10); `PHASE_2_M1_OPEN_DECISIONS.md`; `PHASE_2_M1_DATABASE_DESIGN.md`; `PHASE_2_M1_STORAGE_DESIGN.md`; `PHASE_2_M1_SEARCH_DESIGN.md`; `PHASE_2_M1_SECURITY_REVIEW.md`; `PHASE_2_M1_MILESTONES.md`; `PHASE_2_M1_MASTER_BLUEPRINT.md`; `PHASE_2_M1_ARCHITECTURE.md` (F-2 pointer corrections only); `PHASE_2_TRACEABILITY_MATRIX.md` (§14 status note + §15); `PHASE_HANDOFF.md` (§23); `CHANGELOG.md`; dated status notes on the approval pack and independent audit.
- **Dependencies:** M0 CLOSED (2026-11-14); D-022/D-023/D-024/D-025 unchanged and historically intact.
- **Next action:** DP-09 must be decided before G11; the owner may grant separate M1 implementation authorization at any time — this record is not that authorization.
- **Approval record:** explicit owner instruction in this conversation, 2026-11-14 (directive §A–§G).

### D-027: kit-3 dependency-review outcome — @sveltejs/kit 3.2.0 + adapter-static 4.0.1 ADOPTED (executes the D-026 DP-12 conditional rule)

- **Status:** Approved — conditional-rule outcome (recorded per D-026 ruling 12: "an adoption outcome is recorded as its own decision record").
- **Date:** 2026-11-14
- **Owner:** Project owner — pre-approval of the outcome rule and of the G1 pre-task execution; this record executes that rule and is NOT a new policy decision.
- **Source:** G1 pre-task (M1 dependency review) under the owner's explicit M1 implementation authorization; D-025 (kit-3 deferral to this review); D-026 ruling 12 (DP-12).
- **Context:** D-025 deferred the only complete fix for the M0 npm-audit findings (breaking `@sveltejs/kit` 3.2.0 + `adapter-static` 4.0.1 major) to the M1 dependency review. DP-12 approved the mechanical rule: adopt only after a complete green regression pass; otherwise stay on 2.x.
- **Options considered:** adopt kit 3.2.0 (taken) vs stay on 2.x with documented risk (not taken — the regression was fully green).
- **Decision:** **ADOPT.** `@sveltejs/kit` 3.2.0 and `@sveltejs/adapter-static` 4.0.1 installed; the four kit-3 breaking changes encountered were migrated (kit config inline in `vite.config.js`, flattened `kit` namespace, `$lib`→`#lib` via the package.json `imports` field, tsconfig `extends: "$app/tsconfig"` with an explicit application-scope include). CSP configuration, capability files, and Rust code unchanged.
- **Rationale:** the DP-12 condition is met — the complete regression pass is green: svelte-check 0/0 · vitest 17/17 · cargo fmt/clippy clean + 17/17 tests · `npx tauri build` PASS (MSI 2.04 MiB / NSIS 1.33 MiB) · `check-csp` 39/39 · runtime production CSP probes 5/5 · dev HMR live-verified (committed script PASS). `npm audit` improves 5 low → 4 low (only the unpatched-upstream `deepmerge` dev/build chain remains; re-check obligation per D-025 retained at every toolchain upgrade + closure audit).
- **Evidence:** `docs/phase2-results/m1/kit3-assessment.md` (per-leg table, breaking-change list, post-adoption versions); raw outputs `docs/phase2-results/m1/kit3-regression-outputs.md`.
- **Impact:** the M1 frontend toolchain is kit 3.2.0; no CSP, security-boundary, architecture, or dependency-policy change (vite-plugin-svelte 7.3.1 stays in the D-023-approved set; no new runtime dependencies). The production-CSP `style-src` console event is unaffected (same event, same hash — see the DP-04 investigation record `docs/phase2-results/m1/style-src-investigation.md`).
- **Affected documents:** `DECISION_LOG.md` (this entry, §5 register); `docs/PHASE_2_M1_SECURITY_REVIEW.md` §9 (outcome note); G1 implementation report.
- **Dependencies:** M0 CLOSED; D-022/D-024 CSP baselines unchanged; D-025's deferral is resolved by this record.
- **Next action:** none — review complete. `npm audit fix --force` must NOT be run (it would downgrade kit to 0.0.30).
- **Approval record:** executed outcome of the DP-12 rule explicitly approved by the owner (D-026 ruling 12, 2026-11-14) within the owner's explicit M1 implementation authorization ("begin with G1", 2026-11-14). No new policy is introduced by this record.

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

**Phase 2 planning (2026-11-14):** OD-1..OD-12 recommended decisions are recorded as **Proposed** in Section 5 — none is approved and none may be treated as approved until separately recorded here. The OD-1 neutral-placeholder interim approach is explicitly authorized by the owner's 2026-11-14 directive; logo asset delivery remains a pending owner action. **Update 2026-11-14 (owner instruction): OD-6 is approved as D-022 and OD-8 is approved as D-023;** all other OD recommendations (OD-2, OD-3, OD-4, OD-5, OD-7 methodology, OD-9, OD-10, OD-11) remain **Proposed**, and neither approval constitutes M0 or M1 implementation authorization — those remain separate owner decisions.

**M0 decisions (2026-11-14, owner instruction):** **D-024** — DEV-CSP-1 accepted (Option D): development-only `script-src 'unsafe-inline'` confined to `devCsp`; production CSP unchanged and strict. **D-025** — npm-audit disposition: SvelteKit 3.x upgrade deferred to the M1 dependency review; no dependency changes now. Owner manual verification of the installed M0 release app is recorded in `docs/PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md` §8 and `docs/PHASE_2_M0_POST_REVIEW.md` (SHA-256 artifact check NOT PERFORMED — optional; console-error check not evidenced and remains identified).

**M0 waiver and closure (2026-11-14, owner instruction):** the owner recorded an **unnumbered authorization addendum** (above) explicitly waiving the M0 owner-operated launch confirmation for M0 only, accepting the automated verification evidence (automated install/launch/window/identity/smoke-indicators/IPC/denial/uninstall). Owner-stated accuracy: installation and uninstallation were personally performed via command; the complete smoke-test checklist was **not** personally performed. With this waiver the M0 exit gate is fully satisfied and **PHASE 2 M0: CLOSED** (effective 2026-11-14) is recorded in `docs/PHASE_2_M0_CLOSURE_REPORT.md`. Preserved conditions: the documented production-CSP `style-src` console event (console not clean) and the D-025 kit-3 deferral. The waiver does not apply to M1 or future milestones.

**M1 planning rulings (2026-11-14, owner instruction):** **D-026** records the owner's rulings on the complete M1 blueprint package (DP-01..DP-13): nine rulings **APPROVED** (gate plan G1–G12 + Rev 1.3 re-mapping; post-M1 order; UUID attachment store; orphan quarantine/30-day grace; OD-9 intake limits; in-house sniffer; system fonts/no Geist bundling; kit-3 adopt-only-if-green; OD-7 methodology as enforceable gates), three **APPROVED WITH AMENDMENTS** (DP-03/OD-4 schema v1 with six mandatory amendments; DP-04 CSP strategy preserving D-022/D-024 strictness with a no-inline-style coding rule; DP-10 search defaults with `remove_diacritics=2` pinned and harakat probing), and one **DEFERRED** (DP-09 export/import format — required before G11). All audit amendments (§B–§E of the directive) are incorporated into the M1 planning documents at v1.1. **M1 implementation remains a separate, not-yet-granted owner authorization; no gate is marked implemented or passed.**

---

**Maintenance rule:** Append new decisions. Do not rewrite project history. Keep this document synchronized with `MASTER_BRAIN.md`, affected technical documents, and the phase handoff.
