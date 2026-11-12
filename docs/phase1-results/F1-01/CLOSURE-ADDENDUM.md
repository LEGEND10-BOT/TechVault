# F1-01 / P1-A Closure Addendum

**Date:** 2026-11-13
**Prepared by:** Implementation/verification agent (owner directive 2026-11-13, decision D-018, Section D items D1–D4)
**Scope:** administrative closure of P1-A only. P1-A was **not** re-executed; all original evidence, commits (`196b3bc`), and the results record (`docs/phase1-results/F1-01/RESULTS.md`) remain untouched.

---

## D1. Manual file-picker verification (A5 human half)

**Status: OWNER ACTION PENDING — not claimed as passed.**

### What was attempted (2026-11-13, installed app `C:\Users\REDEYE\AppData\Local\p1-a\p1-a.exe`)

The dialog flow was exercised through UI automation using the repo script `experiments/p1-a/scripts/dialog-uia-verify.ps1` (committed with this addendum; drives the installed app via UI Automation with a real mouse click and a keyboard-activation fallback):

1. **Native dialog open was observed once**: after a real mouse click on "pick file via dialog", a top-level window titled `TechVault P1-A: choose a text file` (class `#32770`, owned by the p1-a process, 960×720) was verified present via window inspection. No screenshot of the open dialog was retained at that moment.
2. **Reproducibility failed**: on repeated fresh instances, none of the three trigger methods (verified real mouse click on the button, UIA `InvokePattern`, UIA `SetFocus` + Space with the app confirmed as the OS-foreground window) opened the dialog; the in-app `dialogResult` paragraph never rendered any text (no `OK (`, `REJECTED (`, or `dialog error` output), and the app's stderr stayed empty (no panic). One earlier instance exited silently during polling — attributed to the automation session's process lifecycle, not the app (no crash record in the Application event log; the relaunched app under identical triggering stayed alive and silent).
3. **Interpretation (uncertain, flagged as such):** the failure pattern points at the automation session's desktop-input environment rather than at the app (the dialog demonstrably opened once, the suite's IPC/fs paths pass identically on every run), but the flow cannot be marked exercised end-to-end on automation evidence alone.

### Evidence artifacts (this session)

| Artifact | File |
|---|---|
| Automation script (reproducible) | `experiments/p1-a/scripts/dialog-uia-verify.ps1` |
| App window at automation attempt (suite all-PASS state) | `experiments/p1-a/results/screenshots/dialog-fixture.png.nodialog.png` |
| Pre-click state capture | `experiments/p1-a/results/screenshots/dialog-fixture.png.preclick.png` |

### Exact instructions for the owner (≤ 2 minutes)

1. Launch **p1-a** from the Start Menu (or `C:\Users\REDEYE\AppData\Local\p1-a\p1-a.exe`).
2. Wait ~5 s until the test table stops updating (the suite auto-runs).
3. Click **"pick file via dialog"**, select `D:\TechVault\experiments\p1-a\fixtures\allowed\sample.txt`, click Open.
   - **Expected:** the amber line `OK (D:\TechVault\experiments\p1-a\fixtures\allowed\sample.txt): TECHVAULT_P1A_FIXTURE_OK` appears under the buttons.
4. Click **"pick file via dialog"** again, type `C:\Windows\win.ini` into the file name field, click Open.
   - **Expected:** the amber line `REJECTED (C:\Windows\win.ini): forbidden path: …` appears — the fs permission scope rejects the read **even though the file was explicitly selected** (the dialog itself is not a permission grant).
5. (Optional) Cancel the dialog instead of selecting — expected `dialog cancelled`.
6. Report the two amber lines (or any deviation) to the controller; a photo/screenshot is sufficient.

**Security note:** item 4's expected rejection is the security property; it is already proven by the committed automated evidence (`results/test-results-release.json`: `forbidden path: C:\Windows\win.ini`). The manual pass verifies the human interaction path end-to-end. Do not broaden the capability file's fs scope to "fix" anything — the scope is correct as-is.

---

## D2. RAM budget (P-022) — recommendation packet (owner decision required)

**Status: OWNER_DECISION_REQUIRED. Not decided on the owner's behalf.** Work continues without it (it gates budget-setting, not Phase 1 execution).

### Measured inputs (from `docs/phase1-results/F1-01/RESULTS.md`, i5-10310U/32 GB reference machine, release build, idle after 6 s)

| Definition | Working set | Private bytes |
|---|---|---|
| App process only | 24.6 MB | 5.1 MB |
| Full process tree (app + 6 WebView2 helpers) | **327.14 MB** | **135.97 MB** |

Key facts:
- The tree **working set** double-counts memory shared between the Chromium/WebView2 helper processes (mapped DLLs and shared segments are counted in each process's WS), so it is an **upper bound**, not the additive footprint.
- The tree **private bytes** are the additive, committed-by-this-app footprint (each page counted once). This is the standard way multi-process Chromium apps report footprint.
- These are **idle** numbers; an active workload (video playback, transcription, large library) will raise them. No active-workload numbers exist yet for the empty PoC shell.

### Decision request P-022 (per the directive's decision-request format)

1. **Decision ID:** P-022 (performance budgets — idle-RAM measurement definition).
2. **Exact question:** Which metric defines the ≤ 150 MB idle-RAM planning target?
3. **Options:**
   - **A (recommended): full-process-tree private bytes** — additive, no double-counting, comparable across Chromium-style apps; P1-A measured **135.97 MB → within the 150 MB planning target**. Working set retained as a reported secondary metric.
   - **B: full-process-tree working set** — conservative upper bound; P1-A measured **327.14 MB → target must be raised to ~350 MB** for an empty shell, or the app must shed WebView2 helper processes (not controllable at PoC level).
   - **C: defer until Phase 2** — decide with the real application under active and idle workloads on the confirmed reference machine (P1-J protocol); keep both numbers recorded meanwhile.
4. **Technical consequences:** A keeps the existing planning target meaningful and matches industry reporting; B is stricter but the extra ~190 MB is shared memory that other processes would map anyway; C leaves P-022 open into Phase 2 (no Phase 1 blocker either way).
5. **Recommendation:** **Option A**, with working set recorded alongside, and the numeric budget re-validated in Phase 2 under active workload (any of A/B/C requires that re-validation).
6. **Can work continue without the decision?** **Yes** — P-022 gates Phase 2 budget-setting only; all Phase 1 packages proceed regardless.

---

## D3. Reference machine and result records

Resolved in the 2026-11-13 Phase 0 closure pass (commit `21357d1`): the owner-confirmed reference machine (Windows 11 Pro, i5-10310U 4C/8T, 32 GB DDR4-2667, single NVMe SSD — verified in-session via `Get-PhysicalDisk`) is now recorded in AGENTS.md §11, ARCHITECTURE §17, MASTER_BRAIN K2, TESTING_STRATEGY §12, PHASE_1_TASK_PACKAGES (P1-J row), and PHASE_0_EXECUTION_PLAN (OI-03, §7). All stale i5-6300U / unknown-RAM references were corrected. The record states this is the **reference** machine, not minimum supported hardware.

## D4. P1-A evidence integrity and limitations

- All evidence files referenced by `RESULTS.md` exist on disk and are committed (verified 2026-11-13: `results/tauri-info.txt`, `test-results-release.json`, `measurements.json`, `screenshots/desktop-window.png`, `scripts/measure.ps1`, `scripts/screenshot-window.ps1`; fixtures and capability file under version control).
- Limitations carried forward, unchanged and still true:
  1. Warm startup 74.5 ms is a **window-handle proxy**, not full interactive readiness.
  2. First-ever startup ≈ 10.5 s (one-time WebView2 profile creation + AV scan); per-launch cold start not separately characterized.
  3. Manual file-picker verification pending (see D1 above).
  4. CSP was unset in the throwaway PoC (`csp: null`, template default) — the production app must define a restrictive CSP.
  5. Android tests were not executed (P1-B deferred per owner).
  6. Dev-run raw `test-results.json` was overwritten by the release run (dev numbers transcribed in RESULTS.md; release JSON kept).
  7. New observation from this addendum: the A5 dialog flow could not be triggered reproducibly by desktop automation in this session (see D1) — no app defect established, human verification pending.

**Affected P-IDs / R-IDs:** P-022 (decision request above), P-002 (stack validation input), R-001..R-003 (evidence support; promotion remains an owner decision).

---

**End of F1-01 CLOSURE-ADDENDUM.md**
