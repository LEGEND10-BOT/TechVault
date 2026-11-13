# P1-C AI Audit Report — Whisper.cpp Desktop Verification (Windows 11)

**Date:** 2026-11-13
**Executor:** Implementation/verification agent (owner directive; authorization D-020 — R-025 Option A, desktop-only)
**Runner:** `experiments/p1-c/Run-P1C-Desktop.ps1` (executed **unmodified** via a DevCmd bootstrap wrapper — see §3)
**Fixture:** official whisper.cpp `samples/jfk.wav` (11.000 s, 16 kHz mono PCM, public-domain sample shipped with the pinned source). **No owner fixture, no Urdu/multilingual claim is made from this English-only fixture.**

## 1. Verdict summary (F1-03 §7 criteria measurable this run)

| Criterion | Target | Result | Verdict |
|---|---|---|---|
| A1 | whisper.cpp builds on Windows at pinned commit `371b5a7` | Built; `actual_commit = 371b5a7561823ab2bb32142d2751e35e7534727b` (matches pin); ggml 0.20.2 | **PASS** |
| A2 | Tiny/base produce usable transcripts on clear fixture | All 4 models transcribed the known JFK text correctly ("And so, my fellow Americans, ask not what your country can do for you…"); medium reproduced punctuation best | **PASS** |
| A3 | RTF ≤ 1.0 (base, clear fixture; processing/audio) | **base 0.292**; tiny 0.234; small 0.892; **medium 2.589 (fails ≤1.0 — not real-time on i5-10310U)** | **PASS for tiny/base/small; medium = finding** |
| A4 | Peak RAM per model recorded; measure-then-decide | Recorded: private 681/793/1261/2583 MB; working set 193/303/770/2088 MB (tiny/base/small/medium) | **RECORDED** (owner decides budget) |
| A5 | Partial segments preserved after cancellation | **NOT_RUN** — requires ≥90 s owner-authorized fixture + `-RunCancellation` (none supplied) | **NOT_RUN** (honest) |
| A6 | Corrupted input fails cleanly, no host crash | `read_audio_data: failed to read audio data` + `error: failed to read audio file`; host script unaffected | **PASS** |
| A7/A8 | Android | **N/A** — P1-D held (D-020) | N/A |
| A9 | Timestamp spot-check ≥8/10 within ±2 s | Segment starts exact (0.000); ends: tiny/base 10.500 (−0.5 s), small/medium 11.000 (exact) on the 11.000 s clip | **PASS** (spot-check) |

**Overall: desktop feasibility CONFIRMED with two runner defects found in the recorded numbers (§4) — the corrected RTF table is authoritative, not the JSON's `realtime_factor` fields.**

## 2. Environment audit (Phase 1) — evidence `results/logs/phase1-env-audit.log`

Executed inside **Visual Studio 2022 Build Tools DevCmd (`-arch=x64`)**, instance `Visual Studio Build Tools 2022 17.14.37906.3`:

| Command | Result |
|---|---|
| `where cl` | `…\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64\cl.exe` |
| `cl` | Microsoft C/C++ Optimizing Compiler **19.44.35230** for x64 (banner captured) |
| `where cmake` | `…\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe` |
| `cmake --version` | **3.31.6-msvc6** (VS-bundled) |
| `where git` | `D:\Git\ucrt64\bin\git.exe`, `D:\Git\cmd\git.exe` |
| `git --version` | 2.56.0.windows.4 |
| `where ffmpeg` | **not found** (optional for this run — jfk.wav is already 16 kHz mono WAV; non-WAV conversion test correctly skipped by the runner) |
| `where vswhere` | not on DevCmd PATH; standalone binary present at `C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe` and used directly |

Component verification: MSVC x64 **and** x86 hosts present (14.44.35207, include/lib/crt complete); Windows 11 SDK **10.0.26100.0**; CMake component present; `Microsoft.VisualStudio.Workload.VCTools` workload confirmed via vswhere. The previous `FATAL: Required command not found: cmake` was **environmental** (runner launched without the DevCmd environment), not a missing component.

## 3. Runner review (Phase 3) — zero changes applied; defects reported

The runner was **not rewritten**. Execution used the wrapper `results/logs/p1c-run-vscmd.cmd` (calls VsDevCmd then the unmodified runner) — the minimal non-invasive fix for the environmental failure. Defects found (fixes **proposed, pending owner approval**):

1. **WAV duration parser defect (affects recorded RTF):** `Get-WavDuration` reads the data-chunk size at fixed offset 40; `jfk.wav` has a 26-byte LIST chunk at offset 36, so it read `dataSize=32` → duration `0.001 s` → all JSON `realtime_factor` fields invalid (2572/3210/9807/28480). **Proposed fix:** walk RIFF chunks to locate `data` (as done by the auditor to recover true values). The wall-time measurements themselves are correct and complete.
2. **`exit_code` recorded as `null` for all measured processes:** `Start-Process -PassThru` without `WaitForExit()` leaves `ExitCode` null in Windows PowerShell 5.1; the corrupted-input PASS check (`exit_code -ne 0`) therefore passes trivially. **Proposed fixes:** call `$p.WaitForExit()` before reading; and treat null as `UNKNOWN` in the corrupted-input status. (A6 still stands — verified directly from the stderr evidence, §1.)
3. **Note contradiction (text-only):** JSON note says "RTF = fixture audio seconds / measured wall seconds; values >1 indicate faster-than-real-time", contradicting the code (`wall/duration`) and the updated F1-03 definition. **Proposed fix:** correct the note text.

Also noted (not defects): medium auto-included at 32 GB RAM (correct); cancellation correctly skipped without a long fixture; model hashes recorded as identity (not signatures — correctly disclosed).

## 4. Measured results (corrected RTF; per D-019 private bytes primary, working set supplementary)

Source: clone `https://github.com/ggml-org/whisper.cpp.git` → checkout `371b5a7` (full hash above); CMake configure + `--build Release --parallel 8` → `whisper-cli.exe` (A1 evidence: `p1c-run-console.log`).

True fixture duration **11.000 s** (RIFF chunk walk: `data=352000 B` @ 16000 Hz/32 kB/s). RTF = wall_seconds / 11.000 (processing/audio, per the updated F1-03 definition).

| Model | Bytes | Wall (s) | **RTF (corrected)** | Peak private (MB) | Peak WS (MB) | CPU s (×wall) | Segments | End timestamp |
|---|---|---|---|---|---|---|---|---|
| tiny | 77,691,713 | 2.572 | **0.234** | 681.1 | 192.7 | 7.69 (3.0×) | 1 | 10.500 |
| base | 147,951,465 | 3.210 | **0.292** | 792.6 | 302.6 | 19.33 (6.0×) | 1 | 10.500 |
| small | 487,601,967 | 9.807 | **0.892** | 1260.9 | 769.7 | 61.48 (6.3×) | 1 | 11.000 |
| medium | 1,533,763,059 | 28.480 | **2.589** | 2582.8 | 2087.8 | 173.89 (6.1×) | 1 | 11.000 |

whisper.cpp's own timing logs corroborate wall times (e.g. medium `total time = 28002.66 ms`). Inference was **CPU-only**: `whisper_backend_init_gpu: no GPU found` / `device 0: CPU` (the `use gpu=1` request found no built GPU backend — honest disclosure that these are pure-CPU numbers).

**Interpretation (feeds the model-selection table, F1-03 §6):** tiny and base are comfortably faster than real-time; small is marginal-real-time (0.892 on an 11 s clip — the definitive A3 measurement should use the spec's 5–10 min clear fixture); **medium is ~2.6× slower than real-time on the i5-10310U → per F1-03 §9 this becomes an owner decision (queue-based background processing / default tiny–small / disclose runtime)**. Memory scaling is linear with model size; medium's ~2.6 GB private bytes fits the 32 GB machine but is a P-022 budget input.

## 5. Items not run / not claimed (honest list)

- **Cancellation (A5): NOT_RUN** — needs an owner-authorized ≥90 s fixture and `-RunCancellation`. No partial-preservation claim is made.
- **FFmpeg decode (P-006 scoping): skipped** — ffmpeg absent; non-WAV conversion untested. Official link if the owner wants it installed: <https://www.gyan.dev/ffmpeg/builds/> (Windows builds by BtbN/gyan; install to e.g. `D:\DevTools\ffmpeg` and add to PATH **only with owner approval** — no PATH change made by this audit).
- **Multilingual/Urdu quality: NOT TESTED** — jfk.wav is English-only; `-Language ur` comparisons need owner-authorized fixtures. No Urdu accuracy claim exists or is implied.
- **A2 quality on noisy/multi-speaker fixtures: not tested** (no such fixture provided).
- **11-second-clip caveat:** RTF on an 11 s clip includes ~1–2 s model load; the definitive A3/A4 numbers should use the spec's 5–10 min clear fixture. The relative model ordering and the medium finding are expected to persist.

## 6. Evidence file paths (all preserved; nothing deleted)

| Artifact | Path |
|---|---|
| Results JSON (machine-readable, unmodified runner output) | `D:\TechVault\experiments\p1-c\results\P1-C-desktop-results.json` |
| This audit report | `D:\TechVault\experiments\p1-c\results\P1-C-AI-AUDIT-REPORT.md` |
| Phase 1 environment audit log | `D:\TechVault\experiments\p1-c\results\logs\phase1-env-audit.log` (+ `.cmd`) |
| Runner console output (build log incl. configure/compile; DevCmd invocation) | `D:\TechVault\experiments\p1-c\results\logs\p1c-run-console.log` (+ `p1c-run-vscmd.cmd`) |
| Per-model transcription stdout/stderr + whisper JSON | `…\logs\tiny|base|small|medium.stdout.txt / .stderr.txt / .json` |
| Corrupted-input rejection log | `…\logs\invalid.stderr.txt` (+ `invalid.stdout.txt`) |
| Built binary (evidence, outside repo) | `D:\Builds\whisper.cpp-p1c\build\bin\Release\whisper-cli.exe` |
| Models (outside repo, D-drive policy) | `D:\Models\whisper\ggml-{tiny,base,small,medium}.bin` (SHA-256 recorded in the results JSON) |

**Coordination note:** the working tree also contains the coordinating session's uncommitted doc updates (D-020 authorization, matrix/Gate-1 edits). This audit only **added** files under `experiments/p1-c/results/`; no existing project files were modified or deleted, and no commits were made by this audit.

---

**End of P1-C-AI-AUDIT-REPORT.md**
