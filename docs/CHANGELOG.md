# TechVault Changelog

All notable changes to TechVault should be documented in this file.

The format is based on Keep a Changelog principles. Version numbers may follow Semantic Versioning when actual releases begin.

**Project:** TechVault  
**Current stage:** Phase 1 — Feasibility and Technical Validation (Phase 0 closed 2026-11-13)  
**Changelog status:** Maintained

---

## How to Maintain This Changelog

Record meaningful changes to:

- Product requirements.
- Architecture.
- Database schema.
- Security policy.
- UI and user experience.
- AI providers and processing.
- Connectors and platform support.
- Testing and performance.
- Build, packaging, and release processes.

Do not record every minor code edit. Use Git history for detailed implementation changes.

### Change Categories

- **Added:** New functionality, requirements, or documentation.
- **Changed:** Changes to existing functionality or decisions.
- **Deprecated:** Features or approaches scheduled for removal.
- **Removed:** Functionality or requirements removed.
- **Fixed:** Defects corrected.
- **Security:** Security-related improvements or fixes.
- **Validated:** Technical assumptions verified through tests or prototypes.
- **Known Limitations:** Important unresolved issues or restrictions.

## Unreleased

### Added
- Master Brain project reference.
- Architecture planning document.
- Database design planning document.
- Security planning document.
- UI design system.
- AI and API policy.
- Development roadmap.
- Testing strategy.
- Decision log.
- Phase handoff process.
- Initial documentation structure.
- Phase 0 execution plan (`docs/PHASE_0_EXECUTION_PLAN.md`).
- Phase 1 task packages (`docs/PHASE_1_TASK_PACKAGES.md`).
- Phase 1 feasibility plan (`docs/PHASE_1_FEASIBILITY_PLAN.md` with experiment specifications F1-01..F1-06 under `docs/phase1-plan/`).
- Documentation consistency audit findings (F-01..F-09) recorded and dispositioned (2026-11-12).
- Decision records D-014..D-017 (2026-11-12), D-018..D-019 (2026-11-13).
- Phase 1 package P1-A (F1-01a desktop PoC): throwaway Tauri 2 + Svelte 5 + strict TypeScript validation shell under `experiments/p1-a/` with automated IPC, permission-scope, and measurement suite (`docs/phase1-results/F1-01/RESULTS.md`) (2026-11-12).
- Phase 0 baseline checkpoint commit (P0-T06) created after owner-supplied repo-local Git identity (2026-11-12).
- Phase 0 closure (`docs/PHASE_0_CLOSURE.md`, 2026-11-13): roadmap §4 exit criteria verified, stale references reconciled, D-018 owner directive recorded.
- Phase 1 sprint (2026-11-13, per owner directive D-018): P1-A closure addendum; P1-G golden dataset v0 (14 cases, 12/12 categories) + dependency-free extraction harness, mock-validated with byte-identical reruns; P1-H Sigma.js/Graphology benchmark page + WebView2 shell + CDP harness with browser-leg measurements; P1-F identity/merge/undo/FTS5 harness (9/9 invariants); P1-I security baseline review (no high/critical findings). Records under `docs/phase1-results/` (F1-01 addendum, F1-04, F1-05, F1-06, P1-I) and `docs/PHASE_1_STATUS_MATRIX.md`.
- Phase 1 continuation (2026-11-13, per owner directive D-019): P1-E desktop playback validation measured in WebView2 (`docs/phase1-results/F1-02/RESULTS.md` — MP4/WebM local playback, YouTube IFrame play + error detection, scheme allowlist); P1-G hardened-prompt mock matrix (deterministic; live run owner-deferred "LATER"); P1-J protocol consolidation (`docs/phase1-results/P1-J/RESULTS.md`); Gate-1 readiness report (`docs/PHASE_1_GATE1_READINESS.md`); D-drive enforcement record (matrix §8); credential-incident handling added to `SECURITY.md` §6.4 and `API_POLICY.md` §12.1, provider capability model (text + TTS) in `API_POLICY.md` §12.2/§8.
- P1-H completion (2026-11-13, owner-approved display session): full 8×2 benchmark matrix measured in Edge **and** WebView2 — ≈60 FPS median at 20k **and 50k nodes/175k edges** on the reference iGPU; A7 10-minute soak pass (−0.7 MB heap growth, 589 samples); **formal R-008 verdict: ADOPT with documented scaling patterns** (`docs/phase1-results/F1-05/RESULTS.md`). Regenerable PoC build caches (~7.5 GB) removed from the repository with owner approval after P1-A installers were preserved to `D:\Builds\p1-a-installers\`; future builds directed to `D:\Builds\cargo-target` via `CARGO_TARGET_DIR`.

### Changed
- Established a documentation-first workflow before implementation.
- Established separate project-control and phase-implementation workflows.
- Clarified the distinction between approved decisions and technical proposals.
- Documentation set reconciled per owner decisions D-014..D-016: roadmap §4 governs Phase 0 (documentation-only), MASTER_BRAIN B2 adapter tiers govern ARCHITECTURE §7.1, transcription foundation set in Phase 2.
- Repository initialized on branch `main` with `.gitignore`; baseline commit created after owner-supplied repo-local Git identity (`1f815b7`, 2026-11-12).

### Validated
- P1-A / F1-01a (desktop, 2026-11-12, i5-10310U reference machine, evidence in `docs/phase1-results/F1-01/RESULTS.md`): Tauri 2 + Rust + Svelte 5 + Vite + strict TS builds and runs on Windows 11 (dev + release + NSIS/MSI installers); IPC round-trip median 1.60 ms release / 2.50 ms dev, 200/200 calls stable (target ≤10 ms); HMR functional; warm startup median 74.5 ms; idle RAM tree working set 327.14 MB / private 135.97 MB (measure-then-decide vs ≤150 MB planning target); installers 1.51–2.23 MB (below 20–60 MB planning range); **fs permission scope rejected `C:\Windows\win.ini` and `C:\Windows\system.ini` reads (mandatory security negative test passed)**. Android half (F1-01b / P1-B) not executed — deferred per owner instruction.
- P1-F / F1-04 (2026-11-13, `docs/phase1-results/F1-04/RESULTS.md`): SQLite identity model invariants 9/9 — FK enforcement; deterministic URL-identity duplicate candidates (no confidence in identity); transactional merge preserving mentions/evidence/aliases + history; verification status never upgraded by merge; full merge undo; additive+guarded migration; FTS5 search median 0.005–0.009 ms at 5k/20k resources.
- P1-H / F1-05 browser leg (2026-11-13, `docs/phase1-results/F1-05/RESULTS.md`, Edge/Chromium on the reference iGPU): vsync-locked ≈60 FPS median during scripted pan/zoom at 1k/5k/20k nodes (labels off; 20k ≈ 35k edges); first render 193 ms at 20k (target ≤3 s); filter re-render 125 ms (target ≤500 ms); progressive 100-node batch add without re-layout; FA2 requires limited-iteration/async pattern. WebView2 leg, 50k, soak, and mobile leg pending/blocked (display time; P1-B deferral).
- P1-G / F1-06 offline validation (2026-11-13, `docs/phase1-results/F1-06/RESULTS.md`): harness pipeline proven — schema-invalid responses never reach metrics (retry-once), planted traps/D-008 violations/verification violations/injection manipulation all detected, reruns byte-identical. Model-quality metrics pending the owner-keyed API run.

### Known Limitations
- Application implementation has not started.
- Phase 1 is IN_PROGRESS (not closed): P1-G API run blocked on owner key/spend cap; P1-H WebView2 leg/soak/50k blocked on display availability; P1-E and P1-J not yet executed; P1-B deferred and P1-C/P1-D held per owner (D-018).
- Tauri 2 Android compatibility remains unverified.
- Video playback compatibility remains unverified (P1-E pending).
- Whisper.cpp integration remains unverified (P1-C/P1-D held per owner).
- Managed API hosting, quotas, and billing policy remain pending.
- Android minimum supported version is not yet selected.
- Exact release and packaging strategy remains pending.
- Approved logo asset and TSX UI reference are not yet in the repository (D-012 delivery pending; P0-T08 carried).
- P1-A file-picker dialog flow awaits owner manual verification (automation attempts recorded in the closure addendum).
- Reference-machine RAM capacity unconfirmed (required for performance baselines, P0-T09 / P1-J).
  - Update 2026-11-12: the active reference machine measures 32 GB RAM with an i5-10310U CPU; owner confirmed this machine as the reference (documents naming i5-6300U await Main Controller correction). Idle-RAM working-set budget outcome is a measure-then-decide item for the owner (P-022).
  - Resolution 2026-11-13: item closed — OI-03/P0-T09 resolved (i5-10310U, 32 GB confirmed); all stale i5-6300U references corrected across AGENTS.md, ARCHITECTURE, MASTER_BRAIN, TESTING_STRATEGY, and the Phase 1 task packages in the Phase 0 closure pass. The idle-RAM budget definition itself remains a P-022 owner decision (see `docs/phase1-results/F1-01/CLOSURE-ADDENDUM.md`).
- P1-A PoC records CSP unset (template default, throwaway shell) — any real application must define a CSP.
- Dialog-based file-pick flow of P1-A implemented but not yet exercised by a human (A5 human half pending owner verification).

---

## Release History

No public or production releases have been recorded yet.

Use the following structure for future releases:

## [X.Y.Z] - YYYY-MM-DD

### Added
-

### Changed
-

### Deprecated
-

### Removed
-

### Fixed
-

### Security
-

### Validated
-

### Known Limitations
-

---

## Change Recording Rules

1. Record significant changes when they are actually completed.
2. Do not record planned work as completed work.
3. Do not claim a technical feature is validated without test evidence.
4. Reference relevant decision IDs from `DECISION_LOG.md`.
5. Update the affected technical documents when requirements change.
6. Record breaking database or API changes clearly.
7. Keep previous release history intact.
8. Use actual release dates.
9. Link important Git commits or release tags when available.
10. Keep this file concise and useful.

## Entry Template

### [Unreleased] - YYYY-MM-DD

**Related phase:**  
**Related decision:**  
**Related commit or tag:**

#### Added
-

#### Changed
-

#### Fixed
-

#### Security
-

#### Validated
-

#### Known Limitations
-

---

**Important:** This changelog currently records the documentation and planning stage. It does not claim that the application, database, integrations, or technical prototypes have been implemented.