# TechVault Phase 2 M1 — Master Engineering Blueprint

**Document status:** v1.1 (2026-11-14, owner rulings recorded — see revision note below). **This is NOT M1 implementation authorization.**
**v1.1 changes (owner directive, recorded as D-026 in `DECISION_LOG.md` §4):** all thirteen packaged decisions (DP-01..DP-13) are now **recorded owner rulings** — nine APPROVED, three APPROVED WITH AMENDMENTS (DP-03/OD-4 schema; DP-04 CSP strategy; DP-10 search), one DEFERRED (DP-09 — required before G11). §1.3 and §10 updated to the recorded statuses; the six F-2 cross-reference errors are **corrected in this pass** (§4 module map; `PHASE_2_M1_ARCHITECTURE.md` §10); the carried-OD rows reflect the cleared approval gates. Every gate still awaits separate M1 implementation authorization.
**v1.0:** Prepared Draft (2026-11-14), prepared under the owner's "M1 Master Engineering Blueprint" directive; verdict READY FOR OWNER REVIEW.

---

## 0. Mission restatement and scope boundary

The owner authorized preparation of an implementation-ready M1 engineering blueprint covering twelve modules:

**A** Resource management · **B** SQLite database and migrations · **C** File storage engine · **D** File import and ingestion · **E** Metadata extraction · **F** Tags and categories · **G** Full-text search (FTS5) · **H** Resource relationships · **I** Backup and restore · **J** Export and import · **K** Resource library UI · **L** Error handling and recovery.

The blueprint must prioritize: minimum CPU/RAM, minimum unnecessary disk usage, fast startup and search, offline-first operation, reliable data integrity, modular/expandable architecture, simple maintenance, strong security, and future compatibility with Phase 3 AI extraction.

**Explicitly out of scope of this authorization** (restated from the directive's restrictions): implementing M1, modifying application source code, changing database or configuration, installing dependencies, creating migrations, building UI screens, committing/pushing, authorizing future milestones.

---

## 1. Repository and documentation audit (performed 2026-11-14)

### 1.1 What actually exists (verified)

| Area | Verified state | Evidence |
|---|---|---|
| Git | branch `main`, HEAD `37a71c4`; no remote; everything uncommitted in working tree | `git status`/`git log` this session |
| M0 scaffold | Tauri 2.12.5 + SvelteKit static SPA + Svelte 5 + strict TS + Tailwind 4 in `src/` + `src-tauri/`; typed IPC envelope (`ipc.rs` ↔ `src/lib/types/ipc.ts` + canonical fixtures); 11-category error taxonomy; zero-permission capability file; rotating secret-free logger; smoke view (`ping`, `app_info`) | `src-tauri/src/`, `src/lib/`, M0 implementation report |
| M0 verification | check-csp 39/39; svelte-check 0/0; vitest 17/17; cargo test 17/17; clippy `-D warnings` clean; `npx tauri build` PASS; production CSP + ACL runtime probes 5/5; NSIS silent install/uninstall cycles; installed size 4.15 MB | `PHASE_2_M0_FINAL_VERIFICATION.md`, `PHASE_2_M0_CLOSURE_REPORT.md` |
| M0 baseline (historical, **not targets**) | warm start median 47 ms (fresh 67 ms); idle process-tree private bytes median 137.45 MB (fresh 143.54 MB); cold start never truly measured (`-Cold` script limitation recorded) | `docs/phase2-results/m0/` |
| Product features | **None.** No database, no storage engine, no import, no resources, no search, no backup — by design (M0 scope) | code inspection |
| Phase 1 evidence available for reuse | P1-F 9/9 identity/merge/FTS-trigger invariants; FTS5 0.005–0.009 ms @ 5k/20k rows; P1-A IPC 1.60 ms median; P1-E playback capability facts (MP4/WebM OK, HEVC/OGG unsupported in WebView2); P1-C Whisper RTF/peak figures (transcription is **not** M1 scope) | `docs/phase1-results/`, Phase 2 master plan §2.2 |
| R-023 config assets | `config/api/providers.schema.json` + `providers.placeholder.json` present (placeholders, all disabled) | file system |

### 1.2 Approved decisions with direct M1 bearing

D-001 (desktop-first, UI-independent core) · D-002 (transcripts saved by default, user-deletable) · D-006/D-007 (no cloud sync; export/import is the portability path) · D-008/D-009 (discovery-type discipline; license inventory) · D-011/D-012 (approved design system; logo verbatim-only) · D-015 (adapter tiers govern ingestion priority) · D-019 (private-bytes RAM metric, 150 MB idle target; D-drive policy; credential rules) · D-020 (R-023 + R-024 adopted as reference designs) · D-021 (Phase 1 closure with documented deferrals) · **D-022** (strict production CSP + restricted dev CSP + automated checks) · **D-023** (in-house accessible Svelte 5 primitives; explicit accessibility test plan) · D-024 (DEV-CSP-1 dev-only `unsafe-inline`) · D-025 (kit-3 upgrade deferred to the M1 dependency review).

### 1.3 Pending owner decisions and actions that constrain M1

| Item | Status | M1 effect |
|---|---|---|
| **OD-4** schema v1 (provenance-classified) | **APPROVED WITH AMENDMENTS — D-026 (2026-11-14)** | G2's approval gate is cleared; the six mandatory amendments (F-1/A-1/A-2/A-3/A-8/A-11) are incorporated in `PHASE_2_M1_DATABASE_DESIGN.md` v1.1; implementation remains separately unauthorized |
| **OD-9** type-specific size limits + archive-bomb protection | **APPROVED — D-026** | G4's approval gate cleared (defaults 100/20/5 MB; logged overrides) |
| **OD-7** performance methodology (process tree, five workloads) | **APPROVED — D-026** (target D-019) | Performance criteria are enforceable gates |
| **OD-1** logo assets | Placeholder approach authorized; asset delivery pending | Non-blocking; verbatim swap on delivery |
| **D-025** kit-3 assessment | Deferred to the M1 dependency review | G1 pre-work under the approved DP-12 rule (adopt only after a complete green regression) |
| style-src console condition | **Strategy APPROVED WITH AMENDMENTS — DP-04/D-026**: time-boxed investigation; accept-as-condition fallback; enforceable no-inline-style rule; no hash allowance | G1 console criterion executable as recorded |
| OD-11 fixtures, OD-12 revocation | Owner actions | Transcription is out of M1 scope; OD-12 unaffected by M1 |

### 1.4 Conflicts and gaps found during the audit

1. **Milestone numbering conflict (material).** The Rev 1.3 planning package defines **M1 = application shell** (with the database at M2, library at M5, search at M7, backup at M9). The owner's current directive defines **M1 = the resource-library core** (modules A–L, which span the old M1→M2→M3-subset→M5→M6→M7→M9 content plus new export/import detail). Per `AGENTS.md` §2 the latest owner instruction governs; the blueprint therefore uses the directive's definition and **proposes a documented re-mapping** (§3.2) rather than silently rewriting history. This re-mapping is itself a proposed decision (M1-OD-1).
2. **The directive's module list omits three planned workstreams** — web/GitHub ingestion (old M4 + SSRF suite), Whisper transcription (old M8), and the application-shell/design-system work (old M1). The blueprint treats the shell as **G1 inside M1** (the library UI cannot exist without it; D-023 approved its primitives), and classifies web ingestion and transcription as **outside M1 scope, deferred to subsequent milestones** (M1-OD-2). M1 ships **zero new network surface**.
3. **Schema additions required by the directive's modules** beyond the Rev 1.3 list: an extensible `resource_categories` seed table (module F) and explicit index/column specifications. Both are folded into the elaborated schema v1 (`PHASE_2_M1_DATABASE_DESIGN.md`) and flagged [P2R] — they extend, not replace, the OD-4 review surface.
4. **`README.md` staleness (minor, documentation only):** §"Project status" still describes `src/`/`src-tauri/`/`tests/` as reserved placeholders, which is no longer true after M0. Not corrected in this pass (outside authorization); recorded for the M1 documentation update.

### 1.5 Deferred recommendations carried forward (not silently dropped)

Fuzzy/similarity matching (P-008 golden-dataset evidence first) · automated YouTube ingestion (OD-5) · partial-transcript persistence · notebooks/collections (Phase 4) · knowledge graph/bookmarks/analytics UIs (Phase 4) · MD/CSV export (R-018) · command palette (R-020) · database encryption (P-014) · embeddings/sqlite-vec (R-011/P-013 rejected) · Android work (deferred/held) · release signing/updater (Phase 5).

---

## 2. M1 objective

**Objective:** deliver the first usable local-first **resource library core**: a reliable, lightweight, offline desktop application in which a user can import files and pasted content, organize canonical resources with tags, categories, aliases, relationships and evidence, find them instantly through FTS5 search, and protect the whole library through backup/restore and export/import — with tested data integrity, typed error handling everywhere, and zero network surface.

**M1 exit condition (gate plan APPROVED — DP-01, D-026):** all twelve modules implemented within their gates; every gate's automated tests green and owner manual passes recorded; the M1 performance report shows measured values against the gate budgets (DP-13/D-026) with misses documented, never redefined; security checks for M1 scope closed; documentation and the decision log updated; **no claim beyond the import-format matrix**.

**What M1 is not:** not an AI product (no extraction, no providers, no live calls — the Phase 2/Phase 3 boundary of `PHASE_2_ARCHITECTURE.md` §11 applies verbatim); not a networked application (no HTTP adapters in M1); not a transcription application (Whisper is out of M1 scope).

---

## 3. Scope definition

### 3.1 In scope (the twelve modules)

1. **Resource management** — canonical resources as first-class objects: CRUD, extensible categories, aliases, strong identifiers, manual mentions, compact evidence, verification-status display (display only — automation is Phase 3), history on meaningful edits, archive/unarchive.
2. **SQLite database and migrations** — production connection management, additive guarded migrations with defined failure/recovery, schema v1, repositories, transaction helpers, FK enforcement, startup integrity checks, WAL decision by evidence.
3. **File storage engine** — the three storage categories (user-owned attachments / temp processing / DB-resident content), attachment registration with streamed hashing, atomic file operations, orphan detection and sweep, path-traversal defenses.
4. **File import and ingestion** — local-file and pasted-text import (Tier 3, zero network), validation-first parsing, configurable type-specific limits (OD-9), duplicate-submission detection that links rather than deletes, atomic imports, interrupted-import recovery, intake jobs on the cancellable job model.
5. **Metadata extraction** — file-level metadata only: magic-byte type sniffing, size, timestamps, SHA-256, text encoding/word counts for text files, container-level media markers with `playback_type` capability records (P1-E evidence). No OCR, no PDF/office parsing, no full media probing (typed `Unsupported`/deferred with honest labels).
6. **Tags and categories** — `resource_tags` (lightweight user organization) + extensible seeded categories (B3).
7. **Full-text search** — FTS5 external-content indexes with trigger sync, escaped MATCH queries, relational filters, sorting, honest latency measurement.
8. **Resource relationships** — `resource_links` created now, user-populated via a minimal link/unlink affordance; AI population is Phase 3 (D-008 then).
9. **Backup and restore** — versioned archive (manifest + DB snapshot + attachments), atomic creation, validated restore with pre-restore safety backup, zip-bomb protection (the only accepted archive is the app's own format).
10. **Export and import** — structured data portability per D-007: a JSON data package with explicit conflict policy (**format decision DEFERRED — DP-09/D-026; required before G11**).
11. **Resource library UI** — library table (virtualized), resource detail view, import workflow, tags/filters, search, empty/loading/error/partial states — on the approved design system, in-house primitives (D-023), dark/light themes, keyboard accessibility.
12. **Error handling and recovery** — typed error taxonomy end-to-end, per-screen states, job failure/`Partial Success` semantics, crash recovery (startup sweep, interrupted-job marking, DB integrity check), migration-failure recovery, restore safety, secret-free logging.

### 3.2 Milestone reconciliation (proposed — M1-OD-1)

| Rev 1.3 milestone | New M1 treatment |
|---|---|
| M1 (shell/design system) | **Absorbed as Gate G1** of M1 (unchanged scope: D-023 primitives, D-022 CSP re-verification, a11y test plan) |
| M2 (database + jobs) | **Gate G2** (still gated on OD-4 approval) |
| M3 (sources Tier 3) | **Split:** local-file + pasted-text import → **G3/G4**; YouTube URL records → **outside M1** (OD-5 Proposed; deferred with the milestone plan) |
| M4/M4b (web/GitHub + SSRF) | **Outside M1** — becomes the first post-M1 milestone (proposed renumbering) |
| M5 (library/tags/attachments) | **G3 (attachments engine) + G5 (resource core) + G9 (library UI)** |
| M6 (identity/dedup) | **G6** |
| M7 (search) | **G8** |
| M8 (Whisper) | **Outside M1** — post-M1, still gated by OD-2/OD-3/OD-10/OD-11 |
| M9 (backup/export) | **G10 (backup/restore) + G11 (export/import)** |
| M10 (hardening/closure) | **M1-acceptance portion → G12**; full Phase 2 closure (audits, W4/W5 transcription workloads) stays with the final post-M1 milestone |

Nothing in the Rev 1.3 package is silently dropped: every old milestone's scope is either inside a gate, explicitly re-dated, or carried as an open decision. The old M-numbering remains the historical record; `PHASE_2_MILESTONES.md` itself is not rewritten by this blueprint.

### 3.3 Out of scope (M1)

Web/URL/GitHub ingestion and the SSRF surface (zero network in M1) · YouTube URL records (OD-5 open) · Whisper transcription, model management, FFmpeg decode (OD-2/3/10/11 chain) · notebooks, bookmarks, knowledge graph, analytics, video player UIs · AI extraction/verification/suggestions · cloud sync · BYOK keychain · database encryption · release signing/updater · Android · mobile layouts (desktop window-resize responsiveness only) · fuzzy/similarity dedup · MD/CSV export.

---

## 4. Module map (summary; full design in the companion documents)

| Module | Design document | Primary gates |
|---|---|---|
| A Resource management | `PHASE_2_M1_ARCHITECTURE.md` §3 | G5 |
| B SQLite + migrations | `PHASE_2_M1_DATABASE_DESIGN.md` | G2 |
| C File storage engine | `PHASE_2_M1_STORAGE_DESIGN.md` | G3 |
| D File import/ingestion | `PHASE_2_M1_ARCHITECTURE.md` §5; storage §4–5 | G4 |
| E Metadata extraction | `PHASE_2_M1_ARCHITECTURE.md` §6 | G4 |
| F Tags/categories | `PHASE_2_M1_DATABASE_DESIGN.md` §3.12/§3.4; architecture §7 | G7 |
| G FTS5 search | `PHASE_2_M1_SEARCH_DESIGN.md` | G8 |
| H Relationships | `PHASE_2_M1_DATABASE_DESIGN.md` §3.11 | G7 |
| I Backup/restore | `PHASE_2_M1_STORAGE_DESIGN.md` §7 | G10 |
| J Export/import | `PHASE_2_M1_STORAGE_DESIGN.md` §8 | G11 |
| K Library UI | `PHASE_2_M1_UI_SPECIFICATION.md` | G1, G9 |
| L Error/recovery | `PHASE_2_M1_ARCHITECTURE.md` §11 | all (G12 acceptance) |

*(F-2 correction, D-026: the six v1.0 pointers in this table and in `PHASE_2_M1_ARCHITECTURE.md` §10 pointed at the wrong sections; corrected in this v1.1 pass.)*
| Security envelope | `PHASE_2_M1_SECURITY_REVIEW.md` | all |
| Budgets | `PHASE_2_M1_PERFORMANCE_BUDGET.md` | all |
| Gates | `PHASE_2_M1_MILESTONES.md` | — |
| Decisions | `PHASE_2_M1_OPEN_DECISIONS.md` | — |

---

## 5. Priorities made enforceable

Each directive priority is bound to a mechanism (not an intention):

1. **Minimum CPU/RAM** — no background services; job workers spawned per job and joined; bounded queues/caches; D-019 150 MB idle private-bytes target over the full process tree; shell delta gate (M1-P1, in force per DP-13/D-026); five-workload methodology.
2. **Minimum disk** — no duplicate media storage (evidence stays compact); no bundled anything; temp auto-cleaned with crash sweep; DB growth budget measured against a seeded corpus; attachments stored once per import with same-hash reporting (no silent duplication).
3. **Fast startup and search** — warm start ≤1.5 s (proposed) against the 47/67 ms M0 baseline; FTS p95 ≤10 ms @10k (proposed) / ≤50 ms @100k (carried); prepared statements; virtualized lists; lazy-loaded routes.
4. **Offline-first** — every M1 feature works with zero network; the frontend performs no fetches (D-022 CSP enforced); providers remain disabled placeholders (R-023/D-021).
5. **Data integrity** — FK enforcement; transactions around every multi-step operation; guarded migrations with failure recovery; transactional merge with exact undo; P1-F invariant suite as the regression gate; startup integrity checks; validated restore that never silently overwrites.
6. **Modular/expandable** — layered Rust core (commands/application/domain/infrastructure) with a framework-free domain; repository traits; adapter trait for ingestion so M2+ network adapters plug in without core changes; engine/provider seams preserved for Phase 3.
7. **Simple maintenance** — no ORM, no heavy UI framework, milestone-scoped dependencies only, small meaningful commits, documentation updated with behavior.
8. **Strong security** — D-022 CSP re-verified at G1/G12; least-privilege capabilities (dialog plugin only when file picking arrives, with audit); path-traversal defenses; validation-first intake; zip-bomb caps; secret-free logging; zero network surface.
9. **Phase 3 compatibility** — transcripts schema ready (segments table, retention states) even though transcription is later; mentions/evidence provenance fields ready; `provider_configs` placeholders unchanged; data layer is the substrate Phase 3 consumes through repository/service interfaces.

---

## 6. M1 dependency posture (summary; detail in the security review §9)

- **Frontend additions (G1, per D-023):** `lucide-svelte`, `clsx`, `tailwind-merge` — the only planned UI additions.
- **Rust additions (G2):** `rusqlite` (bundled), `tokio` (minimal), `uuid` (v7), `thiserror` — the Rev 1.3 M2 list, unchanged.
- **Rust additions (G4):** `tauri-plugin-dialog` (native file picker — arrives exactly when file picking exists, with a capability audit per SEC-04).
- **Deliberately absent in M1:** `reqwest`/`url`/HTML extraction (M-web milestone), FFmpeg/whisper.cpp (transcription milestone), `keyring` (Phase 3), any ORM, `sqlite-vec`, telemetry, heavy UI kits.
- **Standing review item (D-025):** `@sveltejs/kit` 2.x → 3.2.0 (+ `adapter-static` 4.0.1) assessed in the M1 dependency review before G1 adoption decisions; adopt only with a full green regression pass; otherwise remain on 2.x with the documented low-severity audit findings (non-exploitable in the shipped static-SPA architecture) and re-check at the next toolchain upgrade.
- Every dependency: license verified against the upstream license file at adoption; lockfiles committed; minimal feature flags.

---

## 7. Testing posture

Layers per `TESTING_STRATEGY.md` §3. Gate-specific suites are specified in `PHASE_2_M1_MILESTONES.md`. Anchors:

- **TEST-01** IPC contract round-trip (implemented at M0; extended per new command family).
- **TEST-02** P1-F 9-invariant suite ported + extended identity suite (G6 — the Phase 2 test centerpiece).
- **TEST-03** migration suite: fresh, upgrade, injected failure, recovery (G2).
- **TEST-04** FTS sync + latency harness (G2 skeleton, G8 full).
- **TEST-06** malformed-input + unsupported-format negatives; no-orphan-temp checks (G4).
- **TEST-07** job-runner tests: states, cancel, retry idempotency, crash recovery (G2).
- **TEST-08** backup roundtrip incl. attachments; malformed import; interruption; zip-bomb (G10/G11).
- **TEST-09** accessibility: per-primitive automated suites + manual keyboard walkthrough + manual screen-reader smoke test (G1; D-023 requires recorded results — ARIA presence is never accepted as compliance).
- **TEST-12** measurement scripts + consolidated M1 performance report (G12).
- Honest-results rule (AGENTS.md §12): failures reported, never hidden; no test claimed passed without execution; `cargo audit` + formal `npm audit` gates stay at the Phase 2 closure milestone.

---

## 8. Performance measurement plan (summary; full table in the budget document)

| When | What |
|---|---|
| G1 | Shell delta vs M0 idle baseline (proposed guard +10 MB tree private bytes); first-render time; svelte-check/bundle size |
| G2 | FTS latency harness @10k/100k; write overhead; DB size after seeding; WAL-vs-DELETE record |
| G3/G4 | Streamed-hash throughput; import duration per OD-9 profile; temp sweep leaves nothing behind |
| G6 | Candidate scan ≤1 s @10k (proposed); merge ≤250 ms @10 mentions (proposed) |
| G8/G9 | Search p95 @10k/100k; library interaction p95 @10k rows (virtualized) |
| G10/G11 | Export/restore duration @10k incl. attachments (proposed ≤60 s); bounded restore memory |
| G12 | Full consolidated M1 report with the OD-7 process-tree methodology and five workloads; misses documented |

M0 numbers are **historical baselines, not guarantees**; nothing is claimed achieved.

---

## 9. Explicit M1 review items (directive requirement)

### 9.1 Conditions inherited from M0 closure

1. **Production-CSP `style-src` console event** — one CSP enforcement event from the Svelte 5 runtime inline style; the console is not clean; zero application errors. M1's "no console errors" criterion cannot pass while it stands. The recorded ruling is in the security review §8.1 (DP-04, D-026): time-boxed investigation, accept-as-condition fallback, enforceable no-inline-style rule, no hash allowance. *(F-4 correction applied 2026-11-14.)*
2. **D-025 kit-3 deferral** — assessed in the M1 dependency review (§6 above; security review §9.2).
3. True cold-start measurement remains blocked by the `-Cold` script limitation (fix awaiting authorization — carried, G12 optional item).
4. W1 10-minute idle soak is first executable at G12 (per the PERF cadence).

### 9.2 Owner verification boundary

The M0 launch-confirmation waiver was **M0-only**. M1 owner-verification requirements (visual acceptance, a11y walkthrough, screen-reader smoke test, restore drill) stand unmodified and are embedded in the gate exit conditions.

### 9.3 Documentation carry-forwards

`README.md` status section staleness (§1.4) — corrected during G12 documentation updates, owner-visible, no code impact.

---

## 10. Decisions and recorded rulings (summary — full register in `PHASE_2_M1_OPEN_DECISIONS.md`; rulings recorded as D-026 in `DECISION_LOG.md` §4)

**Recorded owner rulings (2026-11-14, D-026):**

| ID | Decision | Ruling (D-026) | Gates |
|---|---|---|---|
| M1-OD-1 (DP-01) | M1 redefinition + gate plan G1–G12 + Rev 1.3 re-mapping | **APPROVED** | entire blueprint |
| M1-OD-2 (DP-02) | Post-M1 sequence: web ingestion → Whisper → hardening/closure | **APPROVED** | roadmap order |
| M1-OD-3 (DP-03) + OD-4 | Elaborated schema v1 (`resource_categories`; column/index detail) | **APPROVED WITH AMENDMENTS** — six mandatory amendments (F-1/A-1/A-2/A-3/A-8/A-11) incorporated in the DB design v1.1 | G2 (approval gate cleared) |
| M1-OD-4 (DP-04) | style-src condition strategy | **APPROVED WITH AMENDMENTS** — time-boxed investigation; accept-as-condition fallback; enforceable no-inline-style rule; no hash allowance | G1 console criterion |
| M1-OD-5 (DP-05) | Attachment store: per-UUID files | **APPROVED** | G3 |
| M1-OD-6 (DP-09) | Export/import data-package format (TVDP-1) + conflict policy | **DEFERRED — owner decision required before G11** | G11 |
| M1-OD-7 (DP-08) | Metadata sniffer: hand-rolled bounded sniffer | **APPROVED** | G4 |
| M1-OD-8 (DP-06) | Orphan policy: quarantine + 30-day grace | **APPROVED** | G3 |
| carried OD-4 | Schema v1 approval | **APPROVED WITH AMENDMENTS — D-026** | G2 (gate cleared) |
| carried OD-9 | Size-limit defaults (100/20/5 MB; logged overrides) | **APPROVED — D-026** | G4 (gate cleared) |
| carried OD-7 | Performance methodology | **APPROVED — D-026** (enforceable gates) | all gates |

*(The remaining approved rulings — DP-02 order, DP-11 system fonts, DP-12 kit-3 rule, DP-13 methodology — appear above and in D-026.)*

**Owner actions (non-approval):** OD-1 asset delivery · OD-12 key revocation · (post-M1) OD-11 fixtures.

**Already approved and honored:** D-022 CSP · D-023 primitives + a11y plan · D-019 RAM target/metric · D-002 retention · D-006/D-007 portability direction · D-011/D-012 design/logo · D-015 tiers (web adapters deferred out of M1) · D-020 reference designs · D-024 · D-025.

**Deferred (with the owner's prior records):** web/GitHub adapters + SSRF suite · YouTube records (OD-5) · Whisper chain (OD-2/3/10/11) · fuzzy matching (P-008) · notebooks/graph/bookmarks/analytics · MD/CSV (R-018) · palette (R-020) · encryption (P-014) · Android · embeddings (rejected, R-011/P-013).

**Requires research inside M1 (time-boxed, evidence-producing):** kit-3 regression compatibility (before G1 adoption decision, DP-12 rule) · FTS5 Urdu-tokenization behavior on owner fixtures (G8 evidence; no quality claims without them) · Svelte-runtime inline-style origin (G1, DP-04/D-026). *(F-4 correction applied 2026-11-14.)*

---

## 11. Verdict

**v1.1 status: decisions RESOLVED — awaiting separate M1 implementation authorization.** The owner ruled on all thirteen packaged decisions (D-026, 2026-11-14); the planning approval gates are cleared; **this document still authorizes no implementation** — no gate is implemented, verified, or passed, and design approval is not implementation evidence.

*(v1.0 verdict preserved for history:)* **READY FOR OWNER REVIEW.**

Basis (v1.0 assessment, preserved for history): the blueprint is grounded in the verified M0 implementation and the approved decision record; every module has a design, contract, failure model, tests, and rollback path; all v1.0 recommendations were labeled Proposed; the two inherited M0 conditions and the OD-4/OD-9 gates were stated rather than assumed away; no measurement is invented. *(All thirteen recommendations have since been ruled on — D-026; see §10.)*

The blueprint becomes implementable only when: (1) the owner approves the gate plan (M1-OD-1) and the schema surface (M1-OD-3 + OD-4), (2) the carried OD approvals needed by specific gates are recorded, and (3) the owner grants **separate, explicit M1 implementation authorization** — nothing here is that authorization.

---

**Companion documents:** `PHASE_2_M1_ARCHITECTURE.md` · `PHASE_2_M1_DATABASE_DESIGN.md` · `PHASE_2_M1_STORAGE_DESIGN.md` · `PHASE_2_M1_SEARCH_DESIGN.md` · `PHASE_2_M1_UI_SPECIFICATION.md` · `PHASE_2_M1_PERFORMANCE_BUDGET.md` · `PHASE_2_M1_SECURITY_REVIEW.md` · `PHASE_2_M1_MILESTONES.md` · `PHASE_2_M1_OPEN_DECISIONS.md` · traceability matrix §14 (proposed M1 registration).

**End of PHASE_2_M1_MASTER_BLUEPRINT.md**
