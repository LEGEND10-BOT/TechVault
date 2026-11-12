# TechVault Phase 1 Task Packages

**Document status:** Active — authored by A1 (Phase 0 Coordinator) as a draft in `tasks/phase-1/`; reviewed and promoted to `docs/PHASE_1_TASK_PACKAGES.md` by the Main Controller on 2026-11-12. Superseded draft remains in `tasks/phase-1/`; do not edit it.
**Version:** 1.0 (reviewed promotion)
**Date:** 2026-11-12

**Activation gate:** These packages start ONLY after the owner approves Phase 1 feasibility work (Phase 0 exit gate, task P0-T11 in `docs/PHASE_0_EXECUTION_PLAN.md`). Preparing packages is Phase 0 work; executing them is not.

**Authoritative references:** the Phase 1 feasibility plan at `docs/phase1-plan/` (index: `docs/PHASE_1_FEASIBILITY_PLAN.md`; shared overview `00-PHASE1-OVERVIEW.md`; experiment specs `F1-01..F1-06`) is authoritative for each experiment's steps and acceptance criteria. This document defines only packaging, ownership, dependencies, owner inputs, and evidence requirements, structured from `DEVELOPMENT_ROADMAP.md` §5.1–5.7 and `MASTER_BRAIN.md` Part O Phase 1 workstreams A–I. Cross-walk: P1-A/P1-B = F1-01a/b; P1-C/P1-D = F1-03a/b; P1-E = F1-02; P1-F = F1-04; P1-G = F1-06; P1-H = F1-05. Where the feasibility plan and this document disagree, the feasibility plan (as approved by the Main Controller) prevails and this document is corrected.

---

## 1. Package Summary

Size key: S = small (<= 1 focused session), M = medium (few sessions, one component), L = large (multi-session, multi-part evidence).

| ID | Objective (short) | Source references | Suggested executing role | Depends on | Required owner-provided inputs | Size |
|---|---|---|---|---|---|---|
| P1-ENV | Phase 1 environment bootstrap: install and verify Node.js LTS, Rust toolchain; record versions (remaining item of P0-T07 if not completed in Phase 0) | Roadmap §5; AGENTS.md §6 | Phase 1 environment agent (or Main Controller) | — | Owner authorization for installs | S |
| P1-A | Tauri 2 desktop proof of concept: build, Rust/Svelte integration, front-back communication, file permissions, startup, packaging; absorbs the deferred Master Brain Part O Phase 0 items 2–5 (toolchain/init verification only — Proposed, pending OI-01) | Roadmap §5.1; MB Part O Phase 1 / Part O Phase 0 items 2–5; D-001 | Desktop platform PoC agent | P1-ENV | None (Windows primary target) | M |
| P1-B | Tauri 2 Android proof of concept: build, Rust core compatibility, permissions, audio, playback, model storage, background behavior, package size | Roadmap §5.2; MB Phase 1 A; D-001, D-010, P-001, P-003 | Mobile platform PoC agent | P1-A; Android SDK/NDK/JDK installed; owner test device | Android test device (or emulator decision); device-matrix acceptance (TESTING_STRATEGY §17) | L |
| P1-C | Whisper.cpp desktop validation: integration, model sizes, CPU/memory, speed, timestamps, partial results, interruption | Roadmap §5.3; MB Phase 1 C; TESTING_STRATEGY §7 | Core/Rust PoC agent (standalone harness — does not require P1-A) | P1-ENV | None | M |
| P1-D | Whisper.cpp Android feasibility: model loading, audio decode, memory pressure, lifecycle/background limits | Roadmap §5.3; MB Phase 1 D; TESTING_STRATEGY §7 (Android) | Mobile platform PoC agent | P1-B, P1-C | Access to Android test device | L |
| P1-E | Video playback validation: local, platform embed, external, WebView compatibility, YouTube limitations, auth restrictions, mobile | Roadmap §5.4; MB Phase 1 B; P-004 | Frontend PoC agent | P1-A | Optional: owner-nominated sample URLs (public, no private-account content) | M |
| P1-F | Database validation: initial schema, foreign keys, resource identity, duplicate candidates, merge preview/rollback/undo, migrations, FTS5 | Roadmap §5.5; MB Phase 1 E; `DATABASE_DESIGN.md` §26–27; R-005, P-007, P-008, P-012 | Data/identity PoC agent (standalone Rust+SQLite harness — independent of P1-A) | P1-ENV | None | M |
| P1-G | Resource extraction validation: build golden dataset; measure precision, recall, false positives, missed/incorrectly merged resources, evidence quality | Roadmap §5.6; MB Phase 1 F; TESTING_STRATEGY §4; R-013, P-009, P-010 | AI evaluation agent (scripted, no app shell) | P1-ENV | OpenRouter test API key (delivered out-of-band, never committed — AGENTS.md §8); owner authorization for test media / dataset material | L |
| P1-H | Graph validation: Sigma.js + Graphology benchmark at small/medium/large scale, search, filtering, progressive rendering, mobile interaction | Roadmap §5.7; MB Phase 1 G; R-008, P-017 | Frontend/graph PoC agent (standalone benchmark page) | P1-ENV | None | M |
| P1-I | Security baseline review of Phase 1 artifacts: URL/SSRF posture, external-process arguments, temp-file handling in PoCs, no secrets in PoC code | MB Phase 1 H; `SECURITY.md` §7–12; AGENTS.md §8–9 | Security review agent (read-only review of P1-A/P1-C/P1-E artifacts) | P1-A (artifacts to review); can run incrementally behind producing packages | None | S |
| P1-J | Low-resource hardware benchmark: run the measurement set of `PHASE_0_EXECUTION_PLAN.md` §7 on the owner-confirmed reference machine (Intel i5-10310U, 32 GB RAM, Windows 11 Pro; corrected from i5-6300U per the 2026-11-12 owner confirmation) | MB Phase 1 I; Roadmap §16–17; P-022; Master Brain K2/K4 | Performance agent | P1-A, P1-C (objects to measure); serialized with other heavy runs on the shared machine | Access to the reference machine; RAM spec confirmed 2026-11-12 (OI-03 resolved) | M |

Notes:
- The approved logo (D-012) is NOT required for any Phase 1 package; it is needed at the Phase 2 application shell at the latest. Early delivery is still encouraged (P0-T08) so the asset is versioned.
- All PoC code lives under `experiments/p1-<id>/` (Proposed convention, `PHASE_0_EXECUTION_PLAN.md` §6.4). Nothing in Phase 1 goes into `src/` or `src-tauri/`.
- Reconciliation (Main Controller, 2026-11-12): feasibility-plan ONE-SOURCE-FLAGs resolved — MASTER_BRAIN workstream H (security baseline) = package P1-I, fed by the security-relevant checks embedded in the F1-01/02/03/06 specs; MASTER_BRAIN workstream I (low-resource hardware benchmark) = package P1-J, executing the shared measurement protocol (`docs/phase1-plan/00-PHASE1-OVERVIEW.md` §5). Prototype directory standardized on `experiments/p1-<id>/` (the overview's `poce/` suggestion superseded); both remain Proposed pending owner approval at P0-T05.

## 2. Dependency Graph (text form)

```
P1-ENV ──┬─> P1-A (desktop toolchain)
         ├─> P1-C (Rust harness)
         ├─> P1-F (Rust + SQLite harness)
         ├─> P1-H (Node benchmark)
         └─> P1-G (Node + API key + dataset)

P1-A ──┬─> P1-E (playback inside the shell)
       ├─> P1-I (review target)
       └─> P1-J (object to measure)
P1-A + Android toolchain ──> P1-B
P1-B + P1-C ──> P1-D
P1-C ──> P1-J
```

No package depends on P1-B, P1-D, P1-E, P1-G, P1-H, P1-I, or P1-J completing first; P1-A and P1-ENV are the only structural prerequisites.

## 3. Recommended Execution Order and Parallelization

Constraint: all work runs on the owner's single machine. Code/writing tasks may overlap; measurement runs (P1-C timings, P1-J) must be serialized with each other to keep numbers clean.

- **Wave 0:** P1-ENV (immediately after Phase 1 approval; or completed as P0-T07 exit-adjacent).
- **Wave 1 (parallel):** P1-A, P1-C (standalone harness), P1-F (standalone harness), P1-H (standalone benchmark), P1-G dataset construction (slow, mostly manual review — start early; API-run evaluation follows once the dataset exists).
- **Wave 2 (after P1-A):** P1-B (also needs Android toolchain + device), P1-E, P1-I (incremental, reviews Wave 1/2 artifacts).
- **Wave 3:** P1-D (after P1-B + P1-C), P1-J (after P1-A + P1-C, on the reference machine, serialized with other benchmarks).
- Desktop-critical path: P1-ENV → P1-A → P1-E/P1-J. Android track is deliberately off the critical path (D-001: evaluate in parallel, never block desktop on it).

## 4. Approval Gates

### Gate 0 — before Phase 1 starts (owner)

The owner must approve, in one packet (P0-T10/P0-T11):

1. Phase 1 feasibility work starting at all (roadmap §4 exit criterion).
2. Resolution of OI-01 (Phase 0 scope difference) and the Proposed mapping of deferred Master Brain Part O Phase 0 items into P1-A / Phase 2.
3. Budget-relevant commitments implied by packages: OpenRouter test-key usage (P1-G), any Android SDK/emulator downloads (P1-B/P1-D).
4. Confirmed reference-hardware spec including RAM (OI-03) so P1-J has a defined environment.
5. Task packages and the reviewed `PHASE_1_FEASIBILITY_PLAN.md` as the Phase 1 scope of record.

### Per-package completion evidence (each package's gate)

A package is complete only when its report shows:

1. Measured results with numbers, method, date, build/commit identifier, and hardware used — no estimates presented as measurements (AGENTS.md §11, §19).
2. Documented limitations and failures, including what could not be tested and why (PHASE_HANDOFF §3.5, §11).
3. Artifact paths (code under `experiments/p1-<id>/`, data, logs) committed to Git.
4. No scope creep: only the package's roadmap/feasibility-plan items addressed; new ideas recorded as proposals, not implemented.
5. Proposed decision updates submitted to the Main Controller (never applied by the executing agent) — e.g., promoting/demoting R-001..R-022 or closing P-001..P-027 items.
6. Security notes for anything touching URLs, media, external processes, or credentials (P1-I spot-checks these).

### Gate 1 — Phase 1 exit review (owner)

Per roadmap §5 exit criteria, the owner approves Phase 2 only when the aggregated evidence shows:

1. Critical technical risks have evidence-based outcomes (each of P1-A..P1-J has a written result).
2. The Tauri desktop path is validated (P1-A + P1-E results).
3. The Android strategy is selected from actual results (P1-B/P1-D: continue Tauri, or R-022 Flutter fallback consideration — decision recorded in `DECISION_LOG.md`).
4. The database identity model passes critical tests (P1-F merge/undo invariants per TESTING_STRATEGY §5).
5. Feasibility report, performance measurements, and resulting architecture updates are documented; `DECISION_LOG.md`, `CHANGELOG.md`, and `PHASE_HANDOFF.md` updated via the Main Controller.

---

**End of PHASE_1_TASK_PACKAGES.md (draft)**
