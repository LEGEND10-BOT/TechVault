# TechVault Phase 2 M1 — Storage Design

**Document status:** v1.1 (2026-11-14, owner rulings recorded — see revision note below). Planning specification — **no implementation authorized.**
**v1.1 changes (owner directive §E, recorded as D-026):** A-4 attachment-directory relocation defined (§3.1) — DB relocation not offered in M1; A-7 restore = full library replacement with quarantine of live extras (§7); A-10 export/restore waits for job-queue quiescence (§7); F-3 dedicated test for the default cross-volume copy path (§9). Storage decisions **DP-05 (UUID-based store), DP-06 (orphan quarantine + 30-day grace), DP-07/OD-9 (intake limits), DP-08 (in-house sniffer) are APPROVED (D-026, 2026-11-14)**; the earlier "Proposed" labels are retained in the v1.0 text for provenance history.
**v1.0:** Prepared Draft (2026-11-14). Extends `PHASE_2_ARCHITECTURE.md` §3.7 (three storage categories) and §7.4 (backup). No binaries are ever stored inside SQLite; the database holds metadata + SHA-256 + relative paths only.

---

## 1. Storage principle

**Metadata in SQLite; binaries on the filesystem.** The database stores every file's identity (UUIDv7), original name (display only), MIME type, size, SHA-256, and app-relative storage path. Rationale: keeps the DB small and fast (FTS/queries), enables streamed hashing without holding files in memory, keeps backup sizes transparent, and avoids SQLite blob-page fragmentation. No justified exception exists in M1.

## 2. Three storage categories (inherited; operational detail)

| Category | Contents | Location | Lifecycle |
|---|---|---|---|
| **1 — User-owned attachments** | files the user explicitly saved at intake (media retained for reprocessing, saved documents) | `<app-data>/attachments/` (configurable) | until explicit user deletion; **never touched by any cleanup pass** |
| **2 — Temporary processing files** | intake workspaces, staging copies, future decode outputs | `D:\Temp\techvault\` default (configurable) | auto-cleaned on job completion/failure/cancellation + startup sweep (ownership + age validated) |
| **3 — Imported content in SQLite** | source metadata, pasted text, extracted plain text, metadata, evidence snippets, resource/mention/alias/history data | the database | never silently deleted by a completing job |

Completing a processing job never deletes source material the user provided — the intake choice (`attachment` vs `temporary`) is recorded on the source row (M1-OD carried from Rev 1.3 directive §2.A).

## 3. Resource directory structure (DP-05 APPROVED — D-026)

```
<app-data>\                        (default %APPDATA%\com.techvault.app; configurable)
  techvault.db                     SQLite (+ -wal/-shm only if WAL is later enabled)
  attachments\                     Category 1
    <id[0..2]>\<id[2..4]>\<uuid>   two-level shard by UUIDv7 prefix; final name = UUID, no extension
  backups\                         default export destination (user chooses per export)
  logs\                            M0 rotating logger
  orphans\                         quarantine for swept orphan files (M1-OD-8)
<temp>\techvault\                  Category 2 (default D:\Temp\techvault\; configurable)
  import-<job-id>\                 one workspace per intake job
```

- **Internal filenames only** (`attachment.original_name` is display metadata, never a path component) — path-traversal and unsafe-character classes are eliminated by construction (SEC-07); safe-join checks remain as defense-in-depth with negative tests.
- Two-level sharding avoids huge single directories at 100k scale with trivially small code.
- No extension on stored files: type lives in `mime_type`; rendering decisions are made by the app, never by the shell.

### 3.1 Attachment-directory relocation (amendment A-4, approved D-026 — required before G3)

Because `attachments.storage_path` is **app-relative to the configured attachments root**, relocation moves the tree without touching DB rows:

1. **Preconditions:** import/index jobs quiesced (A-10 mechanism); destination empty or exclusively containing a previous incomplete relocation workspace; destination volume verified writable with sufficient space.
2. **Move:** copy each file into the destination shard → verify SHA-256 per file against the DB → only after **all** files verify, atomically flip the configured attachments root (single settings write) → re-check one sampled hash through the service path → old tree removed.
3. **Interruption:** the old tree is untouched until the flip; a partial destination workspace is discarded on the next attempt; no DB row ever points at a missing file.
4. **Hash mismatch mid-relocation** → typed `storage.relocation_hash_mismatch`, relocation aborted, both trees intact, typed error reported.
5. **DB relocation is not offered in M1** — changing the database location yields a typed error directing the user to the backup/restore path (G10). Temp-directory changes are free at any time (Category 2 holds no durable value).
6. **Crash between the atomic flip and the old-tree removal (audit F-8, applied 2026-11-14 — required before G3):** the relocation records its in-progress/completed state in settings; the startup sweep detects a leftover relocation source directory after a completed flip, re-verifies each file against the live DB rows before treating the tree as redundant, and only then removes it — the verified copy under the active root is never touched, so **the only verified copy of attachment data is never deleted**. Verified by a G3 sweep test.

## 4. Content hashing and duplicate detection

1. **SHA-256 streamed** (64 KiB chunks, incremental hasher) at attachment registration and paste/file intake — no full-file memory reads (PERF-10). Hash is computed once per import and reused by metadata, dedup, and backup.
2. **Duplicate detection levels:**
   - **Source level:** `sources.content_hash` equality on new intake → link to the existing source row + informational status; records never auto-deleted [AD §5].
   - **Attachment level:** same-hash lookup at registration → the user is informed ("an identical file is already attached to X") and may still attach it.
   - **No silent auto-dedup of attachment files in M1** (per-attachment files keyed by UUIDv7; M1-OD-5). A content-addressed store (one file per hash, refcounted) is the known future optimization — it introduces refcount-deletion correctness risk and is proposed **against** for M1.
3. Hash mismatch during any later verification (backup restore, orphan sweep) → typed `storage.hash_mismatch`, file quarantined, never silently replaced.

## 5. Atomic imports, interrupted-import recovery, validation

**Atomic file placement:** write to the Category 2 job workspace → fsync → `std::fs::rename` into the attachments shard (same volume required — the app verifies temp and attachments are on the same volume; if not, copy+fsync+rename within the attachments tree). A crash before the DB commit leaves an orphan file, handled by the sweep — never a partially written "final" file.

**Import commit order:** file placed and fsynced → DB transaction (source row + attachment row + metadata) commit → FTS triggers fire → temp workspace removed. Failure at any stage preserves prior-stage results (`Partial Success`) and cleans the workspace.

**Interrupted-import recovery (startup):** jobs left `Processing` → marked `Failed (interrupted)` with retry affordance → their workspaces removed after ownership/age validation → attachment-dir orphans quarantined (below).

**File validation (validation-first; DP-07/OD-9 APPROVED — D-026):**

| Check | Rule |
|---|---|
| Size | per-type limits (media 100 MB, archives n/a in M1, documents/text 20 MB, pasted text 5 MB); oversized → typed `validation.size_limit` with the limit named; overrides configurable in Settings, overrides logged |
| Type | magic-byte sniff vs declared matrix; mismatch → `validation.type_mismatch`; extension never trusted alone |
| Readability | read-errors mid-hash → typed `storage.read_failed`; partial hash discarded |
| Name/path | original name length-capped, sanitized for display only; never used as a path |
| Archives | **no archives accepted as source material in M1**; the only archive the app accepts is its own backup format (zip-bomb caps, §6) |

## 6. Orphan detection (DP-06 APPROVED — D-026: quarantine + 30-day grace)

Startup sweep and a manual Settings action:
1. **Attachment-dir orphans** (files present, no live DB row): moved to `<app-data>\orphans\` with a log entry + Settings report; auto-purge after a configurable grace period (default 30 days) **only** with a user-visible report — never a silent delete. (Immediate-delete is the alternative option; quarantine recommended because crash-orphan files may be the only copy of user data.)
2. **Temp workspace stale entries:** deleted after ownership + age validation (Category 2 has no user value by definition) — this matches the inherited Rev 1.3 rule.
3. **DB rows without files** (attachment row, missing file): flagged in Settings → Storage diagnostics; typed error on access; never auto-repaired.

## 7. Backup and restore (G10)

**Format (versioned zip archive — inherited hardened design):**
```
manifest.json          { format_version, app_version, schema_version, created_at,
                         db: { sha256, size_bytes }, attachments: [ {id, path, sha256, size, mime} ],
                         settings_marker }
db\techvault.db        consistent snapshot (online-backup API or clean-copy under lock)
attachments\...        Category 1 tree, per-file hashes in the manifest
```

- **Atomic creation:** assemble entirely in temp space → compute hashes → final `rename` to destination → **verify** (reopen + hash check) → report. Interrupted export leaves no partial final file.
- **Quiescence (amendment A-10, approved D-026 — required before G10):** export and restore wait for job-queue quiescence before taking their snapshot/performing the swap — active jobs are listed to the user, who may wait or cancel them; proceeding mid-job is not offered (the snapshot must be consistent). Verified by a dedicated test (§9).
- **What is included:** DB snapshot + Category 1 attachments + settings marker. **Excluded:** temp workspace, logs, orphans, models (none exist in M1), anything Category 2.
- **Restore validation before replacing anything:** manifest parse → `format_version` compatibility (newer backup → rejected with a clear message; older → guarded migrations after validation) → DB integrity check on the restored copy → attachment hash verification → **automatic pre-restore safety backup** → close-connection → swap → reopen → post-swap integrity check (the close→swap→reopen sequence is an explicit test item).
- **Restore is a full library replacement (amendment A-7, approved D-026 — required before G10):** after the swap, the live attachments tree equals the archive's attachment set; any live attachment file **not** present in the archive is moved to the orphan quarantine (`<app-data>\orphans\`, per DP-06) — never silently deleted. The confirmation dialog states the full-replacement semantics explicitly and names the safety-backup path.
- **Interrupted restore:** built entirely in a fresh workspace; interruption discards the workspace; the live DB is untouched.
- **Zip-bomb protection (SEC-14):** maximum compression ratio, entry count, nesting depth, total uncompressed size caps enforced before and during extraction; violations → typed errors. Path-traversal-safe extraction (`../` entries rejected).
- **Restore drill:** owner performs export → restore as the G10 exit gate.

## 8. Export and import — data portability (G11, M1-OD-6)

Distinct from backup (full-fidelity archive): a **structured data package** for moving/merging library data between libraries or feeding other tools (D-007).

**Format proposal — "TechVault Data Package" (TVDP-1), JSON (⛔ DP-09 DEFERRED — D-026: the owner's format/conflict-policy decision is required before G11):**

```json
{ "format": "techvault-data-package", "format_version": 1,
  "exported_at": "...", "app_version": "...", "schema_version": 1,
  "resources": [...], "resource_aliases": [...], "resource_identifiers": [...],
  "mentions": [...], "evidence": [...], "resource_links": [...],
  "resource_tags": [...], "categories": [...], "sources": [...],
  "attachments": [ {metadata only; files optional, hash-referenced} ] }
```

- **Attachment files:** metadata always; optional sidecar folder `attachments/` with hash-named files (user chooses "include files" or "metadata only").
- **Conflict policy on import (explicit, never silent):** match by stable `id` first, then strong identifiers → identical → skip (report); exists-with-changes → **user choice: update / keep both is not offered / skip** (update overwrites only fields in the package, appends history); new → create; references to missing targets → typed error listing them; **never auto-merge**. Import runs in one transaction with a preview report before commit.
- **No encryption** (P-014 limitation documented); no compression dependency beyond the optional `.json` (gzip only if the owner wants it — default plain).
- MD/CSV export stays deferred (R-018 PA).

## 9. Backup/restore integrity verification matrix (test obligations)

| Test | Gate |
|---|---|
| Roundtrip preserves all M1 entities incl. attachments (hash-verified) | TEST-08 |
| Corrupted archive (bad manifest hash, truncated zip, tampered DB bytes) → typed rejection | TEST-08 |
| Foreign/newer-format archive → typed rejection | TEST-08 |
| Zip-bomb (high ratio, deep nesting, entry flood) → rejected | TEST-08/SEC-14 |
| Interrupted export → no partial final file; interrupted restore → live DB untouched | TEST-08 |
| **Cross-volume copy+fsync+rename path (F-3, D-026) — the DEFAULT placement path when temp and attachments roots are on different volumes** — file placed, hash verified, no partial final, crash-orphan handled | G3/G4 dedicated fixture test |
| **Relocation roundtrip (A-4):** all files moved + hash-verified, pointer flipped, old tree removed; interrupted relocation discards the workspace; hash-mismatch abort leaves both trees intact | G3 dedicated suite |
| **Restore full-replacement (A-7):** post-restore attachments tree equals the archive set; live extras quarantined, not deleted | TEST-08 extension |
| **Quiescence (A-10):** export/restore with an active job waits and lists it; proceeding mid-job is not offered | G10 dedicated test |
| Pre-restore safety backup exists and is itself restorable | TEST-08 |
| WAL-mode backup correctness (only if WAL is ever enabled) | the WAL evidence gate |

---

**End of PHASE_2_M1_STORAGE_DESIGN.md**
