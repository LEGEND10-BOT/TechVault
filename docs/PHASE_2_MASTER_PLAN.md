# TechVault Phase 2 Master Plan — Core Application

**Document status:** Revision 1.3 (2026-11-14, complete recommendation integration + final readiness pass). Draft blueprint for owner review; **no Phase 2 implementation is authorized or performed by this document.**
**Revision 1.3 changes:** every recommendation integrated as actionable specification (milestones restructured to the twelve-field format); traceability matrix and final readiness report added as companion documents; `resource_tags` added to schema v1 as a [P2R] proposal; import-format matrix with explicit unsupported-format boundaries; safe archive extraction with zip-bomb protection; Whisper minimum-hardware guidance and resource fallback; worker lifecycle/cache/lazy-loading invariants; five named performance workloads; Phase 2 / Phase 3 AI boundary documented. Requirement IDs (ARCH/SEC/PERF/UI/TEST-xx) defined in the traceability matrix.
**Revision 1.2 changes:** all OD recommendations recorded as **Proposed** in `DECISION_LOG.md` §5 — none converted to approved; readiness corrected (M0/M1 **not unconditionally ready** while OD-6/OD-8 are Proposed; OD-2/OD-3 confirmed as M8-only decisions); production vs development CSP policies separated with automated configuration checks; explicit M1 accessibility test plan.
**Revision 1.1 changes:** all twelve open decisions finalized with recommended decisions; three storage categories with an attachments model; Whisper design fixed to the CLI subprocess with explicit persistence/cancellation semantics and the no-bundling model policy; FFmpeg sidecar adopted as the audio-decode direction pending a licensing audit; SSRF mechanism specified concretely; schema decisions carry provenance classifications; in-house Svelte primitives; hardened backup format; process-tree performance methodology; milestone readiness matrix.
**Authority basis:** `DEVELOPMENT_ROADMAP.md` §6, `MASTER_BRAIN.md` Part O, `PHASE_HANDOFF.md`, `DECISION_LOG.md` D-001..D-021, the 2026-11-14 owner corrections directive, adopted reference designs R-023/R-024.

### Companion documents

| Document | Content |
|---|---|
| `docs/PHASE_2_ARCHITECTURE.md` (Rev 1.3) | Detailed technical blueprint (application, database, ingestion, Whisper transcription, SSRF mechanism, security, UI, Phase 2/3 boundary) |
| `docs/PHASE_2_MILESTONES.md` (Rev 1.3) | M0–M10 in the twelve-field format: objective, scope, tasks, dependencies, security/performance considerations, tests, acceptance criteria, exit gate, deferred work, OD references |
| `docs/PHASE_2_OPEN_DECISIONS.md` (Rev 1.2) | OD-1..OD-12 finalized: recommended decision, reason, benefits, trade-offs, security/perf impact, milestone impact, acceptance criteria, approval status |
| `docs/PHASE_2_PERFORMANCE_BUDGET.md` (Rev 1.3) | Process-tree methodology, five named workloads, approved targets, proposed budgets, lightweight-operation invariants |
| `docs/PHASE_2_DEPENDENCY_REVIEW.md` (Rev 1.2) | Milestone-scoped dependency review with licensing and overlap analysis |
| `docs/PHASE_2_TRACEABILITY_MATRIX.md` (Rev 1.0) | Full requirement traceability: ODs, recommendations, ARCH/SEC/PERF/UI/TEST requirements → milestones, tests, statuses, approval dependencies |
| `docs/PHASE_2_FINAL_READINESS_REPORT.md` (Rev 1.0) | Final engineering readiness assessment across all domains with the six-state classification |

---

## 1. Repository baseline (verified 2026-11-13, re-verified 2026-11-14)

- **Git:** branch `main`, HEAD `37a71c4`, no remote configured; the only working-tree changes are this planning mission's documents (uncommitted per directive).
- **Production tree:** `src/`, `src-tauri/`, `tests/` remain `.gitkeep`-only placeholders. Phase 2 starts from a verified greenfield scaffold.
- **Pre-existing Phase 2 assets:** R-023 configuration files (`config/api/*`), adopted reference designs, validated Phase 1 pins (Tauri 2.12.x, rusqlite 0.32.x, whisper.cpp @ `371b5a7`, sigma/graphology for Phase 4).
- **Brand assets:** `assets/logo/` still empty (P0-T08). Phase 2 uses a **neutral placeholder** and integrates the exact owner-provided asset when delivered — never an approximation (OD-1).

## 2. Inherited context that Phase 2 must preserve

### 2.1 Approved decisions with direct Phase 2 bearing

| Decision | Bearing |
|---|---|
| D-001 | Desktop-first; core logic UI-independent; Android work deferred (P1-B DEFERRED, P1-D HELD) |
| D-002 | Transcripts saved by default, user-deletable; no permanent original-video storage |
| D-003/D-004 | OpenRouter default direction; providers stay disabled in Phase 2 (R-023 placeholders only) |
| D-005 | Managed API access design-only/later — no gateway, keys, or calls in Phase 2 |
| D-006/D-007 | No cloud sync; export/import is the portability path (M9) |
| D-008/D-009 | Discovery-type discipline in the data model; AI suggestions are Phase 3; license inventory maintained |
| D-011/D-012 | Approved design system; logo verbatim-only (files pending — OD-1) |
| D-015 | B2 adapter tiers govern ingestion priority |
| D-016 | Local transcription foundation is Phase 2 scope |
| D-019 | Private bytes primary, 150 MB idle target; credential-incident rules; D-drive policy |
| D-020 | R-023 + R-024 adopted as Phase 2 reference designs |
| D-021 | Gate-1 closed with explicit deferrals, carried below |

### 2.2 Measured Phase 1 evidence Phase 2 builds on

| Evidence | Value | Phase 2 use |
|---|---|---|
| P1-A IPC | 1.60 ms median | Typed-command envelope headroom |
| P1-A idle RAM (PoC shell) | 135.97 MB private | Baseline context only — **not transferable to the full app**; re-measured per the OD-7 process-tree methodology |
| P1-A startup/installers | 74.5 ms warm; 1.51–2.23 MB | Budget headroom |
| P1-F invariants | 9/9 (URL-identity dedup, transactional merge/undo, no verification upgrade, guarded migrations, FTS5 triggers) | Mechanism regression backbone — **validates the mechanisms, not every schema choice** (provenance rule introduced in Rev 1.1, retained in Rev 1.2) |
| P1-F FTS5 | 0.005–0.009 ms @ 5k/20k | 100k scale unmeasured → measured in M2/M7 |
| P1-C Whisper | RTF tiny 0.234 / base 0.292 / small 0.892 / **medium 2.589**; peak private 681–2583 MB — **short English fixture, tested hardware only; not general guarantees** | Model-card disclosure + separate-workload budgets |
| P1-C gaps | A5 end-to-end cancellation, long-fixture RTF, Urdu untested | **M8 closure gates** (OD-11): long-duration, cancellation/recovery, Urdu + English + mixed fixtures required |
| P1-E playback | MP4/WebM OK in WebView2; HEVC/OGG unsupported; YT IFrame detection works | `playback_type` metadata; player UI stays Phase 4 |
| P1-I carry-forwards | CSP null, unused grants, unbounded payloads | Closed in M0/M1/M4/M10 |

## 3. Phase 2 objective and scope

**Objective (roadmap §6):** the first usable local desktop application — shell, database foundation, source management, resource library, identity/deduplication, local transcription foundation, backup/export foundation, search — with tested data integrity.

**Exit criteria (roadmap §6):** core workflows function; resource data persists; duplicate handling is safe; critical integrity tests pass; owner approves Phase 3.

### In scope

1. Application shell (navigation, themes, in-house primitives, settings shell, neutral logo placeholder).
2. Database foundation (schema v1 incl. attachments, migrations with failure/recovery, repositories, transactions, FTS5 skeleton, WAL gated by tests).
3. Source management (pasted text; local files with the save-as-attachment choice; **YouTube URLs recorded with user-provided transcript/audio import**; status lifecycle; duplicate-submission handling).
4. Web ingestion Tier 1a (generic websites + GitHub public) behind the concrete SSRF mechanism.
5. Resource library (records, categories, verification display, aliases, **attachments**, evidence viewer).
6. Identity and deduplication (identifier-based candidates, review queue, transactional merge/undo/history).
7. Search and filters (FTS5).
8. Whisper transcription foundation (CLI subprocess, FFmpeg sidecar decode, model catalog with consent/checksums/disclosure/inventory/removal, final-segment persistence, safe cancellation, temp cleanup, per-job monitoring).
9. Backup/export foundation (versioned archive incl. attachments, atomic creation, validated restore).
10. Hardening and performance validation (process-tree methodology, separate workloads, security closure).

### Explicitly out of scope (Phase 3+ unless re-authorized)

AI extraction/verification/suggestions; managed gateway; BYOK keychain; any live API call; **automated YouTube ingestion** (OD-5 deferral); notebooks/graph/player/bookmarks/analytics UIs; Android execution; release signing/updater; database encryption; partial-transcript persistence (pending engine-interface evidence + owner decision); models larger than Medium.

## 4. Phase 1 carryovers that Phase 2 inherits

| Carryover | Status | Phase 2 treatment |
|---|---|---|
| Logo asset files (P0-T08) | Owner input pending | Neutral placeholder; verbatim integration on delivery; **does not block the shell** (OD-1) |
| P1-C A5 cancellation end-to-end + long-fixture RTF | NOT RUN | **M8 closure gates (OD-11)**: long-duration, cancellation/recovery, and Urdu/mixed fixtures required before M8 closes |
| Urdu / Roman Urdu / mixed quality | **Not proven** (short English baseline only) | No quality claims anywhere; honest labeling until fixtures are tested |
| P1-G live API benchmark | LATER (D-019) | Phase 3 input; no Phase 2 dependency |
| P1-E A4 curated URLs | PARTIAL (optional) | Informs adapter capability reporting when supplied |
| P1-A file-picker click-through | NOT RUN (owner action) | Phase 1 record; unrelated to Phase 2 code |
| Exposed OpenRouter key | Owner security action (OD-12) | Gates Phase 3 live work; no Phase 2 dependency |
| P1-I carry-forwards | Assigned to production | Closed within M0/M1/M4/M10 |
| 150 MB idle-RAM target | Approved (D-019) | Re-measured on the real app with the OD-7 process-tree methodology; **not claimed achieved** |
| SQLite WAL concurrency | Untested in P1-F | Tested in M2 (concurrency + backup-under-WAL) before enabling |

## 5. Workstream blueprint summary (details in PHASE_2_ARCHITECTURE.md Rev 1.2)

**A. Application architecture** — layered Rust core; typed IPC envelope and error taxonomy; `job:*` events; in-process cancellable job runner with **defined partial-result semantics** (stage-level partials preserved; no partial-transcript persistence promised) and **cancellation consistency** (safe subprocess termination, temp cleanup, consistent DB); no background services or idle workers.

**B. Storage and database** — **three storage categories** (user-owned attachments retained until explicit deletion; temp processing files auto-cleaned with crash recovery; imported content with a defined SQLite-vs-file split); schema v1 with **provenance-classified decisions** ([AD]/[P1E]/[P2R]); identifier-based identity with explicit user-confirmed transactional merges; additive guarded migrations with defined failure/recovery; **WAL only after concurrency + backup tests**; no invented confidence scores.

**C. Ingestion** — capability-reporting adapter interface; Tier 3 first (including **YouTube URL records + user-provided transcript/audio import**); generic-website + GitHub adapters behind the **concrete SSRF mechanism** (fail-closed blocklist, pinned connections, per-hop redirect validation, credential-header stripping) with its limitations documented.

**D. Transcription** — **whisper.cpp CLI subprocess** behind an engine adapter; **FFmpeg sidecar decode** (16 kHz mono PCM WAV; LGPL build audit before distribution); **no bundled models**; catalog Base (default) / Small / Tiny / Medium with consent-gated checksummed downloads, pre-download disclosure, inventory/removal; final-segment persistence after success; **M8 closure gated on long-duration + cancellation/recovery + Urdu/English/mixed fixtures** (OD-11).

**E. Search** — FTS5 external-content indexes + relational filters; duplicate-detection hooks; related-resource schema prepared, AI population Phase 3.

**F. Security and reliability** — strict CSP; least-privilege capabilities; credential-free Phase 2; **explicit no-encryption-at-rest limitation**; versioned atomic backup with attachment integrity and validated restore; migration failure/recovery; secret-free logging (no user content, keys, or sensitive paths); milestone-scoped dependency adoption.

**G. UI/UX** — approved design system as real shell; **in-house accessible Svelte 5 primitives** (no heavy UI framework); every screen with designed states; neutral logo placeholder.

## 6. Milestone sequence summary

| # | Milestone | Depends on | Gate |
|---|---|---|---|
| M0 | Production scaffold and conventions | — (minimal deps) | **OD-6 approved (D-022)** — awaiting separate implementation authorization |
| M1 | Application shell and design system | M0 | **OD-6 (D-022) + OD-8 (D-023) approved** — awaiting M0 completion + separate implementation authorization |
| M2 | Database foundation and job lifecycle | M0 + **OD-4 schema-v1 approval** | BLOCKED until OD-4 approved |
| M3 | Sources Tier 3 + YouTube URL records | M2 | — |
| M4 | Web Tier 1a + SSRF matrix | M3 | Security review |
| M4b | Reddit/Medium (optional) | M4 | Owner call |
| M5 | Resource library + attachments | M2 | — |
| M6 | Identity and deduplication | M5 | P1-F invariant regression gate |
| M7 | Search and filters | M6 | Latency measurement |
| M8 | Whisper transcription foundation | M2/M3 + **OD-2/OD-3 approval** + OD-3 audit + **OD-11 fixtures** | BLOCKED until gates met (OD-2/OD-3 are **M8 decisions only**, not M0/M1 blockers) |
| M9 | Backup/export foundation | M2 | Owner restore drill |
| M10 | Hardening, performance validation, closure | all | **Phase 2 exit gate → owner approves Phase 3** |

**Readiness summary (updated 2026-11-14; details in PHASE_2_MILESTONES.md):** M0 and M1 are **technically ready and approval-gated-clear** — **OD-6 approved (D-022)** clears M0's gate and **OD-8 approved (D-023)** clears M1's; both milestones now await **separate implementation authorization** (explicitly not granted by the approvals), with M1 additionally requiring M0 completion. M2 remains gated by the OD-4 schema-v1 review; M8 remains gated by OD-2/OD-3 approval, the audio-decoding audit, engine-behavior verification, and the OD-11 multilingual/durability fixtures. Four-category readiness classification (technically ready / awaiting owner approval / blocked by another milestone / owner action required) is in the milestones document. **No implementation authorization is granted by this planning pass.**

## 7. Feature classification matrix

**IN** = implement now · **PA** = prepare now, implement later · **DE** = defer · **RJ** = reject unless new evidence.

| Feature | Class | Note |
|---|---|---|
| Shell, navigation, themes, settings shell, in-house primitives | IN | OD-8; OD-6 CSP |
| Logo integration | PA | OD-1 placeholder now; verbatim asset later; **not a shell blocker** |
| SQLite foundation, migrations, repositories, transactions, attachments model | IN | OD-4 provenance-gated |
| Job lifecycle with cancellation consistency | IN | ARCHITECTURE §2.6 |
| Sources Tier 3 (paste, local files with retention choice, YouTube URL records + user import) | IN | OD-5 |
| Web + GitHub adapters with the concrete SSRF mechanism | IN | ARCHITECTURE §4.5 |
| Reddit / Medium adapters | PA (M4b, owner call) | D-015 Tier 1 remainder |
| **Automated YouTube ingestion** | DE | OD-5 deferral until policy/reliability/technical review |
| Resource library, categories, detail, evidence viewer, attachments UI | IN | — |
| Verification status display | IN | Display only; automation Phase 3 |
| Mentions, identifier candidates, merge preview/undo/history | IN | Explicit user-confirmed merges only |
| Fuzzy/similarity matching | DE | P-008 golden-dataset evidence first |
| FTS5 search, filters, sorting | IN | — |
| Command palette (R-020) | PA | Proposed; owner-optional |
| Whisper foundation: CLI adapter, FFmpeg sidecar decode, model manager, consent downloads, transcript store, monitoring | IN | Gated: OD-3 audit (distribution) + OD-11 fixtures (closure) |
| **Partial-transcript persistence / streaming** | DE | Directive §2.B — not promised until engine-interface evidence; future owner decision |
| Models larger than Medium | DE | OD-10 |
| Android transcription (P1-D) | DE | Owner hold |
| Backup/export (versioned archive incl. attachments) | IN | Directive §4 hardened |
| Markdown/CSV export | PA | R-018 on demand |
| Provider configuration UI (disabled placeholders) | IN (structure only) | R-023 |
| Provider adapters / live API / managed gateway | DE | Phase 3; D-005/D-019 gates |
| Notebooks schema | PA (migration plan only) | Additive migration when Phase 4 starts |
| Knowledge graph UI / video player / bookmarks / analytics | DE | Phase 4 |
| sqlite-vec, DB encryption now, cloud sync, telemetry, stack replacement | RJ | P-013/P-014/D-006/P-028/R-022-untriggered |

## 8. Open decisions summary (all finalized — see PHASE_2_OPEN_DECISIONS.md Rev 1.2)

| ID | Recommended decision (documented 2026-11-14) | Status | Still required from owner |
|---|---|---|---|
| OD-1 | Neutral placeholder; exact asset later; not a shell blocker | Placeholder approach **explicitly authorized** (owner directive); full decision **Proposed** | Asset delivery |
| OD-2 | whisper.cpp CLI subprocess; binding only with measured justification | **Proposed** (M8 decision only) | Approval before M8 |
| OD-3 | FFmpeg sidecar + licensing audit (LGPL preferred; never silent GPL) | **Proposed** (M8 decision only) | Approval; build/audit review before bundling |
| OD-4 | Schema v1 with provenance; **final review before M2** | **Proposed — blocks M2** | **Review/approval — gates M2** |
| OD-5 | YouTube URL + user-provided transcript/audio; automated ingestion deferred | **Proposed** | Approval; future decision on automation |
| OD-6 | Strict CSP (dev/prod split + automated checks) | **Approved — D-022** | Separate implementation authorization |
| OD-7 | 150 MB target; complete-process-tree methodology; per-workload records | Target **Approved (D-019)**; methodology **Proposed** | Approval of methodology |
| OD-8 | In-house Svelte 5 primitives; no heavy UI framework | **Approved — D-023** | Separate implementation authorization |
| OD-9 | Type-specific limits; archive-bomb protection; safe parsing | **Proposed** | Approval (defaults adjustable) |
| OD-10 | No bundled models; Base default; Small/Tiny/Medium options | **Proposed** | Approval |
| OD-11 | M8 closure requires long-duration + cancellation/recovery + Urdu/English/mixed fixtures | **Proposed — gates M8 closure** | **Fixture supply (owner action)** |
| OD-12 | Owner revokes exposed key; API activation stays blocked | Owner security action (standing) | **Owner revocation action** |

No recommendation takes effect as an approved decision until separately recorded as Approved in `DECISION_LOG.md`; all twelve are recorded there as **Proposed** (2026-11-14). Owner approval is never invented.

## 9. Performance posture (details in PHASE_2_PERFORMANCE_BUDGET.md Rev 1.2)

- **Methodology (OD-7):** private bytes primary (D-019), measured over the **complete application process tree** (main process + WebView2 children); **idle, startup, search, and transcription recorded as separate workloads**; engine/decode subprocess memory never folded into idle budgets. Acceptance criteria are not weakened to pass targets.
- Approved target: **≤150 MB idle private bytes** — re-measured on the real app; **not claimed achieved**.
- Proposed budgets (OD-7): idle CPU ≤1% (10-min soak); warm start ≤1.5 s; cold ≤3 s (carried); FTS p95 ≤50 ms @100k (carried) and ≤10 ms @10k (proposed); write overhead ≤5 ms p95 (carried); transcription per-model separate-workload budgets from measured tiers; background limits 1 transcription job / ≤2 light jobs / bounded queues / zero idle polling.
- Separate-budget operations: transcription, bulk indexing, model downloads, export/restore, decode sidecar — and graph rendering in Phase 4 (R-008 caps).

## 10. Dependency posture (details in PHASE_2_DEPENDENCY_REVIEW.md Rev 1.2)

- **Milestone-scoped adoption** (directive §2.F): M0 ships minimal; the file-dialog plugin waits for M3; HTTP stack waits for M4; FFmpeg sidecar waits for M8 (audit-gated). Every entry documents purpose, milestone, license, maintenance, platform impact, and existing-dependency overlap.
- In-house UI primitives per OD-8 (bits-ui/melt-ui not adopted).
- License inventory from M0 feeds the D-009 decision; FFmpeg's LGPL/GPL handling is the one license-sensitive item and is explicitly gated.
- Supply-chain controls: lockfiles, pins, audits, minimal feature flags, least-privilege capabilities.

## 11. Testing approach

Layers per `TESTING_STRATEGY.md` §3; the P1-F suite ported as the mechanism regression backbone (with the caveat introduced in Rev 1.1 and retained in Rev 1.2: it validates mechanisms, not the whole schema); every milestone defines automated + owner manual tests; failures reported honestly; **M8 closure additionally requires the OD-11 fixture suite**; performance criteria never weakened.

## 12. Definition of done for Phase 2

1. Roadmap §6 exit criteria met with evidence. 2. Every milestone's acceptance criteria pass with recorded results — including the M8 closure gates. 3. M10 performance report shows measured values against OD-7 budgets with the methodology applied (misses documented, not redefined). 4. Security carry-forwards closed; FFmpeg audit record present before any bundled distribution. 5. Documentation updated; Phase 2 handoff prepared. 6. Known limitations listed (no encryption at rest; no partial-transcript persistence; language-quality status per OD-11 results; all carried Phase 1 deferrals). 7. Owner reviews closure and approves Phase 3.

## 13. Restrictions honored by this plan

Documentation only. No production code; no dependency installation/upgrade/removal; no migrations or production schema; no model downloads; no API activation or provider calls; no secrets; no commits/pushes/amends; Phase 1 evidence and approved decisions preserved; branch and working-tree state preserved (only planning documents modified); no incomplete Phase 1 test marked PASS; **recommendation-vs-approval semantics preserved** — OD-1..OD-12 remain **Proposed** in `DECISION_LOG.md` (only the OD-1 neutral-placeholder interim approach is explicitly owner-authorized), and no recommendation is converted into an approval by documentation, repetition, or implementation.

---

**End of PHASE_2_MASTER_PLAN.md**
