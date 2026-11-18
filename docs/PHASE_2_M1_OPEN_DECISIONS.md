# TechVault Phase 2 M1 — Open Decisions Register

**Document status:** v1.1 (2026-11-14, owner rulings recorded). Every M1-blueprint recommendation is classified per the owner's directive: **Already approved** / **Proposed for owner approval** / **Deferred** / **Rejected** / **Requires research**. No recommendation becomes a decision except by explicit owner approval recorded in `DECISION_LOG.md`. This register **does not authorize implementation**.
**v1.1 status (D-026, 2026-11-14):** the owner ruled on all packaged decisions — **M1-OD-1 (DP-01) APPROVED · M1-OD-2 (DP-02) APPROVED · M1-OD-3 (DP-03)+OD-4 APPROVED WITH AMENDMENTS · M1-OD-4 (DP-04) APPROVED WITH AMENDMENTS · M1-OD-5 (DP-05) APPROVED · M1-OD-6 (DP-09) DEFERRED — required before G11 · M1-OD-7 (DP-08) APPROVED · M1-OD-8 (DP-06) APPROVED** — plus DP-07/OD-9, DP-10, DP-11, DP-12, DP-13/OD-7 as recorded in D-026. The v1.0 per-item text (including the "Proposed" classification lines) is preserved below for provenance history; the governing ruling for each item is stated in its item-8 line update. **M1 implementation remains separately unauthorized.**

Per-item structure: recommendation · reason · benefits · trade-offs · security/performance impact · gate impact · acceptance criteria · classification.

---

## M1-OD-1 — M1 redefinition, gate plan, and Rev 1.3 re-mapping

1. **Recommendation:** adopt the owner-directive definition of M1 (resource-library core, modules A–L) as twelve gates G1–G12 (`PHASE_2_M1_MILESTONES.md`), with the Rev 1.3 shell milestone absorbed as G1 and old M4/M8 (web ingestion, Whisper) re-dated as the first post-M1 milestones (M1-OD-2). Old M-numbers remain the historical record; `PHASE_2_MILESTONES.md` is not rewritten.
2. **Reason:** the latest owner instruction defines M1's content; the Rev 1.3 numbering conflicts and must be reconciled explicitly, not silently.
3. **Benefits:** one coherent, owner-approved scope; traceable mapping; no lost workstreams.
4. **Trade-offs:** one approval step; cross-references must use both numberings during transition.
5. **Security/perf impact:** none directly.
6. **Gate impact:** governs the entire blueprint.
7. **Acceptance criteria:** owner confirms the gate plan; traceability §14 records the mapping.
8. **Classification:** **APPROVED — DP-01, D-026 (2026-11-14).**

## M1-OD-2 — Post-M1 milestone order

1. **Recommendation:** after M1: web ingestion Tier 1a (+ SSRF suite/TEST-05) next; Whisper foundation after it (gates OD-2/OD-3/OD-10/OD-11 unchanged); then Phase 2 hardening/closure (absorbing old M10).
2. **Reason:** M1 leaves the network and transcription workstreams intact-but-unscheduled; the order preserves the approved dependency logic (web adapters need the source pipeline; transcription needs media intake).
3–6. Benefits/trade-offs/impact: keeps every OD gate attached to its consuming milestone; no security surface opens before its review suite exists.
7. **Acceptance criteria:** owner confirms the order (or amends it).
8. **Classification:** **APPROVED — DP-02, D-026 (2026-11-14):** web ingestion Tier 1a → Whisper foundation → Phase 2 hardening/closure.

## M1-OD-3 — Elaborated schema v1 (extends the OD-4 review surface)

1. **Recommendation:** approve the column/index-level schema v1 in `PHASE_2_M1_DATABASE_DESIGN.md` §3 — the Rev 1.3 entity set **plus one new table**, `resource_categories` (extensible B3 categories), plus specified indexes (partial-unique strong identifiers, composite library-listing index, keyset pagination).
2. **Reason:** the directive's modules (tags/categories) require the category table; the OD-4 review should see the exact review object, not a summary.
3. **Benefits:** G2 implements exactly an approved schema; provenance labels ([AD]/[P1E]/[P2R]) preserved per decision.
4. **Trade-offs:** slightly larger review surface than Rev 1.3 §3.2.
5. **Security/perf impact:** FK category protection prevents silent retyping; indexes specified against measured query patterns before G12.
6. **Gate impact:** gates G2 together with OD-4.
7. **Acceptance criteria:** owner review recorded; migrations implement exactly the approved DDL.
8. **Classification:** **APPROVED WITH AMENDMENTS — DP-03 + OD-4, D-026 (2026-11-14):** schema v1 approved subject to the six mandatory amendments (F-1/A-1/A-2/A-3/A-8/A-11), incorporated in `PHASE_2_M1_DATABASE_DESIGN.md` v1.1; migrations must implement exactly the amended DDL.

## M1-OD-4 — style-src console condition resolution

1. **Recommendation:** Option A — time-boxed G1 investigation to identify and eliminate the Svelte 5 runtime inline style without weakening CSP; if not identifiable, Option C (accept documented condition; M1 console criterion = "zero application errors; documented CSP-enforcement events listed") with Option B (production `style-src` hash allowance) recorded as owner-optional hardening. **A production-CSP edit requires separate owner authorization in every case.**
2. **Reason:** M1's "no console errors" criterion is blocked by the inherited condition; elimination is the only durable fix (the hash is rebuild-fragile).
3. **Benefits:** clean console with an unchanged strict policy; no recurring maintenance trigger.
4. **Trade-offs:** investigation effort with an uncertain outcome; B weakens the no-inline-styles posture and re-breaks per Svelte bump.
5. **Security/perf impact:** A/C zero; B a small, recurring policy exception.
6. **Gate impact:** G1 acceptance criterion 9.
7. **Acceptance criteria:** decision recorded; outcome evidenced at G1 (eliminated, hash-pinned with a re-verification step, or accepted-and-documented).
8. **Classification:** **APPROVED WITH AMENDMENTS — DP-04, D-026 (2026-11-14):** time-boxed investigation; if not reasonably eliminable, document and accept the runtime enforcement event as a known condition; enforceable no-inline-style application rule extended into `check-csp`; **no production hash allowance; CSP not weakened — any such change requires separate owner authorization.**

## M1-OD-5 — Attachment store layout

1. **Recommendation:** per-attachment files keyed by UUIDv7 in two-level shards; same-hash attachments stored separately with user notification at import; content-addressed store (hash-keyed, refcounted) explicitly proposed against for M1.
2. **Reason:** eliminates refcount-deletion correctness risk (the classic lost-file bug class) at negligible disk cost for a research library; dedup reporting delivers the user value without the risk.
3. **Benefits:** simple, provable deletion semantics; safe orphan sweep.
4. **Trade-offs:** duplicate bytes when users attach identical files repeatedly.
5. **Security/perf impact:** fewer failure modes; slightly more disk in the duplicate case.
6. **Gate impact:** freezes G3 design.
7. **Acceptance criteria:** delete/restore/orphan tests prove no lost files.
8. **Classification:** **APPROVED — DP-05, D-026 (2026-11-14):** UUID-based attachment storage.

## M1-OD-6 — Export/import format and conflict policy (TVDP-1)

1. **Recommendation:** schema-versioned JSON data package ("TVDP-1") with metadata-always / optional hash-named attachment sidecar; import matches by stable id then strong identifiers; identical → skip (reported); changed → explicit update choice; new → create; missing references → typed error; **never auto-merge**; preview report before a single-transaction commit.
2. **Reason:** implements D-007 without inventing an auto-merge policy the resource-identity rules forbid.
3. **Benefits:** portable, inspectable format; safe merge-free import.
4. **Trade-offs:** JSON size for large libraries (gzip optional); one more format to version.
5. **Security/perf impact:** size caps + sidecar hash verification; bounded-memory import.
6. **Gate impact:** freezes G11.
7. **Acceptance criteria:** roundtrip + conflict-matrix + malformed suites green.
8. **Classification:** **DEFERRED — DP-09, D-026 (2026-11-14):** the owner deferred this decision; it is **required before G11** — G1–G10 proceed without it; G11 must not freeze or start until the owner records the DP-09 decision.

## M1-OD-7 — Metadata sniffer approach

1. **Recommendation:** hand-rolled bounded magic-byte sniffer for the accepted format matrix (~10 signatures, fully unit-tested, zero dependencies); the `infer` crate (MIT) kept as a named alternative; formats outside the matrix → typed `Unsupported` until the owner approves an extension.
2. **Reason:** minimal-dependency principle (AGENTS.md §6); the matrix is small and testable; `infer` adds surface for marginal M1 value.
3. **Benefits:** zero deps; exact test coverage; no supply-chain addition.
4. **Trade-offs:** our maintenance burden for signature correctness; narrower coverage than a library.
5. **Security/perf impact:** bounded parser (caps on bytes inspected); no panic paths.
6. **Gate impact:** freezes G4.
7. **Acceptance criteria:** sniffer matrix tests green; mismatch → typed error.
8. **Classification:** **APPROVED — DP-08, D-026 (2026-11-14):** bounded in-house metadata sniffer.

## M1-OD-8 — Orphan file policy

1. **Recommendation:** crash-orphan attachment files are **quarantined** (`<app-data>\orphans\` + log + Settings report), auto-purge after a configurable grace period (default 30 days) only with a user-visible report; Category 2 temp entries deleted after ownership+age validation (no user value); DB-rows-without-files flagged, never auto-repaired.
2. **Reason:** a crash orphan may be the only copy of user data; silent deletion is the unacceptable failure mode.
3. **Benefits:** no silent destruction; reviewable recovery.
4. **Trade-offs:** quarantine disk usage until purge; one more Settings surface.
5. **Security/perf impact:** bounded by the grace period; log entries are metadata-only.
6. **Gate impact:** freezes G3.
7. **Acceptance criteria:** sweep tests prove quarantine-not-delete for attachment orphans and delete for validated temp.
8. **Classification:** **APPROVED — DP-06, D-026 (2026-11-14):** orphan quarantine with a 30-day grace period.

---

## Carried Phase 2 decisions affecting M1 gates

| ID | Item | Status | M1 effect |
|---|---|---|---|
| **OD-4** | Schema v1 (provenance-classified) | **APPROVED WITH AMENDMENTS — D-026** (G2 gate cleared) | hard gate satisfied by the v1.1 DB design |
| **OD-9** | Type-specific size limits + archive-bomb caps | **APPROVED — D-026** (100/20/5 MB defaults; logged overrides) | G4 gate cleared |
| **OD-7** | 150 MB target (approved, D-019) + process-tree methodology + workloads | **Methodology APPROVED — D-026** (enforceable gates) | gate mode in force |
| **OD-1** | Logo assets | placeholder approach authorized; delivery pending | G1 placeholder; verbatim swap on delivery (owner action) |
| **OD-5** | YouTube URL records + user import | **Proposed** | outside M1 scope by the directive; carried for the post-M1 source milestone |
| **OD-2/OD-3/OD-10/OD-11** | Whisper chain | **Proposed** | outside M1; unchanged gates post-M1 |
| **OD-12** | Key revocation | owner action | standing; unrelated to M1 |
| **D-025** | kit-3 deferral | Approved decision to *defer*; the M1 review executes it under the approved DP-12 rule | G1 pre-work; an adoption outcome is recorded as its own decision (D-026 ruling 12) |

## Classification summary (directive requirement)

- **Already approved (honored, cited):** D-001, D-002, D-006, D-007, D-008, D-009, D-011, D-012, D-015, D-019, D-020, D-021, **D-022**, **D-023**, D-024, D-025; R-023/R-024 adoptions (D-020); FTS external-content + trigger pattern, guarded migrations, transactional merge/undo mechanisms ([P1E] evidence).
- **Proposed for owner approval (this blueprint):** **resolved by D-026 (2026-11-14)** — M1-OD-1/2/5/7/8 APPROVED; M1-OD-3 (+OD-4) and M1-OD-4 APPROVED WITH AMENDMENTS; M1-OD-6 (DP-09) DEFERRED (required before G11). No item remains in Proposed status from this register.
- **Deferred (with prior records, unchanged):** web/GitHub adapters + SSRF suite; YouTube records (OD-5); Whisper chain (OD-2/3/10/11); fuzzy matching (P-008); notebooks/collections (Phase 4); graph/bookmarks/analytics/player (Phase 4); MD/CSV export (R-018); command palette (R-020); database encryption (P-014); Android track; release signing/updater (Phase 5).
- **Rejected (prior records stand):** sqlite-vec/embeddings (R-011/P-013); SQL ORMs; bits-ui/melt-ui; `tauri-plugin-opener`/`tauri-plugin-http`; cloud sync (D-006); telemetry; bundled Python/PyTorch; heavy UI kits.
- **Requires research (time-boxed, evidence-producing):** kit-3 regression compatibility (G1 pre-work, DP-12 rule) · Svelte-runtime inline-style origin (G1, DP-04/D-026) · FTS5 Urdu tokenization behavior on owner fixtures (G8 probe — no claims without evidence). ~~Geist font-bundling license check (m-2)~~ — **resolved by DP-11 (D-026): system fonts, no Geist bundling in M1; no license check required.** *(F-2 correction applied 2026-11-14.)*

---

**End of PHASE_2_M1_OPEN_DECISIONS.md**
