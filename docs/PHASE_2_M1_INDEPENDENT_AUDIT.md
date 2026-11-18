# TechVault Phase 2 M1 — Independent Blueprint and Approval Pack Audit

**Document status:** Audit record v1.0 (2026-11-14). Read-only audit of the M1 blueprint package (10 documents) and the owner approval pack. **No document was edited, no decision approved, no code/configuration/dependency changed, no migration created, no network call made.** Only this file was created. M1 implementation remains unauthorized.

**STATUS UPDATE (2026-11-14, D-026 — appended; all findings and history above are preserved verbatim):** the owner ruled on all thirteen decisions and **adopted the audit's amendments as mandatory** (§B–§E of the ruling directive): F-1, A-1, A-2, A-3, A-8, A-11 into the schema (DP-03 approved with amendments); A-4, A-7, A-10, F-3 into the storage/gates; A-5 (as the DP-10 amendment — `remove_diacritics=2` pinned, harakat probe) into search; A-6 into the DP-04 CSP strategy; A-9, A-11 into G4/G5; A-12 retained as a documented intentional design choice; F-2 corrections executed in the v1.1 reconciliation pass. The audit's verdict conditions are thereby discharged at the planning level — **implementation evidence for every condition still accrues only at its gate**; nothing is Implemented or Verified. Full record: `DECISION_LOG.md` §4 D-026; `PHASE_HANDOFF.md` §23.

**Independence statement:** this audit re-derived its conclusions from primary evidence (documents, code, grep, git) rather than accepting prior claims. Where a prior finding (F-1..F-6, H-1..H-3 from `PHASE_2_M1_OWNER_APPROVAL_PACK.md`) was re-verified, the verification evidence is cited; where the audit disagreed, the correction is stated. Three of the audit's findings are gaps that survived both the Rev 1.3 planning package and the two prior M1 review passes.

---

## 1. Overall verdict

**PASS WITH CONDITIONS.**

The proposed M1 architecture is technically sound in its core mechanisms (typed IPC — M0-implemented; guarded migrations, transactional merge/undo, FTS5 trigger sync — P1-F-measured; zero network surface — verified absent from every gate; hardened backup format; honest performance non-claims). No Critical defect exists. The conditions are:

1. **Schema-surface gaps must enter DP-03 before G2** — migration 001 creates the complete schema v1 in one transaction, so A-2 and A-3 (below) cannot be deferred to implementation time without forcing a second migration.
2. **Behavioral spec gaps must be resolved before their gates** (A-1 before G6, A-4 before G3, A-5 within DP-10, A-6/A-11 before G1/G5).
3. **F-2 documentation corrections before G1** (trivial, owner-authorized).
4. **All thirteen DP decisions remain owner rulings** — this audit assesses which are safe to approve as-is vs. requiring amendment (§7); it approves nothing.

## 2. Method and evidence base

- **Documents inspected:** the ten `PHASE_2_M1_*.md` documents; `PHASE_2_M1_OWNER_APPROVAL_PACK.md`; `DECISION_LOG.md` (D-021..D-025 verified present at lines 483–555); `PHASE_2_M0_CLOSURE_REPORT.md`; `PHASE_2_TRACEABILITY_MATRIX.md` (incl. §14 at line 256); `PHASE_HANDOFF.md`; `AGENTS.md`; `DATABASE_DESIGN.md`; `UI_DESIGN_SYSTEM.md`; `TESTING_STRATEGY.md` (§3.3 contract tests, §5 identity invariants, §10 database tests, §11 security tests read in full); `PHASE_2_MILESTONES.md`; M0 implementation (`ipc.rs`, `errors.rs`, `lib.rs`, `commands/app.rs`, `logging.rs` rotation constants, `tauri.conf.json`, `capabilities/default.json`, `Cargo.toml`, `package.json`, `app.css`, all Svelte routes/components grepped).
- **Mechanical checks:** git state before/after; diff-vs-HEAD scope proof; grep-based cross-reference validation of every section pointer between M1 documents; grep-based scope proof (whisper/YouTube/cloud/reqwest/openrouter absence from in-scope contexts); accessibility-requirement wording comparison against D-023.
- **New code inspection performed by this audit:** grep of all M0 Svelte components for inline-style usage (`style:` directives, `style=` attributes) — **zero hits** (evidence for §4/A-6 and the DP-04 amendment).

## 3. Challenge results — prior findings re-verified

| Prior finding | Verdict | Evidence and corrections |
|---|---|---|
| **F-1** merge/tag consolidation | **CONFIRMED — accurate, but its proposed resolution is incomplete** | `PHASE_2_M1_DATABASE_DESIGN.md:147` — the merge re-point list is "mentions/evidence/aliases/identifiers/history/links/attachments" — tags absent; `:98` `UNIQUE(resource_id, tag)` makes naive tag re-pointing fail. **Correction:** the fix must (a) define consolidation (union; conflict keeps the primary's row, duplicate dropped, both shown in preview) **and (b) extend `resource_merges.snapshot_json` to include the merged resource's tag rows** — otherwise undo cannot restore them exactly. The pack's DP-03 text covered (a) only. |
| **F-2** six wrong cross-references | **CONFIRMED — exactly as characterized** | Verified by grep this audit: storage doc sections are §7 backup / §8 export-import while MASTER §4 points I→"§6", J→"§7"; DB doc tags/categories/relationships live at §3.12/§3.4/§3.11 while MASTER §4 points F→"§7", H→"§8"; architecture Module L is §11 while MASTER §4 points L→"§7"; ARCHITECTURE §10 line 180 points to "§6–§7". Six pointers, one correction task. |
| **F-3** cross-volume copy fallback | **CONFIRMED — accurate; severity arguably Low-Medium, not Medium** | `PHASE_2_M1_STORAGE_DESIGN.md:50` — copy+fsync+rename fallback exists; defaults (temp `D:\Temp\` per D-019, app-data on C:) are indeed cross-volume. Impact is bounded (≤100 MB media per OD-9; copy on NVMe ≈ sub-second to ~1 s; measured at G3/G4 as M1-P8/P9). Windows `fs::rename` is atomic within a volume — no correctness issue. **Correction:** downgrade suggested to Low-Medium; and see §6 — the *default* copy path itself has no dedicated test. |
| **F-4** Svelte runtime style-src event | **CONFIRMED — and now materially strengthened by new evidence** | M0 final verification §5.6 documented the unidentifiable call site. **This audit's new grep: M0 application code contains zero `style:` directives and zero `style=` attributes** — the blocked inline style cannot originate from TechVault code. Consequence: DP-04 Option A ("eliminate app-side") has **low probability of success** as stated — the style is applied by the Svelte 5 runtime/SvelteKit internals, which we do not control. The honest recommendation order should treat Option C (accept documented condition) as the likely outcome, with Option A retained only as a cheap time-boxed check and Option B (hash) as fragile owner-optional hardening. The decision remains the owner's; the pack's "A recommended" framing needs this amendment. |
| **F-5** DB growth accounting | **CONFIRMED — correctly Low** | Budget (`PHASE_2_M1_PERFORMANCE_BUDGET.md` M1-P7) excludes transcripts but not large pasted texts (≤5 MB each, FTS-indexed per `PHASE_2_M1_SEARCH_DESIGN.md` §1). Clarify corpus definition at G8/G12. |
| **F-6** merged-row exclusion | **CONFIRMED — correctly Low** | `merged_into` semantics exist (DB doc §3.3); FTS side covered by TEST-04; listing/count assertions must be added at G5/G8 (keyset-paging total-count estimation interacts here). |
| **H-1** G2 schema-approval dependency | **CONFIRMED** | OD-4 is Proposed and self-declares "blocks M2" (`DECISION_LOG.md` §5 register; `PHASE_2_TRACEABILITY_MATRIX.md` §1); DP-03 inherits the same gate. Condition, not defect. |
| **H-2** G1 CSP/console dependency | **CONFIRMED** | `PHASE_2_M1_MILESTONES.md:34` — G1 criterion 9 "console state resolved per M1-OD-4"; the condition is documented in the M0 closure report §5. Resolvable only by DP-04. |
| **H-3** kit-3 regression risk | **CONFIRMED — correctly characterized** | D-025 defers the 3.2.0 major to this review; DP-12's adopt-only-if-green rule (full regression incl. CSP runtime probes) is the correct mitigation. |

**Rejected or needing correction: none rejected outright.** Two corrections issued: F-1's resolution is incomplete (snapshot must cover tags); F-4's recommendation ordering should be amended per the new app-code-clean evidence (§4/A-6 adds the durable mitigation).

## 4. New findings raised by this audit

Severity: **Critical: none. High: none new** (H-1..H-3 above are gate conditions). **Medium: four. Low: seven. Info: one.** Every finding cites its reference and evidence.

### Medium

**A-1 — Undo-after-subsequent-edit semantics are unspecified.**
`PHASE_2_M1_DATABASE_DESIGN.md:147` promises "Undo restores the snapshot exactly"; `:90` `resource_merges.snapshot_json` holds pre-merge rows. If the user edits the primary resource (or its mentions) **after** the merge and **before** undo, an exact snapshot restore silently clobbers those legitimate edits — violating "never overwrite user data without backup and permission" (MASTER_BRAIN rule 16 / AGENTS.md §13 spirit). P1-F validated exact undo only in a controlled harness with no intervening edits. **Required before G6:** define undo scope — recommended: undo reverts only rows the merge touched; each such row is validated unchanged-since-merge, and any drift yields a typed conflict error listing the drifted fields with manual-resolution guidance (no silent clobber). Snapshot content must also include tags (F-1 correction). Extend TEST-02 with an undo-after-edit case.

**A-2 — Source-deletion semantics for mentions/evidence are undefined and currently unimplementable.**
`PHASE_2_M1_DATABASE_DESIGN.md:78` declares `mentions.source_id TEXT NOT NULL REFERENCES sources(id)` with **no ON DELETE action** (SQLite default = NO ACTION → deletion of a source with mentions fails with an FK constraint error), while `:78` and `:154` say deleting a source "unlinks its mentions". With NOT NULL, "unlink" cannot mean SET NULL. Neither cascade-with-confirmation nor blocking is specified; the acceptance row (`:154`) is ambiguous. This ambiguity is **inherited from the Rev 1.3 package** (`PHASE_2_ARCHITECTURE.md` §3.8 "Source deletion unlinks mentions") and becomes implementable reality in M1. **Required before G2** (schema surface: the FK's ON DELETE action is part of migration 001) and before G5 (behavior): recommended — deleting a source requires explicit confirmation listing the affected mention/evidence counts, then cascades `mentions` (+ their `evidence` via the existing CASCADE); SET NULL is rejected because `TESTING_STRATEGY.md` §5 requires "a mention remains traceable to its original source"; canonical resources, aliases, history, and other resources' evidence always survive (per [AD] DATABASE_DESIGN §25).

**A-3 — No persistence exists for "not the same" / candidate-suppression decisions; the G6 acceptance test is unimplementable as specced.**
`PHASE_2_M1_MILESTONES.md:101` scopes "'not the same' suppression" and `:106` requires the test "not-the-same suppresses re-candidacy". Schema v1 contains **no table or mechanism** for either review-queue state or suppression decisions (`PHASE_2_M1_DATABASE_DESIGN.md` §3.10 `resource_merges.merge_status ∈ {active, undone}` — no rejected/not-the-same record; no candidates table anywhere). The gap is **inherited from the Rev 1.3 schema list** and survived two review passes. Because migration 001 creates the full v1 schema in one transaction, **this must enter the DP-03/OD-4 schema surface before G2** — recommended [P2R] addition: `resource_identity_decisions(id, resource_a_id, resource_b_id, decision ∈ {not_the_same}, decided_at, note?)` with `UNIQUE(resource_a_id, resource_b_id)` (canonicalized pair ordering), suppression checked during candidate generation; candidate computation itself may remain on-the-fly (identifier-equality scan, ≤1 s @10k proposed) — no candidates table needed.

**A-4 — Directory relocation semantics are unspecified (attachments, DB, temp).**
Settings exposes configurable paths (`PHASE_2_M1_UI_SPECIFICATION.md` §4 Storage; `PHASE_2_M1_DATABASE_DESIGN.md` §2 "user-configurable" DB location; storage doc §2/§3), but no M1 document defines what happens to **existing** files/DB when a path changes (grep for relocation semantics across all ten documents: zero hits). Unhandled, a path change silently orphans every stored attachment (DB points at the old tree). **Required before G3:** recommended — attachments-dir change runs a verified move job (copy + per-file SHA-256 verify + atomic pointer flip + old-tree cleanup); DB relocation is **not offered** in M1 (typed error directing to backup/restore); temp-dir change is free (Category 2 has no durable value). Tests: relocation roundtrip, interrupted relocation, hash-mismatch abort.

### Low

**A-5 — FTS5 `remove_diacritics` is mischaracterized and unpinned.**
`PHASE_2_M1_SEARCH_DESIGN.md:56` says "`remove_diacritics=2` is Latin-oriented" — per SQLite FTS5 documentation, value **1** is the legacy Latin-only mapping and **2** is the *broadest* mapping set; the sentence also leaves the actual chosen value ambiguous. **Amend DP-10:** pin `remove_diacritics=2`, and add an explicit harakat-behavior check (does the tokenizer strip Arabic diacritics U+064B–0652?) to the G8 Urdu probe — record the observed behavior raw; make no claim beyond it.

**A-6 — No enforceable inline-style rule protects the console from regrowth.**
The M0 style-src event is runtime-caused (see F-4 correction — app code is clean: zero `style:`/`style=` hits in `src/`), but nothing prevents future app code from reintroducing inline styles and new console CSP events. **Amend DP-04/G1:** adopt and enforce an explicit coding rule — no `style:` directives and no `style=` attributes in application components (CSS classes/tokens only) — enforced by a lint/check-csp extension assertion; documented as the app-side half of the console-criterion strategy.

**A-7 — Restore replacement scope is not explicit.**
`PHASE_2_M1_STORAGE_DESIGN.md` §7 validates before swap and takes a safety backup but never states that restore is a **full library replacement** (post-restore attachment tree = archive contents; live files not in the archive are removed-or-preserved?). **G10 spec:** define (recommended: full replacement, with the confirmation dialog stating it and the safety backup enabling rollback) + test.

**A-8 — `resource_categories` slug rule unspecified.**
`PHASE_2_M1_DATABASE_DESIGN.md` §3.4: `id` is a slug, `name` UNIQUE. Slug generation/collision for user-created categories (e.g., "AI Tools" when `ai-tools` exists) is undefined. **G5/G7 spec:** deterministic slugification + collision suffix; or use the name as PK. Trivial, but belongs in the DP-03 surface.

**A-9 — Text-encoding support matrix stops at UTF-8/UTF-16-BOM.**
`PHASE_2_M1_ARCHITECTURE.md` §6: "encoding detection (BOM/UTF-8 validity; non-UTF-8 → detected-encoding note or typed error per settings)" — the "per settings" branch is undefined, and real-world `.txt` corpora include Windows-1252/UTF-16-without-BOM. **G4 spec:** accept UTF-8 (BOM or not) and UTF-16 by BOM; everything else → typed `Unsupported` (no lossy conversion by default); document the limitation honestly.

**A-10 — Backup/export while jobs are active is unspecified.**
`PHASE_2_M1_STORAGE_DESIGN.md` §7 requires a consistent snapshot but defines no quiesce/warn behavior when intake/index jobs are mid-flight. **G10 spec:** recommended — export waits for job-queue quiescence (or warns with active-job list and offers to proceed when idle); test the wait path.

**A-11 — `verification_status` write semantics in M1 are unspecified.**
The blueprint defines display rules and the merge never-upgrade invariant ([P1E]), but never says **who** may change verification status in M1 (the G5 domain tests mention "verification transitions"). **G5 spec:** recommended — user-settable with an automatic `resource_history` entry (`change_source='user'`); no automated/AI writes exist in M1; `broken` requires an explicit user action. Honest-labeling rules (B5) unchanged.

### Info

**A-12 — `transcripts`/`transcript_segments`/`fts_transcripts` ship in v1 with zero M1 producers.** Documented rationale exists (retention contract + FTS plumbing before the transcription milestone; Phase 2 scope per D-016). Verified consistent with the letter of the no-unused-tables rule ("later *phase*"); recorded here as a conscious, bounded deviation in spirit (three empty tables + triggers for the whole of M1). No action required; the cost is a few KB of schema and three extra migration-test rows.

## 5. Findings summary

| Severity | Count | Items |
|---|---|---|
| Critical | 0 | — |
| High | 0 new | H-1..H-3 confirmed as gate conditions (§3) |
| Medium | 4 | A-1 (undo after edit) · A-2 (source-deletion semantics) · A-3 (not-the-same persistence) · A-4 (relocation) |
| Low | 7 | A-5..A-11 + F-3 severity correction |
| Info | 1 | A-12 |

## 6. Missing architecture or test coverage (consolidated)

1. `resource_identity_decisions` store + suppression logic + tests (A-3) — **schema surface, pre-G2**.
2. Undo-with-drift validation behavior + TEST-02 extension (A-1) — pre-G6.
3. Source-deletion mention/evidence flow: FK ON DELETE action + confirmation UI + integrity test (A-2) — **schema surface, pre-G2**; behavior pre-G5.
4. Relocation verified-move job + interruption + hash-mismatch tests (A-4) — pre-G3.
5. **Cross-volume copy+fsync+rename path test** — this is the *default* import path per F-3, yet G3's test list only exercises the crash/orphan case; add an explicit same-process cross-volume fixture test.
6. `remove_diacritics` pin + harakat probe extension (A-5) — pre-G8.
7. Inline-style lint/check-csp extension (A-6) — pre-G1.
8. Restore full-replacement semantics + test (A-7) — pre-G10.
9. Category slug collision test (A-8) — pre-G5/G7.
10. Encoding-matrix negatives (A-9) — pre-G4.
11. Export-during-jobs quiesce/warn test (A-10) — pre-G10.
12. Verification-status write/history test (A-11) — pre-G5.
13. Temp-root ACL sanity check on the configured D:\Temp default (`TESTING_STRATEGY.md` §11 "temporary-file permissions") — G3, one-line check.
14. Keyset-pagination count/estimation behavior at 100k — fold into the F-5/G8 budget clarification.

## 7. Decision assessment (for the owner — nothing is approved here)

**Safe to approve as proposed:** **DP-01** (gate plan + re-mapping — verified complete, no dropped workstream), **DP-02** (post-M1 order), **DP-05** (per-UUID attachment store — deletion/orphan semantics provable), **DP-06** (orphan quarantine), **DP-07**/OD-9 (size defaults — adjustable), **DP-08** (hand-rolled sniffer — bounded matrix, zero deps), **DP-12** (kit-3 adopt-only-if-green rule — correct mitigation for H-3), **DP-13**/OD-7 methodology (gate mode).

**Approve only with the audit's amendments:** **DP-03 + OD-4** (add A-2 FK/deletion semantics, A-3 `resource_identity_decisions` table, A-8 slug rule, A-11 verification-write rule; extend the F-1 tag-merge resolution with snapshot coverage per §3) — **the schema surface must be final before migration 001 exists**; **DP-04** (re-order per F-4 correction: C is the likely outcome, A a cheap time-boxed check, B fragile-optional; add A-6's enforceable inline-style rule); **DP-10** (pin `remove_diacritics=2` + harakat probe per A-5).

**Defer-safe without impact:** **DP-09** (pre-G11), **DP-10** (pre-G8), **DP-11** (optional, G1).

## 8. Blockers before G1 and G2

**Before G1:** separate M1 implementation authorization (standing) · DP-04 resolution + A-6 rule (console criterion) · DP-12 rule (dependency review can conclude) · DP-13 (evidence mode) · F-2 documentation corrections (owner-authorized, trivial) · G1-scoped dependency additions are unchanged (`lucide-svelte`, `clsx`, `tailwind-merge`).

**Before G2:** **OD-4 + DP-03 approved with the A-2/A-3 schema-surface amendments** — this is the audit's principal condition: migration 001 is a one-shot, transaction-creation of the full schema, so the two Medium schema gaps cannot be patched later without a second migration (allowed by policy but avoidable and undesirable before any user data exists).

## 9. Consistency spot-checks re-verified this audit

D-021..D-025 present and untouched (`DECISION_LOG.md:483–555`) · M0 CLOSED (`PHASE_2_M0_CLOSURE_REPORT.md:5`; milestones execution-status line) · production CSP strict and `devCsp` confined (`tauri.conf.json:25–26`, file unchanged vs HEAD) · D-023 accessibility language carried verbatim in M1 milestones G1 field 7–8 and UI spec §2 · the M0 waiver appears exactly once in the M1 package, correctly scoped M0-only (`PHASE_2_M1_MASTER_BLUEPRINT.md:207`) · zero forbidden-scope leakage (all whisper/YouTube/cloud-sync/reqwest mentions in exclusion contexts; `openrouter` absent; no network dependency in any gate's list) · no proposal is labeled approved anywhere in the package (all "Approved" occurrences cite real decision IDs or [AD] provenance).

## 10. Git state

- **Before audit:** branch `main`, HEAD `37a71c4`; working tree = pre-existing owner/M0 changes + M1 blueprint package + approval pack (all uncommitted; no commits or pushes at any point).
- **After audit:** **identical** — `37a71c4`, no commits, no pushes, no document edited, no source/config/dependency/migration change. **Exactly one new file:** `docs/PHASE_2_M1_INDEPENDENT_AUDIT.md` (this document).

---

**End of PHASE_2_M1_INDEPENDENT_AUDIT.md**
