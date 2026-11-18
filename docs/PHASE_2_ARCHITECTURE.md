# TechVault Phase 2 Architecture Blueprint

**Document status:** Revision 1.3 (2026-11-14, final integration pass). Draft for owner review; no implementation authorized.
**Revision 1.3 changes:** `resource_tags` added to schema v1 as a [P2R] proposal (collections = notebooks, deferred to Phase 4); explicit import-format matrix with unsupported-format and failed-import handling (§4.6); safe archive extraction with zip-bomb protection (§7.4); Whisper minimum-hardware guidance and resource-insufficient fallback (§5.2); worker lifecycle, cache limits, and lazy loading (§2.8); Phase 2 / Phase 3 boundary and future-AI extensibility (§11). Requirement IDs (ARCH-xx, SEC-xx, PERF-xx, UI-xx, TEST-xx) are defined in `PHASE_2_TRACEABILITY_MATRIX.md`.
**Revision 1.2 changes:** production and development CSP policies separated with exact directives and automated configuration checks (OD-6, Proposed); M1 accessibility acceptance strengthened with the explicit test plan (OD-8, Proposed); OD status language corrected — all ODs are **Proposed** until separately approved.
**Revision 1.1 changes:** three storage categories with an attachments model; Whisper implementation and model-management section rewritten (CLI subprocess, no partial-transcript persistence promise, model catalog); SSRF mechanism specified concretely (no "where practical"); schema decisions carry provenance classifications; FFmpeg sidecar replaces the symphonia-first proposal; in-house UI primitives; backup format hardened; privacy limitations stated explicitly.
**Extends (does not replace):** `ARCHITECTURE.md` (baseline), `DATABASE_DESIGN.md`, `SECURITY.md`, `UI_DESIGN_SYSTEM.md`, `API_CONFIGURATION.md` (R-023), `WHISPER_CORE_PLAN.md` (R-024).
**Where this document conflicts with an approved decision, the decision governs** and the conflict is raised, not implemented.

---

## 1. Ground rules

1. Layered architecture per `ARCHITECTURE.md` §4: presentation → application → domain → infrastructure. Domain logic never depends on Svelte, Tauri, or SQLite details.
2. Every privileged operation goes through a validated Rust command; the frontend never touches SQLite files, the filesystem outside granted scopes, or credentials, and performs **no network fetches** (all network lives in the Rust core).
3. No background services, no idle transcription workers, no polling loops, no unbounded caches or job queues. Long work runs as cancellable in-process jobs; expensive work never runs on the UI thread.
4. All external content is untrusted: validated on entry, stored as data, never rendered as HTML, never executed.
5. Local-first; no cloud sync in Phase 2; export/import is the portability foundation (D-006/D-007).
6. **Three storage categories** govern all files (§3.7): (1) user-owned saved attachments — retained until explicit deletion; (2) temporary processing files — auto-cleaned on completion/failure/cancellation plus crash recovery; (3) imported source metadata and extracted content — defined SQLite-vs-file split, never silently deleted by a completing job.
7. D-drive policy (D-019 §7): repository files in `D:\TechVault`; builds via `CARGO_TARGET_DIR=D:\Builds\cargo-target`; temp processing default `D:\Temp\`; Whisper models default `D:\Models\whisper\` (all user-configurable).
8. Reuse measured patterns from `experiments/` after re-review; Phase 1 PoC code is never copied wholesale.
9. Performance budgets use the process-tree methodology of `PHASE_2_PERFORMANCE_BUDGET.md` §1 (complete app tree incl. WebView2 children; engine/decode subprocesses measured as separate workloads).

---

## 2. (A) Application architecture

### 2.1 Process model

- Single Tauri 2 process pair: Rust core (main process) + WebView2 rendering the Svelte 5 frontend (WebView2 is the system Evergreen runtime — not bundled).
- One `tokio` runtime drives async I/O (HTTP, model download, job orchestration). CPU-bound transcription and audio decode run on dedicated blocking slots and as their own subprocesses respectively; they never block the UI event loop. At most **one** transcription job runs at a time (OD-9).
- The whisper engine is a **short-lived CLI subprocess** (OD-2) that exists only while a transcription job runs; the audio decoder is a **short-lived FFmpeg sidecar subprocess** (OD-3). Nothing resident at idle; no idle transcription workers.

### 2.2 Rust module structure (`src-tauri/src/`)

Follows `ARCHITECTURE.md` §5, populated only as modules earn existence (no empty stub modules):

```
main.rs, lib.rs            entry + Tauri builder, plugin registration, startup sequence
commands/                  thin Tauri command layer: validate args → call application → map errors
  sources.rs, resources.rs, attachments.rs, jobs.rs, search.rs, settings.rs,
  transcripts.rs, backup.rs
application/               use-case orchestration (one service per workflow)
  source_service.rs, resource_service.rs, attachment_service.rs, dedup_service.rs,
  merge_service.rs, transcript_service.rs, job_service.rs, backup_service.rs, settings_service.rs
domain/                    entities + rules, framework-free (plain Rust, unit-testable)
  source.rs, resource.rs, mention.rs, evidence.rs, attachment.rs, identity.rs,
  job.rs, verification.rs, settings.rs, errors.rs
infrastructure/
  db/                      connection pool, migrations runner, WAL/checkpoint handling
  repositories/            rusqlite-backed repository implementations
  adapters/                source adapters (local_file, pasted_text, web, github)
  http.rs                  single shared reqwest client (rustls), pinned-resolution connector
  url_validator.rs         SECURITY §8 pipeline + SSRF mechanism (§4.5)
  media/                   temp workspace, metadata probing, FFmpeg sidecar decode (OD-3)
  transcription/           engine adapter (CLI, OD-2), model manager, downloader, monitor
  fs_paths.rs              app dirs, temp dirs, attachments dir, safe path joins
  logging.rs               secret-free logging setup
jobs/                      job runner: queue, states, progress events, cancellation, recovery
security/                  payload bounds, scheme allowlists, CSP asset, path checks
config/                    typed settings load/save (no secrets)
```

### 2.3 Frontend structure (`src/`)

```
app/            SvelteKit route wiring, Tauri invoke bootstrap, error boundary
layouts/        AppShell (sidebar + topbar), ContextPanel host
components/ui/  in-house accessible primitives (OD-8: Svelte 5 runes + Tailwind + Lucide; no
                third-party UI framework) — button, card, badge, table, dialog, sheet, dropdown,
                tabs, toast, tooltip, input
features/       dashboard, sources, resources, review, search, settings (+ "later phase" empty
                states for notebooks/graph/bookmarks/analytics)
lib/            invoke wrappers, formatting utils, constants
services/       typed frontend API over invoke(); the only place that calls Tauri
stores/         UI state only (theme, toasts, job progress subscriptions); DB remains authoritative
types/          shared TS types mirroring the IPC contracts
```

### 2.4 IPC contracts

- **Transport:** Tauri commands (frontend → Rust) + typed events (Rust → frontend). P1-A measured 1.60 ms median round-trip — per-call commands with structured payloads are cheap.
- **Command envelope:** every command returns `Result<T, AppError>` serialized as `{ ok: true, data } | { ok: false, error: { code, category, message, details? } }`.
- **Error taxonomy** — categories per `ARCHITECTURE.md` §14, stable string codes: `validation`, `network`, `authentication_required`, `platform_restriction`, `media_decode`, `transcription`, `provider` (unused in Phase 2), `database`, `storage`, `verification`, `internal`. Sanitized human messages only; internals and secrets never cross the boundary (SECURITY §20).
- **Event channels:** `job:progress { job_id, stage, progress, message }`, `job:state_changed { job_id, status }`, `job:completed { job_id, outcome }`, `job:failed { job_id, error }`. One subscription per job; no global polling.
- **Contract tests:** TS types maintained against the Rust serde structs; a contract test asserts serialized fixtures round-trip both directions.

### 2.5 Error handling and observability

- Typed errors at the domain layer, mapped once at the command layer, rendered by a shared frontend error component (every screen has loading/empty/error states).
- Panics in the Rust core are caught at the command boundary where feasible; a job that panics marks the job `Failed` with earlier-stage results preserved.
- Logging: `log` facade with a rotating, size-capped file sink under app-data/logs. **Logging rules (SECURITY §20, strengthened per directive §4):** never log user content (transcript text, note bodies, fetched page text), API keys, tokens, or unnecessary sensitive file paths; provider errors and process stderr are sanitized before logging; telemetry absent.

### 2.6 Background task strategy

- **Job model:** `processing_jobs` table (DATABASE_DESIGN §17) + in-process runner. States per MASTER_BRAIN C6: Submitted → Pending → Processing → Completed | Partial Success | Authentication Required | Unsupported | Failed | Cancelled. Progress flows through `job:progress` (transcription progress is **best-effort**, derived from parsed CLI output — see §5.4) and is **throttled** (minimum 250 ms between events or one event per N segments, whichever is sparser) so long jobs cannot flood the IPC channel; each job has a cancellation flag checked at stage boundaries plus hard-kill fallback for subprocesses.
- **Concurrency caps (OD-9):** 1 transcription job; ≤2 concurrent lightweight jobs; bounded queue (default depth 20); retries manual by default with idempotency guards (retry never duplicates sources/mentions/resources).
- **Partial results — exact semantics (directive §2.B):** partial results are preserved **at the pipeline stage level**: metadata, captions, or user-provided content stored by earlier stages survive a later-stage failure and the job reports `Partial Success`. **Partial *transcript text* persistence is NOT promised in Phase 2**: transcription persists final timestamped segments **after successful processing**; cancellation/interruption terminates the engine safely and stores no partial transcript. This implements directive §2.B ("do not promise streaming or partial transcript persistence unless the chosen engine interface reliably supports it"). MASTER_BRAIN C7's "preserve partial results" remains satisfied at the stage level; if the owner later wants partial-transcript persistence, it is a new decision requiring engine-interface evidence (e.g., verified CLI segment-stream capture) — recorded as a known limitation, not silently dropped.
- **Cancellation consistency (directive §2.B):** cancelling a transcription job must terminate the subprocess safely (graceful terminate → hard kill on timeout), clean its temporary files, and leave the database in a consistent state (job row `Cancelled`, no orphan rows, no orphan temp files).
- **Recovery:** on startup, jobs left `Processing` by a crash are marked `Failed (interrupted)` with a retry affordance; a startup cleanup pass removes stale temp files after validating ownership and age (SECURITY §12).

### 2.7 Application lifecycle

1. **Startup:** load settings → open DB (run pending migrations in transactions; integrity quick-check) → recover interrupted jobs → stale-temp cleanup → register event listeners → emit `app:ready`.
2. **Runtime:** all work on demand; no idle timers.
3. **Shutdown:** window close with an active transcription job prompts for confirmation; confirm → graceful cancel (stage-level partials preserved per §2.6) → stop runner → checkpoint WAL → close DB → flush logs.
4. **Crash:** next startup performs recovery per §2.6; DB integrity check; last export remains the user's recovery path (M9).

### 2.8 Worker lifecycle, caches, and lazy loading

- **Worker lifecycle (PERF-08):** job-runner workers are spawned per job and joined at completion; the async runtime and its blocking pool exist while the app runs but hold **no idle job workers**; engine/decode subprocesses exist only while their job runs (§2.1). Nothing is resident between jobs.
- **Cache limits:** no unbounded caches — the prepared-statement cache is bounded per connection; fetched content is persisted to the DB, never held in long-lived memory caches; model downloads stream to disk with a bounded buffer; no in-memory transcript caching beyond the active view.
- **Lazy loading:** frontend routes are code-split per feature area; heavy panels (evidence viewer, settings subsections) load on demand; the library table is virtualized (UI-11/PERF-09).

---

## 3. (B) Database architecture

### 3.1 Storage and configuration

- Single SQLite database file under the app-data directory (user-configurable location) plus WAL/SHM sidecars when WAL is enabled.
- `rusqlite` with the `bundled` feature — the binding P1-F validated for the identity/merge/FTS mechanisms.
- Configuration (P-012): `PRAGMA foreign_keys = ON` per connection; `busy_timeout` 5 s; **WAL enabled only after both the concurrency test AND the backup-under-WAL test pass** (P1-F never tested WAL — this is an evidence gate, not a default); `synchronous = NORMAL` under WAL; checkpoint behavior left to SQLite defaults with a size guard; prepared statements cached per repository.
- **No encryption at rest** (P-014 pending a key-management design) — stated as an explicit Phase 2 limitation in-app (backup notes) and in documentation, never hidden (§7.1).
- Filesystem ACLs on the DB directory restricted to the user (SECURITY §18); no secrets in DB fields.

### 3.2 Schema v1 — entities and **provenance classification**

Every schema v1 decision is labeled with one of three provenances — **[AD]** existing approved decision, **[P1E]** demonstrated Phase 1 evidence, **[P2R]** new Phase 2 recommendation requiring owner approval. **The P1-F 9/9 result validates the listed *mechanisms* on the prototype harness (URL-identity matching, transactional merge/undo, guarded migrations, FTS5 triggers); it does not validate the full production schema, concurrency behavior, 100k scale, or any new table.**

| Table | Purpose | Provenance |
|---|---|---|
| `schema_migrations` | versioned migration ledger | [AD] DATABASE_DESIGN §23 |
| `sources` | submitted content, original + normalized URL, platform, status, playback_type, transcript_status | [AD] §5 |
| `source_metadata` | per-platform metadata; typed columns, JSON only where a genuine key/value blob is justified | [P2R] (JSON policy detail) |
| `resources` | canonical identities (name, type, descriptions, official_url, primary_domain, verification_status, discovery_origin, is_archived) | [AD] §6 |
| `resource_aliases` | alternate/previous names with defensible typing | [AD] §10 |
| `resource_identifiers` | strong identifiers; uniqueness only where meaningful | [AD] §11 |
| `mentions` | occurrences; extracted_name, discovery_type, timestamp, context, review_status; **confidence stays NULL unless a reliable provider supplies it** (whisper.cpp does not — no invented scores) | [AD] §7 + [P2R] confidence rule (directive §2.E) |
| `evidence` | compact snippets per mention, provenance visible | [AD] §8 |
| `resource_history` | append-only meaningful-change log | [AD] §12 |
| `resource_merges` | merge records incl. snapshot reference and undo timestamp | [AD] §13 |
| `resource_links` | resource↔resource relationships; created now, user-populated; AI population Phase 3 | [AD] §14 |
| `attachments` **[P2R]** | user-owned saved files (directive §2.A): id, resource_id (nullable FK), source_id (nullable FK), original_name, mime_type, size_bytes, sha256, storage_path, retention_state ('user_owned' default), created_at, deleted_at | **new — owner approval required** |
| `resource_tags` **[P2R]** | lightweight user organization: id, resource_id (FK), tag (normalized), UNIQUE(resource_id, tag); tag list derived by GROUP BY — no separate tag table needed at this scale | **new — owner approval required** |
| `transcripts` | per-source transcript: language, engine, model, format version, retention_state; **no confidence field content** | [AD] §9 + [P2R] confidence rule |
| `transcript_segments` | id, transcript_id, start/end seconds, text, `segment_index` with **UNIQUE(transcript_id, segment_index)** — timestamps + stable ordering [P2R detail] | [AD] §9 + [P2R] ordering constraint |
| `processing_jobs` | job rows | [AD] §17 |
| `settings` | typed, categorized settings; no credentials | [AD] §19 |
| `provider_configs` | R-023 placeholder records; every seed row `enabled=false`, `api_key_ref` placeholder, statuses `unconfigured/unvalidated` | [AD] R-023 adoption + D-021 §3 |

**Mechanisms validated by P1-F [P1E]:** TEXT UUID primary keys; FK enforcement; URL-identity duplicate detection (no confidence in identity); transactional merge preserving mentions/evidence/aliases + history; verification never upgraded by merge; exact undo via snapshot restore; additive + guarded migration pattern; FTS5 external-content trigger sync. **P1-F did NOT validate:** WAL concurrency, backup-under-WAL, 100k scale, attachments, or the production column set as a whole.

FTS5 (external-content, trigger-synced — P1-F pattern): `fts_resources`, `fts_aliases`, `fts_sources`, `fts_transcripts` (segment text linked to source + timestamps). Skeleton in M2; populated from M5/M7.

Notebooks/bookmarks/graph tables are **not created** in v1; they arrive by additive guarded migrations when their phases start — no unused tables (P-027-scope discipline). **Collections** are the notebook concept (Phase 4 — deferred, migration plan only); **relationships** are `resource_links` (created now, user-populated; AI population Phase 3); **categories** are the extensible `resource_type`/category seed per MASTER_BRAIN B3.

### 3.3 Resource identity and canonicalization

- **Resource = canonical identity; Mention = occurrence** (MASTER_BRAIN D1 [AD]). Name changes append `resource_history` [AD] (D7).
- **Phase 2 duplicate detection uses strong identifiers only** [AD]: normalized official URL, canonical domain, repository identifier, package identifier. Exact-or-normalized-equal identifier match ⇒ duplicate **candidate**; never auto-merge on name similarity [AD rule 7 of MASTER_BRAIN D4]. Normalization is deterministic and unit-tested; the original URL is always preserved beside the normalized one.
- **Uncertain matches are never auto-candidates in Phase 2** [P2R for scope]: similarity candidate generation arrives in Phase 3 only with golden-dataset evidence (P-008).

### 3.4 Duplicate handling and merge behavior

- Duplicate **submission** of the same source: detect by normalized URL / content hash; the second submission links to the existing row and surfaces an informational status — records never auto-deleted [AD §5].
- Duplicate **resources**: identifier-equality candidates enter a review queue with a merge preview; **every merge is explicit and user-confirmed** [P2R wording, AD substance].
- **Merge** (transactional — [P1E] mechanism): snapshot affected rows → re-point mentions/evidence/aliases/identifiers/history to the primary → mark the merged resource with a `merged_into` reference ([P2R] exact redirect strategy) → write the merge record. The same sync triggers remove/update the merged resource's FTS rows so **search never returns redirect-only entries** (covered by TEST-04). **A merge never upgrades verification status** ([P1E] measured invariant).
- **Undo** restores the pre-merge snapshot exactly ([P1E]); undo is recorded; history is permanent ([AD]).
- Failure at any step rolls back the whole transaction; the DB remains in its prior valid state ([P1E]).

### 3.5 Migrations

- Sequential, versioned, applied one-transaction-per-migration with a guarded pattern: verify preconditions → apply → verify postconditions [P1E mechanism].
- **Failure and recovery behavior [P2R]:** a failed migration rolls back completely, the database stays at its previous version, startup aborts with a typed `database` error identifying the failed migration, and the user is guided to restore from the latest backup. No partial schema states are ever committed. An automatic pre-migration backup precedes any migration that alters or drops existing tables.
- Fresh-create, upgrade, and partial-failure tests run in the M2 suite.

### 3.6 Transactions, integrity, and WAL

- Repositories operate on transaction handles; merge, source intake, transcript replace, attachment registration, and restore are single transactions.
- `PRAGMA integrity_check` after abnormal shutdown; `quick_check` on normal startup.
- **WAL is enabled only after both tests pass [P2R gate]:** (1) concurrent reader/writer stress with realistic job load; (2) backup/restore correctness under WAL (online-backup API snapshot validates against a live WAL database). Until then, DELETE journal mode is the tested state.

### 3.7 Storage categories and retention (directive §2.A)

**Category 1 — User-owned saved attachments.**
- Files the user explicitly chooses to keep (e.g., a local audio/video source retained for reprocessing, a saved document). Stored **outside the database** in the attachments directory (`<app-data>/attachments/`, user-configurable), referenced by `attachments` rows (path + SHA-256 + size + mime).
- **Retention:** until the user explicitly deletes them. **Their lifecycle never depends on temporary job cleanup** — no cleanup pass may ever touch the attachments directory.
- Resources reference attachments (`attachments.resource_id`); the resource detail view lists them; deleting a resource asks whether to delete or orphan its attachments (explicit choice, no silent destruction).
- Included in backups with per-file integrity checks (§7.4); excluded from nothing by default (unlike temp files).

**Category 2 — Temporary processing files.**
- Decode outputs (16 kHz mono PCM WAV), extraction workspaces, intermediate files, download partials. Located in the temp workspace (`D:\Temp\` default, configurable), unpredictable filenames, app-controlled.
- **Automatically cleaned** after successful completion, failure, or cancellation of the owning job; a crash-recovery sweep at startup removes stale entries after validating ownership and age (SECURITY §12).

**Category 3 — Imported source metadata and extracted content.**
- **In SQLite:** source metadata (title, platform, status), normalized URLs, extracted plain text (fetched page text, pasted transcripts), transcript records + segments, evidence snippets, resource/mention/alias/history data.
- **As external files:** only user-owned attachments (Category 1). Original uploaded media is processed in Category 2 temp space; **completing a processing job never silently deletes source material the user provided** — for a user-supplied file the user is asked at intake whether to (a) save it as an attachment (Category 1) or (b) process temporarily (Category 2, cleaned after the job). The choice is recorded in the source/attachment record.
- Evidence stays compact: snippets + references, never duplicated transcripts [AD D3].

### 3.8 Deletion

- Deleting a transcript does not delete resources, mentions, or evidence; evidence whose snippet came from the deleted transcript retains its stored snippet, marked "source transcript deleted" ([P2R resolution of §27 — approved? pending OD-4 review]).
- Source deletion unlinks mentions; shared canonical resources survive (§25 [AD]). Deleting an attachment removes its file and row (with confirmation). Explicit confirmation UI for all destructive actions.

---

## 4. (C) Resource ingestion

### 4.1 Adapter interface

```rust
trait SourceAdapter {
    fn id(&self) -> AdapterId;                       // "local_file", "pasted_text", "web", "github"
    fn matches(&self, input: &SourceInput) -> bool;
    fn capabilities(&self, input: &SourceInput) -> AdapterCapabilities;
    // { metadata, text_content, captions, audio_available, playback_type,
    //   auth_required, limitations }
    fn ingest(&self, ctx: JobContext, input: SourceInput) -> Result<IngestOutcome, AppError>;
}
```

Rules (`ARCHITECTURE.md` §7.2): adapters return explicit capability information and never claim a source is accessible merely because its URL parses. Failure states are typed (`Unsupported`, `AuthenticationRequired`, `NetworkError`, `ContentUnavailable`, `RateLimited`) and map onto C6 statuses.

### 4.2 Tier plan (D-015) — Phase 2 execution

| Milestone | Adapters | Network surface |
|---|---|---|
| M3 | `pasted_text`, `local_file` (+ YouTube-URL source records with user-provided transcript/audio import — OD-5) | none |
| M4 | `web` (generic websites), `github` (public repos) | full §4.5 SSRF pipeline |
| Deferred | YouTube automated ingestion (OD-5), Reddit, Medium (M4b optional), Tier 2 platforms | — |

### 4.3 Per-adapter behavior (Phase 2)

- **`pasted_text` (Tier 3):** paste transcript/description/notes → content-hash dedup → stored as a text source with provenance "user-pasted". Size-capped (OD-9).
- **`local_file` (Tier 3):** validated types/sizes; **at intake the user chooses**: save as user-owned attachment (Category 1) or process temporarily (Category 2). Temp copies use internal filenames and traversal defenses (SECURITY §10). Media metadata probed; `playback_type` recorded.
- **YouTube URL (Tier 3 mechanics, OD-5):** the URL is recorded as a source with `playback_type=Embed` capability note; the user may attach a user-provided transcript or audio file, which flows through the standard Tier 3 processing. **No automated YouTube fetching in Phase 2.**
- **`web` (Tier 1a):** §4.5 validation pipeline → fetch → HTML main-content text extraction (scripts/styles stripped; stored as plain text data only) → title/canonical/published metadata.
- **`github` (Tier 1a):** public REST metadata + README fetch; `github_repo` identifier rows for identity matching; rate-limit → `RateLimited` status; no auth tokens in Phase 2.

### 4.4 Failure handling

Every network operation: scheme allowlist (HTTP/HTTPS only), connect + read timeouts, response-size and content-type limits, per-hop redirect validation, one safe retry for idempotent GETs, typed failures. Fetched content is stored as data; prompt-injection defense is a Phase 3 consumer concern, but the storage boundary starts here.

### 4.5 URL validation and SSRF mechanism (directive §2.D — concrete, not "where practical")

**Mechanism.** All outbound fetches go through one custom connector on the shared HTTP client:

1. **Scheme gate:** only `http:` and `https:` accepted; userinfo, non-default blocked ports, and hostname forms that obscure destinations (e.g., decimal/octal/hex IP encodings, trailing-dot tricks) normalized or rejected. **IP-literal hostnames** (e.g., `http://127.0.0.1/`, `http://[::1]/`, `http://2130706433/`) are classified **directly against the blocklist without any DNS step** — the resolution stage below applies only to real hostnames.
2. **Resolution:** the hostname is resolved to **all** A/AAAA records before any connection.
3. **Blocklist (fail-closed):** every resolved address is checked against: loopback (`127.0.0.0/8`, `::1`), unspecified (`0.0.0.0`, `::`), private (`10/8`, `172.16/12`, `192.168/16`, `fc00::/7`), link-local (`169.254/16`, `fe80::/10` — includes cloud-metadata `169.254.169.254`), multicast (`224/4`, `ff00::/8`), reserved/unspecialized (`100.64/10` CGNAT, `192.0.0/24`, `192.0.2/24`, `198.18/15`, `198.51.100/24`, `203.0.113/24`, `240/4`, `255.255.255.255`), and IPv6 zone IDs. **If any resolved address is blocked — or resolution fails — the request is rejected.** A mixed public+private record set is rejected (fail-closed over-block is acceptable).
4. **Pinned connection (the rebinding defense):** the connection is made **only to a validated address** — the custom connector passes the validated `SocketAddr` as the resolution override, so the connection step cannot resolve DNS again. TLS SNI and certificate verification still use the **original hostname** (no certificate validation is weakened). Because the socket cannot re-resolve, the classic check-to-connect rebinding window is closed by construction.
5. **Redirects:** every redirect hop is independently validated (scheme, then resolution + blocklist + pinned connect for the next hop). Redirects into blocked networks are rejected. On any redirect, `Authorization`/`Cookie`/other credential headers are **stripped unless the destination origin equals the original origin** (reqwest redirect policy with header control).
6. **Limits:** connect timeout, total read timeout, streamed response-size cap (OD-9), and a content-type allowlist (HTML/JSON/plain text for ingestion; binary downloads only on the consent-gated model downloader path).
7. **Certificate validation:** hostname + chain validation is always performed (rustls); never disabled to work around failures (SECURITY §7).
8. **The frontend performs no fetches** — remote active content is never executed or rendered in the WebView; fetched documents are converted to plain text and stored as data.

**Documented limitations (stated, not hidden):**
- The DNS **resolver itself remains a trusted component**: a compromised or malicious resolver could return public-but-attacker-controlled IPs. The blocklist confines that risk to public-IP SSRF (e.g., internal services reached via public addresses) — it does not eliminate resolver trust.
- CNAME/DNAME chains and DoH/secure-DNS variants inherit the same resolver-trust boundary.
- Over-blocking: CDN edge sets that mix address families or briefly return unusual records may be rejected (accepted trade-off for fail-closed behavior).
- Pinned connections are keyed per validated address in the connection pool, so a rebinding attacker cannot reuse a pooled connection; pooled connections never bypass per-hop re-validation on redirects.
- Automated DNS-rebinding tests in M4 simulate rebinding against a local mock server (fast-flipping dual-record behavior); real-internet rebinding scenarios are approximated, not exhaustively proven.

**M4 test matrix (acceptance):** local mock server tests covering: direct localhost/127.0.0.1/::1; private-range hostnames resolving to RFC1918; link-local and `169.254.169.254`; IPv6 loopback/Ula/link-local edge cases; redirect chains http→https, same-origin, **cross-origin with credential-header stripping verified**; redirect into a private IP; DNS-rebinding simulation (hostname resolving to a public IP at validation and a loopback IP at connect — must be rejected by the pinned connector); oversized responses; slow responses (timeout); disallowed content-types; unusual ports; blocked schemes (`ftp:`, `file:`, `javascript:`, `data:`).

### 4.6 Import-format matrix, unsupported formats, and failed-import recovery (ARCH-17)

- **Supported in Phase 2 (each explicitly implemented and tested):** pasted text (transcript/description/notes); plain-text files (`.txt`); Markdown files (`.md`); local audio/video media files (processed for transcription via the OD-3 decode path); YouTube URLs (recorded per OD-5, with user-provided transcript/audio import).
- **Explicitly unsupported in Phase 2 (typed `Unsupported` error with guidance — never a silent failure or a quality claim):** PDFs (**no PDF text extraction and no OCR in Phase 2** — a future owner decision); office documents (`.docx`, `.odt`, etc.); images (**no OCR**); archives as source material (rejected — the only archive Phase 2 accepts is its own backup format, §7.4); any URL scheme outside http/https.
- **Failed-import recovery:** each intake stage commits independently; a failed stage preserves earlier-stage results and reports `Partial Success` (C7); retry is offered from the source detail view; a failed or cancelled intake leaves **no orphan temp files** (Category 2 cleanup + crash sweep); a duplicate submission links instead of reprocessing (§4.3).
- **No capability is claimed beyond this matrix.** OCR, PDF image extraction, and arbitrary document parsing are future decisions requiring their own dependency, licensing, and accuracy reviews.

---

## 5. (D) Whisper transcription — implementation and model management (directive §2.B; R-024 implemented)

### 5.1 Engine and integration

- **Engine:** whisper.cpp from the **ggml-org** upstream repository, pinned to the P1-C-verified commit `371b5a7` (v1.9.3 line); the pin is a build/integration property recorded in the repo and settings-diagnostics.
- **Integration:** **CLI subprocess behind a Rust `TranscriptionEngine` adapter** (OD-2). The adapter trait abstracts: spawn, structured arguments (no shell concatenation — SECURITY §11), stdout/stderr parsing into typed segment events, progress reporting, cancellation (graceful terminate → hard kill on timeout), exit-status mapping to typed errors. A Rust binding may be evaluated **only if** benchmarks or required capabilities demonstrate the CLI architecture is insufficient — that evaluation is a new owner decision with evidence.
- **Input contract:** 16 kHz mono PCM WAV for the initial pipeline (produced by the OD-3 decode sidecar; whisper.cpp's documented input requirement).

### 5.2 Model management

- **Catalog:** Base multilingual (initial default) · Small multilingual (optional quality) · Tiny multilingual (low-resource option) · Medium multilingual (advanced). Larger models are out of Phase 2 scope (OD-10).
- **No model is bundled** in the application installer.
- **Download:** per-model explicit user consent; a pinned, versioned model registry (name, upstream URL, SHA-256 checksum, quantization variant, size) ships with the app; the downloader verifies the file against the **trusted checksum** before use and discards on mismatch; resumable download; cancellable. Downloads use the **same §4.5 pinned connector** — IP/redirect validation applies to model downloads too; only the ingestion content-type allowlist is replaced by the model-file expectation.
- **Storage:** outside the application directory, configurable; preferred default `D:\Models\whisper\` (D-019 §7 D-drive policy). Never inside the repository or the install dir.
- **Pre-download disclosure:** each model's card shows size, estimated storage, and hardware suitability using the measured baseline (§5.5) **with the fixture-scope caveat** ("measured on the reference hardware with a short English fixture; not a general guarantee").
- **Removal and inventory:** Settings lists installed models (name, size, variant, disk path, status); removal deletes the file and updates the inventory; no orphan files.
- **Minimum-hardware considerations:** guidance derives from the measured reference machine (4-core CPU class, 32 GB RAM) and per-model peak private memory (tiny ≈0.7 GB · base ≈0.8 GB · small ≈1.3 GB · medium ≈2.6 GB, P1-C measured). The model catalog states these expectations; machines with less memory receive a UI recommendation for Tiny/Base (WHISPER_CORE_PLAN low-resource guidance).
- **Fallback when resources are insufficient:** a pre-flight check compares available system memory against the selected model's gate (OD-9/OD-7); insufficient → the job is **not started** and the user gets a typed error with a smaller-model suggestion; if a running job exceeds its gate, it is aborted with a typed error and cleaned up (Category 2 temp removed, DB consistent). The gate is a safeguard, not a guarantee (PERF-11).

### 5.3 Language capability — honest boundaries

- Phase 1 established **only a short English baseline**. **Urdu, Roman Urdu, and Urdu-English mixed transcription quality are NOT proven and must not be claimed** anywhere in UI or docs.
- The UI exposes language selection and auto-detection (whisper.cpp language parameter) but labels untested language behavior honestly.
- **M8 closure gates (OD-11):** representative owner-provided fixtures required and tested for **long-duration (≥90 s, ideally 5–10 min)**, **cancellation and recovery**, and **Urdu + English + Urdu-English mixed** transcription. Results are recorded honestly (pass/fail; no silent promotion of partial tests).

### 5.4 Progress, cancellation, and persistence semantics

- **Progress:** job-level progress events derived from parsed CLI segment output — explicitly **best-effort** (CLI output is not a progress contract; the UI must not present it as precise).
- **Cancellation:** graceful subprocess terminate, hard-kill fallback on timeout, temp files cleaned, DB consistent (job `Cancelled`; §2.6).
- **Persistence:** **final timestamped segments are persisted after successful processing** (`transcript_segments` with stable ordering). **No streaming/partial-transcript persistence is promised or implemented in Phase 2.** Stage-level partial results (metadata, captions, user-provided content) survive later-stage failures per §2.6.

### 5.5 Measured hardware baseline (scoped, not guarantees)

Phase 1 (P1-C, reference machine i5-10310U/32 GB, **11-second English fixture**): corrected RTF **base 0.292 · small 0.892 · medium 2.589 (non-real-time)** · tiny 0.234; peak private bytes 681–2583 MB across tiny→medium. These figures **apply only to the tested hardware and the short English fixture** — they are the initial hardware-suitability baseline for model cards, **not general performance guarantees**. Long-duration RTF and multilingual behavior are unknown pending OD-11 fixtures. Job RAM gates (OD-7/OD-9): proposed safeguard thresholds tiny ≤0.9 GB · base ≤1.0 GB · small ≤1.5 GB · medium ≤3.0 GB — derived from the measured peaks (681/793/1261/2583 MB) plus headroom; measured per job, engine-subprocess memory reported as its own workload. **Audit correction 2026-11-14:** the earlier "small ≤900 MB" figure contradicted the measured 1261 MB small-model peak and was corrected.

### 5.6 Flow

`submit (local media / attachment / user-provided audio) → job → FFmpeg sidecar decode to temp 16 kHz mono PCM WAV (Category 2 temp) → CLI subprocess transcribe → persist final segments + transcript record → temp cleaned → job Completed`. Each stage has typed failure states; a decode success + engine failure yields `Partial Success` with the temp WAV retained only while a retry is offered, then cleaned.

---

## 6. (E) Search and discovery

- FTS5 external-content tables (§3.2) with trigger sync across resources, aliases, sources, transcripts. Query pipeline: FTS MATCH with input escaping + relational filters + sorting, prepared statements.
- Filters: resource type, verification status, discovery type, date range, source platform, transcript presence. Sorting: relevance, created/updated, name.
- Duplicate-detection hooks reuse identity matching (§3.3/§3.4); the review queue is reachable from search results.
- `resource_links` exists (user-populated in Phase 2 via a **minimal link/unlink affordance in the resource detail view, M6**; richer management Phase 4); related-suggestion AI population is Phase 3 (D-008 applies then) — no AI in Phase 2.
- Command palette (R-020 Proposed): owner-optional; uses the same pipeline.

---

## 7. (F) Security and reliability

### 7.1 Local data protection — with explicit limitations

- DB directory ACLs restricted to the user; temp files app-controlled with cleanup on all exit paths (SECURITY §12); no local ports/APIs exposed.
- **Explicit limitation (directive §4): local SQLite data and backups are NOT encrypted at rest in Phase 2.** Database encryption (P-014) awaits a key-management design; this limitation is documented in Settings → Backup notes and in the user-facing documentation — never hidden.

### 7.2 Secrets and configuration boundaries

- Phase 2 stores **no credentials**. `provider_configs` exists only as R-023 placeholders (`enabled=false`, placeholder `api_key_ref`, `unconfigured`/`unvalidated`). No activation, no calls, no key generation (D-021 §3; OD-12). OS keychain integration is Phase 3 BYOK work; the boundary design is documented now.
- Settings are typed and categorized; sensitive values never enter `settings` rows.

### 7.3 CSP — production and development policies (OD-6, Proposed)

**Production policy (`tauri.conf.json` → `app.security.csp`):**

- `default-src 'self'` — only local application resources.
- `script-src 'self'` — **no remote script origins, no `unsafe-eval`**; Tauri injects its init scripts with nonces/hashes automatically; the app ships no inline scripts.
- `style-src 'self'` — **no remote style origins**; Tailwind and Svelte component styles are external stylesheets in the production build (no inline-style allowance required).
- `img-src 'self'` (plus `data:` only if a concrete feature justifies inline image data).
- `font-src 'self'` — Geist/Inter/JetBrains Mono are **self-hosted/bundled**; no font CDN.
- `connect-src 'self' ipc: http://ipc.localhost` — the Tauri 2 IPC allowances required for `invoke()` on Windows; no other remote origins, no `ws://`/`wss://` in production.
- **No disabled certificate or security checks anywhere** (TLS validation is never bypassed — §4.5 item 7).
- The Tauri asset protocol (`asset:`/`http://asset.localhost`) is **absent** unless a feature explicitly requires local-file display (e.g., attachment preview) and is added with a scoped, reviewed allowance.
- **No unnecessary network access from the WebView:** the frontend performs no fetches; all network lives in the Rust core (§1 rule 2).

**Development policy (`app.security.devCsp`):**

- The production base **plus only the restricted local development-server connectivity that Vite/SvelteKit HMR requires**: the dev-server origin (`http://localhost:<port>`), the HMR websocket (`ws://localhost:<port>`), and dev-time inline styles injected by the HMR runtime.
- **No arbitrary remote script origins** in development either.
- **No development exception is carried into production builds:** dev allowances live exclusively in `devCsp`; production `csp` never contains them.

**SvelteKit requirements:** `@sveltejs/adapter-static` SPA output; no server endpoints fetching remote content from the renderer; no external fonts, CDN scripts, or remote images — all assets bundled locally.

**Automated configuration checks (proof, not intent):** `scripts/check-csp` parses `tauri.conf.json` and asserts: production `csp` present and includes `default-src 'self'`; no `unsafe-eval`; no remote `http(s)://` origins in `script-src`/`style-src`/`font-src`; `connect-src` limited to self + the enumerated IPC allowances; every dev-only allowance (HMR websocket, dev inline styles) appears **only** in `devCsp`; capability files grant nothing unnecessary. Runs at M0 (both configs tested: dev HMR functional, production strict via the script + a devtools negative check), re-verified M1 and M10. Both development and production configurations are tested — a passing dev run never substitutes for the production check.

**Status:** OD-6 is **Proposed** — M0 implements both configurations and the check script only after owner approval (readiness matrix).

### 7.4 Backup and restore (directive §4 — hardened)

- **Versioned format:** a single archive (zip) containing `manifest.json` + the DB snapshot + the `attachments/` tree. Manifest: `format_version`, app version, schema version, created timestamp, DB SHA-256 + size, per-attachment entries (path, SHA-256, size), settings marker. `format_version` gates compatibility.
- **Atomic creation:** the archive is assembled in temp space, hashes computed, then atomically moved to the chosen destination; an interrupted backup leaves **no partial final file** (temp discarded on failure/interruption).
- **Attachment inclusion + integrity:** Category 1 attachments are included and hash-verified at export and again at import.
- **Restore validation before replacing anything:** manifest parse → format-version compatibility → DB integrity check on the restored copy → attachment hash verification → migrations applied if the backup schema version is older (after validation, before swap); a backup from a **newer** schema version is rejected with a clear message. Only then is the restored DB swapped into place — the active database is never silently overwritten, and an automatic pre-restore safety backup is taken.
- **Interrupted restore recovery:** restore builds entirely in a fresh workspace; any interruption discards the workspace and leaves the live database untouched.
- **Compatibility/migration strategy:** forward restores (older backup → newer app) run guarded migrations during restore; backward restores are rejected; the manifest records what happened.
- **Safe archive extraction / zip-bomb protection (SEC-14):** the only archive format Phase 2 accepts is **its own versioned backup zip**; extraction enforces a maximum compression ratio, entry count, nesting depth, and total uncompressed size before and during extraction, rejecting violations with typed errors. **Source ingestion accepts no archives** (§4.6).

### 7.5 Database integrity

FK enforcement always on; transactional guarded migrations with defined failure/recovery (§3.5); merge/undo integrity from the P1-F suite; startup integrity checks; corruption → typed error + restore guidance.

### 7.6 Logging and diagnostics

Rotating, size-capped file logs; the §2.5 rules (no user content, no keys, no sensitive paths); sanitized provider/process output; diagnostics export is sanitized and user-triggered; telemetry absent.

### 7.7 Dependency and supply-chain controls

Milestone-scoped adoption only (directive §2.F — no pre-adopting later-milestone dependencies); lockfiles committed; pins per `PHASE_2_DEPENDENCY_REVIEW.md`; `cargo audit` + `npm audit` at M10; least-privilege capabilities (no unused grants — P1-I); CSP enforced; no updater keys distributed (Phase 5).

---

## 8. (G) UI/UX blueprint (per UI_DESIGN_SYSTEM.md)

### 8.1 Shell

Desktop layout: fixed left sidebar 220 px (Dashboard, Sources, Resources, Notebooks, Knowledge Graph, Bookmarks, Research Analytics, Settings), sticky topbar 56 px (global search, job-status indicator, theme toggle), flexible workspace, optional collapsible contextual panel. Dark-primary default with full light theme, persisted. Typography per design system; radius 0.625rem; restrained cards; Lucide icons.

### 8.2 Screens (Phase 2)

| Screen | Phase 2 content |
|---|---|
| Dashboard | counts, recent activity, active jobs — no clutter |
| Sources | list + filters + detail; submit affordances: paste text / local file (with save-as-attachment choice) / URL record (incl. YouTube URL per OD-5) |
| Review | duplicate-candidate queue, merge preview/before-after, undo |
| Resources | library table, detail with aliases dropdown (D5), mentions, **attachments list (upload/remove with explicit retention semantics)**, evidence viewer, history, manual create/edit |
| Notebooks / Graph / Bookmarks / Analytics | "later phase" empty states — placeholders, not fake content |
| Settings | Appearance; Transcription (model catalog, consent, storage dir, inventory/removal); Storage (temp/attachment paths); Sources (limits per OD-9); Search; Backup & restore; About/diagnostics; Providers (R-023 placeholder state — clearly "not configured") |

### 8.3 States, accessibility, responsiveness

Every screen ships loading/empty/error/partial-success states; errors explain what happened and the next action; destructive actions confirm with consequences. Source status displays all nine C6 states; verification display uses the four states with the unverified warning (B5); confidence never shown as verification proof. Keyboard navigation + visible focus; reduced-motion respected; ARIA semantics from the in-house primitives (OD-8). **Accessibility is proven by the explicit M1 test plan (PHASE_2_MILESTONES.md), not by ARIA attribute presence**: per-primitive automated suites (dialog/sheet focus-trap, Escape, focus return, background-inert; dropdown/tab keyboard navigation with roles/states synchronized; visible focus, screen-reader labels, reduced-motion for all), a manual keyboard walkthrough, and a manual screen-reader smoke test with recorded results. Window-resizable responsive behavior within desktop constraints; mobile layouts out of Phase 2 scope.

### 8.4 Branding (OD-1)

Neutral placeholder slot (wordmark) until the owner supplies the exact approved asset; no shield/T approximation or redesign; the asset integrates verbatim on delivery. Missing logo files do not block the shell scaffold.

---

## 9. Platform posture

- **Windows** is the build/test target. Linux/macOS stay compatible-by-design (no Win32-only APIs in core) but are not built/tested/claimed in Phase 2.
- **Android:** deferred (P1-B DEFERRED / P1-D HELD); the core stays UI-independent; no Android work in Phase 2.

---

## 10. Open items status (see PHASE_2_OPEN_DECISIONS.md Rev 1.2; DECISION_LOG.md §5)

All OD-1..OD-12 recommended decisions are recorded as **Proposed** in `DECISION_LOG.md` §5 — none is approved and none may be treated as approved until separately recorded. The single owner-authorized exception is the **OD-1 neutral-placeholder approach** (interim measure; asset delivery remains pending). **Owner approvals outstanding:** OD-6 (gates unconditional M0), OD-8 (gates unconditional M1), OD-4 (gates M2), OD-2/OD-3 (M8 decisions only), OD-5/OD-7-methodology/OD-9/OD-10/OD-11 (before their consuming milestones). **Owner actions outstanding:** OD-1 asset delivery; OD-11 fixture supply; OD-12 key revocation.

---

## 11. Phase 2 / Phase 3 boundary and future AI extensibility

**Phase 2 is not an AI product.** The boundary is explicit and enforceable:

| Aspect | Phase 2 (this blueprint) | Phase 3 (future, separately authorized) |
|---|---|---|
| Provider integration | **None.** `provider_configs` exists only as R-023 placeholders — every record `enabled=false`, `api_key_ref` placeholder, statuses `unconfigured`/`unvalidated` | OpenRouter (default, D-003), Gemini, Z.ai/GLM, Ollama (local), custom OpenAI-compatible (D-004) — each a modular adapter behind the R-023 registry |
| Live API calls / spending | **Zero.** No activation, no calls, no spending; no keys requested or added (D-019/D-021 §3; OD-12) | Only with explicit per-execution owner authorization (D-019 rules) |
| Secrets | None stored; OS-keychain design documented, not implemented | BYOK via OS secure storage (R-009); managed gateway server-side only (D-005/R-010) |
| Extraction / research | Not implemented; **no stubs** | AI extraction consumes **saved resources and transcripts through controlled interfaces** (repository/service APIs — the Phase 2 data layer is the substrate) |
| Local-first independence | Complete — every Phase 2 feature works with zero external AI services | AI features are additive; local-only mode remains enforceable (API_POLICY §13) |
| Frontend secrets | None (ARCH-05/SEC-16) | None ever — keys reach only the Rust adapter's in-memory request path |

**Replaceability:** the provider abstraction remains swappable — the R-023 registry + capability flags define the seam; Phase 3 adapters implement the same registry without core changes. **Phase 2 deliverables that Phase 3 consumes:** transcripts + segments (M8), mentions/evidence (M5/M6), sources + extracted text (M3/M4), identity machinery (M6), and the golden-dataset harness patterns (P1-G, live metrics still owner-deferred).

**What this pass deliberately does NOT do:** add provider SDKs, embedding/vector infrastructure, TTS integration, gateway work, or any Phase 3 code/stub. OD-12 and R-023 remain the governing references.

---

**End of PHASE_2_ARCHITECTURE.md**
