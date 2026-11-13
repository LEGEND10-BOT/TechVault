# P1-C Desktop Whisper Feasibility Runner

This is an execution harness for the owner-authorized P1-C desktop-only pass. It is **not** product integration and does not change the approved Phase 2 Whisper architecture.

## Target and scope

- Windows 11 reference workstation, expected Intel Core i5-10310U / 32 GB RAM (confirm actual values in the generated JSON).
- Upstream: `ggml-org/whisper.cpp`, pinned to release commit `371b5a7` (v1.9.3).
- Models: Tiny, Base and Small; Medium is included automatically when detected RAM is at least 16 GiB (or via `-IncludeMedium`). Models are multilingual and downloaded only to `D:\Models\whisper`.
- Default smoke fixture: upstream `samples/jfk.wav` (English, short). Supply an owner-authorized long fixture for realistic RTF, language/quality coverage, and cancellation.
- Upstream source/build cache: `D:\Builds\whisper.cpp-p1c` (kept outside the repo).
- Build output, logs and JSON evidence: `experiments\p1-c\results` under the repo.
- No model files, downloaded source, or build output are stored inside the production repository tree.

## Run

Open PowerShell (normal user permissions are sufficient if Git, CMake, and a C++ build toolchain are on PATH), or double-click `Run-P1C-Desktop.cmd`:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
Set-Location D:\TechVault
.\experiments\p1-c\Run-P1C-Desktop.ps1
```

For a longer owner-authorized WAV fixture (must be 16 kHz, mono, PCM 16-bit), with cancellation probe:

```powershell
.\experiments\p1-c\Run-P1C-Desktop.ps1 -FixturePath 'D:\Fixtures\authorized-speech.wav' -RunCancellation
```

For a source MP3/MP4 media file, let the runner measure FFmpeg decode time automatically:

```powershell
.\experiments\p1-c\Run-P1C-Desktop.ps1 -SourceMediaPath 'D:\Fixtures\authorized-media.mp4' -RunCancellation
```

Use `-Language ur` for a forced Urdu comparison, or leave the default `auto` for language detection.

If conversion is needed:

```powershell
ffmpeg -i 'D:\Fixtures\source-audio.mp3' -ar 16000 -ac 1 -c:a pcm_s16le 'D:\Fixtures\authorized-speech.wav'
```

The runner clones/fetches the pinned upstream revision, builds `whisper-cli`, downloads the selected multilingual models on first use, measures process wall time / CPU time / sampled peak working set, writes JSON transcription output and logs, and checks malformed input in an isolated child process.

## Acceptance interpretation

- **A1:** build succeeds from the pinned source.
- **A2:** human review of the saved transcripts against the fixture's known content is required. The default JFK fixture is English-only and does not validate Roman Urdu or multilingual performance.
- **A3:** RTF is processing wall seconds / audio duration seconds; values <= 1.0 meet the at-least-real-time target. Target in F1-03 is <= 1.0 for Base on the clear fixture.
- **A4:** peak Working Set and peak Private Bytes are sampled every 250 ms. Private Bytes is the primary comparison metric per D-019/P1-J; brief peaks may be missed.
- **A5:** the optional cancellation probe hard-kills the CLI after it emits at least one timestamped segment, then records lines captured by the harness. This is **not** proof of a future TechVault job's graceful cancellation/callback semantics. Preserve this distinction.
- **A6:** malformed WAV is sent to a separate child process; non-zero exit is recorded as rejection. Review logs for a clear diagnostic.
- **A9:** JSON contains segment timestamps, but the 8/10 within +/-2 seconds criterion requires a human spot-check against fixture ground truth.

The script does not mark the task COMPLETE. Review `P1-C-desktop-results.json`, stdout/stderr, transcript JSON, source commit, model hashes, and fixture provenance. Add a separate result note with the measured outcome and explicit PASS/FAIL/NOT TESTED per criterion.

## Constraints and limitations

- No Android work (P1-B/P1-D remain deferred/held).
- No application integration, background service, automatic model download, or Phase 2 implementation.
- Model SHA-256 is recorded for artifact identity, not publisher-signature verification.
- Default JFK fixture is short. Cancellation is skipped unless a longer fixture is supplied.
- If this runner fails due missing toolchain/network, record the exact error. Do not infer whisper.cpp incompatibility from an environment/setup failure.
