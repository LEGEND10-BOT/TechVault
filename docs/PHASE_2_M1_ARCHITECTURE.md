# TechVault Phase 2 M1 — Architecture

**Document status:** v1.1 (2026-11-14, D-026 reconciliation). **No implementation authorized.** Extends `PHASE_2_ARCHITECTURE.md` (Rev 1.3) §2 and `ARCHITECTURE.md`; where this document would conflict with an approved decision, the decision governs and the conflict is raised. M1-specific decisions are **recorded owner rulings** (D-026 — see `PHASE_2_M1_OPEN_DECISIONS.md`); the v1.0 "Proposed" labels are retained in the text below for provenance history.
**v1.1 changes:** F-2 correction — the §10 pointer to the storage design now cites §7–§8 (v1.0 cited §6–§7). Deletion/merge semantics amended per D-026 are specified in `PHASE_2_M1_DATABASE_DESIGN.md` v1.1 (§3.7, §3.10, §3.18, §7, §8), which governs.

---

## 1. Ground rules (inherited, unchanged)

1. Layered architecture: presentation (Svelte 5) → application services (Rust) → domain (framework-free Rust) → infrastructure (SQLite, filesystem, logging). Domain logic never depends on Svelte, Tauri, or SQLite details.
2. Every privileged operation goes through a validated Tauri command; the frontend never touches SQLite files, the filesystem outside granted scopes, or credentials, and performs **no network fetches** (M1 adds no network surface at all).
3. No background services, no idle workers, no polling loops, no unbounded caches or queues. Long work runs as cancellable in-process jobs; expensive work never runs on the UI thread.
4. All external content (imported files, pasted text) is untrusted: validated on entry, stored as data, never rendered as HTML, never executed.
5. Local-first; no cloud sync (D-006); export/import is the portability path (D-007).
6. Three storage categories govern all files (`PHASE_2_M1_STORAGE_DESIGN.md` §2).
7. D-drive policy (D-019 §7): repository on `D:\TechVault`; builds via `CARGO_TARGET_DIR=D:\Builds\cargo-target`; temp default `D:\Temp\` (configurable).
8. Performance budgets use the process-tree methodology and separate workloads (`PHASE_2_M1_PERFORMANCE_BUDGET.md`).

## 2. Process model and module structure

Single Tauri 2 process pair (Rust core + WebView2). One `tokio` runtime (adopted at G2) drives job orchestration and file I/O; CPU-bound work (hashing, indexing) runs on blocking slots. In M1 there are **no subprocesses** (no FFmpeg, no whisper engine — those are post-M1); nothing is resident between jobs.

### 2.1 Rust module structure (`src-tauri/src/`) — populated only as modules earn existence

```
main.rs, lib.rs            entry + Tauri builder, startup sequence (G2 extends it)
commands/                  thin command layer: validate args → call service → map errors
  app.rs (M0)              ping, app_info
  library.rs               resource CRUD/list/get, tags, links, aliases (G5/G7)
  import.rs                file/paste intake, import status, retry (G4)
  attachments.rs           register/list/delete attachments (G3)
  search.rs                search_query + filter metadata (G8)
  backup.rs                backup export/restore, data export/import (G10/G11)
  jobs.rs                  job list/detail/cancel (G2)
  settings.rs              typed settings read/write (G1 shell, G4 limits)
application/               one service per workflow, transaction-aware
  resource_service.rs, tag_service.rs, link_service.rs, import_service.rs,
  attachment_service.rs, search_service.rs, backup_service.rs, job_service.rs
domain/                    entities + rules (plain Rust, unit-testable, no IO)
  resource.rs, source.rs, mention.rs, evidence.rs, attachment.rs, tag.rs,
  identity.rs, job.rs, import_item.rs, metadata.rs, verification.rs,
  settings.rs, errors.rs (M0)
infrastructure/
  db/                      connection manager (G2): pool-of-one + queue, pragmas,
                           migration runner, integrity checks
  repositories/            rusqlite-backed repository trait implementations
  storage/                 attachments store, temp workspace, safe path joins,
                           streamed hashing, orphan sweep (G3)
  adapters/                source adapters: pasted_text, local_file (G4)
  meta/                    magic-byte sniffer + text/media metadata extraction (G4)
  logging.rs (M0)          secret-free rotating logger
jobs/                      job runner (G2): queue, C6 states, progress events,
                           cancellation, recovery
security/                  path checks, payload bounds, limit tables
config/                    typed settings load/save (no secrets)
```

**Layering rule for repositories (audit F-6, applied 2026-11-14):** repository **traits** are defined in the domain/application layer; `infrastructure/repositories/` provides the rusqlite implementations — infrastructure depends inward, never the reverse. Verified at G2 specification finalization, before migration 001.

### 2.2 Frontend structure (`src/`)

```
src/routes/                SvelteKit routes (route per nav item; code-split)
src/lib/
  components/ui/           in-house accessible primitives (D-023; G1)
  components/library/      resource table, detail panels, import dialog (G9)
  services/                typed invoke wrappers — the only place calling Tauri
  stores/                  UI state only (theme, toasts, job subscriptions);
                           the database remains authoritative — no client cache of
                           record data beyond the active view
  types/                   TS mirrors of the IPC contracts
```

Route skeleton: all 8 nav items exist from G1 with designed empty states; the five later-phase areas (Notebooks, Graph, Bookmarks, Analytics, Dashboard widgets dependent on future data) show explicit "later phase" placeholders, never fake content.

### 2.3 IPC contract (extends the M0 envelope, unchanged shape)

Every command returns `Result<T, AppError>` serialized as `{ ok: true, data } | { ok: false, error: { code, category, message, details? } }` (M0 `ipc.rs`; contract tests extended per command family). M1 command families (**approved design — D-026**; the concrete command list is finalized at each gate's implementation, and any deviation returns to the owner before implementation):

| Family | Commands (indicative) | Gate |
|---|---|---|
| Library | `resource_create/update/delete/archive`, `resource_get`, `resource_list` (paged + filter args), `alias_add/remove`, `identifier_add/remove`, `mention_create/link/unlink`, `evidence_add`, `history_list` | G5 |
| Tags/links | `tag_add/tag_remove/tag_list/tag_rename`, `categories_list/category_create`, `link_create/link_delete/links_for` | G7 |
| Import | `import_file` (dialog path handle + retention choice), `import_paste`, `import_retry`, `import_status` | G4 |
| Attachments | `attachment_register`, `attachment_list`, `attachment_delete` (confirmation), `attachment_open_reveal` (only if a scoped allowance is approved) | G3 |
| Search | `search_query { q, filters, sort, page }`, `filter_metadata` | G8 |
| Backup | `backup_export { destination }`, `backup_restore { archive }`, `data_export`, `data_import` | G10/G11 |
| Jobs | `job_list`, `job_cancel` + events `job:progress`, `job:state_changed`, `job:completed`, `job:failed` (throttled ≥250 ms — inherited) | G2 |
| Settings | `settings_get/settings_set` (typed categories; intake limits per DP-07/OD-9 — APPROVED, D-026) | G1; sections incrementally at G3/G4/G8/G10–G11 (per `PHASE_2_M1_UI_SPECIFICATION.md` §4) — audit F-9 corrected 2026-11-14 |

Error taxonomy (M0, 11 categories) is reused **without extension** — no new category is added; new conditions (e.g., `storage.orphan_quarantined`) are new codes inside the existing `storage` category (approved design — D-026). Event payloads stay bounded (snippets, counts — never full documents).

## 3. Module A — Resource management (G5)

**Responsibility.** Own the canonical-resource lifecycle: create (manual `discovery_origin`), read (paged, filtered), update with history, archive/unarchive, delete with explicit attachment/mention consequences; manage aliases, strong identifiers, manual mentions, and compact evidence.

**Boundary.** Svelte renders data only; all rules in `domain/resource.rs` + `resource_service.rs`; persistence via repository traits.

**Interface (data contracts; the schema DDL is APPROVED in `PHASE_2_M1_DATABASE_DESIGN.md` v1.1 — DP-03/OD-4, D-026).**
- `Resource { id: UuidV7, canonical_name, resource_type (FK categories), short_description, detailed_description?, official_url?, primary_domain?, verification_status ∈ {verified, partial, unverified, broken}, discovery_origin ∈ {manual} (others Phase 3), is_archived, created_at, updated_at, last_verified_at? }`
- `Alias { id, resource_id, alias_name, alias_type ∈ {alternate, previous, abbreviation, former_brand, misspelling, community}, source_mention_id?, valid_from?, valid_until? }`
- `Identifier { id, resource_id, identifier_type, identifier_value, issuer_or_platform?, is_primary, verified_at? }` — uniqueness only where type+issuer make it meaningful.
- `Mention { id, source_id, resource_id?, extracted_name, discovery_type, timestamp_seconds?, context_text?, extraction_method, review_status, created_at }` — **confidence stays NULL in M1** (no reliable provider exists; whisper.cpp does not supply one; no invented scores).
- `Evidence { id, mention_id, evidence_type, evidence_text (snippet), timestamp_seconds?, evidence_url?, provenance, created_at }` — compact; never duplicates transcripts.
- `ResourceHistory { id, resource_id, field_name, previous_value, new_value, change_type, changed_at, change_source, explanation? }` — append-only.

**Failure handling.** All mutations transactional; FK violations → typed `database.constraint` errors; delete flows always surface consequences (attachments, mentions, links) with explicit confirmation (UI-06). History is never rewritten.

**Testing.** Unit tests on domain rules (verification transitions, alias typing, identifier normalization); repository integration tests; "evidence survives transcript deletion" contract test (deferred to the transcription milestone's deletion path but the evidence model is proven now); history append-only invariant test.

## 4. Module B — SQLite database and migrations (G2)

Full design in `PHASE_2_M1_DATABASE_DESIGN.md`. Summary: rusqlite bundled; single connection behind a mutex/queue (library-scale workload; measured before any pool complexity); `PRAGMA foreign_keys=ON`, `busy_timeout=5000`; additive guarded migration runner with pre-migration backup for altering migrations; schema v1 created in migration 001 (all M1 tables — unused tables are not created for later phases); repositories behind traits; transaction helpers; startup `quick_check` (+ `integrity_check` after abnormal shutdown); **WAL enabled only after both the concurrency test and the backup-under-WAL test pass** — otherwise DELETE journal is the recorded, tested state.

**Gate status:** DP-03 + OD-4 are **APPROVED WITH AMENDMENTS (D-026, 2026-11-14)** — the schema surface in `PHASE_2_M1_DATABASE_DESIGN.md` v1.1 (including §3.18 and the A-2 FK guard) governs, and G2's planning approval gate is cleared. Implementation remains separately unauthorized; approved design is not implementation evidence.

## 5. Module D — File import and ingestion (G4)

**Responsibility.** Turn user-supplied files and pasted text into source records (plus optional user-owned attachments) through a validated, atomic, recoverable pipeline with zero network access.

**Adapter interface (extends the Rev 1.3 trait; network adapters implement the same trait post-M1):**

```rust
trait SourceAdapter {
    fn id(&self) -> AdapterId;                    // "pasted_text" | "local_file"
    fn matches(&self, input: &SourceInput) -> bool;
    fn capabilities(&self, input: &SourceInput) -> AdapterCapabilities;
    fn ingest(&self, ctx: JobContext, input: SourceInput) -> Result<IngestOutcome, AppError>;
}
```

Adapters never claim accessibility a URL/content does not prove; failure states are typed (`Unsupported`, `ContentUnavailable`, `ValidationFailed`, `SizeLimitExceeded`, `StorageError`) and map onto the C6 job states (Submitted → Pending → Processing → Completed | Partial Success | Unsupported | Failed | Cancelled; `AuthenticationRequired` has no M1 producer).

**Import-format matrix (bounded, explicit; the intake limits DP-07/OD-9 and the metadata-sniffer approach DP-08 are APPROVED — D-026):**

| Input | M1 behavior |
|---|---|
| Pasted text (transcript/description/notes) | text source, provenance "user-pasted", content-hash dedup, ≤5 MB (OD-9) |
| `.txt` / `.md` files | text source + optional attachment; encoding detection; ≤20 MB (OD-9) |
| Local audio/video media files | source record + attachment choice; container sniff + `playback_type` (P1-E facts); ≤100 MB/file (OD-9); full decode deferred (typed `media_decode.not_available_in_m1` for any attempted extraction — honest label, no silent failure) |
| PDF / office / images / archives / any other type | **typed `Unsupported`** with guidance — never a silent failure, never a quality claim (no OCR/PDF/office parsing in M1) |
| YouTube/URL records | **outside M1** (OD-5 open; deferred) |

**Intake choice (storage categories):** every `local_file` intake asks explicitly: **save as user-owned attachment (Category 1)** or **process temporarily (Category 2, cleaned after the job)** — recorded on the source/attachment row; cleanup passes can never touch Category 1.

**Atomic import.** Stages commit independently: (1) validate + hash (streamed) → (2) place file (temp → final via atomic rename, G3) → (3) source row + metadata in one transaction → (4) FTS sync via triggers. A failure at stage N preserves stage-(N-1) results and reports `Partial Success`; retry is offered from the source detail view.

**Interrupted-import recovery.** Jobs left `Processing` by a crash are marked `Failed (interrupted)` at startup with a retry affordance; the startup sweep removes stale Category 2 temp files (ownership + age validated) and quarantines attachment-dir orphans (M1-OD-8). A duplicate submission (normalized URL n/a in M1; content hash for pastes/files) links to the existing row with an informational status — records are never auto-deleted.

**Dependencies.** `tauri-plugin-dialog` arrives at G4 (native file picker) with a capability audit (SEC-04); the intake limits and sniffer approach are APPROVED (DP-07/DP-08, D-026) — no open dependency decisions remain for this module.

## 6. Module E — Metadata extraction (G4)

**Responsibility.** Extract **file-level** metadata only, with a bounded, testable scope:

- **Type sniffing:** magic-byte inspection for the accepted matrix (plain text/UTF-8 BOM, Markdown treated as text, MP4/M4A `ftyp`, WebM/Matroska `EBML`, WAV `RIFF`, MP3 `ID3`/frame sync, OGG `OggS`, FLAC `fLaC`) — extension is never trusted alone; mismatch → typed `validation.type_mismatch`.
- **Common:** size, created/modified timestamps, SHA-256 (already computed for storage).
- **Text files:** encoding detection (BOM/UTF-8 validity; non-UTF-8 → detected-encoding note or typed error per settings), char/word/line counts (Unicode-aware word segmentation; no language claims).
- **Media files:** container-level markers only (container type, `playback_type` record per P1-E: MP4/WebM OK, HEVC/OGG unsupported in WebView2) — **no duration/bitrate/stream probing** (that needs the post-M1 decode path; no invented numbers).

**Dependency decision (M1-OD-7):** hand-rolled bounded sniffer (recommended — ~10 formats, fully unit-testable, zero deps) vs the `infer` crate (MIT; wider coverage but an added dependency for marginal M1 benefit). Fallback rule: if a real import need appears outside the hand-rolled matrix, the format is rejected as `Unsupported` until the owner approves an extension.

**Failure handling.** Every extraction result is advisory metadata; failure to extract non-critical metadata degrades to `Partial Success`, never fails the import.

## 7. Module F/H — Tags, categories, relationships (G7)

- **Tags:** `resource_tags(resource_id, tag)` with `UNIQUE(resource_id, tag)`; normalization = trim + Unicode NFKC (case-preserving; Urdu and other RTL scripts unaffected); tag list derived by `GROUP BY` — no separate tag table at this scale; rename = transactional update across the tag's rows; case-insensitive *grouping* in the tag list view while the stored value stays user-entered (display shows the stored value).
- **Categories:** extensible `resource_categories` seed table [P2R] pre-seeded with the MASTER_BRAIN B3 set (14 categories), user-extensible via settings/library UI; `resources.resource_type` references it. Not a hard-coded CHECK enum — B3 requires extensibility.
- **Relationships:** `resource_links(source_resource_id, target_resource_id, relationship_type, provenance='manual', created_at)` with typed relationship values (Uses, Integrates With, Alternative To, Depends On, Developed By, Related Concept, Replaced By — extensible list), duplicate-inverse guard, self-link rejection. Minimal link/unlink affordance in the resource detail view (richer management Phase 4); AI population Phase 3 only (D-008 then).

**Failure handling.** All tag/link/category mutations transactional; deleting a resource removes its tags/links rows within the delete transaction (links are association rows, not evidence — their removal is part of the explicit delete confirmation).

## 8. Module G — Search (G8): summary

Full design in `PHASE_2_M1_SEARCH_DESIGN.md`. FTS5 external-content tables with trigger sync; escaped MATCH pipeline; filters (type, verification, discovery, date, tags, attachment presence); sorting (relevance/updated/name); latency instrumentation. The G2 skeleton creates the tables + triggers; G8 populates and measures.

## 9. Module K — Resource library UI (G1 + G9)

Full specification in `PHASE_2_M1_UI_SPECIFICATION.md`. G1 delivers the shell (220 px sidebar + 56 px topbar), themes, primitives with the D-023 accessibility test plan, settings shell with R-023 disabled placeholders; G9 delivers the library table (virtualized), detail view, import workflow, tags/filters, search UI, and the complete state matrix (loading/empty/error/partial on every screen).

## 10. Module I/J — Backup, restore, export/import (G10/G11): summary

Full design in `PHASE_2_M1_STORAGE_DESIGN.md` §7–§8 *(F-2 corrected per D-026; v1.0 cited §6–§7)*. Backup = versioned zip archive (manifest + DB snapshot + attachments) created atomically, restored only after full validation with an automatic pre-restore safety backup; zip-bomb caps; the only accepted archive is the app's own format. Export/import = a proposed schema-versioned JSON data package with an explicit conflict policy (match by stable IDs; existing → update-or-skip choice; never auto-merge) — **DP-09 DEFERRED (D-026): owner decision required before G11.**

## 11. Module L — Error handling and recovery (cross-cutting; acceptance at G12)

1. **Typed errors end-to-end:** domain errors → one mapping at the command layer → shared frontend error component; sanitized messages only (no user content, keys, or sensitive paths — SEC-15 rules from M0).
2. **Per-screen states:** loading, empty, error, partial-success on every screen (UI-05); errors explain what happened and the next action; destructive actions confirm with consequences (UI-06).
3. **Job semantics:** C6 states; `Partial Success` preserves stage-level results; cancellation at stage boundaries; progress events throttled; retry idempotent (never duplicates sources/mentions/resources — guard by content hash + idempotency keys).
4. **Crash recovery:** startup sequence = load settings → open DB → run pending migrations (guarded) → integrity quick-check → mark interrupted jobs → temp sweep + orphan quarantine → register listeners → emit ready. A panic in a job marks the job `Failed` with earlier-stage results preserved.
5. **Migration failure recovery:** rollback → previous version → typed `database.migration_failed` error identifying the failed migration → restore guidance; automatic pre-migration backup before altering migrations.
6. **Restore safety:** validation before swap; pre-restore safety backup; interrupted restore discards its workspace and leaves the live DB untouched.
7. **Logging:** M0 rotating logger unchanged; new services log command names, outcomes, codes, and *counts* — never content.

**Testing.** Typed-error unit tests; kill-during-merge/kill-during-import consistency tests; simulated-crash startup recovery tests; migration injected-failure tests; restore-interruption tests.

## 12. Phase 3 compatibility (directive priority 9)

M1 delivers the substrate Phase 3 consumes through controlled interfaces: `mentions`/`evidence` with provenance fields (extraction writes later — the schema already distinguishes `discovery_origin` and reserves `extraction_method`), `resource_links` (AI-populated later, `provenance` field ready), transcripts/segments tables (created now, populated by the transcription milestone), `provider_configs` (R-023 disabled placeholders, untouched), and the adapter trait that network adapters will implement. **No stubs, no Phase 3 code.**

---

**End of PHASE_2_M1_ARCHITECTURE.md**
