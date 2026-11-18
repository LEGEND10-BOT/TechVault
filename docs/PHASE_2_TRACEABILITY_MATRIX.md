# TechVault Phase 2 Traceability Matrix

**Document status:** Rev 1.0 (2026-11-14, final integration pass). Planning-stage traceability — statuses reflect the planning state; **§10 (added 2026-11-14) records the M0 implementation status update** for the M0-assigned rows only, after the owner's separate M0 authorization.
**Purpose:** map every open decision, recommendation, architecture/security/performance/UI/testing requirement, and milestone acceptance criterion into one verified table with unique identifiers, sources, milestone assignments, required evidence, statuses, and approval dependencies.
**Status vocabulary (strict):** **Proposed** (recommendation awaiting separate owner approval — OD-tied items carry their **recorded ruling status** per D-022/D-023/D-026; only items without a recorded ruling remain Proposed) · **Approved** (grounded in an approved decision D-xxx or measured Phase 1 evidence, cited) · **Implemented** (**unused in this document — no production code exists**) · **Verified** (**unused — no test evidence exists for Phase 2**) · **Deferred** (later phase, explicitly recorded) · **Blocked** (gated by an unapproved OD or an unfinished milestone). Nothing may be labeled Implemented or Verified without repository evidence.
**ID scheme:** `OD-nn` open decisions · `R-nnn` decision-log recommendations · `ARCH-nn` architecture · `SEC-nn` security · `PERF-nn` performance · `UI-nn` UI/UX · `TEST-nn` testing · `M n` milestones (exit gates in §9).

---

## 1. Open decisions (OD-1..OD-12)

**Status (2026-11-14, D-022/D-023/D-026):** OD-6 **Approved (D-022)** · OD-8 **Approved (D-023)** · OD-4 **Approved WITH AMENDMENTS (D-026)** · OD-7 methodology **Approved (D-026; target D-019)** · OD-9's **M1 intake subset Approved (DP-07/D-026: 100 MB media / 20 MB documents / 5 MB pasted text + logged overrides)** — OD-9's archive-intake and HTTP-response subsets remain **Proposed** (not covered by the ruling; they attach to post-M1 work). The per-row statuses below reflect these rulings; historical "Proposed" wording elsewhere in this document is preserved provenance.

| ID | Requirement (recommended decision) | Source | Doc § | Milestone | Required test/evidence | Status | Approval dependency |
|---|---|---|---|---|---|---|---|
| OD-1 | Neutral placeholder branding; verbatim asset integration later; non-blocking | Owner directive 2026-11-14 (placeholder explicitly authorized); D-012 | OPEN_DECISIONS OD-1; ARCH §8.4 | M1 | Neutral placeholder visible; on delivery: files committed unchanged + owner visual check | **Placeholder: Approved (explicit directive). Full integration: Proposed. Asset delivery: owner action** | Asset delivery |
| OD-2 | whisper.cpp CLI subprocess behind replaceable engine adapter; free local inference; no paid API | Owner directive; P1-C evidence; R-007/R-024 | ARCH §5.1; MILESTONES M8 | M8 | Mock-engine tests + real pinned-CLI integration; cancel/temp/DB-consistency tests | **Proposed** | Owner approval before M8 |
| OD-3 | FFmpeg optional sidecar → 16 kHz mono PCM WAV; LGPL audit before distribution; alternatives defined | Owner directive; P-006 | ARCH §5.6; DEP_REVIEW §4.1 | M8 | Decode suite; malformed/oversized negatives; audit record before bundling | **Proposed** | Owner approval + audit review |
| OD-4 | Schema v1 with provenance ([AD]/[P1E]/[P2R]); reversible guarded migrations + recovery; backup compatibility; WAL gated | Owner directive; DATABASE_DESIGN §27; P1-F | ARCH §3; DATABASE_DESIGN | M2 (blocks) | Migration suite incl. failure/recovery; WAL concurrency + backup-under-WAL tests; P1-F invariant port | **Approved WITH AMENDMENTS (D-026)** — schema gate cleared; implementation separately unauthorized | — (approval recorded) |
| OD-5 | YouTube URL records + user-provided transcript/audio import; automated ingestion deferred | Owner directive | ARCH §4.2/4.3; MILESTONES M3 | M3 | URL-record + user-import flows; zero automated-YouTube code | **Proposed** | Owner approval; future decision on automation |
| OD-6 | Strict production CSP + separately restricted dev CSP + automated validation | Owner directive; P1-I carry-forward; **approved D-022 (2026-11-14)** | ARCH §7.3 | M0, M1, M10 | `check-csp` script; devtools negative checks; both configs tested | **Approved (D-022)** — implementation NOT VERIFIED until M0 tests run | — (approval recorded) |
| OD-7 | 150 MB idle private-bytes target (D-019) + process-tree methodology + five named workloads + bounded workloads | D-019 (target Approved); owner directive (methodology) | PERF_BUDGET §1/§3.1 | M0, M10 | Measurement scripts; per-workload rows in M10 report | **Target: Approved (D-019). Methodology: Approved (D-026) — enforceable gates** | — (approval recorded) |
| OD-8 | Lightweight in-house Svelte 5 primitives; accessibility tested, not described | Owner directive; D-011; **approved D-023 (2026-11-14)** | ARCH §8.3; MILESTONES M1 | M1 | Per-primitive a11y suites + manual keyboard walkthrough + screen-reader smoke test | **Approved (D-023)** — implementation NOT VERIFIED until M1 tests run | — (approval recorded) |
| OD-9 | Type-specific size limits, archive-bomb protection, validation-first parsing, temp lifecycle | Owner directive; P-027 | ARCH §4.6/§7.4 | M3, M4, M8, M9 | Limit matrix tests; zip-bomb negative; malformed-input negatives | **M1 intake subset Approved (DP-07/D-026: 100 MB media / 20 MB documents / 5 MB pasted text + logged overrides); archive-intake and HTTP-response subsets Proposed** | archive/HTTP subsets: owner approval with post-M1 work |
| OD-10 | No bundled models; Base default; Tiny/Small/Medium options; consent-gated checksummed downloads; inventory/removal | Owner directive; MASTER_BRAIN F2 | ARCH §5.2 | M8 | Consent negative test; checksum mismatch test; disclosure accuracy; removal test | **Proposed** | Owner approval |
| OD-11 | M8 closure requires long-duration, cancellation/recovery, Urdu + English + mixed fixtures/tests | Owner directive | ARCH §5.3; MILESTONES M8 | M8 | Fixture suite executed + recorded honestly | **Proposed; fixture supply = owner action — blocks M8 closure** | Fixtures + threshold decisions |
| OD-12 | Owner revokes exposed key; providers disabled; activation blocked until secure config + explicit approval | D-019/D-021; SECURITY §6.4 | ARCH §7.2/§11 | n/a (Phase 3 gate) | Owner revocation confirmation; zero-credential scan | **Owner action (standing)** | Owner action |

## 2. Decision-log recommendations (R-001..R-025) — Phase 2 dispositions

| ID | Recommendation | Phase 2 disposition | Status |
|---|---|---|---|
| R-001 | Tauri 2 desktop shell | Adopted (M0); validated P1-A | Approved (P1-A evidence) |
| R-002 | Rust UI-independent core | Adopted (M0/M2 layering) | Approved (P1-A/P1-F evidence) |
| R-003 | Svelte 5 + Vite + strict TS | Adopted (M0); validated P1-A | Approved (P1-A evidence) |
| R-004 | SQLite + FTS5 | Adopted (M2/M7); validated P1-F | Approved (P1-F evidence) |
| R-005 | Separate Resource/Mention entities | Adopted (schema v1, M2/M6) | Approved (P1-F evidence) |
| R-006 | Permanent merge history + undo | Adopted (M6) | Approved (P1-F evidence) |
| R-007 | whisper.cpp local transcription | Adopted (M8, CLI per OD-2) | Approved direction (R-007); OD-2 Proposed |
| R-008 | Sigma.js + Graphology | Phase 4 stack; pins recorded; no Phase 2 work | Deferred (R-008 ADOPT verdict, P1-H) |
| R-009 | OS secure credential storage (BYOK) | Phase 3; boundary documented now | Deferred (Proposed) |
| R-010 | Managed server-side API gateway | Later phase; no Phase 2 work | Deferred (Proposed; D-005) |
| R-011 | Embeddings out of initial release | Honored — sqlite-vec/embeddings rejected (P-013) | Approved direction (honored) |
| R-012 | Capability-based playback backends | `playback_type` metadata captured (M3/M4); player UI Phase 4 | Deferred (UI); metadata Approved |
| R-013 | Golden dataset for extraction regression | Dataset v0 + harness exist (P1-G); live metrics Phase 3 input | Deferred (live run, D-019) |
| R-014 | Data Egress Ledger | No Phase 2 work; recorded in SECURITY §15 | Deferred (Proposed) |
| R-015 | First-run Local/Cloud/No-AI choices | Phase 3; cloud-consent posture documented | Deferred (Proposed) |
| R-016 | Connectors disconnected until authorized | No connectors in Phase 2; posture carried | Deferred (Proposed security requirement) |
| R-017 | Simplified mobile graph | Phase 4/Android track | Deferred |
| R-018 | Markdown/JSON/CSV export | JSON archive ships (M9); MD/CSV drafted only | Partially deferred (PA) |
| R-019 | Backup and restore | Adopted (M9) | Approved direction (D-007) |
| R-020 | Command palette | Owner-optional M7 add-on | Proposed (PA) |
| R-021 | Per-feature resource budgets | Adopted (PERFORMANCE_BUDGET) | Approved direction (OD-7 methodology Proposed) |
| R-022 | Flutter fallback if Tauri Android fails | Contingency untriggered; P1-B deferred | Not applicable |
| R-023 | API configuration structure | Adopted Phase 2 reference design (D-020): placeholders in M1/M2 | Approved (D-020 adoption; providers disabled) |
| R-024 | Whisper Core plan | Adopted Phase 2 reference design (D-020): governs M8 | Approved (D-020 adoption; OD-2/3/10/11 Proposed) |
| R-025 | P1-C/P1-D resolution | Resolved — D-020 Option A executed; P1-D held | Closed (D-020/D-021) |

## 3. Architecture requirements (ARCH-01..25)

| ID | Requirement | Source | Doc § | Milestone | Test/evidence | Status | Approval dep |
|---|---|---|---|---|---|---|---|
| ARCH-01 | Layered Rust core (commands/application/domain/infrastructure); domain framework-free | ARCHITECTURE.md §4 | P2 ARCH §2.2 | M0, M2 | Code review + clippy; unit tests run without UI | Proposed | — |
| ARCH-02 | Typed IPC envelope + 11-category error taxonomy | ARCH §14 | P2 ARCH §2.4 | M0 | TEST-01 contract round-trip | Proposed | — |
| ARCH-03 | Job model: C6 states, progress events, cancellation, retry idempotency, crash recovery | MASTER_BRAIN C6/C7; ARCH §9 | P2 ARCH §2.6 | M2 | TEST-07 | Proposed | — |
| ARCH-04 | No background services, no idle workers, no polling; bounded queues | AGENTS §11; directive §4 | P2 ARCH §2.1/2.6/2.8 | M0, M2, M10 | Soak test (idle CPU + residency) | Proposed | — |
| ARCH-05 | Frontend performs no network fetches; network only in Rust core | SECURITY §16/§17 | P2 ARCH §1/§7.3 | M0 | `check-csp` + devtools negatives | Proposed | — |
| ARCH-06 | rusqlite bundled; FK ON per connection; busy_timeout | P1-F evidence; P-012 | P2 ARCH §3.1 | M2 | FK-violation rejection tests | Approved (mechanism P1-F) | — |
| ARCH-07 | Schema v1: Phase 2 entities incl. `attachments` + `resource_tags` | DATABASE_DESIGN; directive §2.A | P2 ARCH §3.2 | M2 | Migration suite; schema-conformance review vs OD-4 approval | Proposed | **OD-4** |
| ARCH-08 | Provenance classification on every schema decision ([AD]/[P1E]/[P2R]) | Owner directive §2.E | P2 ARCH §3.2 | M2 | OD-4 review record | Proposed | **OD-4** |
| ARCH-09 | Identity via strong identifiers only; no similarity auto-merge; no invented confidence | MASTER_BRAIN D4; directive §2.E | P2 ARCH §3.3 | M6 | Extended invariant suite | Approved (mechanism P1-F; scope directive) | — |
| ARCH-10 | Transactional merge: snapshot → re-point → `merged_into` → history; exact undo; immutable history | P1-F; DATABASE_DESIGN §13 | P2 ARCH §3.4 | M6 | TEST-02 extended suite; property test | Approved (mechanism P1-F) | — |
| ARCH-11 | Additive guarded migrations; failure = rollback + typed error + restore guidance; pre-altering-migration backup | P1-F; directive §2.E | P2 ARCH §3.5 | M2 | TEST-03 incl. injected failure | Approved (mechanism P1-F); recovery behavior Proposed | — |
| ARCH-12 | WAL enabled only after concurrency AND backup-under-WAL tests | Owner directive; P-012 | P2 ARCH §3.6 | M2 | Both test results recorded; fallback = DELETE journal | Proposed | — |
| ARCH-13 | Three storage categories; attachment lifecycle independent of cleanup; SQLite-vs-file split | Owner directive §2.A | P2 ARCH §3.7 | M3, M5, M9 | Retention-choice flows; cleanup-never-touches-attachments test | Proposed | **OD-4 (attachments entity)** |
| ARCH-14 | Adapter trait with explicit capability reporting | ARCH §7.2 | P2 ARCH §4.1 | M3, M4 | Capability-report unit tests | Proposed | — |
| ARCH-15 | Tier 3 adapters incl. YouTube URL records + user transcript/audio import | D-015; OD-5 | P2 ARCH §4.2/4.3 | M3 | M3 acceptance flows | Proposed | **OD-5** |
| ARCH-16 | Web + GitHub public adapters behind the SSRF pipeline | D-015 Tier 1 | P2 ARCH §4.3 | M4 | TEST-05 + real-URL manual pass | Proposed | — |
| ARCH-17 | Import-format matrix; unsupported → typed `Unsupported`; failed-import recovery | Owner directive §8 | P2 ARCH §4.6 | M3 | Unsupported-format negatives; no-orphan-temp tests | Proposed | — |
| ARCH-18 | Whisper CLI subprocess engine adapter; replaceable; no paid API; no Python/PyTorch | OD-2; R-007/R-024 | P2 ARCH §5.1 | M8 | TEST-10 mock + real integration | Proposed | **OD-2** |
| ARCH-19 | FFmpeg sidecar decode → 16 kHz mono PCM WAV; separate from engine | OD-3; P-006 | P2 ARCH §5.6 | M8 | Decode suite; audit record | Proposed | **OD-3** |
| ARCH-20 | Model manager: registry, consent-gated downloads, checksums, disclosure, inventory/removal; nothing bundled; outside app dir | OD-10; MASTER_BRAIN F2 | P2 ARCH §5.2 | M8 | Consent negative; checksum mismatch; removal test | Proposed | **OD-10** |
| ARCH-21 | Final-segment persistence after success only; no partial-transcript promise; cancellation consistency | Owner directive §2.B | P2 ARCH §5.4 | M8 | Cancel mid-run tests; DB-consistency checks | Proposed | — |
| ARCH-22 | FTS5 external-content tables + trigger sync | P1-F; DATABASE_DESIGN §20 | P2 ARCH §3.2/§6 | M2, M7 | TEST-04 sync + latency harness | Approved (mechanism P1-F) | — |
| ARCH-23 | Versioned backup archive; atomic creation; validated restore; attachment integrity; interrupted-operation recovery | D-007; directive §4 | P2 ARCH §7.4 | M9 | TEST-08 roundtrip + interruption + malformed | Proposed | — |
| ARCH-24 | Phase 2 / Phase 3 AI boundary; provider registry swappable; local-first independence | D-003/D-004/D-019; R-023 | P2 ARCH §11 | all | Zero-live-call verification; placeholder-only configs | Approved boundary (D-021 §3) | — |
| ARCH-25 | Provider configs present and enforced-disabled (R-023 placeholders) | R-023; D-021 §3 | P2 ARCH §3.2/§7.2 | M1, M2 | Seed records `enabled=false` verified | Approved (D-020/D-021) | — |

## 4. Security requirements (SEC-01..20)

| ID | Requirement | Source | Doc § | Milestone | Test/evidence | Status | Approval dep |
|---|---|---|---|---|---|---|---|
| SEC-01 | Strict production CSP (no remote origins, no unsafe-eval, minimal connect-src) | OD-6; P1-I; **D-022** | P2 ARCH §7.3 | M0, M10 | `check-csp` + devtools negatives on production build | Approved (D-022) — implementation pending | — |
| SEC-02 | Dev CSP restricted; dev allowances never in production | OD-6; directive §3; **D-022** | P2 ARCH §7.3 | M0, M1 | `check-csp` isolation assertions | Approved (D-022) — implementation pending | — |
| SEC-03 | Automated CSP configuration check | OD-6; directive §3; **D-022** | P2 ARCH §7.3 | M0, M1, M10 | Script committed + passing | Approved (D-022) — implementation pending | — |
| SEC-04 | Least-privilege capabilities; zero unused grants | P1-I; SECURITY §16 | P2 ARCH §2.2/§7.7 | M0, M3 | Capability audit vs used APIs | Approved requirement (P1-I carry-forward) | — |
| SEC-05 | Typed IPC with validated structured payloads | ARCH §14 | P2 ARCH §2.4 | M0 | TEST-01 | Proposed | — |
| SEC-06 | Input validation on frontend and backend | SECURITY §25 | P2 ARCH §2.4/§4.4 | M3, M4 | Validation unit tests | Proposed | — |
| SEC-07 | Safe filesystem access; path-traversal protection; internal filenames | SECURITY §10/§12 | P2 ARCH §3.7/§7.4 | M3, M9 | Traversal negative tests | Proposed | — |
| SEC-08 | Full SSRF pipeline behind every fetch | SECURITY §8 | P2 ARCH §4.5 | M4 | TEST-05 | Proposed | — |
| SEC-09 | DNS rebinding/TOCTOU protection via **connection pinning** (validated `SocketAddr` is the actual connect target; no re-resolution) | Owner directive §5 | P2 ARCH §4.5 | M4 | TEST-05 rebinding simulation | Proposed | — |
| SEC-10 | Per-hop redirect validation; cross-origin credential-header stripping | SECURITY §8; directive §5 | P2 ARCH §4.5 | M4 | TEST-05 redirect cases incl. stripping verification | Proposed | — |
| SEC-11 | Fail-closed IPv4+IPv6 blocklist (loopback/private/link-local/multicast/reserved/metadata) | SECURITY §8; directive §5 | P2 ARCH §4.5 | M4 | TEST-05 IPv4+IPv6 cases | Proposed | — |
| SEC-12 | TLS hostname/certificate validation never disabled | SECURITY §7 | P2 ARCH §4.5 | M4 | Code review + rustls defaults | Approved requirement | — |
| SEC-13 | Timeouts, response-size caps, content-type allowlist | OD-9; SECURITY §8 | P2 ARCH §4.4 | M4 | Budget verification tests | Proposed | **OD-9** |
| SEC-14 | Safe archive extraction; zip-bomb protection (ratio/entries/depth/total size) | OD-9; directive §8 | P2 ARCH §7.4/§4.6 | M9 | Zip-bomb negative test | Proposed | **OD-9** |
| SEC-15 | Secret-free logs; no user content, keys, tokens, sensitive paths | SECURITY §20; directive §4 | P2 ARCH §2.5 | M0 | Log-scrubber tests; log review | Approved requirement | — |
| SEC-16 | No API keys in frontend; providers disabled; placeholder posture | R-023; D-021 §3 | P2 ARCH §7.2/§11 | M1, M2 | Bundle scan; config seed check | Approved (D-021) | — |
| SEC-17 | Model checksum verification against trusted registry | OD-10 | P2 ARCH §5.2 | M8 | Mismatch → typed error + discard | Proposed | **OD-10** |
| SEC-18 | No-encryption-at-rest documented accurately (no false claims) | P-014; directive §5 | P2 ARCH §7.1 | M9, M10 | Documentation review; no encryption claims in code/UI | Approved limitation statement | — |
| SEC-19 | Dependency and license audits | SECURITY §21; D-009 | P2 ARCH §7.7; DEP_REVIEW | M10 | cargo/npm audit reports; license inventory | Proposed | — |
| SEC-20 | Concrete negative-test suites for security boundaries | Owner directive §5 | P2 ARCH §4.5/§7.4 | M4, M9, M10 | TEST-05/TEST-06/TEST-08 suites green | Proposed | — |

## 5. Performance requirements (PERF-01..15)

| ID | Requirement | Source | Doc § | Milestone | Test/evidence | Status | Approval dep |
|---|---|---|---|---|---|---|---|
| PERF-01 | Idle ≤150 MB private bytes, full process tree | **D-019 (Approved)** | PERF §2 | M0, M10 | Process-tree measurement | **Approved (D-019)** — not claimed achieved | — |
| PERF-02 | Process-tree measurement methodology (main + WebView2 children) | Owner directive §4 | PERF §1 | M0 | Script committed | Proposed | **OD-7 methodology** |
| PERF-03 | Five named workloads measured separately (W1 idle / W2 browsing / W3 search / W4 transcription / W5 import-export) | Owner directive §6 | PERF §3.1 | M0–M10 | Per-workload rows in reports | Proposed | **OD-7** |
| PERF-04 | Idle CPU ≤1% avg over 10-min soak | Directive §6 | PERF §3.1 | M0, M10 | Soak script | Proposed | **OD-7** |
| PERF-05 | Cold ≤3 s (carried) / warm ≤1.5 s (proposed) startup | F1-01 A2; directive §6 | PERF §3.1 | M0, M10 | Startup script ≥5 runs | Cold: Approved planning target; warm: Proposed | — |
| PERF-06 | Search p95 ≤10 ms @10k / ≤50 ms @100k (carried) | F1-04 A8 | PERF §3.1 | M2, M7, M10 | FTS harness | Carried target Approved; 100k unmeasured | — |
| PERF-07 | FTS write overhead p95 ≤5 ms/row (carried) | F1-04 A9 | PERF §3.1 | M2, M10 | Trigger timing | Carried target Approved | — |
| PERF-08 | Worker lifecycle (spawn/join per job); bounded queues and caches; no polling | Directive §6 | P2 ARCH §2.8; PERF §5 | M2, M10 | Soak residency + queue-bound tests | Proposed | — |
| PERF-09 | Lazy loading + virtualized lists where justified | Directive §6 | P2 ARCH §2.8 | M1, M5 | Bundle-per-route check; render harness | Proposed | — |
| PERF-10 | Large-attachment handling via streamed I/O | Directive §6 | P2 ARCH §3.7; PERF §5 | M3, M5, M9 | Streamed-hash tests; memory profile | Proposed | — |
| PERF-11 | Transcription as separate workload rows; per-model RAM gates; decode sidecar own row | OD-7/OD-9; directive §6 | PERF §3.3 | M8, M10 | Per-job monitor records | Proposed | **OD-7/OD-9** |
| PERF-12 | Installer ≤60 MB / installed ≤120 MB (K3 ranges); nothing bundled | MASTER_BRAIN K3; OD-10 | PERF §3.2 | M0, M8, M10 | Build artifacts recorded | Approved planning range | — |
| PERF-13 | DB growth ≤50 MB @10k-resource library excl. transcripts | Directive §6 | PERF §3.2 | M7, M10 | Seeded-corpus measurement | Proposed | **OD-7** |
| PERF-14 | Export/restore ≤60 s @10k incl. attachments | Directive §6/§8 | PERF §3.1 | M9, M10 | M9 harness | Proposed | **OD-7** |
| PERF-15 | Acceptance criteria never weakened to pass | Owner directive §6 | PERF §7 | M10 | Report review — misses documented | Approved rule (directive) | — |

## 6. UI/UX requirements (UI-01..16)

| ID | Requirement | Source | Doc § | Milestone | Test/evidence | Status | Approval dep |
|---|---|---|---|---|---|---|---|
| UI-01 | 220 px sidebar + 56 px topbar shell; 8-item navigation | D-011; MASTER_BRAIN H | P2 ARCH §8.1 | M1 | Owner visual acceptance | Approved direction (D-011) | — |
| UI-02 | Dark-primary default + persisted light/dark | D-011/D-013 | P2 ARCH §8.1 | M1 | Theme persistence test | Approved direction (D-011) | — |
| UI-03 | Design tokens, typography, radius per UI_DESIGN_SYSTEM | D-011 | P2 ARCH §8.1 | M1 | Token conformance review | Approved direction (D-011) | — |
| UI-04 | In-house Svelte 5 primitives (Tailwind + Lucide); no heavy framework | OD-8; **D-023** | P2 ARCH §8.2 | M1 | TEST-09 | Approved (D-023) — implementation pending | — |
| UI-05 | Loading/empty/error/partial states on every screen | UI_DESIGN_SYSTEM DoD | P2 ARCH §8.3 | M1+ | Per-screen review | Approved direction | — |
| UI-06 | Confirmation dialogs with consequence text for destructive actions | UI_DESIGN_SYSTEM | P2 ARCH §8.3 | M5, M9 | Manual walkthrough | Approved direction | — |
| UI-07 | Keyboard navigation + visible focus indicators | Directive §7; a11y; **D-023** | P2 ARCH §8.3 | M1 | TEST-09 automated + manual | Approved (D-023) — implementation pending | — |
| UI-08 | Dialog focus trap, Escape handling, focus restoration, background inert | Directive §7; **D-023** | P2 ARCH §8.3; MILESTONES M1 | M1 | TEST-09 dialog/sheet suites | Approved (D-023) — implementation pending | — |
| UI-09 | Screen-reader semantics (roles/states/labels) | Directive §7; **D-023** | P2 ARCH §8.3 | M1 | TEST-09 + manual smoke test | Approved (D-023) — implementation pending | — |
| UI-10 | Reduced-motion support | UI_DESIGN_SYSTEM | P2 ARCH §8.3 | M1 | TEST-09 | Approved direction | — |
| UI-11 | Virtualized library list | Directive §6 | P2 ARCH §2.8/§8.2 | M5 | Render harness | Proposed | — |
| UI-12 | Global topbar search with entity grouping | UI_DESIGN_SYSTEM; directive §7 | P2 ARCH §6/§8.2 | M7 | Manual scenarios | Proposed | — |
| UI-13 | Resource detail: aliases dropdown, mentions, evidence viewer, attachments, tags, history | MASTER_BRAIN D5/H3 | P2 ARCH §8.2 | M5 | Manual pass | Proposed | — |
| UI-14 | Settings: transcription/models/consent, storage paths, limits, backup, providers-placeholder | Directive §7; R-023 | P2 ARCH §8.2 | M1, M8, M9 | Manual pass | Proposed | — |
| UI-15 | Responsive behavior within desktop constraints | D-011 | P2 ARCH §8.3 | M1 | Window-resize check | Approved direction | — |
| UI-16 | Neutral logo placeholder; verbatim swap on delivery | OD-1 | P2 ARCH §8.4 | M1 | Placeholder review; swap diff on delivery | Placeholder Approved; integration Proposed | Asset delivery |

## 7. Testing requirements (TEST-01..12)

| ID | Requirement | Source | Doc § | Milestone | Evidence | Status | Approval dep |
|---|---|---|---|---|---|---|---|
| TEST-01 | IPC contract round-trip tests | TESTING_STRATEGY §3.3 | P2 ARCH §2.4 | M0 | Contract test results | Proposed | — |
| TEST-02 | P1-F 9-invariant suite ported + extended identity suite | P1-F; directive §2.E | P2 ARCH §3.4 | M2, M6 | Suite results (mechanism regression gate) | Approved basis (P1-F); extensions Proposed | — |
| TEST-03 | Migration suite: fresh, upgrade, injected failure, recovery | DATABASE_DESIGN §23/26 | P2 ARCH §3.5 | M2 | Suite results | Proposed | — |
| TEST-04 | FTS sync + latency harness (10k/100k) | F1-04 A8/A9 | P2 ARCH §6 | M2, M7, M10 | Harness reports | Proposed | — |
| TEST-05 | SSRF negative matrix (IPv4+IPv6, rebinding, redirects, headers, limits) | Owner directive §5; SECURITY §25 | P2 ARCH §4.5 | M4, M10 | Mock-server suite results | Proposed | — |
| TEST-06 | Malformed-input + unsupported-format negatives; no-orphan-temp checks | OD-9; directive §8 | P2 ARCH §4.6 | M3, M8 | Suite results | Proposed | **OD-9** |
| TEST-07 | Job-runner tests: states, cancel semantics, retry idempotency, crash recovery | C6/C7; directive §2.B | P2 ARCH §2.6 | M2, M8 | Suite results | Proposed | — |
| TEST-08 | Backup roundtrip incl. attachments; malformed import; interruption; zip-bomb | Directive §4 | P2 ARCH §7.4 | M9, M10 | Suite results + owner restore drill | Proposed | — |
| TEST-09 | Accessibility: per-primitive automated suites + manual keyboard walkthrough + manual screen-reader smoke test | Directive §4/§7; **D-023** | MILESTONES M1 | M1 | Recorded results (automated + manual) | Approved (D-023) — execution pending | — |
| TEST-10 | Whisper mock-engine tests + real pinned-CLI integration (owner-consented fixture) | OD-2; F1-03 | P2 ARCH §5 | M8 | Suite + integration results | Proposed | **OD-2** |
| TEST-11 | OD-11 fixture suite: long-duration, cancellation/recovery, Urdu + English + mixed | OD-11; directive §3 | P2 ARCH §5.3 | M8 | Fixture results recorded honestly | Proposed | **OD-11 fixtures (owner action)** |
| TEST-12 | Performance measurement scripts + M10 consolidated report | OD-7; directive §6 | PERF §6 | M0, M10 | Scripts committed; report with per-workload rows | Proposed | **OD-7 methodology** |

## 8. Milestone index and exit gates

| Milestone | Objective (one line) | Exit gate | Key OD refs | Status |
|---|---|---|---|---|
| M0 | Production scaffold + conventions + baseline | Automated suite green + owner launch + baseline recorded | OD-6 (**approved D-022**), OD-7 | **OD-6 approved (D-022)** — awaiting separate implementation authorization |
| M1 | Application shell + design system + accessibility | Owner visual + a11y acceptance recorded | OD-1, OD-6 (**D-022**), OD-8 (**approved D-023**) | **OD-6/OD-8 approved** — awaiting M0 completion + separate implementation authorization |
| M2 | Database foundation + job lifecycle | Schema = OD-4-approved; regression + WAL evidence | OD-4, OD-7 | **Blocked — OD-4 review** |
| M3 | Sources Tier 3 + YouTube URL records + import matrix | Owner manual pass + integration suite | OD-5, OD-9 | Blocked by M2 |
| M4 | Web/GitHub Tier 1a + SSRF matrix | Owner security review sign-off | OD-5, OD-9 | Blocked by M3 |
| M4b | Reddit/Medium (optional) | Owner acceptance per adapter | OD-5 | Blocked by M4 + owner call |
| M5 | Resource library + tags + attachments + evidence | Owner manual pass | OD-4 | Blocked by M2/M3 |
| M6 | Identity + dedup + merge/undo | Extended invariant suite green | OD-4 | Blocked by M5 |
| M7 | Search + filters | Latency reports recorded | OD-4, OD-7 | Blocked by M6 |
| M8 | Whisper transcription foundation | **OD-11 fixture results recorded** + all functional AC | OD-2, OD-3, OD-9, OD-10, OD-11 | **Blocked** — M2/M3 + OD-2/OD-3 approval + audit + fixtures |
| M9 | Backup/export foundation | Owner restore drill | OD-4, OD-9 | Blocked by M2 (best after M6/M7) |
| M10 | Hardening + performance validation + closure | **Phase 2 exit gate — owner approves Phase 3** | OD-7, OD-11 + all | Blocked by all |

## 9. Coverage verification

- Every OD (12/12) appears in §1 with status and approval dependency; OD integration points are cross-referenced (not duplicated) in MILESTONES and ARCHITECTURE.
- Every decision-log recommendation R-001..R-025 has an explicit Phase 2 disposition (§2).
- Every milestone M0–M10 has acceptance criteria and an exit gate (MILESTONES Rev 1.3 twelve-field format; §8 above).
- Statuses: **no item is marked Implemented or Verified** — no production code or Phase 2 test evidence exists. "Approved" is used only where an approved decision ID or measured Phase 1 evidence is cited. *(Rev 1.0 planning state — the M0-assigned rows are updated by the dated §10 addendum below.)*

## 10. M0 implementation status update (2026-11-14)

**Scope note:** the owner separately authorized M0 implementation only ("M0 STRICT IMPLEMENTATION AUTHORIZATION"). This section records which M0-assigned rows now carry repository evidence; it does not change any other row, any OD status, or the milestone gates. Evidence: `docs/PHASE_2_M0_IMPLEMENTATION_REPORT.md`; raw outputs under `docs/phase2-results/m0/`.

| ID (M0-assigned) | Status after M0 | Evidence |
|---|---|---|
| ARCH-01 | **Implemented** (layer start: commands/domain/infrastructure/ipc; domain framework-free) | `src-tauri/src/` layout; clippy clean; 17 Rust unit tests run without UI |
| ARCH-02 | **Implemented + Verified** (typed envelope, 11-category taxonomy, contract round-trip both directions) | `src-tauri/src/ipc.rs` + `domain/errors.rs`; canonical fixtures asserted by Rust tests and `tests/frontend/ipc-contract.test.ts` |
| ARCH-04 | **Implemented** (M0 app has no timers, workers, or services; verified by design + idle sample) | M0 code surface; baseline process sample |
| ARCH-05 | **Verified** (frontend performs no fetches; remote fetch blocked at runtime) | `check-csp` 39/39 + `verify-prod-csp.mjs` fetch probe |
| SEC-01 | **Verified** (production CSP strict — config + runtime negative checks on the release build) | §6 of the M0 report; `docs/phase2-results/m0/verify-prod-csp-output.txt` |
| SEC-02 | **Implemented + Verified with conditions** (dev allowances isolated to `devCsp`; condition DEV-CSP-1: dev `script-src` also needs `'unsafe-inline'` for the SvelteKit dev bootstrap — owner review requested) | `check-csp` isolation assertions; M0 report §11 |
| SEC-03 | **Implemented + Verified** (`scripts/check-csp`, 39 checks, passing; runtime complement `scripts/verify-prod-csp.mjs`) | evidence file + report §6/§7 |
| SEC-04 | **Implemented + Verified** (zero-permission capability; runtime-proved sufficient for app commands) | `src-tauri/capabilities/default.json`; IPC probe in §6 |
| SEC-05 | **Implemented + Verified** (typed IPC, validated payloads; oversized input → typed validation error) | contract tests + smoke-view error probe |
| SEC-15 | **Implemented + Verified for M0 scope** (rotating, size-capped, secret-free file logger; real log output reviewed — command names only) | `infrastructure/logging.rs` + tests; `%APPDATA%\com.techvault.app\logs\techvault.log` sample in report §7 |
| PERF-01 | **Baseline recorded** (idle private bytes, full tree: median 137.45 MB, 6-s settle sample; 150 MB target still not claimed achieved — soak method belongs to M1+/M10) | `docs/phase2-results/m0/baseline.json` |
| PERF-02 | **Implemented + Verified** (process-tree script committed and executed on the reference machine) | `scripts/measure-baseline.ps1` + baseline.json |
| PERF-05 | **Baseline recorded** (cold 103 ms; warm median 47 ms / p95 54 ms — baseline rows, no pass/fail claimed) | baseline.json |
| PERF-12 | **Measured (installer half)** — MSI 1.96 MiB / NSIS 1.33 MiB; installed-size half NOT RUN (requires owner install) *(ANNOTATED 2026-11-14: installed size subsequently verified at **4.15 MB** by the final verification's temp-install measurements — see §13 and `PHASE_2_M0_FINAL_VERIFICATION.md`; the NOT RUN note above is the historical M0-session record)* | report §7 |
| TEST-01 | **Implemented + Verified** (canonical fixtures round-trip through serde and the TS narrowers) | `tests/fixtures/*` + both test suites |
| TEST-12 | **Implemented (scripts committed and executed)** — M0 half; consolidated M10 report remains future | `scripts/measure-baseline.ps1` et al. |
| M0 (§8 row) | **Implemented — PASS WITH CONDITIONS** (owner launch confirmation outstanding; DEV-CSP-1 owner review) | `PHASE_2_M0_IMPLEMENTATION_REPORT.md` §9/§13 |

Rows not listed here (M1+ scope) are unchanged, including all Proposed OD dispositions.

## 11. M0 closure update (2026-11-14, owner decisions D-024/D-025 + owner verification)

Append-only update to §10 (preserved above as the implementation-time record):

| Row | Status after owner decisions + verification |
|---|---|
| SEC-01 | **Verified** — production CSP strict; unchanged by D-024; re-verification stays scheduled M1/M10 |
| SEC-02 | **Verified** (condition closed) — DEV-CSP-1 accepted as D-024: dev-only `unsafe-inline` is the recorded baseline, confined to `devCsp` and enforced by `check-csp`; production unaffected |
| SEC-03 | **Verified** — `check-csp` 39/39; runtime complement re-executed in the post-review |
| SEC-04 | **Verified** — zero-permission capability; negative case proven (ungranted core API denied by ACL) in the post-review probe |
| SEC-05 | **Verified** — owner screenshot confirms the typed success + validation-error envelopes on the installed release build |
| TEST-01 | **Verified** — contract fixtures round-trip; owner screenshot confirms the same envelopes end-to-end over real IPC |
| M0 (§8 row) | **Implemented — exit gate met; eligible for closure**: automated suite green [A]; owner launch/install/inspect/uninstall confirmation received [O] (residual manual items — console-error check, title-bar text, SHA-256 NOT PERFORMED, installed size — explicitly identified in `PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md` §8; they do not gate closure and are re-covered by M1's scope); baseline recorded [A]. Owner decisions: D-024 (DEV-CSP-1), D-025 (kit-3 → M1 review). Formal closure takes effect with the owner's review of this update; M1 requires separate authorization. |

---

**End of PHASE_2_TRACEABILITY_MATRIX.md** *(§11 appended 2026-11-14)*

## 12. M0 final verification update (2026-11-14)

Append-only update to §11 (preserved above): the owner re-confirmed D-024/D-025 and requested a final automated verification. Executed and evidenced in `docs/PHASE_2_M0_FINAL_VERIFICATION.md`: full automated suite green on freshly built artifacts (svelte-check 0/0, vitest 17/17, cargo fmt/clippy(-D warnings)/test 17/17, `npx tauri build` PASS, check-csp 39/39, runtime CSP+ACL probes 5/5 on installed and portable artifacts, dev HMR live-verified, secret scans 0 hits, npm-audit inventory unchanged), silent NSIS install/uninstall cycles verified twice (installed size 4.15 MB; `%APPDATA%` preserved), window title confirmed via Win32 API, console captured (one known CSP-enforcement event from the Svelte runtime; zero application errors). Fresh baseline: warm median 67 ms; idle tree private median 143.54 MB (baseline-only; historical 47 ms / 137.45 MB preserved). One measurement incident was disclosed and corrected (a plain `cargo build --release` re-link produced a dev-mode binary; proper `tauri build` restored the artifacts; the affected intermediate measurement is quarantined, not cited).

| Row | Final status |
|---|---|
| M0 (§8 row) | **VERIFIED — COMPLETE.** Exit gate fully satisfied: automated suite green [A], owner launch/install/uninstall confirmation [O], baseline recorded (historical + fresh) [A]. All acceptance criteria PASS or PASS WITH CONDITIONS; remaining items are DEFERRED-by-schedule (W1 soak → M1+/M10; cargo audit → M10; true cold start pending a script-fix authorization) or recorded observations. **M0 can be formally closed without further owner action.** M1 remains gated on separate owner authorization (its dependency review carries D-025). |

---

## 13. M0 formal closure (2026-11-14)

**Owner waiver:** the owner explicitly waived the M0 owner-operated launch confirmation for **M0 only**, accepting the automated evidence (unnumbered addendum in `DECISION_LOG.md` §4 — no decision ID invented). Owner-stated accuracy: installation/uninstallation personally performed via command; complete smoke-test checklist not personally performed.

**With the waiver, every M0 exit criterion is satisfied. PHASE 2 M0: CLOSED — effective 2026-11-14**, by the owner's explicit authorization. Preserved conditions: the documented production-CSP `style-src` console event (console not clean; PASS WITH DOCUMENTED CONDITION) and the D-025 kit-3 deferral (M1 dependency-review agenda). Full reconciliation: `docs/PHASE_2_M0_CLOSURE_REPORT.md`. Deferred to schedule: W1 soak (M1+/M10), cargo/npm audit gate (M10), true cold start (pending script-fix authorization). **M1 remains gated on separate explicit owner authorization.**

---

## 14. M1 blueprint registration (2026-11-14 — **Proposed**, awaiting owner review)

**Status update (2026-11-14, D-026 — appended below the original registration, which is preserved verbatim for history):** the owner ruled on all packaged M1 decisions (`DECISION_LOG.md` §4 D-026). §14.2's "Proposed" statuses are superseded by the recorded rulings: M1-OD-1/2/5/7/8 **Approved**; M1-OD-3 (+OD-4) and M1-OD-4 **Approved with amendments**; M1-OD-6 (DP-09) **Deferred — required before G11**. The amendment set is registered in §15. Nothing is Implemented or Verified — design approval is not implementation evidence; M1 implementation remains separately unauthorized.

**Scope note:** the owner authorized preparation of the M1 engineering blueprint only (`docs/PHASE_2_M1_MASTER_BLUEPRINT.md`). **No M1 implementation exists; no item below is Implemented or Verified.** The blueprint's gate plan (G1–G12) and its decision register (M1-OD-1..8) were **Proposed** at the v1.0 registration; their current statuses are the recorded **D-026 rulings** (see the status update above and §15).

### 14.1 Module → gate → document mapping

| Module (owner directive) | Gate(s) | Design document | Status (updated per D-026 — only surfaces D-026 actually approved are marked approved) |
|---|---|---|---|
| A Resource management | G5 | M1_ARCHITECTURE §3 | **Gate plan approved (DP-01)**; schema surface approved (DP-03, amended); module design proceeds as gate content — implementation pending |
| B SQLite database and migrations | G2 | M1_DATABASE_DESIGN v1.1 | **Design APPROVED (DP-03 + OD-4, amended — D-026)** — implementation pending |
| C File storage engine | G3 | M1_STORAGE_DESIGN v1.1 | **Design APPROVED (DP-05, DP-06 — D-026)** — implementation pending |
| D File import and ingestion | G4 | M1_ARCHITECTURE §5; STORAGE §4–5 | **Design APPROVED (DP-07/OD-9, DP-08 — D-026)** — implementation pending |
| E Metadata extraction | G4 | M1_ARCHITECTURE §6 | **Design APPROVED (DP-08 — D-026)** — implementation pending |
| F Tags and categories | G7 | M1_DATABASE_DESIGN §3.4/3.12 | **Gate plan approved (DP-01)**; schema surface approved (DP-03) — implementation pending |
| G Full-text search (FTS5) | G8 | M1_SEARCH_DESIGN v1.1 | **Design APPROVED (DP-10, amended — D-026)** — implementation pending |
| H Resource relationships | G7 | M1_DATABASE_DESIGN §3.11 | **Gate plan approved (DP-01)**; schema surface approved (DP-03) — implementation pending |
| I Backup and restore | G10 | M1_STORAGE_DESIGN §7 | **Gate plan approved (DP-01)**; backup refinements approved (A-7/A-10 — D-026 §E) — implementation pending |
| J Export and import | G11 | M1_STORAGE_DESIGN §8 | **⛔ DEFERRED — DP-09 (D-026): owner decision required before G11** |
| K Resource library UI | G1, G9 | M1_UI_SPECIFICATION v1.1 | **Gate plan approved (DP-01)**; primitives approved (D-023); fonts ruling approved (DP-11) — UI design proceeds as gate content — implementation pending |
| L Error handling and recovery | cross-cutting, G12 | M1_ARCHITECTURE §11 | **Gate plan approved (DP-01)**; recovery refinements approved (D-026 §E) — implementation pending |

### 14.2 M1-specific decision rows (full detail in `PHASE_2_M1_OPEN_DECISIONS.md`)

| ID | Decision | Status | Gate dependency |
|---|---|---|---|
| M1-OD-1 | M1 redefinition + gate plan G1–G12 + Rev 1.3 re-mapping | **Proposed** | entire blueprint |
| M1-OD-2 | Post-M1 order: web ingestion → Whisper → closure | **Proposed** | roadmap order |
| M1-OD-3 | Elaborated schema v1 (adds `resource_categories`; column/index detail) | **Proposed — co-gates G2** | G2 (with OD-4) |
| M1-OD-4 | style-src console condition resolution (A investigate-eliminate → C document → B hash) | **Proposed** | G1 console criterion |
| M1-OD-5 | Attachment store: per-UUID files; content-addressed store proposed against | **Proposed** | G3 |
| M1-OD-6 | TVDP-1 JSON export/import format + never-auto-merge conflict policy | **Proposed** | G11 |
| M1-OD-7 | Hand-rolled bounded metadata sniffer (vs `infer` crate) | **Proposed** | G4 |
| M1-OD-8 | Orphan policy: quarantine + report (vs immediate delete) | **Proposed** | G3 |

### 14.3 Existing requirement rows assigned to M1 gates (status unchanged — Implemented/Verified only with evidence)

G1: SEC-01/02/03 re-verification, SEC-16, UI-01..05/07..10/14/15/16, TEST-09 · G2: ARCH-06/07/08/11/12/22, SEC-05, TEST-02/03/04/07 · G3/G4: ARCH-13/14/15/17, SEC-06/07, TEST-06 · G5/G6: ARCH-09/10, TEST-02 extended · G7: ARCH-07 (categories/tags) · G8: ARCH-22, TEST-04, PERF-06/07 · G9: UI-11/12/13 · G10/G11: ARCH-23, SEC-14/18, TEST-08 · G12: PERF-01 (W1 soak), TEST-12, SEC-19 inventory refresh. Full gate assignments: `PHASE_2_M1_MILESTONES.md`.

## 15. M1 ruling and amendment registration (2026-11-14, D-026)

**Scope note:** the owner's ruling directive recorded thirteen decisions (`DECISION_LOG.md` §4 **D-026**) and mandated the independent-audit amendments into the planning documents. All rows below are **Approved (design) — D-026** requirements; **nothing is Implemented or Verified** — implementation remains separately unauthorized. Gate assignments per `PHASE_2_M1_MILESTONES.md` v1.1.

| ID (audit/pack ref) | Requirement (approved design) | Gate(s) | Test/evidence | Status |
|---|---|---|---|---|
| DP-01 / M1-OD-1 | M1 gate plan G1–G12 + Rev 1.3 re-mapping | all | gate plan executed against evidence at closure | **Approved (design)** |
| DP-02 / M1-OD-2 | Post-M1 order: web ingestion → Whisper → hardening/closure | post-M1 | future planning record | **Approved (design)** |
| DP-03 + OD-4 / M1-OD-3 | Schema v1 with the six mandatory amendments; migration 001 = full amended schema in one transaction | G2 | TEST-03 incl. amended-schema assertions | **Approved (design)** |
| F-1 (DP-03 amendment) | Merge unions tags; primary's row kept on conflict; snapshot includes tag rows; preview shows both | G6 | TEST-02 extension (tag-union + conflict precedence) | **Approved (design)** |
| A-1 (DP-03 amendment) | Undo validates post-merge edits; typed conflict, no silent overwrite | G6 | TEST-02 extension (undo-after-edit) | **Approved (design)** |
| A-2 (DP-03 amendment) | Source deletion: explicit confirmation (mention/evidence counts) → single-transaction cascade; FK guard on `mentions.source_id` | G2, G5 | G2 service-transaction test; G5 confirmation-flow test | **Approved (design)** |
| A-3 (DP-03 amendment) | `resource_identity_decisions` persists not-the-same; suppression honored by candidate generation; pair orientation enforced by UNIQUE + `CHECK(resource_a_id < resource_b_id)` (audit F-7) | G2 (schema), G6 | TEST-02 extension (suppression); TEST-03 schema assertions (CHECK) | **Approved (design)** |
| A-8 (DP-03 amendment) | Deterministic category slugs + collision handling | G5/G7 | slug generation/collision tests | **Approved (design)** |
| A-11 (DP-03 amendment) | Verification-status changes user-controlled; `resource_history` entries | G5 | TEST-02/G5 assertions | **Approved (design)** |
| DP-04 / M1-OD-4 | CSP strategy: time-boxed investigation → accept-as-condition fallback; strict production CSP; no hash allowance | G1 | investigation record + `check-csp` + runtime probes | **Approved (design)** |
| A-6 (DP-04 amendment) | Enforceable no-inline-style rule (`style:`/`style=` prohibited in app components); `check-csp` extension | G1, G12 | extended `check-csp` assertion | **Approved (design)** |
| DP-10 / M1-OD-10 | Search defaults; `remove_diacritics=2` pinned; harakat probe; no unsupported language claims | G8 | probe evidence (raw observations) | **Approved (design)** |
| DP-05 / M1-OD-5 | UUID-based attachment storage | G3 | storage suite | **Approved (design)** |
| DP-06 / M1-OD-8 | Orphan quarantine + 30-day grace | G3 | sweep tests | **Approved (design)** |
| DP-07 / OD-9 | Intake limits 100/20/5 MB; logged overrides | G4 | TEST-06 limit matrix | **Approved (design)** |
| DP-08 / M1-OD-7 | Bounded in-house metadata sniffer | G4 | sniffer matrix tests | **Approved (design)** |
| DP-09 / M1-OD-6 | TVDP-1 export/import format + conflict policy | G11 | roundtrip/conflict/malformed suites | **DEFERRED — owner decision required before G11** |
| A-4 | Verified attachment-directory relocation; DB relocation not offered in M1 | G3 | relocation suite (roundtrip/interruption/hash-mismatch) | **Approved (design)** |
| A-5 (DP-10 amendment) | `remove_diacritics=2` pinned (corrects the v1.0 mischaracterization) | G8 | tokenizer config assertion + probe | **Approved (design)** |
| A-7 | Restore = full library replacement; live extras quarantined; dialog states it | G10 | TEST-08 extension | **Approved (design)** |
| A-9 | Text-encoding matrix: UTF-8/UTF-16-BOM accepted; others typed `Unsupported` | G4 | encoding negatives | **Approved (design)** |
| A-10 | Export/restore waits for job-queue quiescence | G10 | quiescence test | **Approved (design)** |
| A-12 | Empty transcript tables retained as a documented intentional design choice | G2 | migration suite covers them | **Approved (design)** |
| F-3 | Dedicated test for the default cross-volume copy path | G3/G4 | cross-volume fixture test | **Approved (design)** |
| F-2 | Six cross-reference corrections | documentation | corrected in the v1.1 reconciliation pass | **Corrected (D-026)** |
| DP-11 / DP-12 / DP-13 | System fonts (no Geist bundling in M1) · kit-3 adopt-only-if-green (adoption = own decision record) · OD-7 methodology as enforceable gates | G1, all | G1 pre-work; per-gate evidence | **Approved (design)** |

---

**End of PHASE_2_TRACEABILITY_MATRIX.md** *(§12–§13 appended 2026-11-14; §14 appended 2026-11-14 — M1 blueprint registration, v1.0 statuses Proposed, superseded by the D-026 rulings per the §14 status note and §15; §15 appended 2026-11-14 — D-026 rulings and amendments, all design-approved, nothing implemented)*

## 16. G1 implementation status update (2026-11-14)

**Scope note:** the owner granted the explicit M1 implementation authorization (G1 first). This section records, in the strict status vocabulary, which G1-assigned rows now carry repository evidence. **G1 is NOT closed** — its exit condition (owner visual + accessibility acceptance) is open per `docs/PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md`; rows below never claim more than their evidence. Full record: `docs/PHASE_2_M1_G1_IMPLEMENTATION_REPORT.md`; raw outputs `docs/phase2-results/m1/`.

| ID (G1-assigned) | Status after G1 implementation | Evidence |
|---|---|---|
| SEC-01 | **Implemented + Verified** (production CSP strict on the real G1 UI) | `check-csp` 42/42; runtime probes 5/5 on the release build (`g1-verify-prod-csp-output.txt`) |
| SEC-02 | **Implemented + Verified** (dev allowances isolated per D-024, unchanged) | `check-csp` isolation assertions |
| SEC-03 | **Implemented + Verified** (automated CSP check extended with the A-6 no-inline-style assertions) | 39→42 checks; negative case verified; committed script |
| SEC-16 | **Implemented** (providers placeholder-only in Settings; no keys, no network surface) | Settings → Providers section; bundle scan remains scheduled at G12 |
| UI-01 | **Implemented** (220 px sidebar + 56 px topbar + workspace + reserved contextual-panel host; 8-item navigation) | shell code + component tests; owner visual acceptance pending |
| UI-02 | **Implemented** (dark primary default; light theme; persisted via typed settings; `prefers-color-scheme` first-run) | theme store tests; persistence across restart verified in unit flow; owner restart check pending |
| UI-03 | **Implemented** (exact UI_DESIGN_SYSTEM §4 token values; system fonts per DP-11) | `app.css` token layer; owner visual conformance check pending |
| UI-04 | **Implemented + Verified (automated)** (11 in-house primitives; D-023 set; no heavy framework) | per-primitive suites with axe, zero violations; manual items pending |
| UI-05 | **Implemented** (loading/empty/error states on every G1 screen; honest placeholders — never fake content) | route components + tests; partial-success states arrive with data (later gates) |
| UI-07 | **Implemented + Verified (automated)** (keyboard traversal, visible focus, skip link) | shell/primitive keyboard tests; manual walkthrough pending |
| UI-08 | **Implemented + Verified (wiring)** (native `<dialog>` modals: focus into surface, platform trap, Escape, focus return, background lock) | Dialog/Sheet suites (jsdom wiring; platform trap is native); manual confirmation pending |
| UI-09 | **Implemented + Verified (automated)** (roles/states/labels; aria-live toasts; alert errors) | axe suites + role assertions; manual screen-reader smoke pending |
| UI-10 | **Implemented** (global reduced-motion CSS gate) | `app.css` media gate; owner reduced-motion check pending |
| UI-14 | **Implemented (G1 sections)** (Appearance functional; Providers R-023 placeholder; About identity/log path; later-gate sections not rendered yet — honest) | Settings route + tests |
| UI-15 | **Implemented** (desktop-constraint responsive behavior; 900×600 minimums preserved) | owner window-resize check pending |
| UI-16 | **Implemented (placeholder)** (neutral wordmark slot; no invented artwork) | sidebar; verbatim swap on OD-1 asset delivery |
| TEST-09 | **Partially executed — automated half done, manual half outstanding** (per-primitive automated suites + axe: zero violations; manual keyboard walkthrough + screen-reader smoke + reduced-motion + resize remain owner-operated per D-023) | `tests/frontend/*` suites; owner guide §2–§5 |
| M1-P1 | **Measured — within budget** (idle tree private 141.85 MB median vs M0 fresh 143.54 MB; ≤ +10 MB) | `g1-baseline.json` |
| M1-P2 | **Measured — within guard** (first-render 59 ms page-relative median, guard ≤300 ms; spawn→page-target 531 ms recorded separately) | `g1-first-render.json` |
| M1-P3 | **Measured — within guard** (worst route node 3.50 KB gzip; total client JS 60.09 KB gzip; guard ≤300 KB) | `g1-bundle.json` |
| M1-P15 | **Measured** (warm startup 58 ms median, 5 runs; carried ≤1.5 s proposal) | `g1-baseline.json` |

*(A-6/DP-04 enforcement row — security review §8.1 item 4 — is likewise Implemented + Verified: `check-csp` extended with three no-inline-style assertions across 29 markup files, negative case verified.)*

---

**End of PHASE_2_TRACEABILITY_MATRIX.md** *(§16 appended 2026-11-14 — G1 implementation status, nothing marked closed)*

## 16a. G1 correction pass status update (2026-11-14)

Append-only update to §16 after the owner-feedback correction pass (full record: `docs/phase2-results/m1/g1r2-correction-pass.md`; G1 still NOT closed — owner acceptance outstanding):

| Row | Status update |
|---|---|
| UI-02 | **Implemented + Verified (automated)** — dark/light/system all covered; theme persistence tests; **neutral dark token values asserted at file level** (css.test.ts) per the owner's directive; UI_DESIGN_SYSTEM §4.2 amended (dated owner note) |
| UI-03 | **Implemented** — token values per the amended design system; light theme §4.1 unchanged; owner visual conformance pending |
| UI-07/08/09 | skip-link corrections verified (centered-on-focus, focus transfer, no startup focus); no regressions in the keyboard suites |
| UI-15 | window-resize behavior unchanged; still owner-operated |
| SEC-04 | **capability change recorded** — `core:webview:allow-set-webview-zoom` added as the single used grant for the owner-directed zoom feature (least-privilege maintained; automated capability allowlist check passes; zoom verified end-to-end 7/7) |
| ARCH-05 | **strengthened** — `app.no-network-apis` automated assertion added to check-csp (no fetch/XHR/WebSocket/EventSource/sendBeacon in the frontend); zero-network boundary intact |
| SEC-16 | **strengthened** — `app.no-secret-identifiers` automated assertion added |
| M1-P1/P2/P3/P15 | re-measured after corrections — all within guards (idle 145.85 MB median / +2.31 MB vs M0 fresh ≤ +10 MB; first-render 124 ms ≤ 300 ms; route 3.75 KB gzip ≤ 300 KB; warm 72 ms); evidence `g1r2-*.json` |
| TEST-09 | automated half extended (86 vitest tests incl. zoom + boundary + CSS gate suites); manual half still owner-operated |

## 16b. Performance decision recorded (2026-11-19, owner-approved P-1..P-4)

| Row | Status update |
|---|---|
| M1-P1 | **MET — owner-approved verdict (P-1, 2026-11-19):** +5.42 MB median same-session delta at the approved 60-second settle; all three pairs preserved (+5.42/+5.13/+6.46); the ≤ +10 MB guard unchanged. The 6-second +16.03 MB record is preserved as a superseded unsettled-protocol artifact (`f1-controlled-comparison.md`, with its binding arithmetic erratum) |
| Methodology | Idle settle duration **pinned to 60 seconds** (P-2 — clarification of the "post-settle" wording in `PHASE_2_M1_PERFORMANCE_BUDGET.md` §1; not a threshold revision) |
| PERF-01 (absolute 150 MB, D-019) | Final verdict **remains scheduled for the G12 W1 10-minute soak** (P-3); G1 supporting evidence 138.76 MB at 60 s recorded — does not complete that evaluation |
| G1 manual acceptance | **Owner completed the manual acceptance checklist** (2026-11-19 directive) — recorded; formal gate closure pending the owner's explicit instruction |
