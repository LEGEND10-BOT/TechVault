# P1 Documentation Consistency Report — read-only audit (2026-11-13)

**Scope:** cross-check of `PHASE_1_STATUS_MATRIX.md`, `PHASE_1_GATE1_READINESS.md`, `WHISPER_CORE_PLAN.md`, `DECISION_LOG.md`, `PHASE_HANDOFF.md` against the latest confirmed evidence (P1-C Windows run completed: build PASS @ `371b5a7`, tiny/base/small/medium tested, corrected RTF in `P1-C-AI-AUDIT-REPORT.md`, 3 runner defects fixed with 8/8 fix verification, P1-D HELD, P1-B DEFERRED, cancellation/long-duration + Urdu pending, Gate-1 not closed, no Phase 2).
**No files were modified; no commits; concurrent-session changes preserved.**

---

## 1. Outdated P1-C status references (evidence now exists; text written before the Windows run)

| # | File : line | Current text (stale) | Severity |
|---|---|---|---|
| 1 | `PHASE_1_STATUS_MATRIX.md:29` (§2 row) | "AUTHORIZED / EXECUTION PACKAGE PREPARED (D-020); **runtime NOT VERIFIED**" | **High** |
| 2 | `PHASE_1_STATUS_MATRIX.md:43` (§3 bullet) | "Windows runtime evidence has not yet been produced in this Linux review environment. P1-C is therefore IN PROGRESS / NOT VERIFIED" | **High** |
| 3 | `PHASE_1_STATUS_MATRIX.md:53` (§4 row) | "F1-03a authorized; runner prepared, **Windows run pending** (P1-C)" | Medium |
| 4 | `PHASE_1_STATUS_MATRIX.md:135` (§9 row) | "Windows run **NOT YET VERIFIED** … CI (harness only), NT (runtime)" | **High** (§9 is the closure-status source of record) |
| 5 | `PHASE_1_GATE1_READINESS.md:31` (§B table) | "P1-C \| **HOLD** (owner; resolution options in R-025) \| not tested, owner-deferred" | **High** — contradicts D-020 and the executed state |
| 6 | `PHASE_1_GATE1_READINESS.md:49` (§D) | "**NOT tested and NOT claimed:** build/compatibility (tier 2), actual transcription (tier 3), performance benchmarks (tier 4) — all require the **held P1-C**" | **High** |
| 7 | `WHISPER_CORE_PLAN.md:§2` tier rows 2–4 | "AUTHORIZED; Windows execution **pending**" / "**PENDING P1-C Windows run**" (tiers 3 and 4) | Medium |
| 8 | `PHASE_HANDOFF.md:433` (§9 status) | "Whisper Core plan (R-024; **tiers 2–4 not performed**)"; lists "R-025 (P1-C/P1-D resolution)" as an outstanding owner decision | **High** |
| 9 | `PHASE_HANDOFF.md:507` (§12) | "Execute on the Windows reference workstation and attach … P1-C is not complete yet" | Medium |
| 10 | `DECISION_LOG.md` D-020 (evidence/next-action lines) | "Actual Windows execution evidence is not present in this workspace … not COMPLETE" | Low — **historical decision record; do NOT rewrite** (see §5 M5) |

## 2. Contradictions between the five documents

1. **P1-C status: three different answers coexist.** DECISION_LOG (D-020) + HANDOFF §12 + WCP §3: authorized/selected. MATRIX §2/§3/§9: "authorized, runtime NOT VERIFIED". GATE1 §B table: "**HOLD** … not tested". The authoritative execution evidence (`experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md`, `P1-C-RUNNER-FIX-REPORT.md`, `P1-C-desktop-results.json`) supersedes all three stale wordings: **P1-C desktop leg COMPLETE with named pendings** (A5 cancellation probe + long-duration benchmark pending an owner-authorized ≥90 s fixture; Urdu/multilingual quality untested).
2. **GATE1 internal contradiction:** line 31 (B table: P1-C "HOLD") and line 70 (H: "R-025 A/B/C" as an open owner decision) contradict line 81 ("Option A selected by owner (D-020)") and line 106 in the same file.
3. **WCP §2 tier table vs §3:** §3 correctly says "Selected: Option A, per D-020", but §2 tiers 2–4 still read as pending — internally inconsistent after the run.
4. **MATRIX §2/§9 P1-D rows** ("structurally blocked by P1-B/P1-C states"): P1-C is no longer an unexecuted dependency — P1-D is blocked by P1-B (deferred) and the owner hold only. Minor wording staleness.
5. **Evidence linkage gap:** no doc references `P1-C-AI-AUDIT-REPORT.md` or `P1-C-RUNNER-FIX-REPORT.md` (grep across the five docs: zero hits) — the corrected-RTF caveat (JSON `realtime_factor` fields invalid; audit §4 table authoritative) is not visible to a doc-only reader.

## 3. D-020 / R-025 representation check

- **D-020:** recorded in DECISION_LOG and referenced by all five documents (matrix ×10, GATE1 ×5, WCP ×7, HANDOFF ×2). Consistent where present. One historical inaccuracy inside D-020 itself ("execution evidence is not present") — preserve as history; add a dated addendum line instead of editing the ruling.
- **R-025:** "Option A selected" is consistently represented in DECISION_LOG (D-020 + summary), matrix §3, WCP §3, GATE1 §H/§J, HANDOFF §12 — **except** the two stale GATE1 rows (§2/§H) found in finding 2.

## 4. Remaining Phase 1 items preventing formal Gate-1 closure

1. P1-A file-picker human click-through (owner, 2 min; F1-01 CLOSURE-ADDENDUM D1).
2. P1-C A5 cancellation probe + long-duration benchmark (owner-authorized ≥90 s fixture) — and optionally curated Urdu/multilingual fixtures (currently untested).
3. P1-G live benchmark — owner "LATER" (D-019); formalize as approved deferral at Gate-1 or schedule.
4. P1-B deferral formalization (owner; P1-D stays held).
5. Revoke the exposed OpenRouter key (owner, security).
6. Logo asset delivery (P0-T08 — Phase 2 prerequisite).
7. The owner's Gate-1 review itself (agent must not close it).

## 5. Recommended minimal corrections (none applied)

- **M1 (matrix, 4 lines):** §2/§3/§4/§9 P1-C entries → "COMPLETE (desktop leg) — runtime evidence in `experiments/p1-c/results/` (build PASS @ `371b5a7`; tiny/base/small/medium; corrected RTF: base 0.292, medium 2.589 non-real-time; corrupted-input PASS; runner fixes verified 8/8). A5 cancellation + long-duration benchmark pending owner fixture; Urdu untested." Update P1-D dependency wording.
- **M2 (GATE1, 3 spots):** §B P1-C row → same COMPLETE-with-pendings wording; §D tested/deferred lines → tier 1–4 state (2/3 complete, A5 + definitive long-fixture RTF pending); remove the R-025 row from §H open decisions (answered by D-020); add evidence links.
- **M3 (HANDOFF, 2 spots):** §9 status line (P1-C executed; drop "R-025" from outstanding decisions) + §12 append "runtime evidence produced 2026-11-13; see audit/fix reports".
- **M4 (WCP, §2):** tier 2 → COMPLETE (build PASS, pinned commit verified); tier 3 → COMPLETE except A5 (transcripts/timestamps/corrupted-input verified; cancellation pending); tier 4 → measured with the corrected-RTF caveat (definitive long-fixture RTF pending).
- **M5 (DECISION_LOG):** leave D-020 text as history; optionally add one dated addendum line: "2026-11-13: Windows execution evidence produced — see `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md`."

**Checks completed:** all five files read and cross-checked (findings verified by line-numbered grep, not memory). Nothing NOT VERIFIED. Gate-1 remains NOT CLOSED per the evidence list — this report makes no status changes.

---

**End of P1-DOCS-CONSISTENCY-REPORT.md**
