# TechVault Phase 2 M1 — Owner Approval Pack

**Document status:** Prepared Draft v1.0 (2026-11-14). Owner review of `docs/PHASE_2_M1_*` blueprint package. **Nothing in this pack is an approval or an implementation authorization.** Temporary references **DP-xx (Proposed)** are used throughout — only the owner can approve and assign permanent decision records in `DECISION_LOG.md`; no D-ID is created or implied here.

**STATUS UPDATE (2026-11-14, D-026 — supersedes the Proposed status of every DP item above; the v1.0 pack text is preserved for history):** the owner ruled on all thirteen decisions — DP-01, DP-02, DP-05, DP-06, DP-07/OD-9, DP-08, DP-11, DP-12, DP-13/OD-7 **APPROVED**; DP-03+OD-4, DP-04, DP-10 **APPROVED WITH AMENDMENTS** (amendments incorporated in the planning documents at v1.1); DP-09 **DEFERRED — required before G11**. Full record: `DECISION_LOG.md` §4 D-026; per-item statuses: `PHASE_2_M1_OPEN_DECISIONS.md` v1.1. This pack's DP-* recommendations remain the alternatives/analysis record; the rulings govern. **M1 implementation remains separately unauthorized.**

**Review transparency note:** this review was performed read-only, with mechanical verification (git, grep, code inspection) of every consistency claim. It was conducted by the same session that authored the blueprint — every proposal was re-derived against the governing decisions rather than rubber-stamped, and the review did find defects (§6 findings register, including six wrong cross-references). Precedent: the Rev 1.3 package's independent audit found one real defect (H-1 RAM gate). An **optional independent audit** of this blueprint package before decisions is listed in the checklist (§12, item A-0).

---

## 1. Executive verdict

**READY FOR OWNER DECISIONS.**

- The ten-document blueprint package is complete, internally consistent on substance, and traceable to verified M0/Phase 1 evidence. No Critical defect was found.
- Findings: 0 Critical · 3 High (all schedule/gate-related, not design defects) · 4 Medium · 6 Low — one Low finding requires a documentation correction before implementation (wrong section cross-references; content correct).
- 13 decisions are packaged for owner ruling (DP-01..DP-13, all **Proposed**), plus 4 owner actions and 1 optional step.
- Two decisions are blocking-early (DP-01 gate plan; DP-03+OD-4 schema). Eight can be decided now or at their gate without delaying M1 start.

## 2. Confirmed M1 scope (as proposed by the blueprint — subject to DP-01)

**In:** resource management · SQLite + migrations · file storage engine · file import/ingestion (local files + pasted text, zero network) · file-level metadata extraction · tags/categories · FTS5 search · resource relationships (manual) · backup/restore · export/import (TVDP-1) · resource library UI · error handling/recovery — organized as gates **G1 shell → G2 database → G3 storage → G4 import → G5 resources → G6 identity → G7 tags/links → G8 search → G9 library UI → G10 backup → G11 export/import → G12 acceptance**.

**Out (verified absent from every gate's scope and dependency list):** web/GitHub ingestion + SSRF suite · YouTube URL records (OD-5) · Whisper/FFmpeg/transcription (OD-2/3/10/11) · AI extraction/verification/suggestions · providers/live API/managed gateway · cloud sync · BYOK keychain · encryption · notebooks/graph/bookmarks/analytics/player UIs · Android · mobile layouts · fuzzy matching · MD/CSV export · command palette · release signing/updater.

**Verified by grep:** every `whisper`/`YouTube`/`cloud sync`/`reqwest` occurrence in the ten M1 documents is in an exclusion/deferred context; no gate adopts any network dependency; `openrouter` does not appear at all.

## 3. Scope conflicts and proposed resolution

| # | Conflict | Governing rule | Proposed resolution |
|---|---|---|---|
| C-1 | Directive's M1 (resource-library core) vs Rev 1.3's M1 (shell) numbering — old M2/M3/M5/M6/M7/M9 content now lives inside M1 | Latest owner instruction (AGENTS.md §2.1) governs over older planning documents | Blueprint defines M1 as the directive specifies; Rev 1.3 numbering preserved as history; re-mapping table in MASTER_BLUEPRINT §3.2; owner confirms via **DP-01** |
| C-2 | Rev 1.3 M3 included YouTube URL records (OD-5, Proposed); the directive's module list does not | Directive governs scope | YouTube URL records deferred out of M1, carried for the post-M1 source milestone — confirmed by DP-01/DP-02; OD-5 remains Proposed and unforced |
| C-3 | Directive omits the shell workstream, but the library UI cannot exist without it | Directive's UI module (sidebar/navigation listed) implies the shell | Shell absorbed as G1 with unchanged D-023/D-022 obligations — part of DP-01 |
| C-4 | Directive requires schema additions beyond the Rev 1.3 OD-4 surface (`resource_categories`; column/index detail) | AGENTS.md §7 (schema is an approved-requirements surface) | Elaborated schema v1 packaged as **DP-03**, extending — not replacing — the OD-4 review object; both must be approved before G2 |

No conflict with any approved decision (D-001..D-025) was found. Two **owner-authorized interim measures** (OD-1 placeholder; M0 waiver) are correctly scoped and not extended.

## 4. Critical-area verification (condensed; full detail in the blueprint documents)

| # | Area | Blueprint proposal | Governing decision | Conflict? | Feasibility / evidence | Key implication | Missing tests / assumptions | Recommendation |
|---|---|---|---|---|---|---|---|---|
| 1 | Scope + numbering | G1–G12 plan (§3) | Latest directive; AGENTS.md §2 | None with decisions; C-1..C-3 vs planning docs | M0 verified complete; all gates map to existing designs | Re-dates web/Whisper milestones (DP-02) | none blocking | **Approve DP-01** |
| 2 | Schema, identity, mentions, categories, attachments, merge/undo | Column-level schema v1; strong-identifier-only candidates; explicit merges with snapshot undo; `resource_categories` [P2R]; attachments; NULL confidence | MASTER_BRAIN D1/D4; OD-4; [P1E] P1-F 9/9 | None; extends OD-4 surface (C-4) | P1-F validates merge/undo mechanisms; new tables unvalidated by design | Merge must consolidate **tags** — semantics unspecified (**finding F-1**) | Tag-conflict merge test; merged-row listing consistency (F-6) | **Approve DP-03 with OD-4**; add F-1 refinement to the merge spec |
| 3 | Migrations, WAL, backup consistency | Guarded additive migrations + failure recovery; DELETE journal until WAL passes both tests; backup snapshot consistent with mode | OD-4; DATABASE_DESIGN §22-23; [P1E] | None | P1-F guarded-migration mechanism; WAL untested (honest gate) | WAL decision evidence recorded either way | TEST-03; WAL concurrency + backup-under-WAL tests (G2) | **Approve as part of DP-03** |
| 4 | Storage, hashing, dedup, atomic import | Per-UUID sharded files; streamed SHA-256; same-hash reporting, no silent dedup; atomic rename with cross-volume fallback | OD-4 attachments model; D-019 storage policy | None | Streamed hashing standard; rename atomicity requires same volume (**F-3: defaults are cross-volume → copy path is the default**) | Copy-fallback cost measured at G3/G4; owner may co-locate dirs | Hash-throughput + import-duration measurements; orphan-sweep tests | **Approve DP-05, DP-06**; consider co-location note in settings |
| 5 | Import validation, size limits, archive-bomb | OD-9 defaults (100 MB media / 20 MB docs / 5 MB paste); magic-byte sniffing; archives rejected as sources; zip-bomb caps on the only accepted archive (own backup) | OD-9 (Proposed); directive §8 | None (OD-9 adjustable at approval) | Validation-first parsing feasible; sniffer matrix ~10 signatures | Overrides logged; every rejection typed | TEST-06 limit matrix + malformed negatives; sniffer matrix tests | **Approve DP-07 (OD-9 defaults) + DP-08** |
| 6 | FTS5 + Urdu/multilingual | External-content tables + trigger sync [P1E]; unicode61, no porter; codepoint ordering limitation stated; Urdu probe on owner fixtures; no invented numbers | R-004 (SQLite+FTS5); OD-7 targets | None | P1-F measured 5k/20k (0.005–0.009 ms); 10k/100k unmeasured | Urdu = word-level matching only; ordering non-lexicographic (**accepted limitation, DP-10**) | FTS harness @10k/100k; Urdu probe (owner fixtures, optional) | **Approve DP-10** |
| 7 | Export/import | TVDP-1 versioned JSON; metadata-always + optional hash-named attachment sidecar; id/identifier matching; never auto-merge | D-007; R-005/identity rules | None | JSON export trivially feasible; conflict policy respects identity rules | Backup (full fidelity) vs export (portability) distinct | Roundtrip + conflict-matrix + malformed suites (G11) | **Approve DP-09** |
| 8 | Svelte primitives + accessibility | Eleven in-house primitives; full D-023 test plan verbatim; recorded results required | **D-023** (approved) | **None — not weakened** (verified: focus-trap/Escape/focus-return/background-inert/APG/screen-reader-smoke language carried verbatim) | Svelte 5 runes primitives feasible; zero third-party UI deps | Accessibility evidence is gate-exit (G1), not aspirational | TEST-09 automated suites + manual walkthrough + SR smoke test | **No decision needed** — obligations already approved |
| 9 | Strict CSP + style-src event | D-022 policy re-verified at G1/G12; M0's one runtime style-src enforcement event blocks the "no console errors" criterion; three resolution options | **D-022** (approved); D-024 dev-only exception | None; option B would *amend* production CSP → requires separate authorization, treated as such | Event is verified enforcement (not a defect); elimination feasibility unknown (**F-4**) | Console criterion blocked until resolved | G1 time-boxed investigation (Option A) | **Decide DP-04** |
| 10 | Kit-3 under D-025 | Evaluate kit 3.2.0 + adapter-static 4.0.1 in the G1 dependency review; adopt only with fully green regression; else stay on 2.x | **D-025** (approved deferral; the review executes it) | None | 5 low findings non-exploitable in the static-SPA architecture (M0 audit) | If adopted, a breaking toolchain change lands with G1 | Compatibility spike + full regression pass (G1 pre-work) | **Approve DP-12 rule** |
| 11 | Performance budgets + large-library testing | D-019 150 MB target (approved); M1-P1..P15 proposals; five-workload process-tree methodology; 10k/100k corpora | **D-019** (approved target); OD-7 methodology (Proposed) | None | M0 baselines recorded (idle 137.45/143.54 MB; warm 47/67 ms); M1 numbers unmeasured by design | Without DP-13, M1 criteria run report-only | Seeded corpora; W1 soak (G12); bundle guard is a new unbased number (F-11) | **Approve DP-13** (methodology) |
| 12 | Recovery, integrity, failure handling | Typed errors end-to-end; crash-recovery suite; migration-failure recovery; restore safety + pre-restore backup; C6 job semantics with partial-success | AGENTS.md §7-8; TESTING_STRATEGY; [P1E] mechanisms | None | Kill-during-merge/crash-recovery patterns are P1-F-proven mechanisms | Recovery is cross-cutting, accepted at G12 | Simulated-crash suite (G12); restore interruption tests (G10) | **No new decision** — embedded in gates |

## 5. Decisions requiring owner approval

Each item: recommendation · alternatives · advantages/disadvantages · risks · dependencies · consequence of delay · **timing**.

### Architecture

**DP-01 (Proposed) — Adopt the M1 gate plan G1–G12 and the Rev 1.3 re-mapping** (blueprint ref M1-OD-1)
- Recommendation: adopt the twelve-gate plan; absorb the Rev 1.3 shell milestone as G1; treat Rev 1.3 M-numbers as historical record only.
- Alternatives: (a) keep Rev 1.3 numbering and re-label the directive's scope as "Phase 2 remaining milestones" (churn, no gain); (b) fewer, larger gates (violates "small, independently testable"; worse rollback).
- Advantages: one coherent owner-approved scope; every old milestone's content explicitly mapped (nothing dropped). Disadvantages: dual numbering during transition; traceability must carry both.
- Risks: mapping errors (mitigated — full table exists; verified).
- Dependencies: none. **If delayed: M1 cannot be authorized at all.**
- **Timing: required before any M1 implementation authorization.**

**DP-02 (Proposed) — Post-M1 milestone order** (M1-OD-2)
- Recommendation: web ingestion Tier 1a (+SSRF suite) → Whisper foundation (OD gates unchanged) → Phase 2 hardening/closure.
- Alternatives: Whisper first (no — transcription needs media intake and its OD chain is unresolved); defer the decision to M1 end.
- Advantages: roadmap clarity now; security surface opens only with its review suite. Disadvantages: none material.
- Risks: none if deferred either. **If delayed: only G12 closure is affected.**
- **Timing: may be decided now for clarity; latest at G12 exit.**

### Database

**DP-03 (Proposed) — Elaborated schema v1 (with carried OD-4)** (M1-OD-3 + OD-4)
- Recommendation: approve the column/index-level schema v1 (`PHASE_2_M1_DATABASE_DESIGN.md` §3) — Rev 1.3 entity set **plus** `resource_categories`, partial-unique strong identifiers, composite listing index, keyset pagination; provenance labels preserved; merge spec gains the tag-consolidation refinement (finding F-1: on merge, union tags into the primary; on conflict keep the primary's row, drop the duplicate, show both in the preview).
- Alternatives: approve Rev 1.3 §3.2 summary only and detail later (loses the review-object precision the owner directive requested); reject `resource_categories` (then categories become a hard-coded enum — contradicts MASTER_BRAIN B3 extensibility).
- Advantages: G2 implements exactly an approved schema; F-1 closed before implementation. Disadvantages: larger review surface.
- Risks: implementation deviations found later must return to the owner (by design). Dependencies: OD-4 approval. **If delayed: G2 (and everything after) blocked.**
- **Timing: required before G2 (not before G1 — shell work can start first).**

### Storage / import / export

**DP-05 (Proposed) — Attachment store layout** (M1-OD-5)
- Recommendation: per-attachment files keyed by UUIDv7 in two-level shards; same-hash reported, not silently deduplicated; content-addressed store proposed against for M1.
- Alternatives: content-addressed store now (refcount-deletion correctness risk — the classic lost-file bug class — for modest disk savings).
- Advantages: provable deletion/orphan semantics. Disadvantages: duplicate bytes when identical files attach repeatedly. Risks: low. Dependencies: none upstream. **If delayed: G3 design freeze blocked.**
- **Timing: before G3.**

**DP-06 (Proposed) — Orphan-file policy** (M1-OD-8)
- Recommendation: quarantine attachment-dir orphans (log + Settings report, 30-day configurable grace before reported purge); validated temp deletion unchanged; missing-file rows flagged, never auto-repaired.
- Alternatives: immediate delete (risks destroying the only copy after a crash); keep-forever (unbounded growth).
- Advantages: no silent destruction — the unacceptable failure mode is excluded. Disadvantages: quarantine disk usage; one Settings surface. Risks: low. **If delayed: G3 freeze blocked.**
- **Timing: before G3.**

**DP-07 (Proposed) — OD-9 size-limit defaults** (carried)
- Recommendation: adopt OD-9 defaults (media 100 MB/file; documents 20 MB; pasted text 5 MB; archives rejected as sources; overrides configurable + logged). No archive-bomb exposure in M1 outside the own-backup format (zip-bomb caps already in DP-03/G10 scope).
- Alternatives: different defaults (owner-adjustable at approval), or defer to G4 (blocks G4 freeze only).
- Advantages: bounds memory/disk/abuse surface. Disadvantages: conservative defaults may reject large legitimate media (override exists). **If delayed: G4 blocked.**
- **Timing: before G4.**

**DP-08 (Proposed) — Metadata sniffer approach** (M1-OD-7)
- Recommendation: hand-rolled bounded magic-byte sniffer for the ~10-format accepted matrix (zero deps, fully unit-tested); `infer` crate (MIT) as named alternative; out-of-matrix → typed `Unsupported`.
- Alternatives: `infer` crate now (wider coverage; extra dependency for marginal M1 value — against AGENTS.md §6 minimalism).
- Advantages: no supply-chain addition; exact test coverage. Disadvantages: our maintenance burden; narrow coverage by design. **If delayed: G4 freeze blocked.**
- **Timing: before G4.**

**DP-09 (Proposed) — TVDP-1 export/import format and conflict policy** (M1-OD-6)
- Recommendation: schema-versioned JSON data package; metadata always, optional hash-named attachment sidecar; match by stable id then strong identifiers; identical → skip (reported), changed → explicit update choice, new → create, missing references → typed error; **never auto-merge**; preview report before single-transaction commit.
- Alternatives: defer to post-M1 (D-007 is an approved direction but M1 delivery timing is the directive's module J — deferring contradicts the directive unless the owner says so); CSV/MD variants (R-018, separately deferred).
- Advantages: portability per D-007 without inventing auto-merge policy. Disadvantages: one more versioned format. **If delayed: G11 blocked (G1–G10 unaffected).**
- **Timing: before G11 (may be deferred to mid-M1 without impact).**

### Search

**DP-10 (Proposed) — Search defaults package** (blueprint [P2R] items, no prior OD)
- Recommendation: `unicode61` tokenizer (no porter — ASCII-only stemming would silently do nothing for Urdu); SQLite BINARY codepoint ordering accepted as a documented v1 limitation (custom collation proposed against); keyset pagination; bm25 column weights treated as tuning values, never as measured targets; Urdu FTS probe on owner fixtures recorded raw before any multilingual statement.
- Alternatives: trigram tokenizer (substring search; larger indexes; needs its own benchmark — defer); custom Urdu collation (complexity against AGENTS.md §11).
- Advantages: honest, simple, P1-F-validated mechanism. Disadvantages: no Urdu stemming/morphology; non-lexicographic Urdu sort. Risks: low; probe may reveal tokenization surprises (recorded honestly). **If delayed: G8 blocked.**
- **Timing: before G8.**

### UI / accessibility

**DP-11 (Proposed, optional) — Geist font bundling** (audit item m-2)
- Recommendation: verify the Geist license at G1; bundle only if the owner wants the exact typeface; the system-font stack (M0 baseline) remains the working default until then.
- Alternatives: keep system fonts for Phase 2 (zero risk, zero bytes); bundle Inter (fallback, similar question).
- Advantages of deferring: no licensing surface, smaller bundle. Disadvantages: visual direction slightly approximate. Risks: none. **If delayed: nothing blocks — visual acceptance in both themes works either way.**
- **Timing: owner-optional at G1.** (No new accessibility decisions exist: D-023 already governs and is not weakened anywhere.)

### Security and performance

**DP-04 (Proposed) — style-src console condition resolution** (M1-OD-4)
- Recommendation: Option A — time-boxed G1 investigation to identify and eliminate the Svelte 5 runtime inline style without weakening CSP; if not identifiable, Option C (accept documented condition; M1 console criterion becomes "zero application errors; documented CSP-enforcement events listed"); Option B (production `style-src` hash allowance) recorded only as owner-optional hardening. **Any production-CSP edit requires separate owner authorization regardless.**
- Alternatives: B now (one line, but rebuild-fragile — hash changes with every Svelte bump and re-breaks the console; weakens the no-inline-styles posture); C now (no investigation; permanent documented console error).
- Advantages of A: only durable fix; policy unchanged. Disadvantages: uncertain outcome within the time-box (**finding F-4**: M0 could not identify the call site in the minified bundle). **If delayed: G1's "no console errors" criterion is unpassable → G1 acceptance blocked.**
- **Timing: decide before G1 acceptance (investigation may run during G1).**

**DP-12 (Proposed) — Kit-3 disposition rule (executes D-025)** 
- Recommendation: pre-approve the decision rule now — "adopt `@sveltejs/kit` 3.2.0 + `adapter-static` 4.0.1 only if the full regression pass (svelte-check, vitest, cargo suite, dev HMR, release build, CSP config + runtime probes) is entirely green; otherwise remain on 2.x with the documented low-severity risk assessment and re-check `deepmerge` upstream at every toolchain upgrade + closure audit." If the outcome is **adopt**, record it as its own owner decision record (**finding F-8** — a major toolchain upgrade merits a permanent D-ID, not just a dated note); if **stay**, a dated note under D-025 suffices.
- Alternatives: decide adopt/reject now without the spike (guessing); leave the rule undecided (G1 pre-work stalls).
- Advantages: evidence-based; regression-protected. Disadvantages: possible deferral of a real (low) security posture improvement. **If delayed: G1 dependency review cannot conclude.**
- **Timing: rule before G1; outcome evidence during G1 pre-work.**

**DP-13 (Proposed) — OD-7 performance methodology approval (carried)**
- Recommendation: approve the process-tree methodology + five-workload separation so M1 performance criteria are **gates**, not report-only.
- Alternatives: leave methodology Proposed (M1 criteria become reporting targets — weaker acceptance, honestly labeled).
- Advantages: enforceable budgets; misses are real failures. Disadvantages: none identified. **If delayed: M1 performance acceptance weakens to report-only (documented).**
- **Timing: before G1 (affects every gate's evidence mode).**

### Owner actions (not approvals)

| Action | Effect if not done |
|---|---|
| OD-1 logo asset delivery | Placeholder remains; verbatim swap later; nothing blocks |
| OD-12 revoke exposed OpenRouter key | Standing security exposure unrelated to M1 |
| Urdu fixtures (for the G8 probe) | G8's multilingual statement stays "unverified" honestly |
| `-Cold` script-fix authorization (optional) | True cold start remains unmeasured (carried limitation) |
| Optional independent audit of the M1 blueprint package | Owner relies on this review (authoring-session review with mechanical checks) |

## 6. Findings register (from this review)

| ID | Severity | Finding | Disposition |
|---|---|---|---|
| F-1 | Medium | Merge semantics omit `resource_tags`: re-pointing tags can violate `UNIQUE(resource_id, tag)` when both resources share a tag | Fold tag-consolidation rule into DP-03 (spec refinement before G6); test added to TEST-02 extension |
| F-2 | Medium | Six wrong section cross-references: MASTER_BLUEPRINT §4 rows F (`DB §7`→§3.12/§3.4; `architecture §3.8`→§7), H (`DB §8`→§3.11), I (`storage §6`→§7), J (`storage §7`→§8), L (`architecture §7`→§11); ARCHITECTURE §10 (`storage §6–§7`→§7–§8). Content correct; pointers wrong | Trivial documentation correction — requires owner authorization (this review is read-only); recommend executing before G1 |
| F-3 | Medium | Default placement is cross-volume (temp `D:\Temp\` per D-019 vs app-data on C:) → atomic-rename fast path is not the default path; copy+fsync+rename fallback is | By design (D-019 respected); cost measured at G3/G4 (M1-P8/P9); optional owner note: configure attachments+temp co-located for the fast path |
| F-4 | Medium | style-src Option A feasibility unknown (M0 could not identify the runtime call site) | Time-boxed G1 investigation; fallbacks packaged in DP-04 |
| F-5 | Low | DB growth budget (≤50 MB @10k, excl. transcripts) does not state how large pasted texts (≤5 MB, FTS-indexed) count | Clarify accounting at G8/G12 budget report |
| F-6 | Low | Merged rows (`merged_into` set) must be excluded consistently from listings, counts, and search | Assertion added to G5/G6/G8 suites (TEST-02/TEST-04 already cover FTS side) |
| F-7 | Low | Attachment upload UI is end-to-end only from G9 (dialog plugin arrives G4); G3 validates the engine headlessly | Already consistent in blueprint; no change |
| F-8 | Low | A kit-3 **adoption** should be its own permanent decision record, not only a dated note | Included in DP-12 recommendation |
| F-9 | Low | `README.md` status section stale (pre-M0 text) | Corrected during G12 documentation updates (owner-visible) |
| F-10 | Low | True cold start unmeasured (`-Cold` fix unauthorized) | Carried; optional owner authorization |
| F-11 | Low | G1 bundle guard (≤300 KB gzipped/route) is a new proposed number with no prior basis | Clearly labeled Proposed; measured at G1; owner may drop the guard |

## 7. Risks (ranked)

- **Critical:** none found.
- **High:** H-1 G2 blocked until OD-4 + DP-03 approved (schedule, not defect) · H-2 G1 console criterion blocked until DP-04 resolved · H-3 kit-3 adoption without a fully green regression would risk the release build/CSP posture (mitigated by DP-12's adopt-only-if-green rule).
- **Medium:** F-1 merge-tag semantics · F-2 cross-reference corrections pending · F-3 default cross-volume copy path (perf, measured) · F-4 style-src feasibility unknown · OD-7 methodology unapproved → report-only mode · Urdu probe blocked on fixtures (honest "unverified").
- **Low:** F-5..F-11 as listed.

## 8. Missing evidence and required experiments (all scheduled, none invented)

kit-3 compatibility spike + full regression (G1 pre-work) · Svelte runtime style-origin investigation (G1, DP-04-A) · WAL concurrency + backup-under-WAL tests (G2) · FTS harness @10k/100k + write overhead (G2/G8) · Urdu FTS probe (owner fixtures) · seeded-corpus DB-size measurement (G8/G12) · streamed-hash throughput + import duration (G3/G4) · W1 10-minute soak + warm start re-run (G12) · OD-9 limit matrix + malformed negatives (G4) · traversal/orphan-sweep tests (G3) · zip-bomb/restore-interruption suites (G10/G11) · true cold start (pending fix authorization).

## 9. Recommended implementation order

Strict chain **G1 → G2 → G3 → G4 → G5 → G6 → G7 → G8 → G9 → G10 → G11 → G12**, with G10 permitted to start after G3 (parallel with G5–G9; its restore drill is most meaningful after G8 data exists). The Urdu probe needs fixtures before G8 closes; DP-09/DP-10 may be decided mid-M1 without delaying earlier gates.

## 10. Mandatory consistency checks — verified with evidence

| Check | Result | Evidence |
|---|---|---|
| D-021..D-025 historically unchanged | **PASS** | entries present at `DECISION_LOG.md` lines 483–555; file untouched by the blueprint/review sessions (pre-existing working-tree modifications only; no agent edit) |
| M0 remains CLOSED | **PASS** | closure report line 5; milestones M0 execution-status line 44 |
| D-022 production CSP strict | **PASS** | `tauri.conf.json` unchanged vs HEAD; `csp` = strict directive set; M1 docs never weaken it (option B framed as requiring separate authorization) |
| D-024 `unsafe-inline` dev-only | **PASS** | `devCsp` carries `unsafe-inline`; production `csp` does not; grep-verified |
| D-025 review remains open for M1 | **PASS** | carried as G1 pre-work in blueprint §6/§9.2; no upgrade performed or assumed |
| D-023 not weakened | **PASS** | focus-trap/Escape/focus-return/background-inert/APG/screen-reader-smoke/recorded-results language carried verbatim (UI spec §2, milestones G1 field 7–8) |
| No M0 waiver carried into M1 | **PASS** | exactly one waiver mention across the ten M1 docs, stating "M0-only"; G1/G9/G10/G12 owner manual passes stand |
| No API calls / paid services / Whisper / automated web ingestion / cloud sync in M1 | **PASS** | grep: all such terms appear only in exclusion contexts; no network dependency in any gate; `reqwest`/`url` absent; providers untouched |
| No proposed item described as owner-approved | **PASS** | all "Approved" occurrences cite real decision IDs (D-019/D-022/D-023/D-025/[AD] labels); every M1-OD/DP item is labeled Proposed |

**Review-scope note:** git verification shows no source or configuration change vs HEAD `37a71c4` (diff limited to pre-existing working-tree doc changes + `.gitkeep` deletions from the M0 scaffold + the new blueprint/review documents).

## 11. New file created by this review

`docs/PHASE_2_M1_OWNER_APPROVAL_PACK.md` (this document). No other file was created, modified, or reverted. No commits, no pushes.

## 12. Exact approval checklist

| # | Ref | Decision question | Options | Timing |
|---|---|---|---|---|
| A-0 | — | (Optional) commission an independent audit of the M1 blueprint package before deciding | yes / no | before DP-01..13 |
| 1 | **DP-01** | Adopt gate plan G1–G12 + Rev 1.3 re-mapping? | Approve / Amend / Reject | **before any M1 authorization** |
| 2 | **DP-02** | Post-M1 order: web → Whisper → closure? | Approve / Amend / Defer to G12 | now or G12 |
| 3 | **DP-03 + OD-4** | Approve elaborated schema v1 (incl. `resource_categories`, F-1 tag-merge refinement)? | Approve / Amend / Reject | **before G2** |
| 4 | **DP-04** | style-src condition: A investigate-eliminate → C accept-document → B hash-optional? | Choose order or single option | before G1 acceptance |
| 5 | **DP-05** | Attachment store = per-UUID files, no content-addressed store in M1? | Approve / Amend | before G3 |
| 6 | **DP-06** | Orphans: quarantine + 30-day reported purge? | Approve / Amend | before G3 |
| 7 | **DP-07 (OD-9)** | Size-limit defaults 100/20/5 MB + logged overrides? | Approve / Adjust values / Defer to G4 | before G4 |
| 8 | **DP-08** | Hand-rolled sniffer (vs `infer`)? | Approve / Amend | before G4 |
| 9 | **DP-09** | TVDP-1 format + never-auto-merge policy? | Approve / Amend / Defer to G11 | before G11 |
| 10 | **DP-10** | Search defaults: unicode61, no porter, codepoint ordering accepted, keyset paging? | Approve / Amend | before G8 |
| 11 | **DP-11** | (Optional) pursue Geist bundling after license check? | Yes / Keep system fonts | G1, optional |
| 12 | **DP-12** | Kit-3 adopt-only-if-green rule (+ own D-ID if adopted)? | Approve rule / Amend | before G1 |
| 13 | **DP-13 (OD-7)** | Approve process-tree methodology + five workloads (gate mode)? | Approve / stay report-only | before G1 |
| A-1 | OD-1 | Deliver logo asset files | owner action | any time |
| A-2 | OD-12 | Revoke exposed OpenRouter key | owner action | standing |
| A-3 | — | Urdu fixtures for the G8 probe | owner action | before G8 |
| A-4 | — | Authorize `-Cold` measurement-script fix | owner action | optional |
| A-5 | F-2 | Authorize the six cross-reference corrections (doc-only) | owner action | before G1 |

**After the checklist:** M1 implementation still requires the owner's separate, explicit authorization — approving every DP item does not itself authorize implementation.

---

**End of PHASE_2_M1_OWNER_APPROVAL_PACK.md**
