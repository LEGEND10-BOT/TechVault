# Performance Budget Reconciliation & Root-Cause Investigation (G1)

**Date:** 2026-11-19 · **Mandate:** owner directive "Performance Budget Reconciliation & Root-Cause Investigation". Read-only investigation; no source, configuration, threshold, or decision changes; all scratch measurement work outside the repository. **G1 remains open pending the owner's performance decision.**

---

**OWNER APPROVAL (2026-11-19): all four recommendations P-1..P-4 explicitly approved.** P-1: M1-P1 = **MET** at the 60-second settle (+5.42 MB median; pairs +5.42/+5.13/+6.46 preserved; guard unchanged). P-2: idle settle pinned to 60 s (methodology clarification — now recorded in `PHASE_2_M1_PERFORMANCE_BUDGET.md` §1). P-3: absolute 150 MB verdict deferred to the G12 W1 10-minute soak (60 s result 138.76 MB recorded as supporting evidence). P-4: no footprint-reduction work now.

---

## 1. D-019 reconciliation (exact source wording, no silent correction)

**Authoritative source, quoted verbatim** — `docs/DECISION_LOG.md:329` (D-019, decision item 1):

> "**P-022: Option A APPROVED** — private bytes are the primary RAM-budget metric with the **150 MB planning target**; working-set measurements remain supplementary diagnostic information."

Supporting context, quoted verbatim — `docs/phase1-results/F1-01/CLOSURE-ADDENDUM.md` D2 (the decision request D-019 ruled on):

> "**Exact question:** Which metric defines the ≤ 150 MB idle-RAM planning target?" — with Option A "(recommended): full-process-tree private bytes … P1-A measured 135.97 MB → within the 150 MB planning target" and Option B (working set) noting it "is stricter but the extra ~190 MB is shared memory".

Later ratifications: D-026/DP-13 approved the process-tree methodology and five-workload criteria as **enforceable gates** (`PHASE_2_M1_PERFORMANCE_BUDGET.md` §3); OD-7's register row (`DECISION_LOG.md:399`) records the "150 MB idle private-bytes target retained (approved via D-019)".

**Reconciliation answers:**

| # | Question | Answer (source-grounded) |
|---|---|---|
| 1 | 150, 250, or another value? | **150 MB.** No 250 MB figure exists anywhere in the decision log, budget documents, or the P-022 decision request (grep-verified). The "91 MB under it" statement in the F-1 report was an **arithmetic error** (150 − 158.84 is negative) — corrected by erratum in §1.1 below |
| 2 | Metric? | **Private bytes** (`PrivateMemorySize64`), aggregated over the **complete process tree** (main + WebView2 children) — the metric definition comes from D-019 (private bytes primary) + OD-7/D-026 (process-tree methodology, enforceable). Working set is supplementary only |
| 3 | Hard limit, guardrail, or planning threshold? | **Planning threshold.** D-019's own words are "planning target". Its enforcement timing: the budget document assigns the W1 10-minute soak to **G12** (`PHASE_2_M1_PERFORMANCE_BUDGET.md` §2 note and §5 "M1-P14 … G12"); the G1-assigned gate criterion is the **relative** M1-P1 (≤ +10 MB shell delta), in force via DP-13. The absolute 150 MB is therefore a planning target whose final pass/fail lands at G12 — not a G1-closure gate |
| 4 | Does G1 breach the absolute target? | **Depends on the settle window (measured, §3):** at the inherited 6-second settle, yes (158.84 MB, +8.8 over); at a 60-second settle, **no** (138.76 MB, −11.2 under). The W1 soak at G12 is the authoritative evaluation |
| 5 | Does the relative +10 MB guard remain independently applicable? | **Yes** — M1-P1 is the G1-assigned gate budget (DP-13, in force). It is evaluated against the M0 baseline in the same session; per §3 below it is **met with margin under a settled methodology** and was missed under the 6-second protocol |

### 1.1 Erratum (F-1 report, dated)

The F-1 resolution record (`docs/phase2-results/m1/f1-controlled-comparison.md` §5) stated "G1's 158.84 MB median is 91 MB under" the 150 MB target. **This is wrong: 150 − 158.84 = −8.84 MB, i.e. G1 was ~8.8 MB ABOVE the planning target in that 6-second-settle session.** The error did not affect the comparison's measured deltas or its relative-guard verdict (those numbers stand), but it materially mis-stated absolute-target compliance. This document supersedes that sentence. Root cause of the slip: an unanchored mental figure during report writing — no 250 MB source exists to justify it.

## 2. Compliance table (absolute + relative, both settle windows)

| Criterion | Definition | 6 s settle (11-19 session) | 60 s settle (11-19 session, 3 pairs) | Status |
|---|---|---|---|---|
| **M1-P1** (G1 gate, DP-13) | G1 − M0 same-session tree-private delta ≤ **+10 MB** | **+16.03 MB median** (min pair +12.16) — 6 pairs | **+5.42 MB median** (pairs +5.42 / +5.13 / +6.46 — all within) — 3 pairs | **MISSED at 6 s · MET at 60 s** |
| **D-019 absolute** (planning target; final judgment G12 soak) | Tree-private **≤ 150 MB**, idle, post-settle | G1 **158.84** (+8.8 over); M0-equiv 142.81 | G1 **138.76** (−11.2 under); M0-equiv 133.34 | **over at 6 s · under at 60 s** |
| Historical context | Original M0 fresh baseline (11-14): 143.54 MB · historical: 137.45 MB | — | — | M0-equivalent reconstruction at 60 s (133.34) is consistent with both |

## 3. Root-cause analysis (where the memory goes, and why the settle window mattered)

### 3.1 Which process carries the delta (from the 12 paired 6 s runs — `webview-role-analysis.txt`)

| Component | M0 median | G1 median | Delta |
|---|---|---|---|
| techvault.exe (Rust main, incl. settings/zoom backend) | 4.32 MB | 4.37 MB | **+0.05** |
| WebView2 #1 (browser process) | 53.80 | 59.90 | **+6.10** |
| WebView2 #2 (GPU) | 36.82 | 37.21 | +0.39 |
| WebView2 #3 (renderer) | 25.64 | 34.08 | **+8.44** |
| WebView2 #4 (network/utility) | 10.98 | 11.37 | +0.39 |
| WebView2 #5, #6 (utility/crashpad) | 9.59 | 9.58 | ±0.0 |
| **Tree** | **142.81** | **158.84** | **+16.03** |

**~100% of the delta is WebView2-side; the Rust process is flat (+0.05 MB)** — the settings/zoom backend adds nothing measurable. Within WebView2, the renderer (+8.4) and browser process (+6.1) dominate.

### 3.2 Application-owned vs platform/runtime overhead (CDP probes, `jsheap-probe`)

| Probe (settled, page context) | M0 | G1 | Delta |
|---|---|---|---|
| V8 used JS heap | 2 MB | 3 MB | ~+1–3 MB |
| DOM nodes | 57 | 144 | +87 |
| CSS rules | 11 | 50 | +39 |
| Shipped bundle (raw / gzip; 10 vs 30 files) | 82.4 / 31.9 KB | 203.6 / 71.8 KB | **+121 KB raw (+40 gzip)** |

**Interpretation:** the application's own JS heap accounts for only ~1–3 MB. The renderer's remaining ~5–7 MB is Chromium-side structure amplified from the larger surface: V8 compilation/code objects for ~3× the shipped code (kit 3.2.0 runtime + 11 primitives + shell + stores), Blink style/DOM structures for +87 nodes and +39 rules. The browser process's +6.1 MB tracks the same growth (heap segment bookkeeping, cache structures). **Conclusion: the delta is dominated by the G1 shell's larger frontend surface plus the kit 3.2.0 runtime — genuine application-owned growth (G1 really does ship more app), not a leak, not platform-only overhead, and not the settings/zoom backend.** ~3× bundle for a shell + design system over a smoke page is not per se abnormal; the question is only whether the guard's margin accommodates it — which the settle window determines (§3).

### 3.3 Why the settle window reversed the verdict

The inherited measurement protocol ("post-settle", 6 s — M0's script default) captured **pre-GC/pre-trim startup state**: after 6 s the G1 binary still held its larger startup allocation peak. Between 6 s and 60 s, M0 shed 9.5 MB while G1 shed 20.1 MB (the larger surface has more garbage to collect and more reserved segments to trim). At 60 s the paired delta is +5.42 MB — inside the guard with margin. The protocol text (`PHASE_2_M1_PERFORMANCE_BUDGET.md` §1 "post-settle", §3 M1-P1) never pinned the settle duration; 6 s was simply M0's script default inherited forward. **This is a measurement-methodology finding, not a criterion change:** "idle" must mean settled, and 6 s demonstrably was not settled for the G1 surface.

## 4. Measurement confidence assessment (directive §3)

| Question | Assessment |
|---|---|
| Is the reconstructed M0-equivalent sufficiently faithful? | **Yes, with a stated limitation.** Runtime fingerprint matches M0 exactly (smoke view, OK/OK/OK, six-key `app_info` without `data_dir`, no shell elements); installer sizes match the M0-closure records exactly (1.96/1.33 MiB); its measured baseline (139.58–144.89 at 6 s; 132.92–136.38 at 60 s) is consistent with the original M0 baselines (143.54 fresh / 137.45 historical). Limitation (disclosed in F-1): it is a reconstruction, not the hash-verified original (unrecoverable — all paths overwritten, source never committed) |
| Does the shared WebView2 profile bias the comparison? | **No — it is controlled.** Both binaries alternate in the same session on the same profile; any profile state applies to both sides equally. First-run-of-session spikes were observed for startup timing but the memory medians stayed stable within each settle protocol |
| Are six paired transitions sufficient? | **Yes for the 6 s verdict** — all six transitions exceeded the guard (min +12.16), a unanimous result that no additional 6 s sampling would overturn. The 60 s verdict rests on 3 pairs (all +5.1…+6.5, tight and consistent); direction is unanimous, margin ~2× the guard. Adequate to establish "within guard at 60 s" for G1 purposes; the G12 soak remains the final arbiter |
| Would a longer 60 s settle change the result? | **It did** (measured, §2): +16.03 → +5.42 MB; both binaries settle substantially (G1 −20.1 MB, M0 −9.5 MB). The 6 s figure was unsettled startup state |
| Is a 10-minute soak necessary? | For **G1 closure: no** — the 60 s paired evidence settles the M1-P1 question with margin. For the **150 MB absolute target: yes, per the budget document** — the W1 soak is assigned to G12 by the governing docs and should run there (at ≥60 s settle, ideally) to finalize absolute-target compliance. A mid-length (5-min) confirmation at G12 start is a cheap intermediate |
| Is process-tree accounting consistent? | **Yes** — one committed script (`measure-baseline.ps1`) for both binaries, same warm-up (`WaitForInputIdle`), same idle window, same two-level child enumeration; identical 7-process tree shapes both sides; raw per-process rows preserved in every run JSON |

Additional measurements run for this investigation (read-only, thresholds untouched): 60 s settle ×6 (3 pairs), JS-heap/DOM/CSS probes ×2, bundle inventory ×2. Raw evidence: `D:\Temp\techvault\f1-settle60\` (copied into `docs/phase2-results/m1/perf-budget-reconciliation/`), `webview-role-analysis.txt`, `jsheap-probe` outputs, per-process analysis.

## 5. Remediation comparison (directive §4)

| Option | Expected benefit | Technical risk | Effort | Regression risk | Local-first / low-resource impact | Gate effect |
|---|---|---|---|---|---|---|
| **A. Footprint-reduction pass** (trim eager surface, lazy-load primitives, quantify kit 3.2.0 vs 2.70.4 delta) | Modest: measured idle delta is already +5.4 MB settled; the reducible part (eager JS/CSS ~121 KB raw → less parser/code memory) might save a few MB at most; V8/Blink baseline overhead is largely irreducible | Low-med; lazy-loading can change UX timing; kit-downgrade experiments are analysis-only | Medium (1–2 gates' worth of careful work, mostly G9-adjacent) | Low-med (lazy-load regressions, hydration timing) | Positive but small — the shell is already lean at settle | Delays G1 (new work) without evidence of need |
| **B. Longer-settle + G12 soak verification** (pin 60 s settle in the methodology; W1 soak at G12 as scheduled) | **Confirmed by measurement**: guard met with margin (+5.4), absolute target met (138.76 < 150); documents the 6 s artifact | None (measurement-only) | Minimal (already largely done; formalize the settle parameter) | None — no code changes | Neutral-positive: honest low-resource reporting without code churn | **Unblocks G1 closure**; G12 soak unchanged as final arbiter |
| **C. Formal budget revision** (re-derive M1-P1 or the absolute target from measurements) | Would legitimize larger footprints — but **no longer needed**: settled evidence shows the existing criteria are met | Approval/process overhead only | Small (a decision record) | None | Negative signaling (weakened targets erode the low-resource goal) | Unblocks G1 but weakens the framework unnecessarily |
| **D. Accept as documented condition** | None — treats a settled-healthy result as a defect | None | None | None | Negative framing only | Unblocks G1 with a false-negative on record |

## 6. Recommendation

**Option B — formalize the 60-second settle in the measurement methodology and close M1-P1 as MET, with the G12 W1 soak unchanged as the final arbiter of the absolute 150 MB target.** Evidence: (1) the 6-second protocol demonstrably captured unsettled startup state (G1 shed 20.1 MB between 6 s and 60 s); (2) at 60 s the same-session paired delta is +5.42 MB median (all pairs +5.1…+6.5) — inside the ≤ +10 MB guard with ~2× margin; (3) the D-019 absolute planning target is met at settle (138.76 < 150); (4) the root cause of the earlier "miss" was measurement methodology, not application bloat — the Rust process is flat (+0.05 MB) and the renderer delta is a legitimate, bounded consequence of shipping a real shell + design system. Option A remains available later if the G12 soak shows drift; Option C is unnecessary because the existing criteria pass as written; Option D is factually superseded.

**Owner decision packet (explicit choices):**

| # | Decision | Options |
|---|---|---|
| **P-1** | M1-P1 verdict to record | **(B, recommended)** MET at 60 s settle — pin the settle parameter in the methodology note · (alternative) keep the 6 s record as the verdict and order remediation work (Option A) · (alternative) C: formal budget revision |
| **P-2** | Settle-duration methodology note | **(recommended)** add "idle settle = 60 s" to the measurement-plan note (a doc clarification of the existing "post-settle" wording — not a threshold change) · (alternative) leave unpinned |
| **P-3** | Absolute 150 MB target evaluation | **(recommended)** defer final verdict to the G12 W1 10-minute soak as already scheduled (60 s evidence noted) · (alternative) accept the 60 s evidence as final now |
| **P-4** | Remediation work | **(recommended)** none now; revisit only if the G12 soak shows the guard or target under pressure · (alternative) authorize a footprint-reduction pass now |

## 7. Git integrity verification

Branch `main`, HEAD `37a71c4` unchanged before and after this investigation; 0 stashes; nothing committed, pushed, reset, or stashed; no source/configuration/threshold/decision-log changes (verified: zero files under `src/`, `src-tauri/`, `tests/`, `scripts/` modified during this pass; `PHASE_2_M1_PERFORMANCE_BUDGET.md` mtime still 2026-11-14 15:12); D-021..D-027 headers intact; owner settings preserved (`theme: "light"`; zoom value as left by the owner). New files this pass: this report + evidence copies under `docs/phase2-results/m1/perf-budget-reconciliation/` + a dated erratum line in the F-1 report.

---

**Raw evidence:** `docs/phase2-results/m1/perf-budget-reconciliation/` (60 s settle JSONs ×6, per-process and role analysis, JS-heap probe outputs, bundle comparison) + the F-1 evidence set. **G1 remains open until the owner decides P-1..P-4.**

**End of perf-budget-reconciliation.md**
