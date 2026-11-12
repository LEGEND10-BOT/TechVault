# TechVault Phase 1 Feasibility Plan — Index

**Document status:** Active — assembled by the Main Controller (2026-11-12) from the reviewed output of A3 (Technical Feasibility Planner).
**Purpose:** Entry point for the Phase 1 feasibility plan. The plan is split into a shared overview and six experiment specifications, stored in `docs/phase1-plan/`.
**Approval state:** Main Controller review passed (P0-T04, 2026-11-12). Owner approval to execute is the Phase 0 exit gate (P0-T11 in `docs/PHASE_0_EXECUTION_PLAN.md`).

## Plan contents

| Part | File | Content |
|---|---|---|
| Shared overview | `docs/phase1-plan/00-PHASE1-OVERVIEW.md` | Objective, source-document coverage map (union of `DEVELOPMENT_ROADMAP.md` §5.1–5.7 and `MASTER_BRAIN.md` Part O Phase 1 workstreams A–I), toolchain prerequisites and install order, shared measurement protocol, results-record template, scope and safety rules, sequencing, owner approvals needed |
| F1-01 | `docs/phase1-plan/F1-01-tauri-desktop-android.md` | Tauri 2 desktop PoC (F1-01a) and Android PoC (F1-01b) — packages P1-A / P1-B |
| F1-02 | `docs/phase1-plan/F1-02-video-playback.md` | Video playback and platform player compatibility (capability matrix) — package P1-E |
| F1-03 | `docs/phase1-plan/F1-03-whisper-cpp.md` | Whisper.cpp desktop (F1-03a) and Android (F1-03b) feasibility — packages P1-C / P1-D |
| F1-04 | `docs/phase1-plan/F1-04-resource-identity-database.md` | Resource identity, deduplication, merge/undo, migrations, FTS5 validation — package P1-F |
| F1-05 | `docs/phase1-plan/F1-05-knowledge-graph.md` | Sigma.js + Graphology benchmark (R-008 gate) — package P1-H |
| F1-06 | `docs/phase1-plan/F1-06-extraction-golden-dataset.md` | Extraction accuracy, golden dataset v0, confidence calibration — package P1-G |

## Related documents

- **Packaging, ownership, dependencies, gates:** `docs/PHASE_1_TASK_PACKAGES.md` (packages P1-ENV, P1-A..P1-J; Gate 0 / per-package evidence / Gate 1).
- **Phase 0 context and exit criteria:** `docs/PHASE_0_EXECUTION_PLAN.md`.
- Superseded working drafts: `tasks/phase-0/`, `tasks/phase-1/` (audit trail; do not edit).

## Standing rules for Phase 1

1. Execution starts only after the owner approves Phase 1 (Phase 0 exit gate) — no exceptions.
2. Every numeric target in the plan is a **planning target** to be confirmed by measurement; nothing is a measured fact or approved budget until evidence exists (AGENTS.md §11, §19).
3. Fallbacks that introduce different technology (e.g., Flutter per R-022, alternative graph or transcription stacks) are contingent proposals requiring owner decisions — never silent substitutions.
4. No managed-gateway work (D-005 in-principle / R-010 design pending — later phase); F1-06 uses owner-provided BYOK credentials only.
5. Results are recorded per experiment using the template in `00-PHASE1-OVERVIEW.md` §6, with raw evidence, versions, and honest reporting of failures.
