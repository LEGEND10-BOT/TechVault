# P1-C Runner Fix Report — Minimal Bug-Fix Patch

**Date:** 2026-11-13
**File patched:** `D:\TechVault\experiments\p1-c\Run-P1C-Desktop.ps1`
**Backup:** `D:\TechVault\experiments\p1-c\Run-P1C-Desktop.ps1.original` (byte-identical copy of the pre-fix runner)
**Diff (git-diff equivalent; the experiment folder is not yet git-tracked):** `D:\TechVault\experiments\p1-c\results\logs\runner-fix.diff`
**Scope discipline:** exactly the three audit defects + the one-line handle-cache companion required to make fix 2 functional. No other lines touched. Existing test evidence untouched. No model downloads, no benchmark rerun, no commits, no API calls.

---

## 1. Exact changes

### Fix 1 — RIFF chunk-walking WAV duration parser
`Get-WavDuration` no longer reads the data-chunk size at fixed offset 40. It now validates `RIFF`/`WAVE`, then **walks the RIFF chunk list** (8-byte chunk headers, even-size padding) to find `data`, reading `fmt ` fields (channels/sample-rate/byte-rate/bits) from the actual `fmt ` chunk. Malformed negative chunk sizes throw; format validation (16 kHz / mono / PCM 16-bit) is preserved verbatim, and non-WAV input still returns `$null` for the caller's existing error path.

### Fix 2 — reliable ExitCode capture; null never passes
Three minimal parts (the third was required to make the fix functional on Windows PowerShell 5.1):
1. `[void]$p.Handle` cached immediately after `Start-Process` (the classic PS 5.1 quirk: without the cached handle, `ExitCode` stays `$null` even after exit — verified empirically during this fix).
2. `try { [void]$p.WaitForExit(5000) } catch {}` before reading `$p.ExitCode`; the value is captured into `$exitCode` inside `try/catch`.
3. Corrupted-input status: `$null -eq exit_code` now yields **`UNKNOWN_EXIT_CODE_NOT_VERIFIED`** — never `PASS`.

### Fix 3 — RTF note corrected
`"RTF = fixture audio seconds / measured wall seconds; values >1 indicate faster-than-real-time."` → `"RTF = measured processing wall seconds / fixture audio duration; RTF <= 1 means real-time or faster."` (now consistent with the code and the updated F1-03 §2 definition).

## 2. Verification results — 8/8 PASS (machine-readable: `results/logs/runner-fix-test-results.json`; harness: `results/logs/runner-fix-tests.ps1`)

Syntax validation: **PASS** (`Parser::ParseFile`, 0 errors) after every change.

The harness AST-extracts the **actual patched functions** from the runner file (not copies), then tests:

| # | Test | Result | Detail |
|---|---|---|---|
| A1 | WAV **with LIST chunk** before `data` (0.5 s synthetic) | **PASS** | duration 0.5 s (the original defect case shape) |
| A2 | Real `jfk.wav` (26-byte LIST chunk — the exact file that produced the bogus 0.001 s) | **PASS** | duration **11.0 s** |
| A3 | Plain WAV without extra chunks (0.25 s) | **PASS** | duration 0.25 s |
| A4 | Wrong sample rate (8 kHz) | **PASS** | format-validation throw preserved, message intact |
| A5 | Non-WAV input | **PASS** | returns `$null` (caller's existing error path) |
| B1 | Successful child process (`exit 0`) | **PASS** | `exit_code = 0` (was `null` pre-fix) |
| B2 | Failing child process (`exit 7`) | **PASS** | `exit_code = 7` (was `null` pre-fix) |
| B3 | Null-never-passes sanity | **PASS** | both exit codes non-null |

**All three fixes: VERIFIED.** (During verification the harness's own test-WAV writer had a 9-vs-10-byte LIST payload bug — the fixed parser correctly *refused* that malformed file; the writer was corrected and all tests re-run. The parser never produced a wrong number.)

## 3. Impact on prior evidence (honest statement)

- The 2026-11-13 run's `realtime_factor` fields and `duration_seconds: 0.001` in `P1-C-desktop-results.json` remain **invalid as recorded** (produced by the pre-fix parser); the authoritative corrected RTF table lives in `results/P1-C-AI-AUDIT-REPORT.md` §4. No evidence files were modified.
- Future runner executions will record correct durations, RTFs, and (with fix 2) trustworthy exit codes; a `null` exit code can no longer manufacture a corrupted-input PASS.
- The corrupted-input verdict from the audit (`PASS_CHILD_PROCESS_REJECTED_INPUT`) remains valid because it was independently verified from stderr evidence; with the patch, the status will additionally be backed by a real exit code.

## 4. Files created/modified by this patch

| File | Action |
|---|---|
| `experiments/p1-c/Run-P1C-Desktop.ps1` | modified (3 fixes + handle-cache line) |
| `experiments/p1-c/Run-P1C-Desktop.ps1.original` | created (backup of pre-fix state) |
| `experiments/p1-c/results/P1-C-RUNNER-FIX-REPORT.md` | created (this report) |
| `experiments/p1-c/results/logs/runner-fix.diff` | created (unified diff, shown in the delivery message) |
| `experiments/p1-c/results/logs/runner-fix-tests.ps1` | created (verification harness) |
| `experiments/p1-c/results/logs/runner-fix-test-results.json` | created (machine-readable results) |
| `experiments/p1-c/results/logs/fixtest-*.wav/.bin` | temporary test fixtures (harness-created) |

No commits made; no other project files touched; no Phase 2 implementation; no API calls.

---

**End of P1-C-RUNNER-FIX-REPORT.md**
