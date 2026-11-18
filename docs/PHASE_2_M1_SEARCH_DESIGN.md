# TechVault Phase 2 M1 — Search Design

**Document status:** v1.1 (2026-11-14, owner rulings recorded — see revision note below). Planning specification — **no implementation authorized.**
**v1.1 changes (owner directive §D, recorded as DP-10 APPROVED WITH AMENDMENTS / D-026):** FTS5 `remove_diacritics` is **pinned to 2** (the v1.0 text mischaracterized the option as "Latin-oriented"; correction: value 1 is the legacy Latin-only mapping, value 2 is the broadest mapping set); the G8 Urdu probe is extended with explicit **Arabic/Urdu harakat behavior testing** (does the tokenizer strip U+064B–0652?); actual observed behavior is recorded raw; honest multilingual limitations preserved; no unsupported claims of Urdu stemming or advanced multilingual search.
**v1.0:** Prepared Draft (2026-11-14). Extends `DATABASE_DESIGN.md` §20 and `PHASE_2_ARCHITECTURE.md` §6. Search latency numbers marked *carried* come from approved Phase 1 planning targets; nothing in this document is a measured M1 result.

---

## 1. Indexing strategy

**FTS5 external-content tables** (`content=` + `content_rowid=`, content stored once in the source tables) with **trigger sync** — the P1-F-validated pattern [P1E]. Four indexes in schema v1:

| FTS table | Indexed source | Columns |
|---|---|---|
| `fts_resources` | `resources` | canonical_name, short_description, detailed_description |
| `fts_aliases` | `resource_aliases` | alias_name |
| `fts_sources` | `sources` | title, description, (pasted) text content |
| `fts_transcripts` | `transcript_segments` | segment text (linked to source + timestamps) — created empty in M1, populated post-M1 |

- Trigger set per table: AFTER INSERT → index row; AFTER DELETE → delete row; AFTER UPDATE → delete+insert. Merge/delete flows therefore keep indexes consistent *by construction* (merged resources' FTS rows are removed by the same triggers — TEST-04 asserts search never returns redirect-only entries).
- External content keeps DB size low (no text duplication) at the cost of requiring the content rows to exist — consistent with our deletion rules (evidence snippets are stored copies, independent of FTS).
- `fts_sources` text: for `pasted_text` sources the full pasted content is indexed (bounded by the 5 MB OD-9 cap); for local files only title/description/metadata text is indexed in M1 (media content indexing arrives with transcription).
- The G2 gate creates indexes + triggers (skeleton); G8 populates and measures.

## 2. Incremental indexing

- **Normal operation:** triggers keep everything incremental — no batch jobs on the happy path.
- **Bulk reindex** exists for corruption recovery and post-migration rebuilds: cancellable, non-blocking (runs as a job on the runner, ≤2 light jobs cap), chunked batches (e.g., 500 rows/transaction) with progress events; `INSERT INTO fts(fts) VALUES('rebuild')` used only as the last-resort full rebuild path.
- Startup integrity: if a `quick_check`/`fts integrity` anomaly is detected, the affected index is queued for rebuild rather than silently trusted [P2R].

## 3. Query pipeline (G8)

1. **Parse:** frontend sends `{ q, filters, sort, page }`; the Rust layer escapes and converts user input to a safe FTS5 MATCH query — user input is never interpolated into SQL text (injection-safe: FTS syntax characters quoted/escaped; invalid MATCH syntax → typed `validation.query_invalid`, not a 500).
2. **Match:** FTS5 `MATCH` with `bm25()` ranking; **column weights** (DP-10: tuning values, never measured targets): canonical_name 5.0, aliases 3.0, short_description 2.0, other text 1.0 — reviewed against real data at G8, never presented as measured truth before then.
3. **Join + filter:** FTS results joined to live rows (`merged_into IS NULL`, `is_archived` per request); relational filters applied in SQL: resource_type (category), verification_status, discovery_type, created/updated date range, tag (via `resource_tags`), attachment presence, source platform.
4. **Sort:** relevance (bm25) | updated_at | created_at | canonical_name (codepoint order — see §5).
5. **Page:** keyset pagination [P2R] with total-count estimation on the filtered set; entity-type grouping (resources/sources) in the global topbar search per UI-12.
6. **Instrumentation:** every query records duration (ring buffer of last N) for the G8 latency report.

Prepared statements cached per repository (bounded); no query builds unbounded `IN (...)` lists (tag filters use joins).

## 4. Filters and sorting surface (library + global search)

| Filter | Values |
|---|---|
| Category | `resource_categories` list |
| Verification | verified / partial / unverified / broken |
| Discovery type | manual (M1); reserved values displayed only when present |
| Date | created/updated range |
| Tags | multi-select from the tag list |
| Attachments | has / has none |
| Archived | included/excluded (default excluded) |

Sorting: relevance, updated, created, name. Deep links from search results to resource detail (route params).

## 5. Unicode, Urdu, and multilingual handling

- **Tokenizer:** `unicode61` with **`remove_diacritics=2` pinned (DP-10 amendment, approved D-026)**. Correction of the v1.0 text: FTS5's `remove_diacritics` value **1** is the legacy Latin-only mapping; value **2** is the *broadest* diacritic-removal mapping set SQLite ships — it is **not** "Latin-oriented". Rationale: Urdu is whitespace-delimited, so unicode61 tokenizes Urdu words correctly at the word level; SQLite TEXT is UTF-8 native; no language-specific stemming exists for Urdu in FTS5 (and `porter` is ASCII-only — it is **not** enabled, to avoid pretending English stemming while silently doing nothing for Urdu). The effect of `remove_diacritics=2` on Arabic/Urdu diacritics (harakat, U+064B–U+0652) is **an empirical question, not an assumption** — see the G8 probe.
- **What works in M1 (honest):** whole-word and phrase search for Urdu, English, and mixed text; prefix search (`word*`); case-insensitive Latin matching (unicode61 folds case); no diacritic/stem normalization for Urdu — searching اردو variants requires exact token match.
- **What is explicitly NOT claimed:** Urdu quality of any transcription origin (post-M1), Urdu stemming/morphology, RTL presentation correctness of the UI (verified visually at G9 — presentation is a UI concern, not the index's).
- **Collation/ordering:** SQLite BINARY codepoint order for `ORDER BY name` — Urdu sorts by codepoint, which is **not** lexicographic Urdu order. Recorded as a known M1 limitation [P2R accept]; custom collations add complexity and are proposed against for v1 (revisit only with owner demand).
- **Requires research (time-boxed, G8 — extended per DP-10 amendment, D-026):** a small FTS5 probe on owner-supplied Urdu fixtures (index + query a few dozen rows) to confirm tokenization behavior empirically before the G8 report makes any multilingual statement, **now explicitly including the harakat check**: index Urdu text containing harakat (U+064B–U+0652) and record whether `remove_diacritics=2` strips, alters, or retains them — searched both with and without diacritics; observed behavior recorded raw in the gate evidence. **No benchmark may be invented; no Urdu stemming, normalization, or "advanced multilingual search" capability may be claimed** — the only supported statement is what the probe observed.

## 6. Reindexing and recovery

| Scenario | Behavior |
|---|---|
| Normal edits | triggers, zero batch work |
| Corrupt/detached index detected | affected table queued for incremental rebuild job (cancellable, non-blocking) |
| Post-migration schema change to indexed columns | migration includes a rebuild step (TEST-03 asserts FTS consistency after migration) |
| Full rebuild | `('rebuild')` command as last resort; UI shows progress; search remains available against the other indexes meanwhile |

## 7. Performance targets and measurement

| Metric | Target | Status |
|---|---|---|
| FTS query p95 @10k resources | ≤10 ms | Gate budget (DP-13/D-026) |
| FTS query p95 @100k | ≤50 ms | **Carried** approved planning target (F1-04 A8) |
| FTS write overhead p95 per indexed row | ≤5 ms | **Carried** (F1-04 A9) |
| Bulk reindex 100k rows | ≤60 s, cancellable, non-blocking | Gate budget (DP-13/D-026) |
| Library filter+browse interaction p95 @10k rows | ≤100 ms (virtualized UI) | Gate budget (W2 — PERF budget v1.1) |

Phase 1 measured 0.005–0.009 ms median at 5k/20k on the prototype harness — **scope-limited evidence, not a production result**; 10k/100k are measured at G2/G8 with the committed harness (TEST-04/TEST-12). Misses are reported as misses with analysis; criteria are never weakened (PERF-15).

## 8. Out of scope

Semantic/vector search (rejected, R-011/P-013) · command palette (R-020, owner-optional PA) · transcript-content search execution (index exists; population post-M1) · graph search (Phase 4).

---

**End of PHASE_2_M1_SEARCH_DESIGN.md**
