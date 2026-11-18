# TechVault Phase 2 M1 — Performance Budget

**Document status:** v1.1 (2026-11-14, DP-13/OD-7 APPROVED — D-026). Inherits `PHASE_2_PERFORMANCE_BUDGET.md` (Rev 1.3) methodology and targets; M0 numbers are **historical baselines, not guarantees**; nothing here is a measured M1 result. **DP-13/OD-7 is APPROVED (D-026): the process-tree methodology and the five-workload criteria are enforceable gates — the M1 budgets in §3 are the gate criteria, effective exactly as written; no pass/fail exists until measured, and no criterion may be weakened to pass** (PERF-15; a miss is documented with analysis and remediation proposals, and quality is never silently traded for a smaller number). The v1.0 framing ("Proposed budgets await OD-7-methodology approval") is superseded by this ruling and retained only in this note for provenance.
**v1.0:** Prepared Draft (2026-11-14) — blueprint only.

---

## 1. Methodology (inherited)

- **Primary RAM metric:** private bytes (D-019); working set supplementary/diagnostic only.
- **Process tree:** every measurement aggregates the complete application tree (Rust main + all WebView2 children) — the committed `scripts/measure-baseline.ps1` pattern (PERF-02, implemented at M0).
- **Workload separation (OD-7):** W1 idle · W2 normal browsing · W3 large-library search · W5 import/export measured as separate rows. (W4 transcription does not exist in M1 — its rows first appear in the transcription milestone.)
- **Run protocol:** ≥5 runs, median + p95, environment recorded; unmeasured = unmeasured.
- **Idle settle duration: 60 seconds** *(owner-approved methodology clarification P-2, 2026-11-19 — this pins the existing "post-settle" wording; NOT a threshold revision)*. Rationale: the M1-P1 reconciliation demonstrated the inherited 6-second script default captured unsettled startup state for the larger G1 surface (G1 shed 20.1 MB between 6 s and 60 s); at 60 s the paired M0↔G1 delta is stable. The committed script takes `-IdleWaitSeconds`; G12's W1 soak uses its own longer window as scheduled. Full analysis: `phase2-results/m1/perf-budget-reconciliation.md`.

## 2. Approved targets in force

| Metric | Target | Source |
|---|---|---|
| Idle RAM (private bytes, full tree, post-settle, no jobs) | **≤150 MB** | **D-019 approved**; M0 baseline medians 137.45 MB (historical) / 143.54 MB (fresh) — baseline-only, **not claimed achieved** (the 10-min W1 soak belongs to G12). *(P-3, owner-approved 2026-11-19: the final absolute-target verdict remains scheduled for the G12 W1 10-minute soak; the G1 supporting evidence — 138.76 MB tree-private at the approved 60 s settle — is recorded, and does not complete that evaluation.)* |
| Desktop cold startup | ≤3 s median (carried) | Phase 1 planning target; **true cold start has never been measured** (`-Cold` script limitation recorded; fix awaits authorization) |
| FTS5 search latency | p95 ≤50 ms @100k (carried) | F1-04 A8 planning target |
| FTS5 write overhead | p95 ≤5 ms per indexed row (carried) | F1-04 A9 |
| Installer ≤60 MB / installed ≤120 MB | K3 planning range | PERF-12; M0 measured 1.33–2.04 MiB installer / 4.15 MB installed — huge headroom |

## 3. M1 gate budgets (in force — DP-13/OD-7 APPROVED, D-026; pass/fail determined only by measurement)

| ID | Workload / metric | Gate budget | Measured at |
|---|---|---|---|
| M1-P1 | **Shell delta vs M0 idle** (W1, tree private bytes) | ≤ +10 MB | G1 — **MET** *(owner-approved verdict P-1, 2026-11-19): **+5.42 MB median** at the approved 60-second settle; all three paired results preserved (+5.42 / +5.13 / +6.46 MB); the ≤ +10 MB guard is unchanged. The earlier 6-second-settle record (+16.03 MB, `phase2-results/m1/f1-controlled-comparison.md`) is preserved as a superseded unsettled-protocol artifact — root cause was the settle window, not application bloat (Rust process delta +0.05 MB). Full analysis: `phase2-results/m1/perf-budget-reconciliation.md` |
| M1-P2 | First-render time (shell interactive) | recorded; guard ≤300 ms warm-machine | G1 |
| M1-P3 | Bundle size per route (code-split) | recorded; no route chunk > 300 KB gzipped | G1 |
| M1-P4 | FTS query p95 @10k | ≤10 ms | G2 skeleton, G8 full |
| M1-P5 | FTS write overhead p95/row @10k inserts | ≤5 ms (carried) | G2 |
| M1-P6 | Bulk reindex 100k rows | ≤60 s, cancellable, non-blocking | G8 |
| M1-P7 | DB file growth @10k-resource/1k-source/10k-mention seeded corpus excl. transcripts | ≤50 MB | G8/G12 |
| M1-P8 | Streamed SHA-256 throughput (attachments, NVMe) | recorded; planning expectation ≥200 MB/s single-threaded — measured, not assumed | G3 |
| M1-P9 | File import end-to-end (per OD-9 profile: 20 MB text / 100 MB media registration) | recorded; planning expectation ≤10 s for the 100 MB media profile incl. hash | G4 |
| M1-P10 | Candidate scan (identity) @10k | ≤1 s | G6 |
| M1-P11 | Merge transaction @10 mentions | ≤250 ms | G6 |
| M1-P12 | Library interaction p95 @10k rows (virtualized) | ≤100 ms; memory delta vs W1 ≤ +25 MB | G9 |
| M1-P13 | Export/restore duration @10k incl. attachments | ≤60 s; bounded restore working memory (no full-file reads) | G10/G11 |
| M1-P14 | Idle CPU over 10-min soak | ≤1% average (W1) | G12 |
| M1-P15 | Warm startup (median, ≥5 runs) | ≤1.5 s (carried proposal) | G1, G12 |

## 4. Lightweight-operation invariants (verified by design review + soak, not counters)

No background services or idle workers; job workers spawned per job and joined; bounded job-queue depth (default 20); bounded prepared-statement cache; no polling — `job:*` events only; content persisted to DB, never long-lived in memory caches; streamed hashing/downloads (bounded buffers); virtualized library list; feature routes code-split; temp cleaned on all exit paths + startup sweep; expensive work (hashing large files, reindex, backup) never on the UI thread; zero network surface in M1 (nothing to poll).

## 5. Measurement plan per gate (committed scripts, evidence under `docs/phase2-results/m1/`)

| Gate | Measurements |
|---|---|
| G1 | W1 idle tree delta vs M0; first-render; bundle-per-route; warm start |
| G2 | FTS latency + write overhead @10k; DB size after seeding; WAL-vs-DELETE record |
| G3/G4 | Hash throughput; import duration per profile; temp sweep leaves nothing |
| G6 | Candidate scan; merge timing |
| G8/G9 | Search p95 @10k/100k; reindex duration; library interaction p95 |
| G10/G11 | Export/restore duration; backup size |
| G12 | **Consolidated M1 report:** every budget row gets Measured / Pass / Fail / N-A with the methodology applied; misses documented with analysis; W1 soak + warm start re-run |

M0 harness limitations carried honestly: true cold start unmeasurable until the `-Cold` fix is authorized; `verify-prod-csp.mjs` early-target race noted (report-only).

## 6. Explicit non-claims

The 150 MB target is approved but not achieved-claimed · all M1-P* values are gate criteria whose pass/fail exists only after measurement · no transcription numbers exist in M1 (out of scope) · FTS 100k figures do not exist yet · no number is reported without method and raw evidence.

---

**End of PHASE_2_M1_PERFORMANCE_BUDGET.md**
