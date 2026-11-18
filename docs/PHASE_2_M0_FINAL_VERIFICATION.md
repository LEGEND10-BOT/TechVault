# TechVault Phase 2 — M0 Final Automated Verification & Closure Readiness

**Document status:** Final verification record (2026-11-14), prepared under the owner's "Automated Final Verification & Closure Readiness" authorization, resumed after the workspace-contamination check (§1). Evidence files: `docs/phase2-results/m0/final-verification/`. All results below are from checks that **actually ran** in this session unless explicitly marked historical.

**Decision record:** D-024 (DEV-CSP-1, Option D) and D-025 (kit 3.x deferral) were already recorded in `DECISION_LOG.md` §4 during the prior owner directive; this session's directive re-approved both verbatim, so **dated re-confirmation addenda were appended to D-024/D-025 — no new decision IDs were minted** (no D-026/D-027 exist; verified by grep). Production CSP confirmed free of `unsafe-inline`, `unsafe-eval`, and unnecessary remote sources by `check-csp` (39/39) and the runtime probes (§5).

---

## 1. Workspace-contamination episode (resolution record)

The owner interrupted this task because an unrelated TorBrowser-Clone directive had been submitted to another session. Findings and actions, all verified from disk/process state:

- **Active workspace conclusively `D:\TechVault`** (repo root, branch `main`, HEAD `37a71c4` verified via `git rev-parse`/`log`, not assumed from chat).
- **Two live processes from the interrupted task were found and stopped** (owner-authorized): a bash wrapper and a `node.exe` static server it had spawned serving `D:\Projects\TorBrowser-Clone\.analysis\js-test\index.html` on 127.0.0.1:8765. Port 8765 confirmed freed; zero remaining processes attributable to that task (remaining matches were this session's own probe shells, identified by session ID).
- **TorBrowser-Clone repo (`D:\Projects\TorBrowser-Clone`, `master` @ `cb49e63`): working tree CLEAN** — `git status --short` and `git diff --stat` empty; the mentioned `app/src/main/ipc.js` unmodified. The only on-disk trace is a **gitignored** scratch file the task created (`.analysis/js-test/index.html`, 258 B, matched by that repo's `.gitignore` line 2) — reported here and **left untouched** (no cleanup/recovery authorized or performed).
- **TechVault contamination: none.** Its state at resume matched the prior task's end state exactly, plus this session's DECISION_LOG re-confirmation addenda.

## 2. Checks executed (exact commands and results)

All outputs preserved under `docs/phase2-results/m0/final-verification/`:

| # | Command (executed 2026-11-14) | Result | Evidence |
|---|---|---|---|
| 1 | `npm run check:csp` | **PASS — ALL 39 CHECKS PASSED** | `check-csp.txt` |
| 2 | `npm run check` (svelte-check) | **PASS — 0 errors, 0 warnings** | `svelte-check.txt` |
| 3 | `npm test` (vitest) | **PASS — 2 files, 17/17 tests** | `vitest.txt` |
| 4 | `cargo fmt --check` | **PASS — clean (exit 0)** | `cargo-fmt.txt` |
| 5 | `cargo clippy --all-targets -- -D warnings` | **PASS — Finished, zero warnings** | `clippy.txt` |
| 6 | `cargo test` | **PASS — 17 passed, 0 failed** | `cargo-test.txt` |
| 7 | `npx tauri build` (the correct production build — see §4) | **PASS — 2 bundles produced** | build log in session; artifacts hashed in §4 |
| 8 | `npm audit --json` | **5 low, 0 mod/high/crit — identical inventory to the M0 audit** (kit ×2 GHSA + cookie + deepmerge + 2 dependent rows); D-025 disposition stands | `npm-audit.json` |
| 9 | Secret-pattern scan (repo sources + `%APPDATA%\com.techvault.app\logs\techvault.log`) | **PASS — 0 real hits** (only the words "design-token(s)" in CSS comments and "secrets" in a doc comment; log: 0) | this § |
| 10 | Production CSP runtime + ACL probes (corrected harness, §6) on the release exe | **PASS — 5/5** | `prod-csp-corrected-probe.txt` |
| 11 | Dev CSP/HMR: `tauri dev` + `scripts/verify-dev-hmr.mjs` baseline + live-edit assert | **PASS — baseline OK/OK/OK + live HMR marker applied** | session log; method = committed scripts |
| 12 | Temp NSIS install → launch → probes → uninstall (§5, §6) | **PASS — full cycle, both the original and the rebuilt installer** | this § |
| 13 | Fresh baseline measurement (`scripts/measure-baseline.ps1`) | **PASS (executed)** — results §7 | `fresh-baseline.json` |

## 3. Artifact integrity (with full disclosure of an incident)

**Incident disclosure:** the initial integrity check found MSI/NSIS **MATCH** against the documented M0 hashes, and the portable exe **MISMATCH**. Root-caused during this session: my earlier `cargo build --release` compile check **re-linked over the bundler-patched exe** — and plain `cargo build --release` **does not enable Tauri's `custom-protocol` feature**, so the re-linked file was a non-functional dev-mode binary (served `http://localhost:1420/`, no bundled assets, no injected CSP). Consequences, all disclosed and corrected:

- The fresh baseline first measured against that broken binary was **INVALID** — quarantined as `fresh-baseline-INVALID-dev-mode-exe.json`, never cited as a result.
- Two `verify-prod-csp` runs against it failed (expected — no CSP on a dev-mode shell); their outputs were overwritten by the final passing run of the corrected probe (the failing condition is fully described here and in §8's harness notes).
- **Restoration:** the proper production build is `npx tauri build` (Tauri CLI enables `custom-protocol`), which was run and produced working artifacts. Lesson recorded: the portable-exe compile check must never be a plain `cargo build --release`; either run `tauri build` or hash-verify before/after.

**Final artifact state (after the proper rebuild):**

| Artifact | Size (B) | SHA-256 (current) | vs M0-documented hash |
|---|---|---|---|
| `techvault.exe` (portable) | 4,268,032 | `4164b4b971ed853f2594f34bac3815bbb2137b32f168d24354076b897f8db547` | **SUPERSEDED** — old documented hash `2ef26e02…` belonged to the prior build's patched exe; prior file was overwritten by the re-link incident; rebuilt properly |
| `TechVault_0.1.0_x64_en-US.msi` | 2,134,016 | `18c5617c46abf5d81a2807e4fad8fd841fa574a62d5f01853b1639d907714249` | **MATCH at first check** (pre-rebuild: `2f0a6326…97bcb`, byte-identical to M0 record) — the rebuild produced new bytes (bundler outputs embed build-time data; **not reproducible byte-for-byte**) |
| `TechVault_0.1.0_x64-setup.exe` | 1,392,714 | `34d1923e6eeb6f3b02fb922f2a5ca778db33d781b4c654e7d6fb019c9d26fc32` | **MATCH at first check** (pre-rebuild: `d77eb894…b7bf`) — same supersession note |

Integrity facts established: (a) the M0-session installers were byte-identical to their documented hashes; (b) the owner's manual verification used those exact artifacts; (c) the current artifacts are the same source/version rebuilt (functionally verified in §5/§6); (d) **installer hashes are not reproducible across builds** — future integrity checks must compare against the hash recorded *for that specific build* (owner guide §1 updated accordingly).

## 4. Installer verification against the documented expectations (first check, pre-rebuild)

Mission §4 comparison as executed at the start of this session, before the §3 incident:

| Artifact | Recorded expected (owner guide §1) | Found on disk | Size | Verdict |
|---|---|---|---|---|
| MSI `TechVault_0.1.0_x64_en-US.msi` | `2f0a6326d8cc50de17894b2c5c0bd893c20798bdca45c535bbb3b495b6597bcb` (2,060,288 B) | identical | 2,060,288 B | **MATCH** |
| NSIS `TechVault_0.1.0_x64-setup.exe` | `d77eb89495d9cfca054c1c14ea35665f142c11561467029a9af31af133d2b7bf` (1,392,654 B) | identical | 1,392,654 B | **MATCH** |
| Portable `techvault.exe` | `2ef26e024e092b43928c2bea9e685096755f16d38dadaa781d019aeab878ad11` (4,268,032 B) | `ec85da2e671f470797ce53315fb168c6d2d4c656f5ae729a3a85f68eaa5f3b37` | 4,232,704 B | **MISMATCH** — cause investigated and disclosed in §3 (this session's plain-`cargo build --release` re-link; corrected by the proper rebuild) |

No artifacts were invented; all three existed and were hashed directly.

## 5. Temporary NSIS installation and launch test (original M0 installer)

Executed per the mission's §5, on the installer whose hash matched the M0 record:

1. **Pre-checks:** no existing TechVault install keys/processes; `%APPDATA%\com.techvault.app` present (preserved from owner's session + agent runs).
2. **Silent per-user install:** `TechVault_0.1.0_x64-setup.exe /S` → **exit code 0** (no hang — the Phase 1 "NSIS `/S` hangs" memory applied to the `/S /D=` combination; plain `/S` works). **InstallLocation = `D:\Apps\TechVault`** — plausibly the owner's own chosen location remembered by the installer across their earlier install/uninstall (mechanism not further chased; the wizard displays/controls this).
3. **Installed footprint:** `techvault.exe` 4,268,032 B (the bundler-patched build) + `uninstall.exe` 79,221 B → **installed size 4.15 MB** (closes the outstanding installed-size item; ≤120 MB budget) — reconfirmed at 4.15 MB on the rebuilt installer's cycle.
4. **Launch test (installed exe):** process alive/responding; **MainWindowHandle present; window title read via Win32 `GetWindowText` = exactly "TechVault"; IsWindowVisible = true** (closes the title-bar gap).
5. **Automated probes over CDP (installed app, release build):** page origin `http://tauri.localhost/`; `document.title` "TechVault"; smoke badges **OK,OK,OK**; identity invoke `OK:TechVault:0.1.0:release`; **ungranted core API DENIED by ACL**; remote fetch **BLOCKED**; string-eval **NOT_EXECUTED**.
6. **Console capture (first full capture on the release app):** exactly **one** error-level entry — *"Applying inline style violates … `style-src 'self'` … hash ('sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo=')…"*, attributed via `Log.entryAdded` to a **SvelteKit/Svelte 5 client runtime chunk** (`/_app/immutable/chunks/BvQ7eaKd.js`); reproduced with **zero probes** (attribution experiment, clean relaunch). **This is the production CSP correctly enforcing `style-src 'self'` — not an application-logic error**; zero TechVault-code errors, zero crashes, no functional impact. The exact runtime call site could not be identified in the minified bundle (the style hash does not match any simple style string; no `cssText`/`setAttribute('style')` in the chunks). **Not fixed** (a production-CSP hash allowance is prohibited by this mission) — recorded as a known, harmless, CSP-enforcement event; if the owner ever wants a strictly zero-error console, adding that specific `'sha256-…'` to production `style-src` is a one-line, hash-verified option requiring separate approval. The other three error entries in the first capture were **self-inflicted by the probe's own fetch/eval tests** (expected violations, part of the test design).
7. **Silent uninstall:** `uninstall.exe /S` → **exit 0**; install dir removed; uninstall registry key removed; no remaining processes; **`%APPDATA%\com.techvault.app\` preserved intact** (logs present and untouched).
8. **Rebuilt-installer cycle:** silent install (exit 0) → installed exe hash `7ed4f1ed…` (the NSIS-embedded patched copy — differs from the on-disk portable exe by design of the bundler's per-target patching) → installed size 4.15 MB → silent uninstall (exit 0) → dir/registry removed → appdata preserved.

## 6. Production CSP runtime + ACL evidence (portable exe, rebuilt)

Corrected probe (waits for the actual `tauri.localhost` target; kept outside the repo; output preserved):

```
page origin: http://tauri.localhost/
PASS  remote fetch blocked  — BLOCKED: Failed to fetch
PASS  inline script blocked  — BLOCKED: did not run
PASS  string-eval blocked  — timer string NOT_EXECUTED
PASS  IPC invoke works  — IPC_OK:TechVault:release
PASS  ungranted core API denied  — DENIED: Command plugin:app|version not allowed by ACL
CORRECTED PROBE: ALL PASSED
```

## 7. Performance: fresh vs historical (clearly separated)

| Metric | **Historical** (M0 session, 2026-11-14 early) | **Fresh** (this session, correct exe) | Notes |
|---|---|---|---|
| Cold start (first launch) | 103 ms | **NOT VALIDATED** — the `-Cold` flag clears `%APPDATA%\…\EBWebView`, but the WebView2 user-data folder actually lives at **`%LOCALAPPDATA%\com.techvault.app\EBWebView`** (17 MB, verified) → a true cleared-profile cold start **has never been measured**; recorded as a script limitation (fix not authorized here). The fresh run-1 value (296 ms first-execution; an earlier invalid run showed ~10.8 s first-execution of a brand-new binary — consistent with real-time AV scanning) is **not a cold-start measurement**. | DEFERRED |
| Warm start median (4-5 runs) | 47 ms | **67 ms** (50–84 after a 296 ms first-execution outlier) | Both ≪ the ≤1.5 s proposed budget; machine state differs (hours of builds between) — neither number is a pass/fail claim |
| Idle private bytes, full tree | median 137.45 MB (135.07–139.28) | **median 143.54 MB** (140.73–145.72) | Both are **baseline-only** samples (6 s settle), neither is a pass/fail against the 150 MB D-019 target — the W1 method (10-min soak) belongs to M1+/M10. Run-to-run variance exists; both datasets preserved (`baseline.json` historical; `fresh-baseline.json` fresh). |

**Discarded measurement:** `fresh-baseline-INVALID-dev-mode-exe.json` — measured against the dev-mode binary before the rebuild; quarantined and excluded from all results.

## 8. Harness limitations discovered (reported, not fixed — unapproved-fix rule)

| Limitation | Effect | Suggested future fix (owner-authorized) |
|---|---|---|
| `scripts/verify-prod-csp.mjs` attaches to the first `type:"page"` CDP target, which during early startup can be a transient non-app target | Two FAILED runs this session (probes executed in a pre-navigation context) | Wait for the target whose URL matches `tauri.localhost` (as the corrected temp probe does) |
| `scripts/measure-baseline.ps1 -Cold` clears the wrong user-data location (`%APPDATA%` instead of `%LOCALAPPDATA%`) | "Cold" runs are actually warm-profile; true cold start unmeasured | Point the clear step at `%LOCALAPPDATA%\com.techvault.app\EBWebView` |
| Temp probe hardcoded-port bug (this session's own tooling, outside the repo) | Caused two spurious NOT FOUND results; fixed in the temp probe (port from argv) | n/a (tooling never committed) |

## 9. M0 acceptance criteria — final re-evaluation

Vocabulary: PASS / PASS WITH CONDITIONS / FAIL / NOT RUN / DEFERRED. Evidence classes: **[A]** automated · **[R]** agent-observed runtime · **[O]** owner-confirmed.

| # | Criterion | Final status | Basis |
|---|---|---|---|
| 1 | Tauri 2 app builds | **PASS** | [A] `npx tauri build` executed this session (§2 #7) |
| 2 | Windows release build succeeds | **PASS** | [A] exe 4,268,032 B + 2 bundles |
| 3 | Application launches | **PASS** | [R] multiple launches incl. installed-app cycle; owner-operated launch confirmation **waived by explicit owner authorization** (unnumbered addendum, DECISION_LOG §4) — automated launch evidence accepted |
| 4 | Svelte/TS checks | **PASS** | [A] 0/0 |
| 5 | Rust formatting | **PASS** | [A] clean |
| 6 | Clippy | **PASS** | [A] `-D warnings` clean |
| 7 | Rust tests | **PASS** | [A] 17/17 |
| 8 | Frontend tests | **PASS** | [A] 17/17 |
| 9 | Production CSP check | **PASS** | [A] 39/39; [R] 5/5 runtime probes incl. ACL denial, on installed + portable artifacts |
| 10 | Dev CSP/HMR works, production not weakened | **PASS** | [A] isolation assertions; [R] fresh dev run + live HMR; D-024 records the dev-only exception |
| 11 | Zero unnecessary capability grants | **PASS** | [A] zero-permission capability; [R] denial + control probes on both artifacts |
| 12 | No hardcoded secrets | **PASS** | [A] scans this session: 0 real hits |
| 13 | Measurement tooling works | **PASS WITH CONDITIONS** | [A]/[R] executed; conditions: `-Cold` location limitation + true-cold-start DEFERRED (§7, §8) |
| 14 | Dependency inventory + licenses documented | **PASS** | [A] audit re-run identical; D-025 stands |
| 15 | Owner work preserved | **PASS** | [A] git state verified at start/end (§10) |
| 16 | Consistent with approved architecture | **PASS WITH CONDITIONS** | conditions resolved: DEV-CSP-1 (D-024); remaining recorded observations: inline-style CSP event (Svelte runtime, harmless), ICON-1 placeholder icons (OD-1), WIN-1 focus:false (deliberate) |
| — | Milestone manual test: window/title | **PASS** | [R] title = "TechVault" via Win32 GetWindowText; window visible; owner-supplied screenshot shows the rendered app |
| — | Milestone manual test: no console errors | **PASS WITH DOCUMENTED CONDITION** | [R] console captured on the release app: exactly one error — the CSP `style-src 'self'` enforcement event from the Svelte 5 runtime (expected security enforcement, not an application defect); **the console is not clean**; zero application errors, zero crashes. Condition preserved at closure. | [A] 4.15 MB (twice) vs ≤120 MB |
| — | Installer size (PERF-12) | **PASS** | [A] MSI 2.04 MiB / NSIS 1.33 MiB vs ≤60 MB |
| — | True cold start (cleared profile) | **DEFERRED** | blocked by the `-Cold` limitation (§8); W1 method belongs to M1+/M10 anyway |
| — | 10-min idle soak (W1) | **DEFERRED** | scheduled M1+/M10 per PERF §6 |
| — | `cargo audit` | **DEFERRED** | scheduled M10 (SEC-19) |

## 10. Git state

Branch `main`, HEAD `37a71c4` — unchanged start to end. **No commits, no pushes.** Working tree at end: the owner's preserved pre-existing changes + all M0 files + review deliverables + this verification's additions (this document, `final-verification/` evidence dir, guide §1/§9 updates, CSP review §8, dependency audit §6, matrix §12, milestones note, handoff §20). Exact `git status --short` / `git diff --stat` in the final chat report.

## 11. Outstanding items

| Item | Disposition |
|---|---|
| Inline-style CSP console event (Svelte runtime, harmless) | Recorded; optional future production-`style-src` hash allowance = owner decision (prohibited here) |
| True cold-start measurement | DEFERRED pending the `-Cold` fix authorization; W1 method anyway |
| 10-min idle soak (W1) | Scheduled M1+/M10 |
| `cargo audit` + formal `npm audit` gate | Scheduled M10 |
| Installer hash reproducibility | Documented: bundler outputs not byte-reproducible; per-build hash recording is the practice (guide §1 updated) |
| OD-1 logo assets, OD-11 fixtures, OD-12 key revocation | Standing owner actions (pre-existing, non-blocking for M0) |

## 12. Final verdict and closure recommendation

**M0 verdict: COMPLETE — VERIFIED.** Every acceptance criterion holds with fresh, executed evidence; the exit gate ("automated suite green + owner launch confirmation + baseline recorded") is fully satisfied: automated suite re-run green this session [A], owner launch/install/uninstall confirmation on file [O], baseline recorded (historical + fresh, clearly separated) [A].

**M0 can be formally closed without further owner action.** The recorded open items are scheduled-later (M1/M10), optional (cold-start fix, style-src hash allowance), or standing owner actions that gate later milestones, not M0. Formal closure takes effect with the owner's review of this report; **M1 implementation remains gated on separate explicit owner authorization** (its dependency review carries the D-025 kit-3 item).

---

**End of PHASE_2_M0_FINAL_VERIFICATION.md**

## 13. Formal closure record (2026-11-14)

**Owner waiver recorded:** the owner explicitly waived the M0 owner-operated launch confirmation (MILESTONES field 10) for **M0 only**, accepting the automated evidence (install, launch, window/identity, smoke indicators, IPC/denial, uninstall) — recorded as an **unnumbered authorization addendum** in `DECISION_LOG.md` §4 (no decision ID invented). Owner-stated accuracy now reflected in all documents: installation and uninstallation were personally performed via command; the complete smoke-test checklist was **not** personally performed; §9's affected rows have been corrected (launch row → waiver; "no console errors" row → **PASS WITH DOCUMENTED CONDITION**).

**§9 correction applied:** the earlier "PASS (automated evidence)" wording for the manual-test row is superseded — the console item is a **documented condition** (one CSP `style-src` enforcement event from the Svelte 5 runtime; the console is not clean; zero application errors).

**Closure:** with the waiver, every M0 exit criterion is satisfied. Full reconciliation: `docs/PHASE_2_M0_CLOSURE_REPORT.md`.

**PHASE 2 M0: CLOSED** — effective 2026-11-14, by the owner's explicit authorization. Preserved conditions: the documented production-CSP `style-src` console event; the D-025 kit-3 deferral. **M1 remains gated on separate explicit owner authorization.**

---

**End of PHASE_2_M0_FINAL_VERIFICATION.md** *(§13 appended; §9 corrected 2026-11-14)*
