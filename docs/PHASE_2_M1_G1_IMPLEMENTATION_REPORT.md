# TechVault Phase 2 M1 — G1 Implementation Report (Application shell and design-system foundation)

**Document status:** G1 implementation record v1.0 (2026-11-14). Executed under the owner's explicit M1 implementation authorization ("begin with G1", 2026-11-14) against the approved gate specification (`PHASE_2_M1_MILESTONES.md` G1, DP-01/DP-04/DP-11/DP-12/DP-13). **G1 is implemented and its automated evidence is recorded; the gate is NOT closed — the exit condition (owner visual + accessibility acceptance, manual TEST-09 items) remains open for the owner.** Nothing here claims more than the evidence shows.

---

## 1. Pre-tasks (executed before the gate build, as the spec requires)

| Pre-task | Outcome | Record |
|---|---|---|
| **M1 dependency review — kit-3 assessment** (D-025, DP-12 rule) | **ADOPTED** — `@sveltejs/kit` 3.2.0 + `adapter-static` 4.0.1; every regression leg green (svelte-check 0/0, vitest 17/17, cargo suite 17/17 + fmt/clippy clean, `npx tauri build` PASS, check-csp 39/39, runtime CSP probes 5/5, dev HMR live-verified). Recorded as its own decision record **D-027**. `npm audit` 5 low → 4 low (only the unpatched-upstream `deepmerge` dev/build chain remains — re-check obligation retained). | `docs/phase2-results/m1/kit3-assessment.md`; `kit3-regression-outputs.md`; `DECISION_LOG.md` D-027 |
| **style-src investigation** (DP-04, time-boxed) | **ROOT CAUSE IDENTIFIED** — the event is SvelteKit's own route announcer (`#svelte-announcer`, upstream `runtime/components/root.svelte:50` inline style attribute) parsed via `template.innerHTML`; TechVault code contributes zero inline styles. Not reasonably eliminable without weakening CSP or patching upstream → **documented and accepted as a known condition** per DP-04 ruling 3. Console criterion operates as "zero application errors; the documented runtime CSP-enforcement event is listed as a known condition". The old "Option B hash" remedy is technically void anyway (hashes do not apply to style attributes without the broader `'unsafe-hashes'`). | `docs/phase2-results/m1/style-src-investigation.md` |

## 2. Scope delivered (G1 items 1–2 of the milestone spec)

- **AppShell**: 220 px sidebar (OD-1 neutral wordmark placeholder + 7-item main navigation + settings access zone) · 56 px sticky topbar (honest disabled global search with tooltip, inert job-status indicator, theme toggle) · flexible main workspace · skip-to-content link. Contextual right panel: reserved structurally (populated at G9) — occupies no layout in G1.
- **Route skeleton — all 8 destinations**: Dashboard, Sources, Resources, Notebooks, Knowledge Graph, Bookmarks, Research Analytics, Settings. Five later-phase areas + Dashboard/Sources render explicit "later phase"/"coming with data" placeholders — **never fake content**; Resources renders its honest "arrives with G5+" empty state; Settings is fully real.
- **Design tokens + themes**: full token set with the exact UI_DESIGN_SYSTEM §4 values (light + dark), semantic colors, 0.625rem radius, system font stacks (DP-11 — no Geist bundling). Dark is the primary direction (`:root` = dark; `html.light` class switches); `prefers-color-scheme` respected on first run; the choice persists across restarts through the typed settings family.
- **Settings family (G1 slice)**: `settings_get`/`settings_set` typed commands (Appearance category) backed by an atomic JSON settings store in the app-data directory (`config/` module; no secrets; corrupted file → defaults + logged condition, never a crash). Settings screen: Appearance (functional, three theme options), Providers (R-023 placeholder rendered clearly as "not configured — disabled", SEC-16), About (application identity, data directory, log location; diagnostics export honestly marked as G12).
- **The eleven in-house primitives (D-023)**: button, card, badge, table (+ sortable head), dialog, sheet, dropdown, tabs, toast, tooltip, input — Svelte 5 runes + Tailwind + `lucide-svelte`, class composition via `clsx` + `tailwind-merge`. Dialogs/sheets are native `<dialog>` (platform focus trap/Escape/focus-return/background lock); dropdown + tabs follow the WAI-ARIA APG patterns; toasts are an aria-live region (errors `role="alert"`); visible focus indicators everywhere; reduced-motion honored globally.
- **Global error boundary** (`<svelte:boundary>`): renders the design-system error state (what happened + next action + retry) and logs honestly.
- **A-6 no-inline-style rule (DP-04/D-026)**: `scripts/check-csp.mjs` extended with three assertions — no `style=` attributes, no `style:` directives, no `setAttribute("style")`/`.style.cssText` anywhere in the frontend (29 markup files scanned; negative-case verified: a probe violation file FAILS the check).

**Out of scope (per spec):** any data-bound feature; logo asset integration (OD-1 owner delivery pending); DB/schema/jobs (G2+); Phase 3 AI and Phase 4 automation features; G11/DP-09 (remains deferred).

## 3. Files created / modified

**Created (frontend):** `src/lib/components/ui/` — Button, Input, Card, Badge, Table, TableHead, Dialog, Sheet, DropdownMenu, Tabs, Toast, Tooltip, `index.ts`, `types.ts`; `src/lib/components/shell/` — AppShell, Sidebar, Topbar, TopbarSearch, ThemeToggle, JobStatusIndicator, `nav.ts`; `src/lib/components/placeholders/RoutePlaceholder.svelte`; `src/lib/stores/theme.svelte.ts`, `toasts.svelte.ts`, `jobs.svelte.ts`; `src/lib/services/settings.ts`; `src/lib/types/settings.ts`; `src/lib/utils/cn.ts`; routes: `+layout.svelte` (rewritten), `+page.svelte` (rewritten to Dashboard), `sources|resources|notebooks|graph|bookmarks|analytics|settings/+page.svelte`.
**Created (backend):** `src-tauri/src/domain/settings.rs`; `src-tauri/src/config/mod.rs`; `src-tauri/src/commands/settings.rs`.
**Created (scripts/tests/evidence/docs):** `scripts/measure-first-render.mjs`, `scripts/measure-bundle.mjs`; `tests/frontend/setup.ts`, `test-utils.ts`, `a11y.ts`, `theme|shell|primitives|interactive-primitives|routes.test.ts`; `docs/phase2-results/m1/*` (7 evidence files); this report + the owner verification guide.
**Modified:** `src/app.css` (full token set); `src-tauri/src/lib.rs` (settings commands + state); `src-tauri/src/commands/{mod,app}.rs` (settings family; AppInfo `data_dir`); `src-tauri/src/{domain,commands}/mod.rs`; `src/lib/types/app.ts` (`data_dir`); `scripts/check-csp.mjs` (A-6 extension, 39→42 checks); `scripts/verify-prod-csp.mjs` (early-target race fixed — awaits the tauri.localhost page target); `vite.config.js` (kit-3 config + test setup); `tsconfig.json` (`$app/tsconfig`, scoped include, `#lib` paths); `package.json` (kit-3 versions, `#lib` imports field, D-023 deps + dev-only axe-core/@testing-library/user-event).
**Deleted:** `svelte.config.js` (no longer supported by kit 3 — content migrated into the vite plugin config); `tests/frontend/smoke-view.test.ts` (M0 smoke view replaced by the G1 shell; its assertions live on in the contract tests).
**Documentation:** `DECISION_LOG.md` (D-027); `PHASE_2_M1_SECURITY_REVIEW.md` §9 (kit-3 outcome note); `CHANGELOG.md`; `PHASE_HANDOFF.md`; `PHASE_2_TRACEABILITY_MATRIX.md` §16; `PHASE_2_M1_MILESTONES.md` (G1 status note).

## 4. Dependencies (all justified, gate-scoped)

- **D-023 gate-scoped (approved):** `lucide-svelte@1.0.1` (ISC), `clsx@2.1.1` (MIT), `tailwind-merge@3.7.0` (MIT) — the exact set recorded in OD-8/G1.
- **Dev-only test tooling (flagged in the G1 plan):** `axe-core` (MPL-2.0, test suites only — never bundled; the instrument for D-023's mandated "automated accessibility checks per component suite") and `@testing-library/user-event` (MIT, dev-only; keyboard-event realism for the APG suites). Neither reaches the shipped bundle.
- **kit-3 upgrade (D-027):** kit 3.2.0 / adapter-static 4.0.1; vite 8.3.8 in-range bump; no new runtime dependencies.

## 5. Tests executed and actual results

| Suite | Result |
|---|---|
| `npm run check` (svelte-check, src + tests) | **0 errors, 0 warnings** |
| `npm test` (vitest: theme 10, shell 8, primitives 11, interactive 13, routes 7, ipc-contract 15) | **64/64 passed** |
| TEST-09 automated per-primitive a11y suites (axe-core in jsdom, per suite: Button/Input/Card/Badge/Table/TableHead/Dialog/Sheet/DropdownMenu/Tabs/Toast/Tooltip + full shell) | **all axe runs clean — zero violations** |
| `cargo fmt --check` / `cargo clippy --all-targets -D warnings` / `cargo test` | fmt clean · clippy clean · **33/33** (17 M0 + 16 settings/settings-store/commands) |
| `npm run check:csp` (extended) | **42/42** (39 config checks + 3 A-6 assertions; negative-case probe verified the scanner fails on a planted `style=` violation) |
| `node scripts/verify-prod-csp.mjs` (G1 release exe) | **5/5** — page origin tauri.localhost; remote fetch blocked (CSP violation logged); inline script blocked; string-eval blocked; typed IPC invoke works incl. `data_dir` |
| `npx tauri build` | **PASS** — MSI 2.08 MiB / NSIS 1.37 MiB (`D:\Builds\cargo-target\release\`) |
| Settings persistence (Rust unit) | save→load round-trip, atomic replace, corrupt-file fallback, invalid-payload typed rejection, no temp leftovers |

## 6. G1 performance evidence (M1-P1/P2/P3/P15; methodology per OD-7)

| ID | Metric | Result | Guard | Verdict |
|---|---|---|---|---|
| M1-P1 | W1 idle tree private bytes, G1 shell vs M0 fresh baseline (143.54 MB) | **141.85 MB median** (p95 144.68; 5 warm runs) | ≤ +10 MB delta | **within budget** (−1.69 MB median delta; cross-run variance noted honestly) |
| M1-P2 | First render (shell), page-relative (navigation start → DCL, read at shell-present confirmation) | **59 ms median** (54–61 range) | guard ≤300 ms warm | **within guard**. Separately recorded: spawn→page-target median 531 ms (process + WebView2 initialization — environmental, not the SPA's render time) |
| M1-P3 | Bundle per route | 10 route nodes; **worst 3.50 KB gzipped**; total client JS 60.09 KB gzip | no route > 300 KB gzip | **within guard** |
| M1-P15 | Warm startup (to main window, 5 runs) | **58 ms median** | ≤1.5 s carried proposal (G1/G12 recorded) | recorded; within the carried proposal |

Evidence: `docs/phase2-results/m1/g1-baseline.json`, `g1-first-render.json`, `g1-bundle.json`, `g1-verify-prod-csp-output.txt`. Measurement scripts committed (`scripts/measure-baseline.ps1` reused; `measure-first-render.mjs`, `measure-bundle.mjs` new). Reference machine: Windows 11 Pro, i5-10310U, 32 GB RAM.

## 7. Known limitations / documented conditions (nothing hidden)

1. **The documented runtime CSP-enforcement console event persists** (DP-04 accepted condition): exactly one error-level console entry at startup from SvelteKit's route announcer inline style — upstream code, zero application errors, zero functional impact. Recorded in `style-src-investigation.md`. The console criterion operates under the recorded fallback wording.
2. **Manual TEST-09 items are outstanding** (owner-operated): full keyboard walkthrough, manual screen-reader smoke test (Narrator/NVDA), reduced-motion check, window-resize check, and owner visual acceptance in both themes. The automated a11y suites do NOT substitute for these (D-023 is explicit about this).
3. **The 5 later-phase routes are honest placeholders** — no fake content, by design.
4. **Theme pre-hydration frame is dark** (the primary direction) until settings load; a light-preferring user may see a brief dark frame on launch. No inline script is used (CSP); the swap happens at shell mount.
5. **Topbar search is honestly disabled** with an explanatory tooltip — the search surface arrives at G8.
6. **deepmerge advisory (GHSA-gcqx-w48m-w2h4) remains** in the dev/build path — unpatched upstream (no fixed release exists); re-check obligation retained at every toolchain upgrade + closure audit (D-025/D-027). Production static SPA does not execute it.
7. **W1 10-minute idle soak** belongs to G12 per the budget plan — only the M0-methodology idle sample was taken here.
8. `npm audit fix --force` must **not** be run (it would downgrade kit to 0.0.30).

## 8. Security posture verification (G1 item 5)

- Production CSP strict on the real G1 UI: `check-csp` 42/42 + runtime probes 5/5 on the release build (fetch/script/eval negatives + IPC positive).
- Dev allowances isolated per D-024 (dev `script-src`/`style-src` `unsafe-inline` confined to `devCsp`; no dev-only token in production).
- No secrets in the frontend (SEC-16): providers render placeholder-only state; no keys, no network surface (M1 adds zero network code).
- Capabilities unchanged (zero-permission baseline; no new plugin permissions).
- Settings IPC validates payloads and maps malformed input to typed `validation.*` errors; the settings file is written atomically (write → sync → rename) and never blocks startup on corruption.
- Logging follows SEC-15: command names/outcomes/codes only; no paths beyond the data-dir display in About (the user's own data root), no content.

## 9. Git state and commit policy

Everything remains **uncommitted on `main` @ `37a71c4`** (the working tree also carries the uncommitted M0 + planning state), consistent with the project's review-before-commit pattern. No commits or pushes were made by this gate. The diff is reviewable as: kit-3 toolchain migration + G1 frontend/backend additions + settings family + scripts/tests/evidence/docs.

## 10. Gate status

**G1: IMPLEMENTED — automated evidence recorded — NOT closed.** The exit condition ("owner visual + accessibility acceptance recorded") is the owner's. The owner verification guide lists exactly what to run and check: `docs/PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md`.

---

**End of PHASE_2_M1_G1_IMPLEMENTATION_REPORT.md**

---

## 11. Correction pass (2026-11-14, owner feedback directive) — v1.1

**Status:** the owner reviewed the G1 desktop application (screenshots supplied) — **not yet approved** — and directed corrections plus a complete automated regression before any further manual verification. All four correction items were implemented and every automatable check was executed. **Full record: `docs/phase2-results/m1/g1r2-correction-pass.md`.** G1 remains NOT closed; owner acceptance is the exit condition.

### 11.1 Owner corrections implemented
- **A. Workspace design** (per the owner's reference screenshot): branding block (wordmark + "Local-first research"; OD-1 placeholder preserved), honestly-disabled "Add Source URL" primary action with tooltip, single 8-item navigation list, topbar section-title left + search/toggle right, **vertical Settings internal navigation** (`aria-current`, accent-tinted), segmented theme control (Light/✓Dark/System), spacious workspace. No later-gate functionality introduced.
- **B. Neutral dark theme**: near-black workspace `#0b0b0d`, charcoal sidebar `#191a1c` (new token), lighter charcoal cards `#232427`, subtle grey borders `#2f3033`, off-white text `#f2f2f3`, muted grey secondary `#9d9ea6`, restrained purple accent `#8b5cf6` (interactive states only). Light/system preserved; tokens centralized. **`UI_DESIGN_SYSTEM.md` §4.2 amended with a dated owner-directive note** (v1.0 palette preserved as history).
- **C. Zoom**: Ctrl+Plus / Ctrl+Minus / Ctrl+0 (physical layouts handled — `=`/`+`, `-`/`_`, numpad keys; Shift allowed for Plus), bounds **50 %–200 %** clamped in the Rust domain on load and save (NaN-safe), persistence through a new centralized `settingsStore` (single snapshot owner — theme/zoom can never stale-overwrite each other), WebView application via the **single least-privilege capability grant `core:webview:allow-set-webview-zoom`**, manual controls in Settings → Appearance → Display zoom. **Runtime verification on the release build through the real input pipeline: 7/7** (`scripts/verify-zoom.mjs`) — includes persistence to `settings.json`, both bounds held, and typing-never-intercepted.
- **D. Skip link**: hidden during ordinary interaction; on keyboard focus **fixed and horizontally centered** (can no longer overlap the sidebar branding — the defect visible in the owner's screenshot); activation explicitly transfers focus into `#main-workspace`; no startup focus (asserted).

### 11.2 Regression totals after the correction pass
**vitest 86/86** (9 files — adds zoom, error-boundary, and CSS-gate suites; shell/theme/routes suites updated for the revised layout) · **cargo 37/37** (adds 4 zoom tests) · **svelte-check 0/0** · **check-csp 44/44** (adds `app.no-network-apis` and `app.no-secret-identifiers` — automated zero-network and secret-free-frontend assertions) · runtime CSP **5/5** · runtime zoom **7/7** · startup console: **exactly the one documented announcer condition** (verified on natural startup, no reload).

### 11.3 Performance re-measurement (vs the pre-correction G1 evidence, same methodology)
M1-P1 idle tree private **145.85 MB median** (delta vs M0 fresh 143.54 MB: **+2.31 MB** — within the ≤+10 MB guard with headroom; the delta moved from −1.69 MB across runs — cross-run variance dominates, noted for the G12 soak) · M1-P2 first-render **124 ms** page-relative (guard ≤300 ms — within; boot clock recorded separately at 1037 ms this run, environmental) · M1-P3 worst route **3.75 KB gzip** (+0.25 KB; guard ≤300 KB — within; total 65.39 KB) · M1-P15 warm startup **72 ms** (within the carried ≤1.5 s proposal). Raw: `g1r2-baseline.json`, `g1r2-first-render.json`, `g1r2-bundle.json`.

### 11.4 Build + screenshots
Clean release rebuild **PASS** (MSI 2.09 MiB / NSIS 1.38 MiB; one aborted attempt documented — a lingering probe-held exe file lock, killed and rerun). Theme screenshots captured via CDP with per-theme token verification before capture (owner's persisted preference never overwritten): `docs/phase2-results/m1/screenshots/` — dark dashboard, light dashboard, dark Settings (vertical navigation + segmented theme + zoom controls visible).

### 11.5 Remaining owner-operated verification (unchanged in kind, updated in content)
Visual acceptance of the revised themes/layout, real screen-reader walkthrough, reduced-motion check, window-resize check, zoom keyboard feel. Guide: `PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md` v1.1.

---

## 12. Performance decision recorded + manual acceptance (2026-11-19, owner-approved) — v1.2

- **Owner completed the manual acceptance checklist** (owner directive 2026-11-19 — visual, keyboard, screen-reader, reduced-motion, resize, zoom checks).
- **Owner approved the performance decisions P-1..P-4** (from the reconciliation's decision packet): **M1-P1 = MET** at the approved 60-second settle (+5.42 MB median; pairs +5.42/+5.13/+6.46 preserved; the ≤ +10 MB guard unchanged); idle-settle methodology pinned to 60 s in `PHASE_2_M1_PERFORMANCE_BUDGET.md` §1 (clarification, not a threshold revision); the D-019 absolute 150 MB planning-target final verdict deferred to the G12 W1 10-minute soak (60 s supporting evidence: 138.76 MB, under target); no footprint-reduction work now.
- **Gate status:** the G1 exit-condition evidence set is complete (automated suites + owner manual acceptance + performance decision). **Formal closure remains pending the owner's explicit closing instruction** — this report does not close the gate. Status, records: `PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md` (acceptance checklist), `phase2-results/m1/perf-budget-reconciliation.md` (approved analysis), `PHASE_2_M1_INDEPENDENT_VERIFICATION` §10 (verification + approval note).
