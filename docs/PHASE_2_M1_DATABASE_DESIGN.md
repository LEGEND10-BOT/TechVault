# TechVault Phase 2 M1 — Database Design

**Document status:** v1.1 (2026-11-14, owner rulings recorded — see revision note below). Planning specification — **no migration may be created and no schema implemented until separate M1 implementation authorization is granted.**
**v1.1 changes (owner directive §B, recorded as D-026):** schema v1 **APPROVED WITH AMENDMENTS** — the six mandatory amendments are incorporated: F-1 (merge tag union + undo snapshot), A-1 (undo drift validation), A-2 (source-deletion confirmation + cascade semantics), A-3 (`resource_identity_decisions`), A-8 (category slug rule), A-11 (user-controlled verification writes). New table §3.18; updated §3.3/§3.4/§3.7/§3.10/§5/§7/§8.
**v1.0:** Prepared Draft (2026-11-14) — the OD-4/M1-OD-3 review surface. Extends `DATABASE_DESIGN.md` (baseline) and `PHASE_2_ARCHITECTURE.md` §3 (Rev 1.3). Provenance labels: **[AD]** approved decision · **[P1E]** demonstrated Phase 1 evidence · **[P2R]** new M1 recommendation requiring owner approval.
**Approval status (D-026, 2026-11-14):** schema v1 is **approved with the six mandatory amendments**; every [P2R] item in this document is thereby approved as amended. **[P2R] labels are retained unchanged for provenance history.**

---

## 1. Principles (inherited)

SQLite first (local file, no server) · stable TEXT UUIDv7 identifiers independent of display names · strict Source/Resource/Mention/Evidence separation ([AD], MASTER_BRAIN D1) · FK enforcement always on · transactions around every multi-step operation · no invented confidence scores · additive versioned migrations · no table is created for a later phase's feature (no notebooks/bookmarks/graph/notes tables in v1).

**P1-F caveat (binding honesty rule):** the 9/9 prototype invariants validate the *mechanisms* (URL-identity dedup, transactional merge/undo, guarded migrations, FTS5 trigger sync) — not this production column set, WAL behavior, or 100k scale.

## 2. Connection and configuration

| Setting | Value | Provenance |
|---|---|---|
| Access | single `rusqlite` connection behind a mutex-serialized queue (library-scale workload); measure before considering a pool | [P2R] simplicity-first; revisit only with measured contention |
| Build | `rusqlite` with `bundled` feature (SQLite compiled in; ~1–2 MB) | [P1E] P1-F validated pattern |
| `foreign_keys` | `ON` per connection | [AD] |
| `busy_timeout` | 5000 ms | [AD] §22 |
| Journal mode | **DELETE until evidence**; WAL enabled only after (1) concurrent reader/writer stress with realistic job load and (2) backup-under-WAL validation both pass — the decision and evidence recorded either way | [AD gate, P2R tests] |
| `synchronous` | `FULL` under DELETE journal; `NORMAL` only if/when WAL is enabled | [P2R] |
| Integrity | `quick_check` on normal startup; `integrity_check` after abnormal shutdown | [AD] |
| Prepared statements | cached per repository, bounded | [P2R] |
| Location | app-data dir (user-configurable); DB-directory ACLs restricted to the user | [AD] |
| Encryption | **none** — explicit documented limitation (P-014 pending), never hidden | [AD limitation statement] |

## 3. Schema v1 — table-by-table specification

All tables: `id TEXT PRIMARY KEY` (UUIDv7), `created_at TEXT` (ISO-8601 UTC), timestamps UTC. Every child table declares `ON DELETE` behavior explicitly. Column-level DDL below is the **review object** — deviations found during implementation go back to the owner, not silently in.

### 3.1 `schema_migrations` [AD]

`version INTEGER PRIMARY KEY`, `name TEXT NOT NULL`, `applied_at TEXT NOT NULL`. The migration runner is the only writer.

### 3.2 `sources` [AD §5]

| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUIDv7 |
| source_type | TEXT NOT NULL | `pasted_text` \| `local_file` (M1; `web`/`github`/`youtube_url` post-M1) |
| original_url | TEXT | preserved verbatim when a URL exists (post-M1 types); NULL for M1 types |
| normalized_url | TEXT | never replaces the original |
| platform | TEXT | controlled values; `local`/`paste` in M1 |
| title | TEXT | display title (filename or user-supplied) |
| description | TEXT NULL | |
| creator_name | TEXT NULL | |
| content_hash | TEXT NULL | SHA-256 hex of pasted/file content — duplicate-submission detection |
| status | TEXT NOT NULL | C6 lifecycle |
| playback_type | TEXT NULL | `local`/`embed`/`external`/`unavailable` capability record (P1-E) |
| transcript_status | TEXT NULL | `none` in M1 (transcription post-M1) |
| metadata_json | TEXT NULL | only where a genuine key/value blob is justified [P2R JSON policy] |
| processed_at TEXT NULL · last_error TEXT NULL (sanitized summary) | | |
| retention_choice | TEXT NULL | `attachment` \| `temporary` — the recorded intake decision [P2R] |

Indexes: `status`, `source_type`, `created_at`, `content_hash` (dedup lookup).

### 3.3 `resources` [AD §6]

`canonical_name TEXT NOT NULL` · `resource_type TEXT NOT NULL REFERENCES resource_categories(id)` [P2R FK detail] · `short_description TEXT` · `detailed_description TEXT NULL` · `official_url TEXT NULL` · `primary_domain TEXT NULL` · `verification_status TEXT NOT NULL DEFAULT 'unverified'` ∈ {verified, partial, unverified, broken} · `discovery_origin TEXT NOT NULL DEFAULT 'manual'` (M1 writes `manual` only; enum reserved for Phase 3) · `is_archived INTEGER NOT NULL DEFAULT 0` · `updated_at TEXT NOT NULL` · `last_verified_at TEXT NULL` · **`merged_into TEXT NULL REFERENCES resources(id)`** [P2R redirect strategy — Rev 1.3 item] — set only by an approved merge; a merged row is hidden from listings and its FTS rows are removed by the sync triggers.

**Verification writes (amendment A-11, approved D-026):** in M1, `verification_status` changes are **user-controlled only** — no automated or AI path exists; every change appends a `resource_history` entry (`change_source='user'`); the unverified default and the B5 warning rules are unchanged; a merge never upgrades verification status ([P1E], unchanged).

Indexes: `resource_type`, `verification_status`, `is_archived`, `canonical_name` (for sorted browse), `merged_into`.

### 3.4 `resource_categories` [P2R — approved D-026]

`id TEXT PK` (slug) · `name TEXT NOT NULL UNIQUE` · `is_builtin INTEGER NOT NULL DEFAULT 0`. Seeded with the MASTER_BRAIN B3 set (14 categories: software tools, cybersecurity tools, AI tools/platforms, websites/services, GitHub repositories, libraries/frameworks, programming tools, development environments, applications, courses, technical concepts, technologies/protocols, products/services, other). User-extensible; `resources.resource_type` is an FK — deleting a category requires it to be unused (typed error), never a cascade that silently retypes resources.

**Slug rule (amendment A-8, approved D-026):** slugs are generated deterministically — Unicode NFKC → trim → Latin case-fold → whitespace/underscore runs → `-` → strip characters outside `[a-z0-9-]` → collapse duplicate `-` → trim `-`. If the result is empty or entirely non-ASCII (e.g., an Urdu-only name), the slug is `category-<first 8 chars of the UUIDv7 id>`. On collision the slug is suffixed `-2`, `-3`, … (re-checked inside the insert transaction). The display name is always the user's `name`; the slug is an internal identifier only.

### 3.5 `resource_aliases` [AD §10]

`resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE` · `alias_name TEXT NOT NULL` · `alias_type TEXT NOT NULL` ∈ {alternate, previous, abbreviation, former_brand, misspelling, community} · `source_mention_id TEXT NULL` · `valid_from TEXT NULL` · `valid_until TEXT NULL`. Index `(resource_id)`; not every similar name is an alias — defensible relationship required.

### 3.6 `resource_identifiers` [AD §11]

`resource_id` (FK CASCADE) · `identifier_type TEXT NOT NULL` · `identifier_value TEXT NOT NULL` · `issuer_or_platform TEXT NULL` · `is_primary INTEGER NOT NULL DEFAULT 0` · `verified_at TEXT NULL`. **Partial UNIQUE index** `ON (identifier_type, identifier_value) WHERE identifier_type IN ('official_domain','github_repo','package_registry')` [P2R detail — uniqueness only where globally meaningful]. Index `(resource_id)`.

### 3.7 `mentions` [AD §7 + P2R confidence rule]

`source_id TEXT NOT NULL REFERENCES sources(id)` — **no ON DELETE action (NO ACTION/RESTRICT by default; amendment A-2, approved D-026)**: the FK is a deliberate guard — a source with mentions cannot be deleted at the SQL level; deletion flows only through the source-deletion service transaction described in §8, after explicit user confirmation. Mentions therefore always remain traceable to their original source while it exists (`TESTING_STRATEGY.md` §5 invariant). · `resource_id TEXT NULL REFERENCES resources(id)` · `extracted_name TEXT NOT NULL` · `discovery_type TEXT NOT NULL` ∈ {explicit_mention, ai_discovered, related_suggestion, manual} (M1 writes `manual` only) · **`confidence_score REAL NULL` — stays NULL in M1; never fabricated** · `timestamp_seconds REAL NULL` · `context_text TEXT NULL` (bounded snippet) · `extraction_method TEXT NOT NULL DEFAULT 'manual'` · `review_status TEXT NOT NULL DEFAULT 'unreviewed'`. Indexes: `(source_id)`, `(resource_id)`, `(timestamp_seconds)`.

### 3.8 `evidence` [AD §8]

`mention_id TEXT NOT NULL REFERENCES mentions(id) ON DELETE CASCADE` · `evidence_type TEXT NOT NULL` ∈ {transcript, caption, metadata, url, manual} · `evidence_text TEXT NOT NULL` (compact snippet) · `timestamp_seconds REAL NULL` · `evidence_url TEXT NULL` · `provenance TEXT NOT NULL`. Index `(mention_id)`. Deleting a transcript (post-M1) never destroys evidence snippets — they are stored copies marked with provenance.

### 3.9 `resource_history` [AD §12]

`resource_id` (FK CASCADE) · `field_name TEXT NOT NULL` · `previous_value TEXT NULL` · `new_value TEXT NULL` · `change_type TEXT NOT NULL` · `changed_at TEXT NOT NULL` · `change_source TEXT NOT NULL` · `explanation TEXT NULL`. **Append-only** — no UPDATE/DELETE path exists in the repository layer.

### 3.10 `resource_merges` [AD §13]

`primary_resource_id TEXT NOT NULL` · `merged_resource_id TEXT NOT NULL` · `merge_reason TEXT` · `merge_method TEXT NOT NULL DEFAULT 'user_confirmed'` · `reviewed_by_user INTEGER NOT NULL DEFAULT 1` · `merge_timestamp TEXT NOT NULL` · `undo_timestamp TEXT NULL` · `merge_status TEXT NOT NULL` ∈ {active, undone} · `snapshot_json TEXT NOT NULL` (pre-merge affected rows for exact undo — **amendment F-1, approved D-026: the snapshot includes the merged resource's `resource_tags` rows** in addition to mentions/evidence/aliases/identifiers/history/links/attachments). Immutable rows; undo writes status/timestamp only.

### 3.11 `resource_links` [AD §14]

`source_resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE` · `target_resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE` · `relationship_type TEXT NOT NULL` (validated value list, extensible by decision) · `provenance TEXT NOT NULL DEFAULT 'manual'` · `UNIQUE(source_resource_id, target_resource_id, relationship_type)` · self-link rejected in the service layer · duplicate-inverse guard [P2R detail]. Index both resource columns.

### 3.12 `resource_tags` [P2R — Rev 1.3 carry]

`resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE` · `tag TEXT NOT NULL` (NFKC + trim normalized, case-preserving) · `UNIQUE(resource_id, tag)`. Indexes: `(tag)` for the tag list (GROUP BY), `(resource_id)`. No separate tag table at this scale.

### 3.13 `attachments` [P2R — Rev 1.3 carry]

`resource_id TEXT NULL REFERENCES resources(id)` · `source_id TEXT NULL REFERENCES sources(id)` · `original_name TEXT NOT NULL` (display only — never used as a path) · `mime_type TEXT NOT NULL` · `size_bytes INTEGER NOT NULL` · `sha256 TEXT NOT NULL` · `storage_path TEXT NOT NULL` (app-relative, internally named) · `retention_state TEXT NOT NULL DEFAULT 'user_owned'` · `deleted_at TEXT NULL` (soft-delete marker for undoable deletes). Indexes: `(resource_id)`, `(source_id)`, `(sha256)` (same-hash reporting).

### 3.14 `transcripts` + `transcript_segments` [AD §9 + P2R detail]

Created in v1 (empty in M1 — transcription is post-M1) so the transcript-deletion/retention contract and FTS plumbing exist before the engine lands: `transcripts(id, source_id FK, language, transcription_engine, model_name, transcript_format_version, retention_state DEFAULT 'retained', created_at, updated_at)`; `transcript_segments(id, transcript_id FK CASCADE, start_seconds REAL NOT NULL, end_seconds REAL NOT NULL, text TEXT NOT NULL, segment_index INTEGER NOT NULL, UNIQUE(transcript_id, segment_index))`. No confidence field content.

### 3.15 `processing_jobs` [AD §17]

`source_id TEXT NULL REFERENCES sources(id)` · `job_type TEXT NOT NULL` (`import_file`, `import_paste`, `reindex`, …) · `status TEXT NOT NULL` (C6 set) · `progress REAL` · `stage TEXT` · `started_at/completed_at` · `error_code TEXT NULL` · `error_summary TEXT NULL` (sanitized) · `retry_count INTEGER NOT NULL DEFAULT 0` · `updated_at`. Indexes: `(status)`, `(source_id)`.

### 3.16 `settings` [AD §19]

`key TEXT PRIMARY KEY` · `value TEXT NOT NULL` (typed via the settings service — validated on read/write) · `category TEXT NOT NULL`. No credentials ever. M1 keys: theme, storage paths (temp/attachments/backup), OD-9 limit table, import defaults, UI preferences.

### 3.17 `provider_configs` [AD R-023 adoption]

Unchanged from the M0/Rev 1.3 posture: seed rows `enabled=false`, `api_key_ref` placeholder, statuses `unconfigured`/`unvalidated`. No M1 code touches them beyond the settings-shell display.

### 3.18 `resource_identity_decisions` [P2R → approved — amendment A-3, D-026]

`resource_a_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE` · `resource_b_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE` · `decision TEXT NOT NULL` ∈ {not_the_same} (extensible only by a future owner decision) · `decided_at TEXT NOT NULL` · `note TEXT NULL` · **`UNIQUE(resource_a_id, resource_b_id)`** and **`CHECK(resource_a_id < resource_b_id)`** — canonical pair ordering enforced by the schema **and** the service layer (the lexicographically smaller UUID is stored as `resource_a_id`, so a pair can be recorded only once regardless of lookup order; see the compatibility note below). Indexes: `(resource_b_id)` for reverse lookups.

Purpose: persist explicit "not the same" rulings from the duplicate-candidate review queue so candidate generation (identifier-equality scan) suppresses previously rejected pairs — the G6 acceptance test "not-the-same suppresses re-candidacy" (TEST-02 extension) is implementable only with this store. Rows are removed automatically when either resource is deleted (CASCADE); no edit path exists.

**Pair-constraint hardening (audit F-7, applied 2026-11-14 — no change to the approved identity-decision semantics):** the DDL includes **`CHECK(resource_a_id < resource_b_id)`** in addition to the UNIQUE pair index, so the canonical orientation is enforced by the schema itself, not only by the service layer. **Compatibility verified:** ids are canonical lowercase hyphenated UUIDv7 TEXT; SQLite TEXT comparison is memcmp (byte-wise), which for fixed-width canonical UUID strings is exactly lexicographic order — deterministic and valid for a CHECK constraint (for v7, lexicographic order is also creation-time order); any two distinct ids compare strictly, so the constraint is satisfiable for every legitimate pair. Carried into the TEST-03 schema assertions (G2, before migration 001).

## 4. Index and integrity summary

- Every FK column indexed (SQLite does not auto-index FK children).
- Partial unique index on strong identifiers only (§3.6).
- Composite index for the default library listing: `(is_archived, updated_at DESC)` on `resources` [P2R].
- No index without a demonstrated query pattern; final index set reviewed against the G8/G9 measured query patterns before G12.
- `PRAGMA foreign_key_check` in the startup integrity pass after abnormal shutdown.

## 5. Migrations and rollback strategy

1. Sequential integer versions; one migration = one transaction (guarded pattern: verify preconditions → apply → verify postconditions) [P1E].
2. **Failure behavior** [P2R]: rollback → DB stays at the previous version → startup aborts with typed `database.migration_failed` naming the failed migration → user guided to restore the latest backup. No partial schema states are ever committed.
3. **Pre-migration backup** before any migration that alters or drops existing tables [P2R].
4. Migration 001 creates the complete schema v1 above in one transaction (fresh install) — **including the D-026 amendment set (§3.18 `resource_identity_decisions`; the A-2 FK guard on `mentions.source_id`; the A-8 slug rules; the A-11 verification rules)**; later migrations are additive by policy — destructive changes require explicit owner approval and a recovery plan (AGENTS.md §7).
5. Tests (TEST-03): fresh create; upgrade path (v1 → later); injected mid-migration failure → rollback verified; recovery-from-backup guidance verified.

## 6. WAL and transaction policy

- Every multi-step operation runs in one transaction: merge (§7), import commit, attachment registration, tag rename, category delete-check, restore swap.
- Merge and undo are transactional with snapshot-based exact undo [P1E]; kill-during-merge tests prove no partial state (TEST-02).
- WAL evidence gate: concurrency stress (reader during writer jobs) + backup-under-WAL (online-backup snapshot validates against a live WAL DB). Until both pass, DELETE journal is the shipped mode; the decision is recorded with evidence either way (never assumed).

## 7. Resource identity and deduplication

- **Identity** = the canonical `resources` row; **occurrence** = `mentions` [AD].
- **Duplicate detection in M1 uses strong identifiers only** [AD]: normalized official URL, canonical domain, repository identifier. Exact-or-normalized-equal match ⇒ duplicate *candidate* → review queue → **explicit user-confirmed merge** — never automatic, never name-similarity-based.
- **Duplicate submission** of the same source content: `content_hash` equality links the new submission to the existing row with an informational status; no record is auto-deleted [AD §5].
- **Merge** (transactional; D-026-amended): snapshot affected rows into `resource_merges.snapshot_json` — **including the merged resource's `resource_tags` rows (F-1)** — → re-point mentions/evidence/aliases/identifiers/history/links/attachments of the merged resource to the primary → **union tags into the primary: for each merged-resource tag that already exists on the primary, keep the primary's row and drop the duplicate (both are shown in the merge preview before confirmation)** → set `merged_into` on the merged row → write the merge record → the FTS sync triggers remove/update the merged resource's index rows (search never returns redirect-only entries — TEST-04). **A merge never upgrades verification status** [P1E].
- **Undo** (amendment A-1, approved D-026): undo restores the pre-merge snapshot for exactly the rows the merge touched — but **validates each such row is unchanged since the merge first**; any post-merge user edit to those rows (a drifted field) aborts the undo with a typed conflict error listing the drifted fields and offering manual resolution — **no silent overwrite of user changes**. When no drift exists, the restore is exact (including the snapshot's tag rows, F-1); the undo is recorded; history is permanent. Drift-validation semantics are proven by a TEST-02 extension (undo-after-edit case).
- Uncertain/similarity matches are never auto-candidates in M1 (P-008 golden-dataset evidence required before any similarity feature — deferred).

## 8. Deletion and retention rules

| Action | Rule |
|---|---|
| Delete source | **explicit confirmation first (amendment A-2, approved D-026): the dialog lists the counts of mentions and evidence records that will be removed with the source** — then, in one transaction, the service deletes the source's mentions (their evidence cascades) and finally the source row; the FK guard on `mentions.source_id` (NO ACTION) makes any path that skips this transaction fail safely. Shared canonical resources, their aliases, identifiers, history, and other resources' evidence always survive [AD §25]; attached user-owned attachments ask explicitly (delete/orphan/keep) |
| Delete resource | explicit confirmation listing consequences: mentions, evidence, aliases, identifiers, history, links, tags, attachments — each with an explicit choice; history rows of *other* resources referencing it via links are preserved (link rows removed) |
| Delete transcript (post-M1) | never deletes resources/mentions/evidence; evidence retains its stored snippet, marked "source transcript deleted" (contract proven in the evidence model now) |
| Delete attachment | removes file + row with confirmation; file removal uses safe joins; failed file removal → typed error, row retained |
| Delete tag/category | tag rows removed with the resource or explicitly; category deletion blocked while referenced |
| Anything destructive | confirmation dialog with consequence text (UI-06); no silent destruction anywhere |

## 9. Scale considerations (without unnecessary complexity)

- Library-scale target 10k resources near-term; 100k synthetic for FTS measurement. TEXT UUIDv7 keys keep index locality (time-ordered) [P1E favoring TEXT].
- Paged queries everywhere (`LIMIT/OFFSET` + keyset pagination for the library table) [P2R]; no `SELECT *` unbounded loads.
- FTS external-content tables avoid text duplication in indexes.
- No partitioning, no ORM, no stored procedures — complexity is added only when a measured need exists (AGENTS.md §11).

---

**Open items carried to `PHASE_2_M1_OPEN_DECISIONS.md`:** the whole of §3 is the M1-OD-3/OD-4 review surface; §3.4 `resource_categories` is the one table not present in the Rev 1.3 list; §2 journal-mode policy is the OD-4 WAL gate.

**End of PHASE_2_M1_DATABASE_DESIGN.md**
