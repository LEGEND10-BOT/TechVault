# TechVault Phase 2 M1 — Milestones (Implementation Gates)

**Document status:** v1.1 (2026-11-14, owner rulings recorded — see revision note below). **Nothing here authorizes implementation.** Each gate is small and independently testable, with its own exit condition and rollback path. General rules (inherited): small meaningful commits; tests written with the code; no gate closes without recorded evidence; failed tests reported, never hidden; criteria never weakened; dependencies adopted gate-scoped only.
**v1.1 changes (owner directive §B–§E, recorded as D-026):** the DP-01..DP-13 rulings are recorded in `DECISION_LOG.md` §4 — **all M1 planning approval gates are cleared**; the six mandatory schema amendments (F-1/A-1/A-2/A-3/A-8/A-11) are incorporated into the database design v1.1 and reflected below as gate tasks/tests; DP-04's CSP strategy (time-boxed investigation → accept-as-condition fallback; enforceable no-inline-style rule; no hash allowance) is embedded in G1; DP-10's tokenizer pin and harakat probe in G8; A-4 relocation in G3; A-9 encoding matrix in G4; A-7/A-10 in G10; **DP-09 is DEFERRED — owner decision required before G11**; F-2 cross-reference corrections are completed in this reconciliation pass (v1.1); every gate still awaits **separate M1 implementation authorization** and no gate is marked implemented or passed.
**v1.0:** Prepared Draft (2026-11-14) — blueprint only; gate plan proposed under M1-OD-1.

**Gate plan status: APPROVED — DP-01 (D-026, 2026-11-14).** The twelve-gate plan and the Rev 1.3 re-mapping are approved; the schema surface is approved with amendments (DP-03 + OD-4, D-026); the intake limits are approved (DP-07/OD-9, D-026). **Every gate still requires the owner's separate, explicit M1 implementation authorization — D-026 is not that authorization, and neither is this document.**

---

## Sequencing overview

```
M0 (CLOSED) ──► G1 shell/primitives ──► G2 database+jobs ──► G3 storage engine ──► G4 import+metadata
                                                                                        │
        G5 resources ◄──────────────────────────────────────────────────────────────────┘
            └► G6 identity/dedup ──► G7 tags/categories/links ──► G8 search ──► G9 library UI
                                                                                  │
                        G10 backup/restore ──► G11 export/import ──► G12 acceptance/closure
```

G10 can start after G3 (parallel with G5–G9 if the owner prefers); its restore validation is strongest after G8 data exists. The recommended order is the strict chain above.

---

## G1 — Application shell and design-system foundation ✅ implemented + correction pass + owner manual acceptance + performance decision complete (2026-11-19) — **evidence set complete; formal closure pending the owner's explicit instruction.** Manual acceptance checklist completed by the owner; performance decision approved (M1-P1 MET at the pinned 60-second settle, +5.42 MB median, guard unchanged — `PHASE_2_M1_PERFORMANCE_BUDGET.md` §3; absolute 150 MB verdict scheduled for the G12 W1 soak). Records: `docs/PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md` v1.1; implementation report §1–§12; verification §1–§10; correction evidence `docs/phase2-results/m1/g1r2-correction-pass.md`; performance reconciliation `docs/phase2-results/m1/perf-budget-reconciliation.md` (P-1..P-4 approved)

1. **Objective:** the approved visual direction as real UI (D-011), with the D-023 primitive set and recorded accessibility evidence.
2. **Scope:** IN — AppShell (220 px sidebar + 56 px topbar + workspace + contextual-panel host), route skeleton for all 8 nav items, dark/light themes with persistence, full design-token set + typography, the eleven in-house primitives, global error boundary, inert job-status indicator, Settings shell with R-023 disabled provider placeholders, accessibility test plan execution, **the enforceable no-inline-style rule (DP-04/D-026: no `style:` directives and no `style=` attributes in application components; extended `check-csp` assertion)**, and the time-boxed style-src investigation per DP-04. OUT — any data-bound feature; logo asset integration (OD-1 pending).
3. **Dependencies:** M0 closed; **DP-01/DP-04/DP-12/DP-13 approved (D-026)**; F-2 cross-reference corrections completed in the v1.1 reconciliation pass (before this gate). **Gate-scoped dependencies:** `lucide-svelte`, `clsx`, `tailwind-merge` (D-023). Pre-task: the M1 dependency review incl. the D-025 kit-3 assessment under the approved DP-12 rule (adopt 3.x **only** after a complete green regression, recorded as its own decision; otherwise stay on 2.x).
4. **Deliverables:** shell + routes + primitives + theme system; `check-csp` extended/verified on the real UI; TEST-09 evidence pack.
5. **Security checks:** production CSP strict on the real UI (`check-csp` + devtools negatives); dev allowances isolated (D-024); no secrets in frontend (SEC-16).
6. **Performance tests:** shell delta vs M0 idle ≤ +10 MB tree private bytes (proposed); first-render recorded; bundle-per-route.
7. **Automated tests:** component tests (theme store, nav, each primitive variant); per-primitive a11y suites; `check-csp`; visual smoke.
8. **Manual tests:** owner visual acceptance vs `UI_DESIGN_SYSTEM.md` in both themes; manual keyboard walkthrough; manual screen-reader smoke test (recorded); reduced-motion check; window-resize check.
9. **Acceptance criteria:** all nav items render with designed empty states; theme persists across restart; keyboard traversal with visible focus; every primitive passes the full accessibility plan; shell matches design tokens; production CSP strict; console state resolved per **DP-04 (D-026)** — time-boxed investigation executed and recorded; if the runtime event is not reasonably eliminable, it is documented and accepted as a known condition (zero application errors required either way); extended `check-csp` passes including the no-inline-style assertion.
10. **Exit condition:** owner visual + accessibility acceptance recorded.
11. **Rollback:** revert UI commits (no schema/storage impact); primitives are additive files.
12. **Review items:** style-src strategy per DP-04 (D-026) — time-boxed investigation, accept-as-condition fallback; kit-3 outcome per DP-12 rule; fonts resolved by DP-11 (system fonts). *(F-3 correction applied 2026-11-14.)*

## G2 — Database foundation and job lifecycle  ✅ approval gate CLEARED (DP-03 + OD-4 approved WITH AMENDMENTS — D-026); awaits separate M1 implementation authorization

1. **Objective:** production SQLite + migrations + repositories + typed errors + the cancellable job model.
2. **Scope:** IN — connection management, guarded migration runner with failure/recovery, **schema v1 exactly as approved WITH AMENDMENTS (D-026; `PHASE_2_M1_DATABASE_DESIGN.md` v1.1 — including §3.18 `resource_identity_decisions`, the A-2 FK guard on `mentions.source_id`, the A-8 slug rules, and the A-11 verification rules)**, repositories, transaction helpers, FK enforcement, FTS5 skeleton + triggers, job runner (C6 states, throttled progress, cancellation, retry idempotency, crash recovery, worker spawn/join), startup integrity checks, WAL evidence decision. OUT — notebooks/bookmarks/graph tables (never created in v1); any AI.
3. **Dependencies:** G1. Gate-scoped dependencies: `rusqlite` (bundled), `tokio` (minimal), `uuid` (v7), `thiserror`.
4. **Deliverables:** `infrastructure/db/`, repositories, `jobs/`, migration 001; DB status command.
5. **Security checks:** FK violations rejected; no secrets in DB fields; restrictive DB-directory ACLs; bounded payload validation on new commands.
6. **Performance tests:** FTS latency @10k + write overhead (harness committed); DB size after seeding; WAL-vs-DELETE evidence record.
7. **Automated tests:** P1-F 9-invariant suite ported (TEST-02, mechanism caveat retained); migration suite fresh/upgrade/injected-failure/recovery (TEST-03) asserting the **D-026 amendment schema** (§3.18 table present; A-2 FK guard behaves as specified); FTS trigger sync (TEST-04); job-runner suite (TEST-07: transitions, cancel, idempotent retry, kill-during-job consistency); corruption detection; **source-deletion service transaction test (A-2): confirmed flow removes mentions + evidence atomically; any path bypassing the transaction fails on the FK guard**.
8. **Manual tests:** app starts against an empty library; settings paths honored.
9. **Acceptance criteria:** fresh DB creates and opens; migration apply + rollback + failure-recovery verified; repositories transactional; job state machine proven; startup after simulated crash recovers; FTS triggers keep indexes synced; **WAL decision recorded with test evidence (pass or documented stay-on-DELETE)**.
10. **Exit condition:** schema implemented exactly as approved; regression suite green; WAL evidence recorded.
11. **Rollback:** migration 001 removal + revert commits (no user data exists yet).
12. **Review items:** WAL evidence gate; connection-contention measurement before any pool complexity.

## G3 — File storage engine and attachments

1. **Objective:** the three storage categories as working infrastructure with atomic placement, streamed hashing, and orphan safety.
2. **Scope:** IN — attachments store (sharded dirs, internal names), temp workspace, safe path joins, streamed SHA-256, atomic registration (file→fsync→rename→transaction), attachment CRUD commands + service, orphan sweep + quarantine (DP-06 approved: 30-day grace), **attachment-directory relocation job (A-4, D-026 — copy+verify+atomic flip; DB relocation not offered)**, storage settings (paths, usage summary), diagnostics. OUT — import flows (G4); backup (G10).
3. **Dependencies:** G2 (DB + jobs).
4. **Deliverables:** `infrastructure/storage/`, `attachment_service`, attachment commands, Settings → Storage section.
5. **Security checks:** traversal negative suite; internal-filename enforcement; category-1 files excluded from every cleanup path (tested).
6. **Performance tests:** streamed-hash throughput recorded (planning expectation ≥200 MB/s NVMe, measured not assumed); registration memory profile (no full-file reads).
7. **Automated tests:** hash correctness; atomic placement incl. simulated crash between rename and commit → orphan quarantined; **the default cross-volume copy+fsync+rename path (F-3, D-026) as a dedicated fixture test**; **relocation suite (A-4): roundtrip with per-file hash verification, interrupted relocation discards the workspace, hash-mismatch abort leaves both trees intact**; retention-choice semantics; hash-mismatch quarantine; cleanup-never-touches-attachments invariant; **temp-root ACL sanity check on the configured temp directory (TESTING_STRATEGY §11 "temporary-file permissions")**.
8. **Manual tests:** register/list/remove an attachment via the service surface; Settings storage paths honored.
9. **Acceptance criteria:** attachment rows + files consistent in both directions; orphans quarantined with report (or the owner-selected policy); no partial final files ever observable.
10. **Exit condition:** storage suite green + owner pass recorded.
11. **Rollback:** revert commits; attachments dir removal safe (no DB rows reference it after revert).
12. **Review items:** none open — DP-05 (store layout) and DP-06 (orphan policy) are APPROVED (D-026); A-4 relocation is defined in the storage design v1.1.

## G4 — File import, ingestion, and metadata extraction  ✅ approval gate CLEARED (DP-07/OD-9 + DP-08 APPROVED — D-026); awaits separate M1 implementation authorization

1. **Objective:** validated, atomic, recoverable local import with honest capability boundaries.
2. **Scope:** IN — `pasted_text` + `local_file` adapters with capability reporting, validation-first intake, OD-9 limits + overrides (DP-07 approved: 100 MB media / 20 MB documents / 5 MB pasted text; logged overrides), **metadata extraction** (magic-byte sniffer per DP-08; text/media metadata per the architecture §6 matrix), duplicate-submission detection (content-hash link), intake jobs on the runner, retention choice recording, import-format matrix enforcement (unsupported → typed `Unsupported`), **accepted text-encoding matrix (A-9, D-026): UTF-8 (BOM or not) and UTF-16 by BOM accepted; all other encodings → typed `Unsupported` (no lossy conversion by default)**, `tauri-plugin-dialog` (minimal grants + audit). OUT — web/URL/YouTube inputs (post-M1); OCR/PDF/office (typed non-claim); full media probing.
3. **Dependencies:** G2, G3.
4. **Deliverables:** `adapters/`, `meta/`, import commands + services; import status/retry surface.
5. **Security checks:** OD-9 limit matrix tests; type-mismatch negatives; malformed-input negatives (TEST-06); capability audit for the dialog plugin; no archives accepted.
6. **Performance tests:** import duration per profile recorded (planning expectations in the budget doc); temp dir empty after batch; no orphan temps incl. crash sweep.
7. **Automated tests:** adapter unit + integration (cancel mid-intake, retry idempotency, duplicate-link behavior, retention flows, encoding detection, sniffer matrix); unsupported-format negatives; crash-recovery sweep.
8. **Manual tests:** paste flow; local media both retention choices; duplicate submission; unsupported file → clear typed message; cancel mid-intake.
9. **Acceptance criteria:** paste → source with provenance; local file → category honored; duplicates link; invalid/oversized/unsupported → typed errors; **non-UTF-8/non-UTF-16 encodings → typed `Unsupported` with guidance (A-9)**; no orphan temp; metadata honest (no invented media fields).
10. **Exit condition:** import suite green + owner manual pass recorded.
11. **Rollback:** flag-gate the import commands (adapters feature-flagged off) — DB rows remain valid sources.
12. **Review items:** none open — DP-07/DP-08 approved (D-026); encoding matrix defined (A-9).

## G5 — Resource management core

1. **Objective:** canonical resources as first-class objects with complete identity surfaces.
2. **Scope:** IN — resource CRUD/archive; extensible categories (seeded B3; **deterministic slug generation with collision handling per A-8/D-026**); aliases; strong identifiers (partial-unique rules); **manual** mentions; compact evidence; append-only history on meaningful edits; **verification-status changes are user-controlled and append `resource_history` entries (A-11/D-026)**; verification-status display rules (4 states + unverified warning; confidence never fabricated); **source-deletion flow with explicit confirmation listing affected mention/evidence counts, then the single-transaction service deletion (A-2/D-026)**; delete flows with explicit consequences. OUT — AI verification/suggestions (Phase 3); fuzzy matching (P-008).
3. **Dependencies:** G2, G4 (mention sources exist).
4. **Deliverables:** `resource_service` + repositories + commands; category seeds.
5. **Security checks:** transaction integrity; payload validation; sanitized errors.
6. **Performance tests:** paged list queries @10k (keyset) recorded.
7. **Automated tests:** domain rule units (verification transitions **including A-11 user-write + history-entry assertions**, alias typing, identifier normalization/uniqueness); **category slug generation/collision tests (A-8)**; repository integration; history append-only invariant; evidence-survives-deletion contract; delete-consequence correctness **including the A-2 source-deletion confirmation flow**.
8. **Manual tests:** create/edit/archive/delete walkthroughs on seeded data.
9. **Acceptance criteria:** every CRUD flow transactional; meaningful edits append history; aliases typed; identifiers unique only where meaningful; unverified warning renders; no silent data loss on delete.
10. **Exit condition:** suite green + owner pass recorded.
11. **Rollback:** revert commits; schema untouched (v1 already contains the tables).

## G6 — Identity and deduplication  ★ Phase 2 test centerpiece

1. **Objective:** safe identity: identifier-based candidates, review queue, transactional merge with preview/undo/history.
2. **Scope:** IN — identifier normalization service; candidate generation (identifier-equality only) **with suppression from `resource_identity_decisions` (A-3/D-026)**; review-queue service + minimal UI hooks; merge preview (winning fields, affected records **including the tag-union outcome per F-1**); transactional merge (snapshot **including tag rows (F-1)** → re-point → tag union with primary-row precedence on conflicts → `merged_into` → history → FTS rows removed by triggers); **undo with drift validation (A-1/D-026): typed conflict on post-merge edits, exact restore otherwise**; immutable history; "not the same" recording persisted in `resource_identity_decisions`. OUT — similarity/fuzzy candidates (P-008); auto-merge of any kind.
3. **Dependencies:** G5.
4. **Deliverables:** `identity.rs`, `merge_service`, review-queue data flows.
5. **Security checks:** no partial merge states (transaction integrity); concurrent-merge guard.
6. **Performance tests:** candidate scan ≤1 s @10k; merge ≤250 ms @10 mentions (proposed).
7. **Automated tests:** **extended P1-F suite** (original 9 + uncertain-never-auto-candidate; preview equals outcome; undo-twice fails cleanly; history immutable; not-the-same suppression **persisted via `resource_identity_decisions` and honored by candidate generation (A-3)**; **tag-union merge with conflict precedence (F-1)**; **undo-after-edit returns a typed conflict without overwriting user changes (A-1)**) — TEST-02; merge/undo property test; kill-during-merge consistency; concurrent-merge guard; FTS-redirect removal (TEST-04).
8. **Manual tests:** review-queue walkthrough; merge + undo on seeded data; evidence visibly preserved.
9. **Acceptance criteria:** extended suite green; no path upgrades verification via merge; aliases/identifiers/history preserved; **no confidence fabrication anywhere**.
10. **Exit condition:** regression gate passed (the Phase 2 test centerpiece).
11. **Rollback:** revert commits; merge records are transactional and never leave partial state.
12. **Review items:** none open — merge semantics APPROVED with amendments (DP-03/OD-4, D-026). *(F-5 correction applied 2026-11-14.)*

## G7 — Tags, categories, and relationships

1. **Objective:** lightweight organization (tags), extensible categories, and user-populated relationships.
2. **Scope:** IN — `resource_tags` service (add/remove/rename, NFKC normalization, case-preserving), tag list (GROUP BY), `resource_categories` CRUD (delete blocked while referenced), `resource_links` service + typed relationship values + duplicate-inverse/self-link guards, **minimal manual link/unlink affordance** in the resource detail data layer. OUT — AI link population (Phase 3); collections (Phase 4).
3. **Dependencies:** G5.
4. **Deliverables:** `tag_service`, `link_service`, category service + commands.
5. **Security checks:** transactional mutations; validated relationship values; payload bounds.
6. **Performance tests:** tag-filtered list query @10k recorded.
7. **Automated tests:** tag normalization/UNIQUE behavior; rename transaction; category delete-guard; link guards (self, inverse-duplicate); cascade correctness on resource delete.
8. **Manual tests:** tag/untag/rename; category add/remove; link/unlink walkthrough.
9. **Acceptance criteria:** tags and links behave transactionally; categories extensible and protected; no orphan tag/link rows.
10. **Exit condition:** suite green + owner pass recorded.
11. **Rollback:** revert commits (v1 tables already present).

## G8 — Full-text search

1. **Objective:** working search with filters and honest latency numbers.
2. **Scope:** IN — query pipeline (escaped MATCH + relational filters + sorting + keyset paging), filter metadata command, global-search data layer, latency instrumentation, bulk-reindex job (cancellable, non-blocking), **Urdu FTS probe** on owner fixtures (time-boxed; raw results recorded, no quality claims). OUT — command palette (R-020 PA); semantic search (RJ).
3. **Dependencies:** G6 (merged/consistent data), G7 (tag filters).
4. **Deliverables:** `search_service` + commands; harness scripts committed.
5. **Security checks:** injection-safe MATCH escaping (unit + fuzz-ish negatives).
6. **Performance tests:** p95 @10k and @100k; write overhead; reindex duration (M1-P4..P7).
7. **Automated tests:** FTS sync after edit/merge/delete (TEST-04); filter composition; escaping negatives; latency harness.
8. **Manual tests:** realistic Urdu/English/mixed search scenarios; filter interactions; **the DP-10-amended Urdu probe including the harakat check (index harakat-bearing text; record whether `remove_diacritics=2` strips/alters/retains U+064B–U+0652; search with and without diacritics; raw observations recorded)**.
9. **Acceptance criteria:** index consistency proven; filters compose; p95 measured vs targets (misses documented); empty/no-result states designed; **the probe evidence records observed tokenizer behavior with no claim beyond it (DP-10/D-026: no Urdu stemming or advanced-multilingual claims anywhere)**.
10. **Exit condition:** latency report recorded.
11. **Rollback:** revert commits; indexes rebuildable.
12. **Review items:** Urdu probe evidence; index-set review against measured query patterns.

## G9 — Resource library UI

1. **Objective:** the library as a real, fast, accessible screen set on the G1 shell.
2. **Scope:** IN — virtualized library table (columns, sorting, saved filters), resource detail view (aliases dropdown, mentions, evidence viewer, attachments list, tags editor, relationships, history), import workflow UI over G4, filter chips, search results UI, deep links, complete state matrix. OUT — notebooks/graph/bookmarks/analytics content (placeholders only); mobile layouts.
3. **Dependencies:** G1, G5–G8.
4. **Deliverables:** `components/library/*`, routes wired to real data.
5. **Security checks:** content rendered as text only (no HTML injection paths); confirmation dialogs for all destructive actions.
6. **Performance tests:** interaction p95 @10k virtualized (≤100 ms proposed); memory delta vs W1 (≤ +25 MB proposed).
7. **Automated tests:** component tests per view; state-matrix tests; a11y suites for composed screens; virtualization behavior.
8. **Manual tests:** owner walkthrough of a 100-resource synthetic library in both themes; import workflow; tag/filter flows; keyboard-only navigation.
9. **Acceptance criteria:** all screens match the design system; states complete; virtualization holds the p95 target (miss documented otherwise); destructive confirmations show consequences.
10. **Exit condition:** owner manual pass recorded.
11. **Rollback:** revert UI commits (data layer untouched).

## G10 — Backup and restore

1. **Objective:** local data protection per D-007 with the hardened format.
2. **Scope:** IN — versioned archive (manifest + DB snapshot + attachments), atomic creation + verification, **job-queue quiescence before export/restore (A-10/D-026: active jobs listed; user waits or cancels; no mid-job snapshot)**, restore validation pipeline + pre-restore safety backup + close→swap→reopen, **full-replacement restore semantics (A-7/D-026: post-restore attachments tree = archive set; live extras moved to orphan quarantine, never silently deleted; stated explicitly in the confirmation dialog)**, interrupted-operation recovery, zip-bomb caps, Settings → Backup UI with progress + cancellation. OUT — cloud sync (D-006); encryption (P-014 documented limitation); MD/CSV (PA).
3. **Dependencies:** G3 (attachments); best after G8 data exists.
4. **Deliverables:** `backup_service` + commands; archive format spec implemented exactly.
5. **Security checks:** SEC-14 suite; traversal-safe extraction; restore-never-silent-overwrite; no-encryption limitation stated in UI notes.
6. **Performance tests:** export/restore duration @10k incl. attachments (≤60 s proposed); bounded restore memory.
7. **Automated tests:** TEST-08 full suite (roundtrip incl. attachments; corrupted/foreign/newer-format rejections; interruption tests; zip-bomb negatives; safety-backup restorability; **quiescence-wait test (A-10)**; **full-replacement test incl. live-extra quarantine (A-7)**).
8. **Manual tests:** **owner restore drill** (export → wipe/restore → verify) — the exit gate.
9. **Acceptance criteria:** roundtrip hash-verified; restore never overwrites without confirmation; interrupted operations leave the live library untouched.
10. **Exit condition:** owner restore drill completed.
11. **Rollback:** revert commits; backup format versioned so early archives stay importable.
12. **Review items:** WAL-mode backup correctness (only if WAL was enabled at G2).

## G11 — Export and import (data portability)  ⛔ owner decision required before this gate: DP-09 DEFERRED (D-026) — the TVDP-1 format and conflict policy must be approved before G11 freezes

1. **Objective:** structured library data export/import per D-007 with an explicit conflict policy (M1-OD-6). **DP-09 is DEFERRED by the owner (D-026): G1–G10 proceed without it; this gate must not freeze or start until the owner records the DP-09 decision.**
2. **Scope:** IN — TVDP-1 JSON export (metadata always; optional hash-named attachment sidecar), import with preview report + conflict policy (id/identifier matching; update-or-skip; never auto-merge), single-transaction commit, malformed-package rejections. OUT — MD/CSV (R-018 PA); conflict auto-resolution.
3. **Dependencies:** G10 (shares archive/zip-bomb infrastructure); G5–G7 data.
4. **Deliverables:** `data_export`/`data_import` commands + format schema documented.
5. **Security checks:** package size caps (OD-9 posture); attachment sidecar hash verification; traversal-safe sidecar extraction; malformed negatives.
6. **Performance tests:** export/import duration @10k recorded; bounded memory.
7. **Automated tests:** roundtrip; conflict-matrix tests (identical/changed/new/missing-reference); malformed/negative suite; interruption test.
8. **Manual tests:** export → import into a scratch profile with conflicts; review preview report behavior.
9. **Acceptance criteria:** roundtrip preserves entities; conflicts resolved only by explicit user choice; never auto-merges; typed rejections for foreign/corrupt packages.
10. **Exit condition:** suite green + owner pass recorded.
11. **Rollback:** revert commits; export files are inert data.
12. **Review items:** ⛔ DP-09 DEFERRED (D-026) — the owner's format/conflict-policy decision is required before this gate freezes; no other review items.

## G12 — Error handling, recovery, and M1 acceptance

1. **Objective:** close M1 honestly: cross-cutting recovery proof, security closure for M1 scope, consolidated performance report, documentation, handoff.
2. **Scope:** IN — crash-recovery suite (simulated crashes across import/merge/backup paths); startup recovery verification; W1 10-minute soak + warm-start re-run; consolidated performance report (every budget row Measured/Pass/Fail/N-A); security closure (bundle scan, log review, secret scan, capability audit vs used APIs, dependency inventory refresh); README status-section correction; documentation + decision-log updates; M1 handoff record. OUT — new features; formal `cargo audit`/`npm audit` gates (stay at Phase 2 closure per the inherited plan).
3. **Dependencies:** all gates.
4. **Deliverables:** recovery test suite; `docs/phase2-results/m1/` evidence; M1 performance report; updated docs; M1 handoff section.
5. **Security checks:** the G1–G11 security checks re-verified on the final build.
6. **Performance tests:** full consolidated report with the OD-7 methodology.
7. **Automated tests:** full regression pass (TEST-01..09 as applicable); recovery suite; committed measurement scripts (TEST-12).
8. **Manual tests:** roadmap §6 workflow acceptance walkthrough (owner); performance report review.
9. **Acceptance criteria:** every budget measured and reported; all gate criteria evidenced; known limitations listed (no encryption at rest; Urdu tokenization scope per the probe; codepoint ordering; metadata matrix boundaries; all carried deferrals); traceability statuses refreshed.
10. **Exit condition:** **M1 exit gate — owner reviews closure and authorizes the next milestone (web ingestion per M1-OD-2).**
11. **Rollback:** n/a (closure gate).
12. **Review items:** true cold-start measurement (if the `-Cold` fix is authorized); README correction.

---

## Gate readiness matrix (updated 2026-11-14, D-026)

**Status after the owner's rulings:** every M1 planning approval gate is **CLEARED** — DP-01..DP-08 and DP-10..DP-13 are APPROVED (three with amendments, recorded in D-026). The only open planning decision is **DP-09 (DEFERRED — required before G11)**. **No gate is authorized: M1 implementation requires the owner's separate, explicit authorization, which has not been granted.** No gate is implemented, verified, or passed — design approval is not implementation evidence.

| Gate | Technically ready | Owner approval | Blocked by |
|---|---|---|---|
| G1 | Yes | **CLEARED — DP-04 (CSP strategy), DP-12 (kit-3 rule), DP-13 (gate mode) approved, D-026** | **M1 implementation authorization** |
| G2 | Yes (design, D-026-amended schema v1.1) | **CLEARED — DP-03 + OD-4 approved WITH AMENDMENTS, D-026** | G1; **M1 implementation authorization** |
| G3 | Yes (design incl. A-4 relocation, F-3 cross-volume test) | **CLEARED — DP-05/DP-06 approved, D-026** | G2; implementation authorization |
| G4 | Yes (design incl. A-9 encoding matrix) | **CLEARED — DP-07/OD-9, DP-08 approved, D-026** | G3; implementation authorization |
| G5/G6/G7 | Yes (design incl. A-2/A-8/A-11 and F-1/A-1/A-3 amendments) | **CLEARED — schema amendments approved, D-026** | prior gates; implementation authorization |
| G8 | Yes (design incl. DP-10-amended tokenizer + harakat probe) | **CLEARED — DP-10 approved WITH AMENDMENTS, D-026** | G6/G7; owner Urdu fixtures (probe, recommended); implementation authorization |
| G9 | Yes (design) | CLEARED (primitives D-023) | G1+G5..G8; implementation authorization |
| G10 | Yes (design incl. A-7/A-10) | CLEARED | G3 (best after G8); implementation authorization |
| G11 | Yes (design) | **⛔ DP-09 DEFERRED (D-026) — owner decision required before this gate freezes** | G10; **DP-09 decision**; implementation authorization |
| G12 | Yes (design) | CLEARED | all gates; implementation authorization |

**Owner actions outstanding (standing):** OD-1 asset delivery · OD-12 key revocation · Urdu fixtures for the G8 probe (optional but recommended) · **DP-09 decision before G11**.

---

**End of PHASE_2_M1_MILESTONES.md**
