# TechVault Phase 2 M1 G1 — Independent Adversarial Verification Report

**Document status:** Independent audit record (2026-11-19). Read-only verification of the completed G1 implementation and its owner-feedback correction pass, executed per the owner's directive. **Only this file was created in the repository**; all probe scripts ran from `D:\Temp\techvault\` (outside the repo). No source, configuration, or decision was modified; nothing committed; every uncommitted change preserved. The audit treated all reported claims as claims to verify, not facts.

**Auditor method:** every suite was re-executed fresh on 2026-11-19; implementation files were read directly (not via the reports); runtime evidence was reproduced against the actual release exe; performance was re-measured independently on the same reference machine (i5-10310U/32 GB, Win11); a full independent build was executed in a scratch cargo target directory so the evidence artifacts in `D:\Builds\cargo-target` were never overwritten.

---

## 1. Repository state protection (directive §2)

| Check | Result |
|---|---|
| Branch / HEAD | `main` @ `37a71c4` — unchanged, no new commits (verified before and after all audit activity) |
| Working-tree entries | 62 porcelain entries; `git stash list` empty |
| Tracked diffs | **Append-only**: `.gitignore` (+4: `.svelte-kit/`, `build/` — M0-era), `DECISION_LOG.md` +163/−0, `PHASE_HANDOFF.md` +168/−0, `CHANGELOG.md` +60/−0, `UI_DESIGN_SYSTEM.md` +14/−0 (§4.2 amendment preserves the v1.0 table as history); 3 empty `.gitkeep` deletions |
| Decision integrity | D-021..D-027 verified present and unchanged at `docs/DECISION_LOG.md:484/501/518/535/556/586/617` |
| G2 discipline | No `db/`, `jobs/`, `migrations`, or schema artifacts anywhere in `src-tauri/src/` (infrastructure contains only `logging.rs` + `mod.rs`) — **no G2 work exists** |
| Risk to existing work | None found. Nothing was reset, stashed, committed, or discarded by this audit |

**Ownership classification:** changes fall into three eras, all currently uncommitted — (1) owner/M0-era (planning docs, M0 implementation, `.gitignore`, package/toolchain baselines), (2) G1 implementation + correction pass (agent-executed under the owner's authorization and directive), (3) the owner's own artifacts outside the repo (review screenshots in `Pictures/Screenshots/`; the persisted `theme: "light"` choice in `%APPDATA%\com.techvault.app\settings.json` — which this audit's probes read but never overwrote).

## 2. Changed-file inventory (actual)

| Category | Count | Contents |
|---|---|---|
| Frontend source (`src/`) | 48 | app shell, 11 primitives, stores (settings/theme/zoom/toasts/jobs), services (app/ipc/settings/zoom), types, utils, 8 routes, tokens (`app.css`) |
| Rust + config (`src-tauri/`) | 17 | `domain/{errors,settings}.rs`, `config/mod.rs`, `commands/{app,settings}.rs`, `ipc.rs`, `lib.rs`, `infrastructure/logging.rs`, capability file, `Cargo.{toml,lock}`, `tauri.conf.json`, `build.rs` |
| Tests (`tests/`) | 15 | 9 frontend suites + setup/helpers + IPC fixtures |
| Scripts | 8 | `check-csp`, `verify-prod-csp`, `verify-dev-hmr`, `verify-zoom`, `measure-baseline`, `measure-first-render`, `measure-bundle`, `capture-theme-screenshots` |
| M1 evidence (`docs/phase2-results/m1/`) | 18 | 2 pre-task records, 15 evidence files (G1 + G1r2 eras), 3 verified screenshots |
| Untracked docs | 34 | Phase-2 planning set, M0 records, M1 blueprint set, G1 records, this file |
| Root toolchain | 4 | `package.json` (+ `#lib` imports field, D-023 deps, kit-3 versions), `package-lock.json`, `vite.config.js` (kit-3 config), `tsconfig.json` (`$app/tsconfig`) |
| Modified tracked + deletions | 11 | as itemized in §1 |
| `static/` | 1 | favicon |

Note on the directive's "72 changed files": that figure matches the correction-pass delta context; the **total uncommitted delta spans the whole M0+planning+G1 history (~145 files + 11 tracked entries)** — all intentional, none destructive, nothing discarded.

## 3. Implementation inspection (directive §3 — read directly, not from reports)

| Area | Inspection result | References |
|---|---|---|
| Neutral dark theme | Verified in source: `:root` = `#0b0b0d` bg / `#191a1c` sidebar / `#232427` surface / `#2f3033` borders / `#f2f2f3` text / `#9d9ea6` secondary / `#8b5cf6` accent; light §4.1 values unchanged; `html.light` is the only theme mechanism | `src/app.css:23-38,46-59` |
| Token discipline | **Zero hardcoded hex colors, zero `dark:` variants, zero inline `style=`/`style:`** across all 28 Svelte files + `app.html` (grep-verified). `text-white` appears 5× as the label color on filled accent/destructive surfaces (see finding F-4) | grep sweep |
| Navigation | 8 destinations in a single nav landmark; Settings included per the reference hierarchy; honest disabled "Add Source URL" (`disabled` + `aria-disabled` + `pointer-events-none` so the explanatory tooltip works over a disabled control); no later-gate functionality — the five later-phase routes and Dashboard/Sources import **zero data services** | `nav.ts:20-38`, `Sidebar.svelte`, route greps |
| Settings vertical navigation | `<nav aria-label="Settings sections">` with `aria-current="true"` on the active section; segmented theme control built on **native radios** (`fieldset` + `sr-only` legend, keyboard-functional); zoom card with bounded controls | `routes/settings/+page.svelte:107-163` |
| Zoom — frontend | `ZoomStore`: step 0.1, clamp on every set, persistence via the centralized `settingsStore`; shortcuts accept `+`/`=`/numpad-Add and `-`/`_`/numpad-Subtract with **Shift allowed** (physical Ctrl+Plus is Ctrl+Shift+=), Ctrl+0 reset; listener installed once, guarded; handled combos `preventDefault`-ed, everything else untouched | `stores/zoom.svelte.ts:23-27,53-77` |
| Zoom — Rust | `MIN_ZOOM 0.5 / MAX_ZOOM 2.0 / DEFAULT 1.0`; `clamp_zoom` NaN-safe (NaN → minimum); `normalize()` wired on **load** (`config/mod.rs:66`) and **before save** (`config/mod.rs:82`) — a hand-edited file can never produce an unusable interface; missing `zoom` field defaults (forward/backward compatible) | `domain/settings.rs:18-33,72-78` |
| Capabilities | **Exactly one grant**: `core:webview:allow-set-webview-zoom` (the real Tauri permission name; the file's description text says `allow-set-zoom` — see finding F-3); no window/fs/network surface | `capabilities/default.json:6-8` |
| Centralized settings | Single `settingsStore` snapshot; `updateAppearance` merges-and-saves so theme/zoom can never stale-overwrite each other; snapshot write is synchronous before the await (no lost-update window) | `stores/settings.svelte.ts:14-46` |
| Skip link | `sr-only` in ordinary use; `focus:fixed focus:left-1/2 focus:-translate-x-1/2 focus:z-50` on focus (cannot overlap the sidebar branding); explicit `preventDefault` + `main.focus()` on activation; no startup autofocus | `AppShell.svelte:17-31` |
| Theme mechanism | `theme.init()` → `settingsStore.load()` → resolve (`prefers-color-scheme` on first run, dark fallback when no OS signal) → class toggle; system-change listener installed once | `stores/theme.svelte.ts:57-83` |
| Error handling | Typed IPC envelope unchanged from M0; settings parse failures → typed `validation.settings_invalid`; storage failures → sanitized `storage.settings_write_failed` (no paths/contents in messages or logs — SEC-15 spot-checked) | `commands/settings.rs:12-24`, `config/mod.rs:96-108` |

## 4. Evidence matrix (directive §4 — classification: A reproduced / B inspected-not-reproduced / C reported-only / D failed)

| # | Claim | Classification | Audit evidence |
|---|---|---|---|
| 1 | svelte-check 0 errors 0 warnings | **A** | Re-run 2026-11-19: `svelte-check found 0 errors and 0 warnings` |
| 2 | Vitest 86/86 (9 files) | **A** | Re-run: `Test Files 9 passed (9), Tests 86 passed (86)` |
| 3 | Rust tests 37/37 | **A** | Re-run: `running 37 tests … ok. 37 passed; 0 failed` |
| 4 | cargo fmt + clippy `-D warnings` clean | **A** | Re-run: fmt clean; clippy finished with no warnings |
| 5 | check-csp 44/44 | **A** | Re-run: `ALL 44 CHECKS PASSED`; script source verified to genuinely scan what it claims (`check-csp.mjs:406-441`) |
| 6 | Runtime CSP probes 5/5 | **A** | Re-run against the evidence exe (port 9391): all five PASS |
| 7 | Runtime zoom 7/7 | **A** | Re-run (port 9392): all seven PASS, incl. persistence verified by reading the real `%APPDATA%…\settings.json` from disk and both bounds held. Disclosed side effect: the probe transiently writes zoom values via the app's own real feature and resets to 1.0 at the end; the owner's `theme: "light"` was never touched |
| 8 | Successful release build | **A** | **Independently reproduced**: full build in a scratch target dir (fresh `CARGO_TARGET_DIR=D:\Temp\techvault\audit-target`, complete dependency recompile) — `npx tauri build` PASS, MSI 2.02 MiB / NSIS 1.38 MiB produced. Evidence artifacts in `D:\Builds\cargo-target` untouched and verified **newer than every source file** |
| 9 | M1-P3 bundle (worst route 3.75 KB gzip; total 65.39 KB) | **A** | Re-run: identical numbers |
| 10 | M1-P2 first-render 124 ms (guard ≤300 ms) | **A** (within guard) | Re-run: **60 ms** median page-relative — passes; differs favorably from the claimed 124 ms (cross-session variance, see §5) |
| 11 | M1-P1 idle 145.85 MB median, within the ≤ +10 MB delta guard | **D** (not reproduced — guard exceeded on independent re-measurement) | Three independent run-sets on 2026-11-19: **155.06 / 156.81 / 157.37 MB medians** (single samples to 164.63) → delta vs the M0 fresh baseline 143.54 MB = **+11.5 to +13.8 MB > +10 MB**. The binary is unchanged since the within-guard run (exe newer than all source; bundle identical), so this is **cross-session environment variance** (WebView2 evergreen/OS state suspected), not an app-code regression — but the guard margin is not robust across sessions. Unresolved: needs a controlled same-session M0-vs-G1 binary comparison or the G12 soak; must not be silently weakened (PERF-15) |
| 12 | M1-P15 warm startup 72 ms | **B** | Today's warm medians 95–157 ms (first-run spikes to 409 ms) — within the ≤1.5 s carried proposal, but the specific 72 ms figure did not reproduce (same variance family as #11) |
| 13 | Accessibility: axe per-primitive + shell | **A** | Suites re-run green as part of #2; spot-reviewed: tests drive real interactions (userEvent, axe on rendered DOM), not just prop assertions |
| 14 | Theme screenshots (dark/light/settings, verified) | **A** | 3 files, distinct hashes (`5168cd02/bd33c944/04646efe`), visually verified against the neutral palette |
| 15 | kit-3 adoption (D-027) legs | **A** for the ongoing-green legs (svelte-check/vitest/cargo/check-csp re-run today on kit 3.2.0); **B** for the one-time historical legs (dev HMR, kit-3 spike) — evidence files inspected |

**Test-quality assessment:** coverage is behavior-centric — keyboard events dispatched through real listeners, focus assertions via `document.activeElement`, axe run on rendered DOM, native-dialog event wiring exercised, persistence verified through the mock boundary *and* end-to-end at runtime by `verify-zoom.mjs` reading the real file. Known honest limits: skip-link class assertions (`shell.test.ts:85-91`) are implementation-detail checks paired with a real focus-transfer test (pragmatic, noted as F-5); jsdom cannot express the native focus trap, so dialog trap behavior rests on the platform + the owner's manual walkthrough (correctly documented, not claimed).

## 5. Security and architecture review (directive §5)

**No Critical or High findings.** Prioritized findings:

| ID | Severity | Finding | Reference |
|---|---|---|---|
| F-1 | **Medium** | **M1-P1 idle-RAM guard not reproducibly satisfied across sessions** (evidence-matrix #11). Not a code regression — the identical binary measured within-guard on 11-14 and out-of-guard on 11-19; the margin (+10 MB) is smaller than observed cross-session variance. Obligation: controlled same-session M0-vs-G1 comparison and/or G12 soak; record the analysis; do not weaken the criterion | `scripts/measure-baseline.ps1`; audit run-sets in §4#11 |
| F-2 | **Medium** | **Owner guide §2 item 4 is stale**: instructs "Settings tabs … roving tabindex" but the implementation uses vertical button navigation (Tab-reachable buttons + `aria-current`) — an owner following the guide would test behavior that no longer exists. Doc-only correction needed (audit is read-only; not applied) | `docs/PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md:33` vs `routes/settings/+page.svelte:107-126` |
| F-3 | Low | Capability **description** names `core:webview:allow-set-zoom`; the actual grant is `core:webview:allow-set-webview-zoom` — prose-only staleness; the grant itself is correct and minimal | `src-tauri/capabilities/default.json:4` |
| F-4 | Low | `text-white` on filled accent/destructive surfaces (5 sites) uses Tailwind's default white rather than a token — contrast is fine; consider an `--tv-on-accent` token for strict token discipline | `Button.svelte:39,44`, `AppShell.svelte:32`, `Sidebar.svelte:36`, `settings/+page.svelte:145` |
| F-5 | Low | Skip-link tests assert Tailwind class names (implementation detail) in addition to the behavioral focus-transfer test — brittle to refactoring, but paired with behavior coverage | `tests/frontend/shell.test.ts:85-91` |
| F-6 | Info | `JobStatusIndicator.failed` is a constant-false branch (deliberate G2 placeholder, documented inline) | `JobStatusIndicator.svelte:14` |
| F-7 | Info | Each `Tooltip` instance installs a window-level keydown listener (2 instances mounted) — negligible; harmless | `Tooltip.svelte:44-48` |
| F-8 | Info | Audit probes transiently mutate `%APPDATA%\com.techvault.app\settings.json` zoom values (via the app's real feature) and restore 1.0; owner theme untouched | `scripts/verify-zoom.mjs:31-32,196-200` |
| F-9 | Info | Tauri installers are not byte-reproducible (audit build MSI 2.02 vs evidence 2.09 MiB) — consistent with the M0-documented behavior; sizes well inside the K3 range | scratch build log |

**Security posture verified directly:** single least-privilege capability grant; production CSP strict (config 44 checks incl. dev/prod isolation + zero-network + no-secret scans, all passing) **and** runtime-verified (fetch/script/eval blocked on the actual exe); typed IPC envelope with validated settings payloads (malformed → typed `validation.*`); atomic settings persistence (write→sync→rename) with corrupt-file fallback to defaults; NaN-safe domain clamping; zero frontend network APIs; zero secret identifiers; sanitized error/log messages; local-first architecture intact (no network code anywhere in M1); no Phase 3/4 functionality (later-gate routes are pure placeholders importing no services; source-intake UI honestly disabled).

## 6. Discrepancies between reports and repository state

1. **M1-P1 "within guard"** — the correction-pass claim was true for its run (145.85 MB, recorded in `g1r2-baseline.json`) but did **not** reproduce on 2026-11-19 (§4#11, F-1). The report's own hedging ("cross-run variance noted for the G12 soak") anticipated fragility but under-stated it.
2. **M1-P15 "72 ms"** — not reproduced (95–157 ms today); still within the carried ≤1.5 s proposal; recorded honestly as B.
3. **Guide §2 item 4** — stale after the vertical-nav correction (F-2); the guide's v1.1 note says "§2–§5 remain valid", which is inaccurate for that one item.
4. **"72 changed files"** framing (directive §1) — the actual total uncommitted delta is ~145 files + 11 tracked entries spanning M0 + planning + G1; the 72 figure matches the correction-pass window only (§2 inventory).
5. No other discrepancies: all headline counts (86/86, 37/37, 44/44, 5/5, 7/7, build success, bundle sizes) verified exactly as reported; the correction-pass changed-file inventory matches the tree.

## 7. Owner acceptance checklist (directive §6)

The guide (`docs/PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md`) is **accurate for §1 (v1.1 items 1.3R/1.6R/1.11R/1.12R), §3–§5 and the zoom/skip-link sections**, with the single stale item F-2 — when reading §2, substitute item 4 with: *"Settings: Tab into the vertical section navigation (Appearance/Providers/About are ordinary focusable buttons with a visible active state — arrows are not used between them); Enter/Space switches sections."*

**Mandatory for acceptance** (cannot be automated):
1. Visual acceptance of dark + light themes and the corrected layout vs your reference screenshots (`docs/phase2-results/m1/screenshots/` for pre-review) — guide §1 items 1.1–1.12R.
2. Physical-keyboard zoom feel: Ctrl+Plus/Minus/0 incl. while typing in a field; zoom survives an app restart; Settings zoom buttons disable at 50 %/200 % — guide zoom §items 1–4.
3. Keyboard-only walkthrough of the full shell (with the §2 item-4 substitution above) — guide §2.
4. Screen-reader smoke test (Narrator/NVDA): nav landmarks, aria-current, segmented radios, section labels — guide §3.
5. Reduced-motion check with OS animation off — guide §4.
6. 900×600 window resize — guide §5.
7. Subjective usability approval (spacing, density, interaction states).

**Optional observations** (non-blocking): console shows exactly one documented announcer CSP event (re-verified 2026-11-19); zoom persistence mechanics; installer install/uninstall cycle.

## 8. Final recommendation

**READY AFTER SPECIFIC FIXES** — the implementation, security posture, and test evidence are verified sound (all headline claims reproduced exactly; no Critical/High findings; no scope, decision, or security regressions), but two specific, non-code items should land before G1 closure:

1. **Resolve F-1 (M1-P1)**: run the controlled same-session M0-binary-vs-G1-binary idle comparison (both executables exist; one session, alternating runs). If the delta is within +10 MB, record the variance explanation and proceed; if it still exceeds the guard, record a miss with analysis and remediation options — never weaken the criterion (PERF-15).
2. **Fix F-2 (guide §2 item 4)** with the substitution text above (one doc edit).

Neither blocks the owner from beginning visual/zoom/a11y acceptance now — both must simply be recorded before the gate closes. F-3..F-9 are recorded for the implementer/owner at discretion; none is a closure blocker.

---

**Audit restrictions honored:** read-only except this file; no source/config/decision changes; no commits/pushes; no G2 work; every existing uncommitted change preserved (verified unchanged after all audit activity). Audit scratch artifacts (probe scripts, independent build, measurement JSONs) live outside the repository in `D:\Temp\techvault\`.

**End of PHASE_2_M1_G1_INDEPENDENT_VERIFICATION.md**

---

## 9. Finding-status addendum (2026-11-19, owner "Final Finding Resolution Pass")

| Finding | Status after the resolution pass | Evidence |
|---|---|---|
| **F-1** (Medium — M1-P1 idle-RAM guard not reproducibly satisfied) | **RESOLVED — investigation executed; verdict: PERFORMANCE GUARD MISSED.** A controlled same-session, alternating-order comparison (12 runs, 6 counterbalanced M0↔G1 pairs, identical script/methodology/process accounting) measured a **median delta of +16.03 MB** (minimum pair delta +12.16 MB — every transition above the +10 MB guard; identical 7-process trees both sides). The reconstruction's M0-equivalent measured 139.58–144.89 MB, consistent with the original M0 baselines. **The audit's environment-variance hypothesis is refuted as the sole cause** — the delta is a stable property of the G1 build. The miss is recorded with four owner-decision remediation options (footprint-reduction pass, longer-settle/G12-soak re-measurement, owner-approved budget re-derivation, accept-as-documented-condition); no criterion was weakened; no historical evidence rewritten | `docs/phase2-results/m1/f1-controlled-comparison.md` + `f1-controlled-comparison/` (12 raw run JSONs + aggregate + fingerprint tool) |
| **F-2** (Medium — guide §2 item 4 stale) | **RESOLVED** — §2 item 4 replaced with the directed wording describing the actual vertical section navigation (ordinary focusable buttons, visible active state, no arrow-key roving, Enter/Space switches), with a dated correction marker; the v1.1 header note amended for consistency; no unrelated sections rewritten | `docs/PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md:33` + v1.1 header line |

F-3..F-9 (Low/Info) remain recorded for the implementer/owner at discretion — unchanged by this pass. **G1 remains open pending owner acceptance**, now carrying the recorded M1-P1 miss as an owner-decision item.

**Resolution-pass changed-file inventory:** `docs/PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md` (2 edits: §2 item 4 + v1.1 header note) · `docs/phase2-results/m1/f1-controlled-comparison.md` (new) · `docs/phase2-results/m1/f1-controlled-comparison/` (new — 14 evidence files) · this addendum. **No source, configuration, capability, threshold, or decision changes.** Repository scratch work (M0 reconstruction, comparison runs) performed entirely outside the repo in `D:\Temp\techvault\`.

**Resolution-pass git integrity:** branch `main`, HEAD `37a71c4` unchanged before and after; no commits/pushes/resets/stashes; all prior uncommitted changes preserved.

## 10. F-1 verdict superseded by measured reconciliation (2026-11-19, owner performance-reconciliation directive)

§9's F-1 status ("RESOLVED — verdict: PERFORMANCE GUARD MISSED") is **superseded by measurement**: a 60-second-settle paired re-run (3 counterbalanced M0↔G1 pairs, same session, same committed script) measured a **+5.42 MB median delta — within the ≤ +10 MB guard** — with both binaries settling substantially (G1 −20.1 MB, M0 −9.5 MB from their 6 s figures). Root cause of the earlier miss: the 6-second settle captured unsettled startup state (never pinned in the protocol; M0 script default inherited forward). The D-019 absolute 150 MB planning target is met at settle (G1 138.76 MB). Full analysis, compliance table, root-cause decomposition (renderer/browser-side growth, flat Rust process, JS-heap/DOM/bundle evidence), measurement-confidence assessment, and the owner decision packet (P-1..P-4): `docs/phase2-results/m1/perf-budget-reconciliation.md`. The 6-second data remains preserved and unmodified; the erratum for the F-1 report's absolute-target sentence is recorded in `f1-controlled-comparison.md`. **Update 2026-11-19: the owner approved all four decisions (P-1..P-4) — M1-P1 recorded MET at the 60-second settle in the budget document; methodology pinned; absolute-target verdict deferred to G12 W1; no footprint work. This resolves the outstanding performance decision this section deferred to the owner.**
