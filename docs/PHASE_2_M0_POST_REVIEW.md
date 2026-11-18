# TechVault Phase 2 — M0 Post-Implementation Review

**Document status:** Post-implementation review record (2026-11-14), prepared under the owner's "M0 POST-IMPLEMENTATION REVIEW AND BLOCKER RESOLUTION" authorization: **read-only investigation, security review, dependency-audit analysis, evidence collection, and decision preparation only.** No configuration, CSP, dependency, or code was modified. No commits or pushes. Companion deliverables: `PHASE_2_M0_CSP_DEVIATION_REVIEW.md`, `PHASE_2_M0_DEPENDENCY_AUDIT.md`, `PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md`.

**Evidence classes used throughout:**
- **[A]** Automated evidence — tool output reproducible from committed scripts/config (re-runnable without a display).
- **[R]** Agent-observed runtime evidence — the agent executed the app/probe and recorded the output (same machine, same day; not owner-confirmed).
- **[O]** Owner-confirmed evidence — requires the owner's direct action; no substitute exists.

---

## 1. What was independently re-executed during this review (all 2026-11-14)

| Check | Result this review | Class |
|---|---|---|
| `npm run check:csp` (39 assertions) | **ALL 39 CHECKS PASSED** | [A] |
| `npm run check` (svelte-check) | **0 errors, 0 warnings** | [A] |
| `npm test` (vitest) | **17/17 passed** | [A] |
| `cargo fmt --check` / `cargo clippy --all-targets -- -D warnings` / `cargo test` | **clean / clean / 17 passed** | [A] |
| `scripts/verify-prod-csp.mjs` on the release exe | **4/4 PASS** (output re-saved to `docs/phase2-results/m0/verify-prod-csp-output.txt`) | [R] |
| Extended runtime probe (new, one-off script embedded in §4; output `docs/phase2-results/m0/post-review-runtime-probe.txt`) | **3/3 PASS** — see §4 | [R] |
| Installer hashes/sizes | recorded (§6, full detail in the owner guide) | [A] |
| MSI package database read (Property table via read-only COM query — nothing installed) | `ALLUSERS=1`, ProductCode `{BF2E26B8-0469-4362-BA9A-C1024D7C2CE8}`, ProductName/Version confirmed | [A] |
| App log re-inspection | 95 lines; startup + command-name/outcome lines only; pattern scan for `api_key/password/token/secret`: **0 hits** | [A]/[R] |

## 2. M0 security evidence review — claim-by-claim

| M0 claim | Independent result this review | Verdict |
|---|---|---|
| Production CSP strict (config) | 39/39 `check-csp` assertions re-passed, incl. isolation of every dev-only token | Confirmed [A] |
| Production CSP enforced at runtime | 4/4 probes re-run on the release exe: remote fetch **blocked** (CSP violation text captured), inline script **blocked**, string-eval **blocked**, typed IPC **works** | Confirmed [R] |
| Zero unused capability grants | Re-proven **stronger than the M0 claim**: with zero permissions granted, an ungranted core plugin command (`plugin:app|version`) is **denied by the ACL** ("Command plugin:app|version not allowed by ACL") while the app command succeeds (control probe). The M0 session had only proven the *positive* case; the *negative* case is now evidenced too. | Confirmed + strengthened [R] |
| Smoke view functional in release build | New evidence: the release app renders all three self-check badges **OK,OK,OK** (previously only verified in the dev build) | New [R] |
| Dev CSP/HMR functional | Relied on M0-session runtime run (same day/machine: dev boot + live HMR marker). Not re-run end-to-end this session because a full dev run was not needed for any changed claim; the config-level isolation is re-asserted by `check-csp`. | Held [R from M0 session], not re-run |
| Secret-free logging | Log re-inspected (95 lines; 0 secret-pattern hits); M0 rule (command names only) holds | Confirmed [A] |
| Dependency inventory accuracy | Lockfile-pinned versions re-confirmed against `node_modules` and `Cargo.lock` during the audit analysis | Confirmed [A] |
| Contract tests both directions | vitest 17/17 + cargo 17/17 re-run against the same canonical fixtures | Confirmed [A] |

**Gaps identified (none new-critical; all previously disclosed or now closed):**

1. **Closed by this review:** the least-privilege *negative* case (ungranted core API denied) had not been explicitly probed in M0 — now evidenced (§4 probe 2).
2. **Closed by this review:** release-build rendered-state check (badges OK,OK,OK) — now evidenced (§4 probe 1).
3. **Open:** dev-CSP behavior was analyzed from sources and the runtime mechanism was proven on the release build, but no dev run under a deliberately un-allowanced CSP was performed (would require a prohibited config edit) — recorded in the CSP review §4.
4. **Open (owner):** installed-app launch, window/title/console check, uninstall round-trip — see the owner guide.
5. **Open (scheduled):** `cargo audit` (M10), 10-minute idle soak (M1+/M10), installed-size measurement (requires the owner's install step).

## 3. DEV-CSP-1 — outcome (full analysis in `PHASE_2_M0_CSP_DEVIATION_REVIEW.md`)

- Root cause verified from installed sources: SvelteKit's dev server has **no CSP support at all** (`kit.csp` applies only to SSR/prerender output), and it always injects one byte-stable inline bootstrap script; Tauri injects the CSP as a **static** meta tag and cannot carry per-request nonces.
- Options: SvelteKit nonce — **infeasible**; hash-pinned dev script — **feasible** (SHA-256 `omexX53BM4kcFHqMOynB85uzz2PpUvgoHBJX+sDkf8E=`, identical across two dev-server restarts; requires recompute on kit upgrade/repo move + a full dev-workflow test pass); custom externalization middleware — **rejected** (fragile custom tooling); keep dev-only `unsafe-inline` — **recommended default**.
- **Production CSP is unaffected by every option and remains unchanged.** Owner decision requested (three options with suggested wording in the CSP review §6).

## 4. New runtime evidence captured (post-review probe)

Script kept **outside the repository** (temporary tooling; embedded here for reproducibility), executed against the release exe with WebView2 remote debugging (`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS`), output saved to `docs/phase2-results/m0/post-review-runtime-probe.txt`:

```
PASS  smoke-view self-check badges rendered OK,OK,OK  — OK,OK,OK
PASS  ungranted core API denied (plugin:app|version)  — DENIED: Command plugin:app|version not allowed by ACL
PASS  app command allowed (control)                   — ALLOWED:TechVault
probe: ALL PASSED
```

(The probe polls the rendered badges until the async self-check settles; probes: `window.__TAURI_INTERNALS__.invoke(...)` — the same mechanism as `scripts/verify-prod-csp.mjs`.)

## 5. Dependency audit — outcome (full analysis in `PHASE_2_M0_DEPENDENCY_AUDIT.md`)

- 5 findings, all **low**; 4 distinct advisories (`GHSA-pfhg-q3qv-9q6r`, `GHSA-27mw-82g8-phjj`, `GHSA-pxg6-pf52-xh8x`, `GHSA-gcqx-w48m-w2h4`) across kit 2.70.4, cookie 0.6.0, deepmerge 4.3.1 (+2 dependent rows).
- None affects the shipped production runtime (static SPA: no kit server, no form actions, no prerender, no cookie handling); each assessed individually, none dismissed.
- Non-breaking fixes: only a `cookie@^0.7.0` npm override is possible (untested — prohibited here). deepmerge has **no patched release at all** (4.3.1 = latest). Kit advisories require the breaking 3.2.0 major.
- **No upgrade performed.** Disposition recommendations (accept for M0; schedule kit-3 decision at M1 review/M10 audit; optional cookie-override test) await the owner.

## 6. Installer verification preparation (full guide: `PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md`)

- Artifacts, sizes, SHA-256, prerequisites (WebView2 bootstrapper, unsigned → SmartScreen), MSI per-machine (`ALLUSERS=1`, needs elevation, `C:\Program Files\TechVault`) vs NSIS per-user (no elevation), launch/uninstall steps, known concerns, and a 14-item manual checklist are prepared. **Nothing was installed; no system change was made.**

## 7. M0 acceptance criteria — re-evaluation

Statuses distinguish evidence classes. **[A]** automated · **[R]** agent-observed runtime · **[O]** owner-confirmed.

| # | Criterion (MILESTONES M0 / authorization) | Status | Class + evidence |
|---|---|---|---|
| 1 | Tauri 2 app builds | **PASS** | [A] release + debug builds; re-verified indirectly by cargo suite re-run |
| 2 | Windows release build succeeds | **PASS** | [A] exe 4,268,032 B, hash recorded |
| 3 | Application launches | **PASS** | [R] 8+ launches incl. 3 this review (9336/9340/9341) — owner's own launch still pending |
| 4 | Svelte/TS checks pass | **PASS** | [A] svelte-check 0/0 re-run |
| 5 | Rust formatting passes | **PASS** | [A] `fmt --check` re-run |
| 6 | Clippy passes | **PASS** | [A] `-D warnings` re-run |
| 7 | Rust tests pass | **PASS** | [A] 17/17 re-run |
| 8 | Frontend tests pass | **PASS** | [A] vitest 17/17 re-run |
| 9 | Production CSP check passes | **PASS** | [A]+[R] 39/39 config; 4/4 runtime probes re-run on release exe |
| 10 | Dev CSP/HMR works without weakening production | **PASS WITH CONDITIONS** | [A] isolation re-asserted; [R-from-M0-session] dev HMR run; condition = DEV-CSP-1 owner decision |
| 11 | No unnecessary capability grants | **PASS** | [A] zero-permission capability; [R] denial + control probes this review |
| 12 | No hardcoded secrets | **PASS** | [A] repo scan in M0 + log re-scan this review (0 hits) |
| 13 | Measurement tooling works | **PASS** | [A] scripts committed; [R] baseline captured in M0 session (unchanged machine state; not re-measured — same-day data stands) |
| 14 | Dependency inventory + license review documented | **PASS** | [A] §5 of M0 report; audit analysis this review |
| 15 | Existing documentation and owner changes intact | **PASS** | [A] git status — owner's uncommitted work preserved (§9) |
| 16 | Consistent with approved architecture | **PASS WITH CONDITIONS** | conditions unchanged: DEV-CSP-1; ICON-1 placeholder icons; WIN-1 focus:false |

Manual milestone tests (MILESTONES field 8): owner launches installed app; window, title, no console errors — **NOT RUN [O]**.

## 8. M0 closure assessment

**M0 is NOT closed** — by design and honestly:

- **Blocking, owner-only:** (1) launch the installed app and record the manual checklist (`PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md` items 1–8); (2) the DEV-CSP-1 decision (CSP review §6); (3) the npm-audit kit-3 disposition (audit doc §4) — (3) may also be scheduled rather than blocking, per the owner's choice.
- **Everything agent-executable has passing evidence**, re-executed today where re-execution was meaningful.

**Closure recommendation:** treat M0 as **"Implementation complete — pending owner verification and two recorded decisions"**. After (1) and (2), M0 can be marked closed in the traceability matrix; the kit-3 decision may be carried into the M1 dependency review without holding M0 open. No criterion is marked Verified on owner-dependent evidence alone, and none of the outstanding items can be substituted by further agent work.

## 9. Changed files and Git status (this review task)

**Created (4 deliverables + 1 evidence file):**
- `docs/PHASE_2_M0_POST_REVIEW.md`
- `docs/PHASE_2_M0_CSP_DEVIATION_REVIEW.md`
- `docs/PHASE_2_M0_DEPENDENCY_AUDIT.md`
- `docs/PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md`
- `docs/phase2-results/m0/post-review-runtime-probe.txt` (evidence capture)
- `docs/phase2-results/m0/verify-prod-csp-output.txt` (re-captured output of the existing M0 script)

**Modified:** none — no factual correction to existing M0 documentation was required (all M0 claims survived review; new evidence is recorded here and in the matrix pointer below). **Not modified:** `tauri.conf.json`, `svelte.config.js`, `vite.config.js`, `package.json`, lockfiles, all source files, `DECISION_LOG.md`, all historical records. Historical documents were appended to in the previous task only; this task appended nothing to them (no status change occurred — closure is pending owner items).

**Git state:** branch `main` (unchanged), HEAD `37a71c4` (unchanged), no commits/pushes. Working tree = the owner's preserved pre-existing changes (modified `docs/DECISION_LOG.md`, `docs/PHASE_HANDOFF.md`, 10 untracked `PHASE_2_*.md` planning docs) + all M0 implementation files + the review deliverables above. Exact status output is in the final chat report.

## 10. Unresolved issues register

| ID | Item | Owner? | Blocks M0 closure? |
|---|---|---|---|
| U-1 | Owner launch + manual checklist | Yes | Yes |
| U-2 | DEV-CSP-1 mechanism decision (CSP review §6) | Yes | Yes |
| U-3 | kit-3 upgrade disposition (audit doc §4) | Yes (may defer) | No (deferrable to M1 review/M10) |
| U-4 | npm cookie-override test (optional) | Yes | No |
| U-5 | Installed-size measurement | Yes (during install) | No (record at launch check) |
| U-6 | `cargo audit` | Scheduled M10 | No |
| U-7 | 10-min idle soak (W1) | Scheduled M1+/M10 | No |
| U-8 | Logo assets (OD-1), OD-11 fixtures, OD-12 revocation | Standing owner actions | No (pre-existing) |

## 11. Post-decision update (2026-11-14, owner instruction "M0 Owner Decisions and Verification Record")

This section supersedes the affected rows of §8/§10 above (preserved unchanged as historical record).

**Owner decisions recorded:** D-024 (DEV-CSP-1 accepted, Option D — development-only `unsafe-inline`; production CSP unchanged) and D-025 (SvelteKit 3.x deferred to the M1 dependency review; no dependency changes now) — full entries in `docs/DECISION_LOG.md` §4; decision records appended to the CSP review (§7) and dependency audit (§5) documents.

**Owner verification evidence received:** the owner installed, launched, inspected, and uninstalled the M0 release application, supplying a screenshot of the release smoke view showing: all three IPC self-checks **OK** (`app_info`, `ping` typed round-trip, oversized-ping typed validation error); Application identity **TechVault 0.1.0 / tauri 2.12.5 / windows / x86_64 / build_profile release**; Last ping `pong` echoed `hello` (`server_time_unix_ms=1794642466086` — consistent with 2026-11-14); expected typed error `validation.message_too_long` with its sanitized message. The owner confirms the application was **uninstalled** afterward. Detailed item mapping: `PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md` §8.

**Register updates:**

| ID | Prior status | Status after this update |
|---|---|---|
| U-1 | Owner launch + manual checklist — outstanding (**blocked closure**) | **Substantially confirmed [O]**: install → launch → inspect (smoke view fully OK) → uninstall all evidenced. Residual unverified sub-items remain explicitly identified: window-title-bar text, approximate window dimensions, F12 console-error check (see below), and the optional log/network observations. |
| U-2 | DEV-CSP-1 decision outstanding (**blocked closure**) | **RESOLVED — D-024** (Option D accepted; production CSP unchanged and strict). |
| U-3 | kit-3 disposition — owner | **DEFERRED by decision D-025** to the M1 dependency review; no longer an M0 item. |
| U-4 | cookie override test (optional) | **Closed — not pursued** per D-025 (no dependency changes now). |
| U-5 | Installed-size measurement | **NOT PERFORMED** — owner did not record it; remains optional (record opportunistically if the app is ever reinstalled). *(ANNOTATED 2026-11-14: subsequently measured by the agent's temp-install verification — **4.15 MB**, twice; see `PHASE_2_M0_FINAL_VERIFICATION.md` §5 and the closure report.)* |
| — | SHA-256 artifact verification | **NOT PERFORMED** by the owner. Recorded accurately as not performed — an optional artifact-integrity check, **not a failure** and not a prerequisite for application functionality (the agent-side hashes remain recorded in the owner guide §1). |
| — | Console-error verification | **NOT EVIDENCED** — the owner did not report a devtools/console check, and none can be claimed. Remains an identified outstanding manual item (release devtools may be disabled by default; if it does not open, the check cannot be performed without a debug build or devtools feature). |
| — | Window-title-bar / dimensions check | **NOT EVIDENCED** — the supplied screenshot shows the app content only (no title bar); the title check from milestone field 8 ("window, title") is not claimed. |

**M0 closure assessment after this update:** every element of the M0 exit gate ("automated suite green + owner launch confirmation + baseline recorded") now has evidence — automated suite re-verified [A], owner launch confirmation received [O], baseline recorded [A]. **M0 is eligible for closure.** The residual items above (console-error check, title-bar text, SHA-256, installed size) are recorded as identified-not-performed manual items and are naturally re-covered by M1's verification scope (real shell, window title, console-error check on real UI); they do not gate closure. Formal closure takes effect with the owner's review of this update; M1 implementation still requires separate explicit owner authorization.

---

**End of PHASE_2_M0_POST_REVIEW.md** *(§11 appended 2026-11-14)*
