# F1-04 — Resource Identity, Deduplication and Database Integration Validation

**Project:** TechVault
**Task ID:** F1-04
**Document status:** Proposed task specification, awaiting owner approval
**Version:** 1.0
**Shared context:** read `00-PHASE1-OVERVIEW.md` first.

**Source mapping:** DEVELOPMENT_ROADMAP §5.5 (database validation: initial schema, foreign
keys, resource identity, duplicate candidates, merge preview/rollback/undo, migration
strategy, FTS5 search); MASTER_BRAIN Part O workstream E ("SQLite schema and migration
tests") — roadmap §5.5 is the wider wording, union covered here.

**Decisions / pending items addressed:** P-007 (canonical identity model), P-008 (merge
thresholds — initial deterministic rules only; the AI-confidence part belongs to F1-06),
P-011 (resource history policy input), P-012 (SQLite configuration: FTS5, JSON1, WAL,
migrations), P-013 (sqlite-vec — expected outcome: not needed now, R-011), P-014 (encryption
— explicitly out of scope), R-004 (SQLite+FTS5), R-005 (Resource/Mention separation),
R-006 (merge history + undo).

**Hard constraint:** this task prototypes the approved schema from `docs/DATABASE_DESIGN.md`.
It does not redesign it. Items left open by that document (its §27 list: UUID representation,
final names, merge-undo implementation, transcript segmentation, evidence retention after
transcript deletion, JSON column usage) are resolved here by evidence and recommendation, for
owner approval — not by silent choice.

## 1. Objective

Prove in a small Rust test harness (no UI, no application) that the approved logical schema
translates into a working SQLite database where: identity invariants hold (Mention vs
canonical Resource separation), duplicate submissions and merge operations are safe
(transactional, reviewable, undoable, evidence-preserving), migrations are versioned and
fail-safe, and FTS5 search performs at realistic library sizes. Produce recommendations for
the §27 pending schema items so the production schema can be approved in Phase 2.

## 2. Technical Questions

Verified facts (SQLite official documentation — stable, re-verify versions at execution):

- FTS5 is a SQLite extension building full-text tables; external-content FTS5 tables with
  triggers are the standard pattern to avoid duplicating text (sqlite.org/fts5.html).
- WAL mode changes concurrency behavior (readers don't block the writer) and has backup/
  checkpoint implications; copying a database file while active is unsafe — the online
  backup API or VACUUM INTO is the supported path (sqlite.org/wal.html; sqlite.org/backup.html).
- JSON1 functions ship enabled in common SQLite builds, including the bundled SQLite used by
  typical Rust bindings (verify per binding at execution).
- `PRAGMA foreign_keys` must be enabled per connection; it is off by default.

Questions this experiment must answer by evidence:

1. Does the approved entity set (Sources, Resources, Mentions, Evidence, Aliases,
   Identifiers, History, MergeHistory, Relationships, Jobs, plus transcript storage)
   map to workable tables with the documented constraints — and where do the §27 open items
   land (UUID TEXT vs INTEGER surrogate keys: size/index cost at 100k rows)?
2. Do all ten identity test cases from `docs/TESTING_STRATEGY.md` §5 behave per the
   invariants (same-URL merge accepted; same-name-different-product NOT auto-merged;
   renamed resource; fork-vs-original; insufficient-evidence → review queue, etc.)?
3. Is a merge fully transactional — does an injected mid-merge failure leave the database
   byte-consistent (integrity_check pass) with zero partial changes?
4. Is undo implementable as specified (restore merged resource identity, mentions, aliases,
   evidence links) using the MergeHistory snapshot approach, and what is the simplest correct
   implementation (a §27 decision)?
5. WAL + busy_timeout under a concurrent reader/writer micro-benchmark: any
   SQLITE_BUSY-pathological behavior on Windows (relevant because the app writes during
   processing while the UI reads)?
6. FTS5 with external content + triggers: index maintenance cost on insert/update, and query
   latency (prefix, phrase, filtered joins) at 10k/50k/100k resources with realistic text?
7. Migration harness: sequential versioned migrations with `PRAGMA user_version` (or
   equivalent) — does a deliberately failing v1→v2 migration roll back completely, and is a
   partially-migrated DB detected on reopen?
8. Duplicate source submission: re-running an insert for the same URL+platform creates no
   duplicate rows when using the documented unique constraints (AGENTS.md §7).

## 3. Dependencies

- Rust toolchain only. Independent of all other experiments; can start immediately after
  toolchain install.
- Binding recommendation (per AGENTS.md §6, documented choice): `rusqlite` with the
  `bundled-full` feature set as the PoC vehicle (bundles SQLite with FTS5/JSON1 enabled;
  MIT licensed; actively maintained). This is a harness choice for validation, recorded as
  evidence for the Phase 2 dependency decision — not an approval.
- No owner-provided resources required. Test data is synthetic (generator script producing
  realistic names/URLs/timestamps).

## 4. Test Environment

- Reference Windows machine. Rust integration-test harness in the scratch directory.
- Synthetic data generator with a fixed seed; sizes 1k / 10k / 50k / 100k resources with
  proportional mentions/evidence; text drawn from a fixed corpus of technical-style
  sentences so FTS queries are realistic.

## 5. Minimal Proof of Concept

1. Translate `docs/DATABASE_DESIGN.md` §5–§20 into SQL DDL (v1) exactly as documented; where
   §27 leaves a choice open, implement BOTH variants behind a migration flag for the one
   being measured (UUID TEXT vs INTEGER) and benchmark; keep the approved structure intact.
2. Implement the identity/dedup rule set as pure functions over identifiers (strong
   identifiers per §11: official URL, repo ID, package ID; name similarity explicitly NOT a
   merge trigger), producing: auto-match / review-candidate / no-match — the deterministic
   half of P-008.
3. Implement merge as a single transaction with a pre-merge snapshot row; implement undo
   from the snapshot; implement "not-the-same" (blocklist entry preventing future
   auto-suggestion of the same pair).
4. Migration runner with two dummy versions; fault-injection test (abort between statements)
   verifying rollback and detection.
5. FTS5 external-content table + sync triggers over resources/aliases/transcripts; benchmark
   queries at each dataset size; measure insert/update index overhead.
6. WAL concurrency micro-benchmark: writer thread + reader thread, busy_timeout configured,
   count of busy failures and p95 read latency.
7. Encode TESTING_STRATEGY §5's ten cases + §5's required invariants as automated tests;
   run and record results.

Out of scope: encryption (P-014 — separate later evaluation), sqlite-vec beyond a
recorded "deferred" note (P-013/R-011), any application/repository layer, backups beyond a
single VACUUM INTO sanity check, UI.

## 6. Expected Deliverables

- SQL DDL (v1 + v2 migration) matching the approved design, plus the harness code.
- Automated test suite results: 10 identity cases, invariants, merge/undo, duplicate
   submission, migration fault-injection — pass/fail list with output logs.
- Benchmark tables: FTS latency by size; write overhead with/without FTS triggers; WAL
   contention results; UUID-vs-INTEGER size/index comparison.
- Recommendation sheet for each §27 open item touched, each labeled
   recommendation-requires-owner-approval.
- Completed results record.

## 7. Measurable Acceptance Criteria

| # | Criterion | Target |
|---|---|---|
| A1 | Fresh DB creation from DDL succeeds; FK enforcement on (violating insert rejected) | Pass required (hard) |
| A2 | All 10 identity cases produce the specified verdict (merge / review / distinct) | 10/10 required; any deviation is a design finding to escalate, not to patch silently |
| A3 | Merge transactionality: injected mid-merge failure → zero partial changes, `PRAGMA integrity_check` = ok | Pass required (hard) |
| A4 | Undo restores identity, mentions, aliases, evidence links exactly (automated comparison) | Pass required (hard) |
| A5 | Uncertain matches never auto-merged; AI-confidence never treated as identity proof in the rule functions | Pass required (hard; AGENTS.md §7 resource-identity rules) |
| A6 | Duplicate source submission (same platform+URL) creates exactly one source row | Pass required (hard) |
| A7 | Failing migration rolls back fully and is detected on reopen | Pass required (hard) |
| A8 | FTS5 search p95 latency at 100k resources, simple phrase query | PLANNING TARGET ≤ 50 ms; measure then decide with owner (P-022 input) |
| A9 | Write overhead added by FTS triggers on bulk insert | Measured; compare against baseline insert rate; no pre-set pass number — feeds budget decisions |
| A10 | WAL reader p95 latency under concurrent writes; busy-failure count | PLANNING TARGET 0 data-loss incidents, busy failures resolved by timeout; measure then decide |

## 8. Failure Conditions

- The approved logical schema cannot be expressed in SQLite without violating one of its own
  documented invariants (e.g. a constraint set that cannot coexist) — escalate as a design
  conflict with evidence; do not redesign unilaterally.
- Any hard criterion A1–A7 failing after genuine implementation effort.
- FTS or WAL behavior on Windows materially worse than the planning targets with no
  configuration remedy (documented investigation required first: page size, synchronous
  settings, checkpoint tuning).

## 9. Fallback Options

- Performance shortfalls: SQLite configuration tuning (page_size, cache_size, synchronous,
  checkpoint pacing, FTS page-size/tokenizer choices) is the first and authorized response —
  it is exactly what P-012 asks to validate.
- If UUID TEXT proves costly at scale, INTEGER surrogate + separate stable public ID is the
  documented alternative shape within the design intent — recommendation to owner (§27).
- Replacing SQLite or adding an ORM/server database is NOT an authorized fallback (R-004,
  local-first D-006); any such move would be a new proposal with demonstrated blockers.
- Encryption and vector search remain deferred (P-014, P-013) — no fallback action here.

## 10. Evidence and Source References

- SQLite FTS5 extension: https://www.sqlite.org/fts5.html
- SQLite WAL: https://www.sqlite.org/wal.html
- SQLite backup API / VACUUM INTO: https://www.sqlite.org/backup.html
- SQLite PRAGMA reference (foreign_keys, user_version, busy_timeout):
  https://www.sqlite.org/pragma.html
- Project documents: `docs/DATABASE_DESIGN.md` (entire; §21–§27 especially),
  `docs/MASTER_BRAIN.md` Part D, Part I; `docs/TESTING_STRATEGY.md` §5, §10;
  `docs/DEVELOPMENT_ROADMAP.md` §5.5; `docs/DECISION_LOG.md` P-007..P-014, R-004..R-006,
  R-011; AGENTS.md §7 (database and resource-identity rules).

**Effort:** M–L. Fully parallelizable with F1-03a, F1-05 (browser half), F1-06 (prep).
**Costs/owner approvals:** none beyond toolchain; §27 recommendations returned to owner.
