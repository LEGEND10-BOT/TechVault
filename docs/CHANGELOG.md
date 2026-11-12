# TechVault Changelog

All notable changes to TechVault should be documented in this file.

The format is based on Keep a Changelog principles. Version numbers may follow Semantic Versioning when actual releases begin.

**Project:** TechVault  
**Current stage:** Pre-development documentation  
**Changelog status:** Initial draft

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
- Decision records D-014..D-017 (2026-11-12).
- Phase 1 package P1-A (F1-01a desktop PoC): throwaway Tauri 2 + Svelte 5 + strict TypeScript validation shell under `experiments/p1-a/` with automated IPC, permission-scope, and measurement suite (`docs/phase1-results/F1-01/RESULTS.md`) (2026-11-12).
- Phase 0 baseline checkpoint commit (P0-T06) created after owner-supplied repo-local Git identity (2026-11-12).

### Changed
- Established a documentation-first workflow before implementation.
- Established separate project-control and phase-implementation workflows.
- Clarified the distinction between approved decisions and technical proposals.
- Documentation set reconciled per owner decisions D-014..D-016: roadmap §4 governs Phase 0 (documentation-only), MASTER_BRAIN B2 adapter tiers govern ARCHITECTURE §7.1, transcription foundation set in Phase 2.
- Repository initialized on branch `main` with `.gitignore`; baseline commit pending Git identity.

### Validated
- P1-A / F1-01a (desktop, 2026-11-12, i5-10310U reference machine, evidence in `docs/phase1-results/F1-01/RESULTS.md`): Tauri 2 + Rust + Svelte 5 + Vite + strict TS builds and runs on Windows 11 (dev + release + NSIS/MSI installers); IPC round-trip median 1.60 ms release / 2.50 ms dev, 200/200 calls stable (target ≤10 ms); HMR functional; warm startup median 74.5 ms; idle RAM tree working set 327.14 MB / private 135.97 MB (measure-then-decide vs ≤150 MB planning target); installers 1.51–2.23 MB (below 20–60 MB planning range); **fs permission scope rejected `C:\Windows\win.ini` and `C:\Windows\system.ini` reads (mandatory security negative test passed)**. Android half (F1-01b / P1-B) not executed — deferred per owner instruction.

### Known Limitations
- Application implementation has not started.
- Tauri 2 Android compatibility remains unverified.
- Video playback compatibility remains unverified.
- Whisper.cpp integration remains unverified.
- Resource identity and merge rules require technical validation.
- Database configuration and performance require testing.
- Managed API hosting, quotas, and billing policy remain pending.
- Android minimum supported version is not yet selected.
- Exact release and packaging strategy remains pending.
- Approved logo asset and TSX UI reference are not yet in the repository (D-012 delivery pending).
- Reference-machine RAM capacity unconfirmed (required for performance baselines, P0-T09 / P1-J).
  - Update 2026-11-12: the active reference machine measures 32 GB RAM with an i5-10310U CPU; owner confirmed this machine as the reference (documents naming i5-6300U await Main Controller correction). Idle-RAM working-set budget outcome is a measure-then-decide item for the owner (P-022).
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