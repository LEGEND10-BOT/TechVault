# F1-04 Results — Database, Resource Identity, Merge/Undo, FTS5 (P1-F)

**Date executed:** 2026-11-13
**Executor:** Implementation/verification agent (owner directive 2026-11-13, D-018)
**Environment:** Windows 11 Pro, i5-10310U/32 GB reference machine; Rust 1.99.1 (stable-MSVC, toolchain homes on `D:\dev-caches`); rusqlite 0.32.1 (bundled SQLite, WAL mode enabled)
**Artifacts:** `experiments/p1-f/` (harness `src/main.rs`, results `results/p1-f-results.json`, DB `results/p1-f.db` — gitignored as user data)

**Overall status: COMPLETE (harness-level) — 9/9 checks PASS, rerun reproduces 9/9.** This validates the documented identity model's critical invariants in a throwaway SQLite harness; it does NOT implement the production schema (per AGENTS.md §F3 boundary — no production schema changes).

## Measurements

| Metric | Method | Value |
|---|---|---|
| Wall time, full suite | `Instant` | 718 ms (release build) |
| FTS5 index fill, 5k rows | wall | 172 ms |
| FTS5 index fill, 20k rows | wall | 488 ms |
| FTS5 search (MATCH), 5k resources, median of 20 | query timing | **0.005 ms** (p95 0.025 ms) |
| FTS5 search (MATCH), 20k resources, median of 20 | query timing | **0.009 ms** (p95 0.014 ms) |

## Acceptance criteria evaluation (F1-04 spec; TESTING_STRATEGY §5 invariants)

| Check | Invariant tested | Result |
|---|---|---|
| schema-v1-created | Documented identity model tables (resources / mentions / evidence / aliases / merge_history) + FTS5 external-content index | **PASS** |
| fk-enforcement | Mention referencing a nonexistent resource is rejected | **PASS** |
| duplicate-candidate-by-url | Deterministic identity matching: same official_url ⇒ duplicate candidate; no confidence involved (R-005/P-007 discipline) | **PASS** |
| merge-transactional-preserving | Merge inside a transaction: mentions re-pointed (2/2), evidence preserved and traceable (2/2), loser alias moved to winner, history row recorded (1/1) | **PASS** |
| merge-does-not-upgrade-verification | Winner's verification_status stays `unverified` after absorbing a merged duplicate | **PASS** |
| merge-undo-restores-state | Undo: loser resource restored (1/1), mentions re-pointed back (1/1), evidence traceable again (1/1), history marked undone (1/1) | **PASS** |
| migration-additive-and-guarded | Additive v2 migration applies; unguarded re-run fails loudly; version table records applied guard | **PASS** |
| fts5-search-5000 / -20000 | Search latency medians (above) far under any planning threshold | **PASS** |

**Merge regression checks covered** (TESTING_STRATEGY §5): canonical identity, preserved mentions, preserved evidence, preserved aliases, merge history, undo behavior — verified by explicit count assertions in the harness. Relationship updates and transactional rollback-mid-merge are partially covered (the merge runs inside one transaction; a mid-transaction failure path was not separately induced — recorded as a known gap).

## Known gaps (honest scoping)

1. Duplicate-candidate matching tested with URL identity only; name-similarity matching (P-008's deterministic half) was not exercised — the F1-06 dataset covers the AI half when its run unblocks.
2. No concurrent-writer test (single connection); production must validate WAL concurrency.
3. JSON snapshot parsing in the undo path is a crude PoC parser (no serde dependency added); production needs the approved serialization design.
4. No mid-merge crash-recovery simulation (WAL journal recovery not exercised).

## Raw evidence index

| Artifact | File |
|---|---|
| Harness source (reproducible) | `experiments/p1-f/src/main.rs` |
| Machine-readable results | `experiments/p1-f/results/p1-f-results.json` |
| Harness database (fixture, not user data) | `experiments/p1-f/results/p1-f.db` (gitignored) |
| Pinned dependency | `experiments/p1-f/Cargo.toml` (rusqlite 0.32.1 bundled), `Cargo.lock` |

**Outcome:** the approved identity model's critical integrity requirements hold in SQLite with WAL + FTS5: identity is deterministic (URL), merges are transactional and preserve evidence/aliases/history, verification status never upgrades via merge, undo fully restores prior state, migrations are additive+guarded, and FTS5 search is sub-millisecond at 20k resources. **This satisfies the database identity-model evidence Gate 1 (roadmap §5) requires.**

**Affected P-IDs / R-IDs:** supports R-004 (SQLite+FTS5), R-005 (Resource/Mention separation — evidence), R-006 (merge history + undo — evidence); inputs for P-007/P-008/P-012 owner reviews.

---

**End of F1-04 RESULTS.md**
