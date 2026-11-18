# TechVault M0 — Owner Verification Guide

**Document status:** Post-implementation review deliverable (2026-11-14). Preparation only — **no software was installed and no system setting was changed** while preparing this guide. Everything below is ready for you to run manually when you choose.

---

## 1. Build artifacts

**SUPERSEDED 2026-11-14 — the hashes/sizes below are the ORIGINAL M0-session build (the artifacts the owner manually verified and that hash-matched their record). Current artifact hashes after the final-verification rebuild are in §9. This table is retained as the historical record.**

| Artifact | Path | Size (bytes) | SHA-256 |
|---|---|---|---|
| MSI installer | `D:\Builds\cargo-target\release\bundle\msi\TechVault_0.1.0_x64_en-US.msi` | 2,060,288 (1.96 MiB) | `2f0a6326d8cc50de17894b2c5c0bd893c20798bdca45c535bbb3b495b6597bcb` |
| NSIS installer | `D:\Builds\cargo-target\release\bundle\nsis\TechVault_0.1.0_x64-setup.exe` | 1,392,654 (1.33 MiB) | `d77eb89495d9cfca054c1c14ea35665f142c11561467029a9af31af133d2b7bf` |
| Standalone exe (no install needed) | `D:\Builds\cargo-target\release\techvault.exe` | 4,268,032 (4.07 MiB) | `2ef26e024e092b43928c2bea9e685096755f16d38dadaa781d019aeab878ad11` |

Verify checksums yourself with: `certutil -hashfile <path> SHA256` (PowerShell/cmd).

Built 2026-11-14 from the exact working-tree configuration (Tauri 2.12.5, app version 0.1.0, identifier `com.techvault.app`), x64.

## 2. Installation requirements

- **OS:** Windows 10/11 x64 (built and measured on Windows 11 Pro 10.0.26200).
- **WebView2 Evergreen runtime:** both installers bundle the standard WebView2 bootstrapper and will offer/download it if the machine lacks it (most Windows 11 systems already have it).
- **Elevation:** the **MSI is a per-machine install** (MSI property `ALLUSERS=1`, verified in the package database) → requires administrator rights; default destination `C:\Program Files\TechVault\`. The **NSIS installer defaults to a per-user install** (no elevation required) — the wizard displays the exact destination before installing (expected under your user profile, typically `%LOCALAPPDATA%\Programs\TechVault`); please note the path it shows.
- **Signing:** the build is **unsigned** — Windows SmartScreen will show "Windows protected your PC" for the NSIS exe (choose *More info → Run anyway*). MSI may show an unknown-publisher warning. This is expected for a local development build; release signing is a later-phase item (P-026).

## 3. How to launch

- Start menu shortcut **"TechVault"** (both installers create one), or
- run the installed `TechVault.exe` directly, or — with zero installation — run `D:\Builds\cargo-target\release\techvault.exe`.

## 4. How to uninstall

- **Settings → Apps → Installed apps → TechVault → Uninstall** (or classic *Control Panel → Programs and Features*). Both installers register an uninstall entry.
- MSI installs can also be removed with `msiexec /x {BF2E26B8-0469-4362-BA9A-C1024D7C2CE8}` (ProductCode, read from the package database).
- **Note:** user-level data is NOT removed by uninstall: `%APPDATA%\com.techvault.app\` (currently only `logs\techvault.log` from verification runs) persists. Delete it manually if you want a fully clean state.

## 5. Known Windows compatibility concerns

| Concern | Impact | Disposition |
|---|---|---|
| SmartScreen / unknown-publisher warnings | One extra click at install | Expected (unsigned local build); P-026 covers release signing later |
| WebView2 runtime missing (rare on Win11) | Installer downloads it (needs internet) | Standard Tauri behavior; runtime is Evergreen, not bundled |
| MSI needs admin rights | UAC prompt | Per-machine by design (`ALLUSERS=1`); use the NSIS installer if you prefer a no-elevation per-user install |
| App does not steal focus on launch | Cosmetic | Deliberate M0 choice (`focus: false` in the window config) — tell me if you prefer the opposite |
| Icons/favicon are Tauri defaults | Cosmetic | OD-1: your approved logo asset will be integrated verbatim when delivered |

## 6. Manual verification checklist (~10 minutes)

Tick each item; anything that fails is a finding, not something to retry into passing.

**Install & launch**
1. ☐ Run either installer (MSI = admin/per-machine, NSIS = per-user; note the install path shown).
2. ☐ SmartScreen handling works (More info → Run anyway) — expected, record any different behavior.
3. ☐ Launch "TechVault" from the Start menu.
4. ☐ Window opens, title bar reads exactly **"TechVault"**, approx. 1100×720, dark background, violet "TechVault" heading.

**Smoke view (the only M0 screen — this is intentional, M1 builds the real shell)**
5. ☐ "IPC self-check" section shows **OK / OK / OK** for: `app_info`, `ping (typed round-trip)`, `oversized ping → typed validation error`.
6. ☐ "Application identity" panel shows: app_name TechVault · version 0.1.0 · tauri_version 2.12.5 · os/arch windows/x86_64 · build_profile **release**.
7. ☐ Click **"Re-run self-check"** — badges briefly show "…" and return to OK/OK/OK; no crash.
8. ☐ "Typed error envelope (expected)" panel shows `code=validation.message_too_long category=validation` — this is the *expected* demonstration of the typed error path, not a bug.

**Health**
9. ☐ Press F12 (devtools may be disabled in release — if it does not open, skip; that is default release behavior) — no requirement.
10. ☐ Optional: `%APPDATA%\com.techvault.app\logs\techvault.log` exists and contains startup/command lines (no user content, no secrets).
11. ☐ Optional: confirm the app makes no unexpected network connections (Task Manager → Resource Monitor; M0 performs none by design).

**Cleanup**
12. ☐ Uninstall via Settings → Apps; confirm the entry disappears and Start-menu shortcut is gone.
13. ☐ (Optional) delete `%APPDATA%\com.techvault.app\` for a fully clean state.

**Optional dev-flow check (requires Node toolchain already present)**
14. ☐ `npm install` in `D:\TechVault`, then `npm run tauri dev` — dev window boots, same smoke view, build_profile **debug**; editing `src/app.css` visibly updates the running window (HMR).

## 7. Recording results

Report pass/fail per item (a simple "all pass" plus any deviations is enough). Owner confirmation of items 1–8 completes the last **NOT RUN** automated-substitutable item in the M0 exit gate (`PHASE_2_MILESTONES.md` M0 field 8: "owner launches the installed app; window, title, no console errors").

---

**End of PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md**

## 8. Owner verification results (recorded 2026-11-14)

The owner performed the install → launch → inspect → uninstall cycle and supplied a screenshot of the release smoke view. Per-item mapping against the §6 checklist (**[O]** = owner-confirmed; "not recorded" = owner did not report the item; nothing is claimed without evidence):

| # | Checklist item | Result |
|---|---|---|
| 1 | Install an installer | **Confirmed [O]** — owner states the release app was installed (installer variant and install path not recorded) |
| 2 | SmartScreen handling | Not recorded |
| 3 | Launch from Start menu | Owner stated launch in the earlier verification record; per the owner's §10 clarification the personally-performed steps were installation and uninstallation via command — for the exit gate the accepted launch evidence is the **automated launch (waiver, §10)** |
| 4 | Window opens / title bar "TechVault" / ~1100×720 / dark bg / violet heading | **Partially confirmed [O]** — dark background and violet "TechVault" heading are visible in the screenshot; **title-bar text and dimensions are not visible in the screenshot → not evidenced** |
| 5 | IPC self-check OK / OK / OK | **Demonstrated in owner-supplied screenshot** (the app's automated self-check output; the owner did not personally perform the complete checklist — owner clarification, §10) — screenshot: `app_info` OK · `ping (typed round-trip)` OK · `oversized ping → typed validation error` OK |
| 6 | Application identity panel | **Demonstrated in owner-supplied screenshot** (same clarification, §10) — screenshot: app_name TechVault · version 0.1.0 · tauri_version 2.12.5 · os/arch windows / x86_64 · build_profile **release** |
| 7 | "Re-run self-check" click | Not recorded (no evidence of the click; the passing state itself is evidenced) |
| 8 | Typed error envelope panel | **Demonstrated in owner-supplied screenshot** (same clarification, §10) — screenshot: `code=validation.message_too_long category=validation` + message "Message exceeds the maximum allowed length of 1000 characters." |
| 9 | Console-error check (F12) | **NOT PERFORMED / NOT EVIDENCED** — explicitly not claimed; remains an identified outstanding manual item (release devtools may be disabled; see §6 item 9 note) |
| 10 | Log file exists (optional) | Not recorded (agent-side log evidence exists separately from the M0 verification runs) |
| 11 | No unexpected network connections (optional) | Not recorded |
| 12 | Uninstall | **Confirmed [O]** — owner confirms the application was uninstalled afterward |
| 13 | App-data cleanup (optional) | Not recorded (`%APPDATA%\com.techvault.app\` may still exist) |
| 14 | Dev-flow check (optional) | Not recorded |
| — | SHA-256 artifact verification (§1) | **NOT PERFORMED** — recorded accurately as not performed; an optional artifact-integrity check, **not a failure** and not a prerequisite for application functionality. Agent-computed hashes remain in §1 for future reference. |

**Additional evidence from the screenshot:** Last ping panel shows `message=pong echoed=hello server_time_unix_ms=1794642466086` (consistent with 2026-11-14), demonstrating the typed success envelope end-to-end on the installed release build.

**Summary (corrected 2026-11-14 per the owner's clarification in §10):** the screenshot objectively demonstrates the app's displayed self-check output (smoke view, IPC round-trip, typed error path) on the installed release build; the owner personally performed installation and uninstallation via command and did **not** personally perform the complete smoke-test checklist. For the M0 exit gate, owner-operated launch confirmation is satisfied through the owner's **explicit waiver (§10)** accepting the automated evidence. Outstanding manual items, explicitly identified: console-error check, window-title-bar text (and dimensions), and the optional items 2/7/10/11/13/14. None of these gates M0 closure (see `PHASE_2_M0_POST_REVIEW.md` §11); the title and console checks are naturally re-covered by M1's verification scope on the real shell.

---

**End of PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md** *(§8 appended 2026-11-14)*

## 9. Final automated verification results (2026-11-14, "M0 Final Automated Verification" session)

Full detail: `docs/PHASE_2_M0_FINAL_VERIFICATION.md`. Summary of what this changes in this guide:

**§1 artifact table — SUPERSEDED.** The M0-session artifacts were verified byte-identical to the §1 hashes at the start of the final verification (MSI/NSIS **MATCH**), then a rebuild was performed after a disclosed compile-check incident (a plain `cargo build --release` re-link produced a dev-mode binary; corrected by a proper `npx tauri build`). Bundler outputs are **not byte-reproducible**, so the current artifacts carry new hashes:

| Artifact | Size (B) | Current SHA-256 |
|---|---|---|
| `techvault.exe` | 4,268,032 | `4164b4b971ed853f2594f34bac3815bbb2137b32f168d24354076b897f8db547` |
| `TechVault_0.1.0_x64_en-US.msi` | 2,134,016 | `18c5617c46abf5d81a2807e4fad8fd841fa574a62d5f01853b1639d907714249` |
| `TechVault_0.1.0_x64-setup.exe` | 1,392,714 | `34d1923e6eeb6f3b02fb922f2a5ca778db33d781b4c654e7d6fb019c9d26fc32` |

Future integrity checks must compare against the hash recorded for the **specific build being checked** (record at build time).

**Agent-executed install/uninstall verification (supplements your §8 manual record, does not replace it):** silent NSIS install (`/S`, exit 0) → installed at `D:\Apps\TechVault` (4.15 MB, includes the bundler-patched exe) → launch verified with window title exactly "TechVault" (Win32 `GetWindowText`), smoke badges OK/OK/OK, identity `TechVault 0.1.0 release`, IPC working, ungranted core API denied by ACL, remote fetch/inline-script/string-eval all CSP-blocked → silent uninstall (exit 0) → install dir and registry entry removed, **`%APPDATA%\com.techvault.app` preserved intact**. The cycle was run twice: once against your verified M0 installer (hash-matched) and once against the rebuilt installer.

**Console-error item (from §8 outstanding list) — now covered by automated evidence:** a full console capture on the installed release app recorded exactly one error entry, a CSP `style-src 'self'` enforcement event originating in the Svelte 5 runtime bundle (no TechVault application errors, no crashes, no functional impact). The production CSP behaved exactly as D-022 requires. A strictly zero-error console would require adding that specific style hash to the production CSP — an owner decision, not taken.

**Fresh measurements (distinct from historical):** warm start median 67 ms; idle process-tree private bytes median 143.54 MB (both baseline-only, no pass/fail). True cold start remains unmeasured (the `-Cold` flag targets the wrong profile location — recorded limitation). Historical M0-session numbers (warm 47 ms; idle median 137.45 MB) remain on file in `docs/phase2-results/m0/baseline.json`.

---

**End of PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md** *(§9 appended 2026-11-14)*

## 10. Owner waiver and formal M0 closure record (2026-11-14)

**Owner waiver (explicit, dated):** the owner explicitly waives the M0 owner-operated launch confirmation requirement (MILESTONES M0 field 10) and accepts the existing **automated evidence** in its place: automated NSIS installation, automated application launch, window and application identity verification, smoke-test indicators, IPC functionality and permission-denial verification, and automated uninstall verification.

**Owner-stated accuracy (binding):** the owner personally performed **installation and uninstallation using a command**; the owner did **NOT** personally perform the complete smoke-test checklist. This §8 has been corrected accordingly (items 3/5/6/8). The unnumbered authorization addendum is recorded in `docs/DECISION_LOG.md` (§4, after D-025). **Scope: M0 only** — the waiver does not apply to M1 or future milestones.

**Formal closure:** with this waiver, every M0 exit criterion is satisfied (see `docs/PHASE_2_M0_CLOSURE_REPORT.md` for the full reconciliation). Preserved conditions: the documented production-CSP `style-src` console event (the console is **not** clean) and the D-025 kit-3 deferral.

**PHASE 2 M0: CLOSED** — effective 2026-11-14, by the owner's explicit authorization in the "M0: Owner Waiver Recording & Formal Final Closure" directive.

---

**End of PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md** *(§10 appended; §1/§8 corrected 2026-11-14)*
