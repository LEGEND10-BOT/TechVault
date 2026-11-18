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
- Phase 1 closure pass (2026-11-13, owner directive 82417): API configuration architecture added as placeholders — `docs/API_CONFIGURATION.md` + `config/api/providers.schema.json` + `config/api/providers.placeholder.json` (5 provider adapters, capability flags, connection/validation lifecycle, OS-keychain references; offline validation PASS 5/5; no keys, no code, no calls). Whisper Core architecture and integration plan added (`docs/WHISPER_CORE_PLAN.md`; verification tiers 2–4 explicitly not performed — P1-C hold unchanged; resolution decision request R-025). P1-I architecture-preservation review (addendum 2): 16/16 required properties preserved. D-drive reconciliation documented (dev-caches mapped to the DevCache role; compliance claimed only for project-generated artifacts). Gate-1 readiness report consolidated to the A–J format (`docs/PHASE_1_GATE1_READINESS.md`) with recommendation **GATE-1 READY WITH EXPLICIT DEFERRALS** (owner approval outstanding). Recommendations R-023..R-025 recorded.
- P1-C execution and runner patch (2026-11-13, D-020): whisper.cpp desktop verification executed on the Windows reference machine — build PASS at pinned commit `371b5a7`, tiny/base/small/medium transcription PASS, corrected RTF (base 0.292; medium 2.589 non-real-time), peak RAM recorded, corrupted-input rejected; runner defects (WAV-duration parser, null ExitCode, RTF note) patched and verified 8/8. Evidence: `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md`, `P1-C-RUNNER-FIX-REPORT.md`.
- Phase 1 final closure mission (2026-11-13): documentation reconciled with P1-C execution evidence (matrix, Gate-1 report, handoff, Whisper plan tiers, D-020 execution addendum); final deliverables added — `docs/PHASE1-FINAL-CONSOLIDATED-STATUS.md`, `docs/PHASE1-REMAINING-ACTIONS.md`, `docs/GATE1-FINAL-ACCEPTANCE-REPORT.md` (recommendation: **READY FOR OWNER APPROVAL** with explicit deferrals; Gate-1 NOT closed), `docs/PHASE1-TEST-EVIDENCE-INDEX.md`. Regression suite re-run: runner-fix 8/8, P1-G mock reproduced exactly, P1-F 9/9 after clean rebuild on `D:\Builds\cargo-target`, P1-A svelte-check 0/0, security re-scan clean. Exposed-key revocation reminder recorded.

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

## 2026-11-13 — Owner-directed final Phase 1 execution pass (D-020)

- Added standalone P1-C desktop Whisper runner pinned to whisper.cpp release commit `371b5a7`, plus runbook and structured result output.
- Recorded owner selection of R-025 Option A; P1-D remains held and P1-B deferred.
- Adopted R-023 API configuration and R-024 Whisper architecture as Phase 2 reference designs, without enabling live APIs or production integration.
- Updated the P1-C hardware reference to the owner-confirmed i5-10310U / 32 GB workstation.
- Windows runtime tests remain pending; no build, transcription, benchmark, or cancellation pass is claimed from this Linux workspace.

## 2026-11-14 — Phase 2 M0 production scaffold implemented (owner-authorized, M0 only)

- Added the Tauri 2.12.5 desktop workspace (`src/`, `src-tauri/`, identifier `com.techvault.app`): SvelteKit static-adapter SPA, Svelte 5, strict TypeScript, Tailwind CSS 4 with a minimal dark-primary/violet token layer, MSI + NSIS installers (1.96 MiB / 1.33 MiB).
- Added the D-022 security foundation: strict production CSP verified at runtime on the release build (remote fetch/inline script/eval all blocked, CSP violations captured), restricted dev CSP with isolated Vite/HMR allowances, automated `scripts/check-csp` (39 assertions, passing), and a zero-permission capability file proven sufficient for app-command IPC.
- Added the typed IPC envelope + 11-category error taxonomy with canonical fixtures round-tripped through both serde and TypeScript contract tests (TEST-01), plus `ping`/`app_info` smoke commands and a rotating, size-capped, secret-free file logger (SEC-15).
- Added the test and measurement foundations: vitest + svelte-check (17/17 frontend tests, 0/0 checks), cargo fmt/clippy(-D warnings)/test (17/17), and `scripts/measure-baseline.ps1` process-tree baseline (cold 103 ms; warm median 47 ms; idle private median 137.45 MB full tree — baseline only, 150 MB target not claimed achieved).
- Recorded the M0 evidence set under `docs/phase2-results/m0/` and the full report in `docs/PHASE_2_M0_IMPLEMENTATION_REPORT.md` (verdict: PASS WITH CONDITIONS — owner launch confirmation and DEV-CSP-1 dev-CSP review outstanding). M1+ not started; no commits or pushes made.

## 2026-11-14 — M0 owner decisions recorded and owner verification confirmed (documentation only)

- Recorded decision **D-024** (DEV-CSP-1 accepted, Option D): the development-only `script-src 'unsafe-inline'` required by the SvelteKit dev bootstrap is the recorded development-CSP baseline, confined to `devCsp`; the production CSP remains strict and unchanged, with `scripts/check-csp` isolation enforcement and the runtime proof preserved.
- Recorded decision **D-025** (npm-audit disposition): the SvelteKit 3.x major upgrade is deferred to the M1 dependency review; no dependency changes or cookie overrides applied now; existing audit findings and risk assessment preserved in `docs/PHASE_2_M0_DEPENDENCY_AUDIT.md`.
- Recorded the owner's manual verification of the M0 release application (install → launch → smoke view fully OK → uninstall) with explicit not-performed/not-evidenced items identified: SHA-256 artifact check NOT PERFORMED (optional); console-error and window-title-bar checks not evidenced.
- Updated M0 status documents (all append-only): M0 exit-gate evidence is complete and M0 is eligible for closure; M1 remains gated on separate explicit owner authorization. No source, configuration, CSP, or dependency change; no commits or pushes.

## 2026-11-14 — M0 final automated verification complete (M0 verified, closeable)

- Re-confirmed owner decisions D-024 (DEV-CSP-1 Option D) and D-025 (kit-3 deferral to M1 review) via dated addenda; no new decision IDs.
- Executed the full automated verification on freshly built artifacts: check-csp 39/39, svelte-check 0/0, vitest 17/17, cargo fmt/clippy(-D warnings)/test 17/17, `npx tauri build` PASS, production CSP + ACL runtime probes 5/5, dev HMR live-verified, secret scans clean, npm-audit inventory unchanged.
- Verified silent NSIS install → launch (window title "TechVault", smoke view OK/OK/OK, installed size 4.15 MB) → uninstall twice, preserving `%APPDATA%\com.techvault.app`; console captured (one known CSP-enforcement event from the Svelte runtime; zero application errors).
- Fresh baseline (separate from historical): warm start median 67 ms; idle process-tree private median 143.54 MB — baseline-only, no pass/fail claimed.
- Disclosed and corrected a verification-session incident (plain `cargo build --release` produced a dev-mode binary; proper rebuild restored artifacts; affected measurement quarantined). Recorded harness limitations (report-only).
- **M0 verified complete — eligible for formal closure without further owner action.** M1 remains gated on separate owner authorization. No commits or pushes.

## 2026-11-14 — PHASE 2 M0: CLOSED (owner waiver recorded, formal closure)

- Recorded the owner's **unnumbered authorization addendum** explicitly waiving the M0 owner-operated launch confirmation for M0 only, accepting the automated verification evidence (automated install/launch/window/identity/smoke-indicators/IPC/denial/uninstall). Owner-stated accuracy recorded: installation/uninstallation personally performed via command; complete smoke-test checklist not personally performed. No decision ID created; D-021/D-024/D-025 preserved.
- Reconciled every M0 exit criterion against evidence in the new `docs/PHASE_2_M0_CLOSURE_REPORT.md`; corrected the console-error status to PASS WITH DOCUMENTED CONDITION (one CSP `style-src` enforcement event from the Svelte 5 runtime — the console is not clean); annotated stale installed-size references with the verified 4.15 MB measurement; added SUPERSEDED markers to historical installer hashes.
- **PHASE 2 M0: CLOSED — effective 2026-11-14.** Preserved conditions and deferrals listed in the closure report. M1 remains gated on separate explicit owner authorization. No source, CSP, or dependency change; no commits or pushes.

## 2026-11-14 — Phase 2 M1 master engineering blueprint prepared (owner-authorized, blueprint ONLY)

- Prepared the complete M1 engineering blueprint under the owner's "M1 Master Engineering Blueprint" directive (blueprint preparation only — **no M1 implementation authorized or performed**): ten documents (`PHASE_2_M1_MASTER_BLUEPRINT.md`, `_ARCHITECTURE`, `_DATABASE_DESIGN`, `_STORAGE_DESIGN`, `_SEARCH_DESIGN`, `_UI_SPECIFICATION`, `_PERFORMANCE_BUDGET`, `_SECURITY_REVIEW`, `_MILESTONES`, `_OPEN_DECISIONS`) covering all twelve directive modules A–L.
- Audited the M0 implementation, the full Phase 2 planning package, the decision log (D-001..D-025 + unnumbered addenda), and the independent audit; identified the milestone-numbering conflict between the directive's M1 (resource-library core) and the Rev 1.3 M1 (shell) and proposed an explicit re-mapping (G1–G12 gate plan; M1-OD-1/2) rather than silently rewriting history.
- Classified every recommendation (approved / proposed / deferred / rejected / requires research): eight new M1 decisions proposed (M1-OD-1..8), carried OD gates restated (OD-4 + M1-OD-3 block the database gate; OD-9 gates import defaults), and the two inherited M0 conditions treated as explicit M1 review items (style-src console condition → M1-OD-4; D-025 kit-3 assessment → G1 dependency review).
- Registered the M1 items in `PHASE_2_TRACEABILITY_MATRIX.md` §14 (all Proposed). No source, configuration, dependency, migration, or schema change; no commits or pushes.

## 2026-11-14 — M1 owner rulings recorded (D-026) and audit findings reconciled (documentation only)

- Recorded the owner's thirteen M1 planning rulings as decision **D-026** (next available ID after D-025, verified before recording): nine APPROVED (gate plan G1–G12 + Rev 1.3 re-mapping; post-M1 order; UUID attachment store; orphan quarantine/30-day grace; OD-9 intake limits; in-house sniffer; system fonts; kit-3 adopt-only-if-green; OD-7 methodology as enforceable gates), three APPROVED WITH AMENDMENTS (DP-03+OD-4 schema v1; DP-04 CSP strategy; DP-10 search defaults), one DEFERRED (DP-09 export/import — required before G11). Decision-log §5 register (OD-4/OD-7/OD-9) and §10 updated; statuses preserved verbatim.
- Reconciled the M1 planning documents to v1.1 per the ruling directive: database design gained the six mandatory amendments (merge tag union + undo snapshot coverage; undo drift validation; source-deletion confirmation with FK guard and cascade; `resource_identity_decisions`; category slug rules; user-controlled verification writes); storage design gained relocation (A-4), full-replacement restore (A-7), job quiescence (A-10), and the cross-volume test (F-3); search design pinned `remove_diacritics=2` and extended the G8 probe with harakat testing; security review recorded the DP-04 CSP strategy with the enforceable no-inline-style rule (no hash allowance); milestones marked all planning approval gates CLEARED, embedded the amendment tests per gate, and flagged DP-09 before G11; master blueprint + architecture received the six F-2 cross-reference corrections; traceability matrix §15 registers all amendments as design-approved; handoff §23 records the reconciliation.
- Preserved unchanged: D-021..D-025, M0 CLOSED status, the M0-only waiver, strict production CSP (D-022), the D-024 dev-only exception, and all original audit findings/history. **No source, configuration, dependency, migration, or schema change; no commits or pushes; M1 implementation remains a separate, not-yet-granted owner authorization.**

## 2026-11-14 — Phase 2 M1 G1 implemented (application shell + design-system foundation) under explicit owner authorization

- **Pre-tasks executed (G1 item 3):** the M1 dependency review completed — kit-3 assessment under the DP-12 rule: `@sveltejs/kit` 3.2.0 + `adapter-static` 4.0.1 **ADOPTED** after a fully green regression (svelte-check, vitest, cargo suite, release build, check-csp, runtime CSP probes, dev HMR); recorded as decision **D-027** (npm audit 5 low → 4 low; the unpatched-upstream deepmerge dev/build chain remains with its re-check obligation). The DP-04 style-src investigation completed with the root cause identified — SvelteKit's own route announcer inline style (upstream code, not TechVault); **documented and accepted as a known condition** per the recorded ruling; no CSP weakening, no hash allowance (evidence: `docs/phase2-results/m1/style-src-investigation.md`).
- **G1 built:** AppShell (220 px sidebar + 56 px topbar + workspace, skip link, OD-1 neutral wordmark placeholder, inert job-status indicator, honest disabled topbar search); all 8 route destinations with honest empty states (five later-phase areas + Dashboard/Sources as explicit placeholders — never fake content); full design-token set with the exact UI_DESIGN_SYSTEM §4 values (dark primary + light, persisted via the new typed settings family; `prefers-color-scheme` on first run; system fonts per DP-11); the eleven D-023 primitives (button, card, badge, table + sortable head, dialog, sheet, dropdown, tabs, toast, tooltip, input — native `<dialog>` modals, WAI-ARIA APG dropdown/tabs, aria-live toasts, reduced-motion support); Settings shell with functional Appearance, R-023 disabled Providers placeholder (SEC-16), and About (identity, data dir, log path); global error boundary.
- **Backend:** typed settings family (`settings_get`/`settings_set`, Appearance category) with an atomic settings store in the app-data directory (`domain/settings.rs`, `config/mod.rs`, `commands/settings.rs`); corrupted settings file falls back to defaults without crashing; malformed payloads map to typed validation errors; `AppInfo` extended with the user-visible data directory.
- **A-6 enforcement:** `scripts/check-csp.mjs` extended 39→42 checks with the no-inline-style application rule (no `style=`/`style:` in components, no `setAttribute("style")`/`cssText` in the frontend); negative case verified (planted violation FAILS). `scripts/verify-prod-csp.mjs` early-target race fixed (awaits the tauri.localhost page target instead of the transient about:blank).
- **Tests:** frontend suites 64/64 (theme/shell/primitives/interactive/routes + the M0 contract tests), including the TEST-09 automated per-primitive a11y suites (axe-core in jsdom, zero violations; manual keyboard/screen-reader walkthrough remains owner-operated per D-023); cargo suite 33/33 with the new settings tests; svelte-check 0/0 over src+tests.
- **Performance evidence (OD-7 methodology, reference machine):** M1-P1 idle tree private 141.85 MB median vs M0 fresh 143.54 MB (≤ +10 MB budget — within, −1.69 MB); M1-P2 first-render 59 ms page-relative median (guard ≤300 ms — within; spawn→page-target 531 ms recorded separately as process/WebView2 boot); M1-P3 worst route chunk 3.50 KB gzip (guard ≤300 KB — within); M1-P15 warm startup 58 ms median. Scripts committed; raw evidence under `docs/phase2-results/m1/`.
- **Gate status:** G1 implemented with automated evidence recorded; **NOT closed** — the exit condition (owner visual + accessibility acceptance) awaits the owner per `docs/PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md`. DP-09/G11 remain deferred/blocked; no Phase 3/4 scope entered; everything remains uncommitted on `main` @ `37a71c4` for owner review.

## 2026-11-14 — G1 owner-feedback correction pass (workspace layout, neutral dark theme, zoom, skip link) + full automated regression

- **Corrections implemented per the owner's review (application not yet approved; directive: complete all automatable work before further manual verification):** (A) workspace layout revised to the owner's reference screenshot — sidebar branding block (wordmark + "Local-first research", OD-1 placeholder preserved), honestly-disabled "Add Source URL" primary action with tooltip, single 8-item navigation list, topbar section-title left + search/toggle right, vertical Settings internal navigation with segmented theme control, spacious workspace; (B) **neutral dark theme** — near-black workspace / charcoal sidebar / lighter charcoal cards / subtle grey borders / off-white text / muted grey secondary / restrained purple accent — light and system themes preserved, tokens centralized, `UI_DESIGN_SYSTEM.md` §4.2 amended with a dated owner-directive note; (C) **zoom** — Ctrl+Plus/Minus/0 (physical-layout variants handled), 50–200 % bounds clamped in the Rust domain (NaN-safe), persistence via a new centralized settings store, manual Settings controls, and the single least-privilege capability grant `core:webview:allow-set-webview-zoom`; (D) skip link fixed — centered on focus (no branding overlap), explicit focus transfer, no startup focus.
- **Automated regression totals:** vitest **86/86** (adds zoom/error-boundary/CSS-gate suites) · cargo **37/37** (adds zoom-clamping tests) · svelte-check **0/0** · check-csp **44/44** (adds automated no-network-apis and no-secret-identifiers assertions) · runtime CSP probes **5/5** · **runtime zoom verification 7/7** through the real keyboard pipeline on the release build (`scripts/verify-zoom.mjs` — shortcuts, bounds, persistence to settings.json, typing-never-intercepted).
- **Performance re-measured** (same methodology, compared against the earlier G1 evidence): idle tree private 145.85 MB median (delta vs M0 fresh baseline +2.31 MB — within the ≤ +10 MB guard), first-render 124 ms page-relative (guard ≤300 ms), worst route node 3.75 KB gzip (guard ≤300 KB), warm startup 72 ms. Clean release rebuild PASS (MSI 2.09 MiB / NSIS 1.38 MiB).
- **Evidence:** theme screenshots captured via CDP with per-theme token verification (`docs/phase2-results/m1/screenshots/`); full correction-pass record + changed-file inventory `docs/phase2-results/m1/g1r2-correction-pass.md`; startup console re-verified — exactly the one documented route-announcer CSP condition, zero application errors. G1 remains NOT closed; owner acceptance is the exit condition; everything uncommitted.
