# TechVault Phase 1 — Remaining Actions & Exception Decisions

**Date:** 2026-11-13 · Companion to `PHASE1-FINAL-CONSOLIDATED-STATUS.md` and `GATE1-FINAL-ACCEPTANCE-REPORT.md`.

## A. Owner actions (physical/inputs — exact, minimal)

| # | Action | Exact steps | Unblocks |
|---|---|---|---|
| 1 | Revoke the exposed OpenRouter key | OpenRouter dashboard → delete/revoke the exposed key. A clean repository does **not** make the old key safe | Security; precondition for any future P1-G live run |
| 2 | P1-A file-picker click-through (2 min) | Launch **p1-a** → wait ~5 s → click "pick file via dialog" → select `D:\TechVault\experiments\p1-a\fixtures\allowed\sample.txt` → expect `OK (…): TECHVAULT_P1A_FIXTURE_OK`; repeat, type `C:\Windows\win.ini` → expect `REJECTED (…): forbidden path: …`; report the two amber lines (photo sufficient) | P1-A A5 human half |
| 3 | (Optional) P1-C long fixture | Provide an owner-authorized ≥90 s (ideally 5–10 min) 16 kHz mono WAV or media file + conversion approval; then run `experiments/p1-c/Run-P1C-Desktop.ps1 -RunCancellation [-SourceMediaPath <file>]` from the DevCmd wrapper | P1-C A5 cancellation probe + definitive long-duration RTF |
| 4 | (Optional) P1-E curated restriction URLs | Provide 1–2 known embedding-disabled / age-restricted public video URLs | P1-E A4 completion; P-004 closure |
| 5 | Logo asset files (P0-T08) | Place the approved shield-and-T files (original asset per D-012) — they will be committed to `assets/logo/` unchanged | Phase 2 application shell |
| 6 | (Optional) P1-A relocation to D: | Run the NSIS installer interactively and choose `D:\Apps\p1-a` (silent modes investigated: NSIS `/S /D=` hangs; MSI needs elevation) | D-drive completeness for the app |

## B. Exception decisions for Gate-1 (owner decides; nothing decided by the agent)

| Exception | Reason | Impact if waived | Risk if forced now | Can Phase 1 close without it? | Approval needed | Recommendation |
|---|---|---|---|---|---|---|
| **P1-B deferred scope** (Android PoC) | Owner direction D-018; Android toolchain/device never authorized | Roadmap exit criterion 3 (Android strategy) stays undecided; D-010/P-023 evidence-pending | High cost: SDK/NDK installs + device; desktop-first priority unaffected | **Yes** — record as approved deferral; Android plan informed by desktop evidence | Gate-1 waiver | Approve deferral; revisit with a device when desktop Phase 2 stabilizes |
| **P1-D held scope** (Whisper Android) | Owner hold D-018/D-020; depends on P1-B device | No mobile transcription feasibility evidence | Same as P1-B + model-on-device constraints | **Yes** — approved deferral | Gate-1 waiver | Keep HELD; desktop transcription evidence informs a later decision |
| **P1-G live API benchmark** (D-019 LATER) | No replacement key/spend cap on record; exposed key must be revoked first | Live-model precision/recall/confidence metrics pending (P-009/P-010/P-018 inputs) | Spend (small but owner-gated); violates standing rule if run without cap | **Yes** — approved deferral (offline pipeline + dataset are done) | Gate-1 waiver or scheduling decision | Keep LATER; schedule only after revocation + replacement key + cap |
| **P1-E mobile scope** | No Android device/toolchain (P1-B track) | A2/A6 mobile playback evidence missing | Device + toolchain cost | **Yes** — covered by the P1-B deferral | Gate-1 waiver | Defer with P1-B |
| **P1-C remaining items** (A5 cancellation; definitive long-duration RTF; Urdu quality) | No owner-authorized ≥90 s / 5–10 min fixture was provided; no multilingual fixture | Partial-result-preservation invariant unproven on-device; medium-model RTF finding (2.589) is from an 11 s clip | None — running them without an authorized fixture would fabricate scope | **Yes** — approve as pending-owner-fixture deferral, or provide the fixture (action A3) | Gate-1 decision: waive or supply fixture | Provide the fixture if Phase 2 will use medium models; otherwise waive with the desktop-leg evidence |
| **P0-T08 logo delivery** | Assets not yet supplied (`assets/logo/` empty) | Phase 2 shell cannot integrate the approved logo | None now; Phase 2 shell blocked on it later | **Yes** — Phase 2 prerequisite, not a Phase 1 exit criterion | Owner supply | Deliver before the Phase 2 application shell |

## C. Explicit non-goals (unchanged)

No Phase 2 implementation; no live API usage; no Android work; P1-D stays HELD; P1-B stays DEFERRED; no silent promotion of partial/untested items to PASS anywhere in the record.
