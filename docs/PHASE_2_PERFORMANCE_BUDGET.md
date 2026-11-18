# TechVault Phase 2 Performance Budget

**Document status:** Revision 1.3 (2026-11-14, final integration pass). Values marked **Proposed** are planning budgets awaiting owner approval (OD-7 — recorded as Proposed in `DECISION_LOG.md` §5); values marked **Approved** carry an existing owner decision (the 150 MB idle private-bytes target, D-019). **Nothing here is a measured result for the Phase 2 application** — measurement happens during Phase 2 milestones. Acceptance criteria are never weakened to make targets easier to pass. No readiness claim in this document depends on an unapproved OD.
**Revision 1.3 changes:** the five named workloads formalized (W1 idle application · W2 normal resource browsing · W3 large-library search · W4 active transcription · W5 import/export); worker lifecycle, cache limits, lazy loading, virtualization, and large-attachment handling added as measurable invariants (§5); trade-off statement added (§7). Requirement IDs defined in `PHASE_2_TRACEABILITY_MATRIX.md`.
**Revision 1.2 changes:** status language aligned to the Proposed register.
**Revision 1.1 changes:** explicit process-tree measurement methodology (directive §4); per-workload separation; engine/decode subprocess memory defined as its own workload; decode sidecar added to the separate-budget list; language-quality non-claims stated.
**Revision 1.1 changes:** explicit process-tree measurement methodology (directive §4); per-workload separation (idle / startup / search / transcription recorded separately); engine/decode subprocess memory defined as its own workload; decode sidecar added to the separate-budget list; language-quality non-claims stated.
**Reference machine (owner-confirmed):** Windows 11 Pro, Intel Core i5-10310U (4C/8T), 32 GB RAM, single NVMe SSD (C: system/tools, D: repository/caches, E: bulk). Measurement reference — not the minimum-spec definition.

---

## 1. Metrics and methodology (directive §4)

| Rule | Content |
|---|---|
| Primary RAM metric | **Private bytes**, per D-019 |
| Supplementary RAM metric | Working set — diagnostic only, never a pass/fail gate |
| **Process-tree definition (OD-7)** | "Idle RAM" and interactive budgets are measured over the **complete application process tree**: the Rust main process **plus every WebView2 child process the application spawns** (and any other app-owned children). Aggregation = sum of the tree's private bytes at the sampled moment. |
| **Workload separation (OD-7)** | **Idle, startup, search, and transcription are recorded as separate workload rows.** The transcription engine subprocess and the FFmpeg decode sidecar are **their own workload rows** — their memory is never folded into idle or interactive budgets. A transcription run may legitimately exceed the idle budget by an order of magnitude; that is what the separate rows exist to show honestly. |
| Run protocol | ≥5 runs, median and p95 reported; environment (build type, background load) recorded; the Phase 1 measurement protocol carries over |
| Tools | The P1-A measurement scripts **adapted to process-tree aggregation**; new FTS/job/decode harnesses; all scripts committed under `scripts/` at M0/M10 |
| Reporting | Budget-relevant numbers recorded per milestone; M10 consolidates the Phase 2 performance report with pass/fail against this table |
| Honesty rules | Unmeasured = unmeasured; no number without method and raw evidence; **criteria are never weakened** — a miss is reported as a miss with analysis |

---

## 2. Approved targets already in force

| Metric | Value | Source |
|---|---|---|
| Idle RAM (private bytes, **complete app process tree**, after startup settles, no jobs) | **≤150 MB planning target** | D-019 (P-022). P1-A measured the PoC shell tree at 135.97 MB — **not transferable to the full app**; re-measured in Phase 2 |
| Desktop cold startup | **≤3 s median** (planning target carried from F1-01 A2) | Phase 1 spec; P1-A warm 74.5 ms shows headroom; cold start on the real app unmeasured |
| FTS5 search latency | **p95 ≤50 ms @ 100k resources** (carried from F1-04 A8) | Measured only at 5k/20k (0.005–0.009 ms median) — the 100k scale is measured in M2/M7 |
| FTS write overhead | **p95 ≤5 ms per indexed row** (carried from F1-04 A9) | As above |

---

## 3. Proposed budgets (awaiting OD-7 approval)

### 3.1 Application-level workloads (five named workloads, each reported separately — PERF-03)

**W1 Idle application** · **W2 Normal resource browsing** · **W3 Large-library search** · **W4 Active transcription** (+ decode sidecar) · **W5 Import/export operations**. Engine/decode subprocess memory belongs to W4 only, never to W1–W3 or W5.

| Workload | Metric | Proposed budget | Measurement |
|---|---|---|---|
| **W1 Idle** | Private bytes (full app tree), 10-min soak | ≤150 MB (Approved target) **and** ≤1% average idle CPU over the soak | Process-tree sampling script |
| **Startup** | Cold start (first launch) | ≤3 s median (carried) | Startup script, cleared caches, ≥5 runs |
| **Startup** | Warm start (subsequent launches, shell interactive) | ≤1.5 s median (proposed) | Same script |
| **W2 Normal browsing** | Library list scroll + detail opens p95 @ 10k rows (virtualized) | ≤100 ms interaction p95 (proposed); memory delta vs W1 ≤ +25 MB (proposed guard) | Frontend profiling harness + process-tree sampling |
| **W3 Large-library search** | FTS query p95 @ 10k (near-term realistic) | ≤10 ms (proposed) | FTS harness |
| **W3 Large-library search** | FTS query p95 @ 100k (synthetic corpus) | ≤50 ms (carried) | FTS harness |
| **W3 Large-library search** | Bulk reindex (100k rows) | ≤60 s, cancellable, non-blocking (proposed) | Reindex harness |
| **W4 Transcription** | Engine + decode subprocess memory, RTF, post-job residency | Separate workload rows (§3.3); gates per model tier | M8 harness |
| **W5 Import/export** | Export/restore duration @ 10k-resource library incl. attachments | ≤60 s (proposed); bounded working memory during restore | M9 harness |

### 3.2 Packaging and storage

| Metric | Proposed budget | Measurement |
|---|---|---|
| Installer size | ≤60 MB (upper K3 planning range); **expected well below** — minimal shell measured 1.5–2.2 MB in P1-A; **no Whisper models bundled** (OD-10); FFmpeg sidecar adds tens of MB if bundled (OD-3 audit outcome recorded) | Build artifacts, per milestone |
| Installed size | ≤120 MB (upper K3 range) excluding WebView2 runtime and models | Install measurement |
| DB file growth | ≤50 MB for a 10k-resource / 1k-source / 10k-mention library excluding transcripts | Seeded corpus (M7/M10) |
| Temp workspace (`D:\Temp\` default) | Soft cap 500 MB; per-file intake caps per OD-9; startup sweep removes orphans | Intake + sweep tests |
| Transcript storage | Order-of-magnitude ~1 MB/hour of speech — replaced by the measured value in M8 | M8 measurement on owner media |
| Model storage | tiny ~75 MB · base ~142 MB · small ~466 MB · medium ~1.5 GB (upstream figures; consent-gated; user-managed outside the app dir) | Downloader records actual sizes |
| Backup size | ≈ DB + attachments + manifest; excludes temp/models | M9 measurement |

### 3.3 Transcription workloads (separate rows — never folded into idle)

| Metric | Value | Status |
|---|---|---|
| RTF (real-time factor, **11 s English fixture, reference hardware**) | tiny 0.234 · base 0.292 · small 0.892 · **medium 2.589 (non-real-time)** | **Measured** (P1-C corrected figures; original JSON RTF fields invalid — disclosed). **Scope: tested hardware + short English fixture only — not general guarantees.** |
| Long-duration RTF | unknown — OD-11 fixture-gated | Not measured; not invented |
| Peak private bytes during transcription (engine subprocess workload) | 681–2583 MB across tiny→medium (P1-C measured) | **Measured (scoped as above)** |
| Job RAM gate (abort/warn threshold) | Proposed: tiny ≤0.9 GB · base ≤1.0 GB · small ≤1.5 GB · medium ≤3.0 GB — derived from measured peaks (681 / 793 / 1261 / 2583 MB) plus ~15–20 % headroom. **Audit correction 2026-11-14:** the earlier "small ≤900 MB" figure contradicted the measured 1261 MB small-model peak and would have aborted legitimate jobs | Proposed safeguard (OD-7/OD-9), measured per job as a separate workload row |
| Decode sidecar workload | Memory + duration recorded per conversion (own row) | M8 harness |
| Concurrent transcription jobs | **1** (OD-9) | Enforced by job runner |
| Post-job residency | 0 background processes; temp WAV deleted; no idle workers | Verified per run |
| Urdu / multilingual performance | **Unknown** — quality and performance on non-English fixtures are not established | OD-11 fixtures required before M8 closure; results recorded honestly |

---

## 4. Operations with separate budgets

1. **Transcription** — measured tiers (§3.3) + OD-11 long-duration results when available.
2. **Audio decode sidecar (FFmpeg)** — memory + duration per conversion (own workload row).
3. **Bulk indexing / reindex** — throughput + duration (§3.1), cancellable, non-blocking.
4. **Model downloads** — network-bound; budgeted by consent-UI disclosure (size + expected time), cancellable; not app-resource budgets.
5. **Export/restore** — library-size-bound; proposed ≤60 s for a 10k-resource library (M9 measurement).
6. **Knowledge graph rendering (Phase 4)** — R-008 ADOPT caps recorded from P1-H (≈60 FPS @ 50k nodes); carried, not applicable in Phase 2.
7. **AI extraction (Phase 3)** — deferred to Phase 3 planning; P1-G live metrics are the intended input (owner-deferred).

---

## 5. Lightweight-operation invariants (directive §4)

Verified by design review and soak tests, not just counters:

- No bundled Whisper models (OD-10).
- **Worker lifecycle:** job workers spawned per job and joined at completion; no idle job workers; no resident engine/decode processes between jobs.
- No background polling without a real need; zero timers while idle; bounded job-queue depth.
- **Cache limits:** no unbounded caches — bounded prepared-statement cache, DB-persisted content, streamed downloads with bounded buffers.
- **Lazy loading + virtualization:** feature routes code-split; heavy panels load on demand; library table virtualized where justified (UI-11/PERF-09).
- **Large-attachment handling:** attachments hashed and backed up via streamed I/O — no full-file memory reads; per-file size caps (OD-9).
- No unnecessary database duplication; evidence stays compact; indexing per measured query patterns (ARCHITECTURE §3.2/§6).
- Expensive work (transcription, decode, reindex, backup) never runs on the UI thread.
- **Memory cleanup:** temp files cleaned on completion/failure/cancel + startup sweep; attachment memory released after streamed operations; subprocess handles joined.
- Idle CPU budget (§3.1) backs these invariants with a number.

---

## 6. Measurement plan and cadence

| Milestone | What is measured |
|---|---|
| M0 | Baseline via the **process-tree script**: cold/warm startup, idle private bytes (full tree), installer/installed size — **baseline only, no pass/fail** |
| M1 | Shell delta vs M0 (proposed +10 MB guard), first-render time |
| M2 | FTS latency @ 100k + write overhead; DB size after seeding; WAL-vs-DELETE behavior record |
| M4 | Fetch budget verification (timeout/size/content-type caps); idle CPU unchanged |
| M5 | Library render p95 @ 10k |
| M6 | Candidate scan, merge transaction timing |
| M7 | Search p95 @ 10k + 100k; DB growth with corpus |
| M8 | RTF + peak private bytes per model on owner media (**separate workload rows**: engine + decode sidecar); transcript sizes; post-job residency; **OD-11 long-duration results** |
| M9 | Export/restore duration + backup size |
| M10 | Full suite consolidated; **every budget row gets Measured / Pass / Fail / N-A with the methodology applied**; misses documented with analysis and remediation proposals |

---

## 7. Explicit non-claims

- The 150 MB idle private-bytes target is **approved but not achieved** — it will be measured on the real application (full process tree) and reported as-is.
- No transcription performance or quality claim beyond the P1-C measured English-fixture tiers; long-duration, Urdu, Roman Urdu, and mixed-language behavior remain unknown pending OD-11 fixtures.
- FTS5 figures at 100k scale do not exist yet; the carried ≤50 ms p95 is a planning target, not a result.
- All Proposed budgets are proposals pending OD-7 approval; until approved they are measurement/reporting targets, not gates.
- Acceptance criteria will not be weakened to convert a miss into a pass.
- **Trade-off statement:** budgets exist to keep TechVault usable on modest hardware, not to starve quality. Where a budget and product quality conflict (e.g., virtualization complexity vs a 10k-row render target, or a RAM gate vs a legitimate large-media workflow), the conflict is documented with the measured number and a remediation proposal — the owner decides. Product quality is never silently traded for a smaller number, and a budget is never silently loosened to pass.

---

**End of PHASE_2_PERFORMANCE_BUDGET.md**
