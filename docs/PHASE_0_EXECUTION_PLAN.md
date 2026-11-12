# TechVault Phase 0 Execution Plan

**Document status:** Active — authored by A1 (Phase 0 Coordinator) as a draft in `tasks/phase-0/`; reviewed and promoted to `docs/PHASE_0_EXECUTION_PLAN.md` by the Main Controller on 2026-11-12. The superseded draft remains in `tasks/phase-0/` for audit; do not edit it.
**Version:** 1.2 (Phase 0 closure pass 2026-11-13: P0-T05 owner-approved; P0-T06 verified commit `1f815b7`; P0-T07 desktop toolchain installed via P1-ENV; P0-T09/OI-03 resolved — RAM confirmed; task statuses reconciled to verified reality)
**Date:** 2026-11-12
**Verified-state baseline:** Main Controller snapshot of 2026-11-11 (treated as ground truth; not re-inspected by A1).

---

## 1. Objective, Scope, and Out-of-Scope

### 1.1 Objective

Establish a reliable project foundation before full application development, per `DEVELOPMENT_ROADMAP.md` §4 and `PHASE_HANDOFF.md` §5 (Phase 0): reconciled documentation, repository conventions, an initial Git baseline, identified technical risks, baseline performance-measurement definitions, a reviewed Phase 1 feasibility plan, and an owner approval gate for Phase 1.

### 1.2 Approved Phase 0 scope

- Review Master Brain and all architecture documents (A2 consistency check, in progress).
- Resolve documentation conflicts and stale statuses.
- Confirm technical boundaries; verify Resource/Mention separation and merge/undo documentation.
- Repository conventions: branch naming (roadmap §13), commit message conventions.
- Baseline Git commit of the documentation baseline.
- Baseline performance-measurement definitions (hardware spec capture, including RAM confirmation).
- Phase 1 feasibility plan drafted (A3) and reviewed.
- Phase 0 handoff update and completion report.
- Owner approval gate for Phase 1.

### 1.3 Explicitly out of scope (Phase 0)

- No application implementation of any kind (owner's standing instruction to the controller; roadmap §4: "Do not generate the full application during Phase 0"). This includes Tauri/Svelte project initialization, Rust module scaffolding, and any Windows build.
- No Phase 1 experiments (feasibility PoCs, benchmarks, golden-dataset runs).
- No reopening or redesign of approved decisions D-001..D-013.
- No database schema changes, dependency additions, or UI work.
- No rewriting of approved planning documents beyond resolving concrete findings from the A2 check.

### 1.4 Open item OI-01: Phase 0 scope-definition difference (requires owner clarification)

`MASTER_BRAIN.md` Part O "Phase 0" includes implementation work (initialize Tauri 2, configure Svelte 5/Vite/TypeScript/Tailwind, integrate design system and logo, Rust structure, database module, logging/config, build initial Windows application, record package size). `DEVELOPMENT_ROADMAP.md` §4 and `PHASE_HANDOFF.md` §5 define Phase 0 as documentation/foundation only and explicitly prohibit generating the application in Phase 0. The owner's standing instruction to the controller is: **no app implementation in Phase 0.**

- **Operating rule until clarified:** the roadmap §4 definition governs execution; Master Brain Part O Phase 0 items 2–8, 14–15 are deferred.
- **Proposed disposition (label: Proposed, traceable rationale):** the deferred Master Brain items map onto Phase 1 package P1-A (Tauri desktop PoC, which bootstraps the toolchain and a minimal shell) and Phase 2 (production application structure). After owner confirmation, A2/Main Controller record the alignment in `DECISION_LOG.md` and `MASTER_BRAIN.md` Part O.
- **Owner decision needed:** confirm the roadmap Phase 0 definition as authoritative and accept the Proposed mapping, or instruct otherwise.
- **Resolved (2026-11-12):** owner approved the roadmap §4 definition and the Proposed mapping — recorded as decision **D-014**; alignment note added to MASTER_BRAIN Part O; document edits applied in the reconciliation pass.

### 1.5 Other open items

| ID | Item | Disposition |
|---|---|---|
| OI-02 | `DECISION_LOG.md`, `PHASE_HANDOFF.md`, and roadmap §18 describe the decision log / handoff / changelog as "pending" while prepared drafts (and `CHANGELOG.md`) exist on disk | **Resolved 2026-11-12** — statuses refreshed (PHASE_HANDOFF §2/§9, roadmap §18); see P0-T02 |
| OI-03 | Reference-machine RAM capacity unconfirmed (CPU known: Intel Core i5-6300U) | **Resolved 2026-11-12** — owner confirmed the reference machine: Windows 11 Pro, Intel Core i5-10310U (4C/8T), 32 GB RAM (2×16 GB DDR4-2667); single NVMe SSD (C:/D:/E:). Stale i5-6300U references corrected in AGENTS/ARCHITECTURE/MASTER_BRAIN/TESTING_STRATEGY/task packages during the 2026-11-13 closure pass |
| OI-04 | Phase 1 feasibility plan missing from docs/ | **Resolved 2026-11-12** — A3 delivered `00-PHASE1-OVERVIEW.md` + `F1-01..F1-06` (its session ended with a quota error after writing the files); reviewed by the Main Controller and promoted to `docs/phase1-plan/`, index at `docs/PHASE_1_FEASIBILITY_PLAN.md` |

---

## 2. Phase 0 Task Breakdown

Statuses reflect verified reality as of 2026-11-11/12. Nothing is marked Done that is not done.

| ID | Description | Owner | Status | Depends on | Deliverable | Definition of Done |
|---|---|---|---|---|---|---|
| P0-T01 | Documentation and decision consistency check across all docs (read-only) | A2 | **Done** (2026-11-12) | — | Findings F-01..F-09 delivered to the Main Controller (F-01 Critical; F-02/F-03 High; F-04..F-09 Medium) | Every conflict/stale item listed with severity and a proposed resolution; no document modified |
| P0-T02 | Resolve documentation findings; refresh stale statuses (OI-02); record OI-01 outcome | Main Controller (owner input where decisions change) | **Done** (2026-11-12) | P0-T01 | Decisions D-014..D-016 recorded in `DECISION_LOG.md`; ARCHITECTURE §7.1, MASTER_BRAIN Part O, PHASE_HANDOFF, ROADMAP §18 reconciled | F-01/02/03/05/06/09 closed; F-04 (decision-register mapping) and F-07 (initial desktop target) remain pending owner confirmation; F-08 pending asset delivery |
| P0-T03 | Draft `docs/PHASE_1_FEASIBILITY_PLAN.md` (Phase 1 experiment specs) | A3 | **Done** (2026-11-12) | — | `docs/phase1-plan/00-PHASE1-OVERVIEW.md` + `F1-01..F1-06`; index at `docs/PHASE_1_FEASIBILITY_PLAN.md` | Covers roadmap §5.1–5.7 and Master Brain Part O Phase 1 A–I with steps and acceptance criteria per experiment |
| P0-T04 | Review Phase 1 feasibility plan for scope, decision compliance, and consistency with task packages | Main Controller (A2 cross-check) | **Done** (2026-11-12) | P0-T03 | Review passed; ONE-SOURCE-FLAGs reconciled (P1-I/P1-J stay packages; PoC dir standardized `experiments/p1-<id>/`) | Plan consistent with D-001..D-013, roadmap, and `docs/PHASE_1_TASK_PACKAGES.md`; approved by Main Controller |
| P0-T05 | Repository conventions: branch naming (roadmap §13), commit message format, PoC code location (see §6, Proposed) | Main Controller (drafted by A1 in §6 of this document) | **Done** (2026-11-13) — owner approved conventions (incl. `experiments/p1-<id>/` + `docs/phase1-results/` locations and §6/§7 definitions) in the Phase 0/1 execution directive | — | Conventions section approved (this document §6, promoted to `docs/`) | Conventions approved and recorded; no conflict with roadmap §13 |
| P0-T06 | Baseline Git commit of documentation + repository structure; first `CHANGELOG.md` entry | Main Controller | **Done** (2026-11-12) — verified commit `1f815b7` on `main` after owner-supplied repo-local Git identity; P1-A executed and committed as `196b3bc` | Owner supplies Git identity only (may proceed before P0-T01/T02 finish) | Verified initial commit on `main` | Commit exists and verified on `main`; working tree clean; no secrets committed; reconciliation edits later land as a second commit |
| P0-T07 | Development environment setup: Node.js LTS + npm, Rust toolchain (desktop); Android SDK/NDK + JDK (Android, deferrable) | Main Controller (owner performs/authorizes installs on the machine) | **Done (desktop)** (2026-11-12) — executed as P1-ENV during P1-A with owner authorization: MSVC Build Tools 14.44.35207, Rust 1.99.1 (stable-MSVC), Node 24.20.0/npm 11.19.0; toolchain homes on `D:\dev-caches\` (outside `D:\TechVault`). Android toolchain remains deferred until P1-B scheduling | — | Installed toolchains with recorded versions | `node`, `npm`, `cargo`/`rustc` available and versions recorded; Android toolchain verified before P1-B starts |
| P0-T08 | Logo asset acquisition (D-012): owner supplies the approved shield-and-T original asset files | Owner (Main Controller commits to `assets/logo/`) | **Blocked — awaiting owner** | — | Original asset file(s) in `assets/logo/` | Asset present, format/source resolution identified, committed; no redesign |
| P0-T09 | Baseline performance-measurement definitions: capture hardware spec (i5-6300U; RAM unknown — owner to confirm), define metrics/methods Phase 1 must report (see §7 starter set) | Main Controller (A3 incorporates into feasibility plan) | **Done** (2026-11-12/13) — definitions in this document §7 and `docs/phase1-plan/00-PHASE1-OVERVIEW.md` §5; RAM confirmed 2026-11-12 (OI-03 resolved: i5-10310U, 32 GB); stale hardware references corrected in the 2026-11-13 closure pass | — | Measurement definitions in the reviewed feasibility plan | Metrics, method, and reference hardware (incl. confirmed RAM) recorded; unknowns explicitly flagged, not guessed |
| P0-T10 | Phase 0 completion report + update `PHASE_HANDOFF.md` §9 current record | Main Controller (A1 supplies draft inputs) | **Done** (2026-11-12) | P0-T01..P0-T05, P0-T09 | PHASE_HANDOFF §9 current record + document inventory updated; completion report delivered with decisions D-014..D-017 recorded | Handoff matches verified repository state; checklist (handoff §10, applicable items) satisfied |
| P0-T11 | Owner approval gate for Phase 1 feasibility work (roadmap §4 exit criterion) | Owner | **Done** (2026-11-12) | P0-T10 | Owner approval recorded as decision **D-017** | Explicit owner approval recorded; Phase 1 packages activated (execution gated on P0-T06 baseline commit + toolchain install per D-017 impact) |

**Task counts (reconciled 2026-11-13):** 11 total — **Done 9** (P0-T01..P0-T07 desktop half, P0-T09, P0-T10, P0-T11) **/ Blocked awaiting owner 1** (P0-T08 — logo asset delivery; not a roadmap §4 exit criterion; needed by the Phase 2 application shell at the latest) **/ partially deferred** (P0-T07 Android toolchain half — deferred until P1-B scheduling, per the exit-adjacent recommendation below).

**Recommendation on P0-T07 (development environment), label Proposed:** split it. Desktop toolchain (Node.js, Rust) is a hard prerequisite for Phase 1 day one (packages P1-A, P1-C, P1-F) — schedule it during the Phase 0 closing window as an exit-adjacent task, but do not make it a Phase 0 exit criterion, because roadmap §4 exit criteria are documentation/approval-based and gating Phase 0 closure on installs would only delay the owner gate without adding review value. Android toolchain (SDK/NDK/JDK) is required only for P1-B/P1-D and may be deferred until those packages are scheduled. Rationale: smallest set of blockers on the critical path; Android installs are large and only needed later.

---

## 3. File Ownership Rules

Purpose: prevent overlapping edits between agents. **Only the owning role edits a file.** All other agents propose changes as findings/diffs in reports or under `tasks/`, and the owner of the file applies them.

| Artifact | Owning role | Rules |
|---|---|---|
| `docs/MASTER_BRAIN.md` | Owner (content); Main Controller for mechanical edits on owner instruction | Product requirements change only via owner decision |
| `AGENTS.md`, `README.md` | Owner / Main Controller | Configuration-level changes need owner review |
| `.zcode/agents/*.md` | Owner / Main Controller | Agent configuration; not editable by A1–A3 |
| `docs/ARCHITECTURE.md`, `DATABASE_DESIGN.md`, `SECURITY.md`, `API_POLICY.md`, `UI_DESIGN_SYSTEM.md`, `TESTING_STRATEGY.md`, `DEVELOPMENT_ROADMAP.md` | Main Controller | Edits only through a decision-log entry or an accepted A2 finding; A2 is read-only |
| `docs/DECISION_LOG.md`, `docs/CHANGELOG.md`, `docs/PHASE_HANDOFF.md` | **Main Controller only** | Updated only via Main Controller review; agents submit proposed entries, never apply them |
| `docs/PHASE_1_FEASIBILITY_PLAN.md` + `docs/phase1-plan/` | Main Controller owns promoted copies (promoted 2026-11-12; drafted by A3) | Future updates only via Main Controller review |
| `docs/PHASE_0_EXECUTION_PLAN.md`, `docs/PHASE_1_TASK_PACKAGES.md` | Main Controller owns promoted copies (promoted 2026-11-12; drafted by A1) | Superseded drafts remain under `tasks/` for audit; do not edit them |
| `tasks/phase-0/` | A1 (Phase 0 Coordinator) | Coordination workspace |
| `tasks/phase-1/` | A1 packaging; Main Controller may annotate | Phase 1 coordination workspace |
| `assets/logo/` | Owner supplies; Main Controller commits | D-012: use supplied asset unchanged |
| `src/`, `src-tauri/`, `tests/` | Unused in Phase 0/1 (placeholders) | Reserved for Phase 2+ implementation agents; Phase 1 PoC code goes to `experiments/` (Proposed, §6.4) |
| `experiments/` (proposed, created at Phase 1 start) | One Phase 1 agent per package subdirectory (e.g., `experiments/p1-a/`) | Throwaway PoC code; never imported by production docs as validated behavior |

---

## 4. Risks and Blockers

| # | Risk / blocker | Impact | Mitigation | Unblocked by |
|---|---|---|---|---|
| R-B1 | Git identity unconfigured → no commits at all | No versioned baseline; work is loss-exposed | Owner supplies `user.name`/`user.email`; commit immediately (P0-T06), then reconcile docs in a second commit | Owner |
| R-B2 | Approved logo asset missing (D-012) | Cannot integrate logo later; D-012 verification blocked | Owner supplies original asset files; not needed until application shell (Phase 2), but should be committed early | Owner |
| R-B3 | Reference RAM unknown | Performance baselines and Phase 1 benchmarks (P1-J) lack a defined environment | Owner confirms RAM (and OS/disk type) during P0-T09; mark unknown until then | Owner |
| R-B4 | Phase 0 scope ambiguity (OI-01: Master Brain vs roadmap) | Risk of accidental implementation jump, or of an owner expectation that a Windows build exists at Phase 0 exit | Record OI-01; operate on roadmap definition; owner clarifies at the approval gate | Owner (clarification) + A2 (finding) |
| R-B5 | Stale document statuses (OI-02) | Handoff/decision records mislead future agents | P0-T02 refresh after A2 findings | Main Controller |
| R-B6 | Toolchains missing (Node, Rust, Android) | Phase 1 start slips; experiments cannot run | P0-T07 exit-adjacent (desktop first); Android deferred to P1-B scheduling | Main Controller / Owner (installs) |
| R-B7 | Parallel-agent edit collisions | Conflicting document versions | Ownership table §3; single-writer rule; shared registers Main-Controller-only | Main Controller (enforcement) |
| R-B8 | `PHASE_1_FEASIBILITY_PLAN.md` incomplete; duplication risk with Phase 1 task packages | Divergent Phase 1 definitions | P0-T04 review cross-checks both documents; packages reference, never duplicate, the plan | A3 → Main Controller |
| R-B9 | Owner availability (three owner-blocked tasks + approval gate) | Phase 0 stalls despite agent work | Batch owner asks into one packet at P0-T10: Git identity, logo files, RAM spec, OI-01 clarification, Phase 1 approval | Owner |

---

## 5. Exit-Criteria Checklist (mapped to `DEVELOPMENT_ROADMAP.md` §4)

| Roadmap §4 exit criterion | Current status | Evidence / task |
|---|---|---|
| No unresolved critical architectural contradiction | **Met** — owner rulings D-014..D-016 applied 2026-11-12; remaining items (F-04 register mapping, F-07 desktop target) are Medium severity and non-blocking | A2 audit + reconciliation pass |
| Resource and Mention concepts clearly separated | **Confirmed consistent** (A2 §4: uniform across MASTER_BRAIN Part D, ARCHITECTURE, DATABASE_DESIGN, TESTING_STRATEGY, AGENTS.md) | A2 audit finding |
| Merge and undo requirements documented | **Confirmed consistent** (A2 §4: merge history + undo + evidence preservation uniform everywhere) | A2 audit finding |
| Major technical risks identified | **Done** | Roadmap §17 risks mapped to measured experiments F1-01..F1-06 + P1-I/P1-J (P0-T03) |
| Owner approves Phase 1 feasibility work | **Met** (decision D-017, 2026-11-12) | P0-T11 approval recorded in `DECISION_LOG.md` |

Supporting (operational) items — not roadmap exit criteria but required to close Phase 0 cleanly:

| Item | Status | Task |
|---|---|---|
| Repository conventions defined and approved | **Done** (2026-11-13, owner approval) | P0-T05 (§6 below) |
| Baseline Git commit exists | **Done** (`1f815b7`; P1-A at `196b3bc`) | P0-T06 |
| Documentation statuses reflect reality (OI-02) | **Done** (2026-11-12) | P0-T02 |
| Phase 0 handoff record updated | **Done** (2026-11-12; refreshed 2026-11-13) | P0-T10 |
| Desktop toolchain installed (Phase 1 prerequisite) | **Done** (2026-11-12, P1-ENV) | P0-T07 |

---

## 6. Repository Conventions (Approved — owner confirmation recorded 2026-11-13, task P0-T05)

1. **Branches (from roadmap §13).** During Phase 0: work directly on `main` (documentation only, single-writer per file). From Phase 1: use `phase/1-feasibility` for experiment code, or per-package branches `poc/p1-<id>` when two packages run concurrently. Phase branches per roadmap §13 (`phase/2-core-app`, etc.) apply from Phase 2. Simplification is allowed by roadmap §13 while the project stays small.
2. **Commit messages.** Conventional-Commits-style: `type(scope): summary`. Types: `docs`, `build`, `test`, `feat` (Phase 2+), `chore`. Scopes: `phase-0`, `p1-a`..`p1-j`, `db`, `ui`, `security`, `repo`. Evidence (measured numbers, hardware, build identifiers) belongs in the commit body or the linked report file, not the subject.
3. **Commits.** Small, meaningful, verifiable; never commit secrets (AGENTS.md §8, §13); no force-push (AGENTS.md §13).
4. **PoC/experiment code location (Proposed).** Phase 1 throwaway code lives under `experiments/p1-<id>/`, committed per package and clearly labeled non-production. `src/`, `src-tauri/`, `tests/` remain reserved for Phase 2+ production implementation. Rationale: keeps feasibility evidence versioned without polluting the production tree or implying validated features.

## 7. Baseline Performance-Measurement Definitions (starter set for P0-T09)

Reference hardware (owner-confirmed 2026-11-12): Windows 11 Pro (Build 26200), Intel Core i5-10310U @ 1.70 GHz (4C/8T), 32 GB RAM (2×16 GB DDR4-2667), single NVMe SSD (Samsung MZVLB512HAJQ 512 GB; partitions C:/D:/E:). Every Phase 1 measurement report must state: date, build/commit identifier, machine spec, method/tool, and raw numbers. Metrics Phase 1 must capture (sources: roadmap §16, `TESTING_STRATEGY.md` §12): cold/warm startup time; idle RAM/CPU; peak RAM; CPU during transcription and extraction; transcription speed (realtime factor) and model download size; search latency; graph render performance at small/medium/large datasets; installer and installed size; disk growth during processing. Numeric budgets are set after Phase 1 measurements, not before (Testing Strategy §12; Master Brain K4).

---

**End of PHASE_0_EXECUTION_PLAN.md (draft)**
