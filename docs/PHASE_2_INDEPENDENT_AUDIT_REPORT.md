# TechVault Phase 2 Independent Engineering Audit Report

**Document status:** Rev 1.0 (2026-11-14). Independent, adversarial audit of the Phase 2 Revision 1.3 planning package, performed per the owner directive. **This audit approves nothing and grants no implementation authorization.**
**Method:** repository verified from disk (git state, file existence, content greps); every Phase 2 document cross-checked against the governing Phase 1 documents (MASTER_BRAIN, ARCHITECTURE, DATABASE_DESIGN, SECURITY, UI_DESIGN_SYSTEM, API_POLICY, DEVELOPMENT_ROADMAP, TESTING_STRATEGY, DECISION_LOG, PHASE_HANDOFF) and against measured Phase 1 evidence; adversarial review of each architecture area; all 20 SEC and 15 PERF requirements independently challenged; traceability counts re-verified by grep; milestone-by-milestone feasibility assessed. Proven contradictions were corrected during the audit (each logged in §M); everything else is reported as findings.
**Classification vocabulary:** **PASS** (supported by actual evidence) · **PASS WITH CONDITIONS** (technically acceptable, stated gate required) · **DOCUMENTATION ONLY** (specified, not implemented or tested) · **FAIL** (concrete defect or contradiction) · **NOT VERIFIED** (insufficient evidence) · **DEFERRED** (intentionally outside scope).

---

## A. Overall audit result

**PASS WITH CONDITIONS.** The Revision 1.3 package is internally consistent, technically sound, and implementable after owner approval. One concrete defect (a transcription RAM gate that contradicted measured Phase 1 evidence) and five specification gaps were found and **corrected during this audit** (§M); no unresolved FAIL remains. The blueprint is **documentation-ready, not implementation-ready**: no code exists, no Phase 2 test has run, and six ODs plus three owner actions gate the milestone chain. Conditions are stated in §N.

## B. Verified strengths

1. **Evidence-grounded stack:** Tauri 2/Svelte 5/Rust/SQLite-FTS5 choices rest on measured P1-A/P1-F results (IPC 1.60 ms, identity invariants 9/9, installers 1.5–2.2 MB), not assumptions.
2. **Honest evidence scoping:** every reused Phase 1 number carries its fixture/hardware scope (RTF figures "short English fixture only"; 150 MB target "not claimed achieved"); no unverified claim was found promoted to fact.
3. **Decision hygiene:** all 12 ODs Proposed in `DECISION_LOG.md` §5; the single authorized exception (OD-1 placeholder) is consistently distinguished from full approval across all documents; no approval language was found anywhere it shouldn't be (grep-verified).
4. **Provenance discipline:** schema decisions classified [AD]/[P1E]/[P2R] with the explicit caveat that P1-F validates mechanisms, not the whole schema — the exact honesty the owner's directive required.
5. **Concrete SSRF mechanism:** connection pinning is specified as the actual enforcement (validated `SocketAddr` is the connect target; no re-resolution), not "best effort"; IPv6, redirect-per-hop, and credential-header stripping are explicit; limitations (resolver trust) are documented rather than hidden.
6. **Enforceable Phase 2/Phase 3 boundary** (ARCHITECTURE §11): providers disabled placeholders only, no stubs, local-first independence, controlled interfaces named for Phase 3 consumption.
7. **Full traceability:** 12/12 ODs, 25/25 R-dispositions, 88 requirement rows, 12/12 milestones with acceptance criteria and exit gates — counts verified by grep during this audit.
8. **Testability:** every requirement maps to a named test (TEST-01..12) and every milestone has automated + manual evidence requirements; acceptance criteria are never self-weakened.

## C. Critical issues

**None remaining.** One critical-severity defect was found and corrected during the audit (see §H-1 / §M-1): the proposed small-model RAM gate (≤900 MB) contradicted the measured small-model peak (1261 MB, P1-C) and would have aborted legitimate small-model transcription jobs. No other issue rose to critical.

## D. High-priority issues

| ID | Finding | Class | Resolution |
|---|---|---|---|
| H-1 | **RAM-gate contradiction** — `PERFORMANCE_BUDGET` §3.3 and `ARCHITECTURE` §5.5 proposed "small ≤900 MB" while citing measured peaks that include small = 1261 MB; the medium gate (2.6 GB) also left only ~17 MB headroom over the measured 2583 MB | FAIL (found) → **corrected** | Gates re-derived from measured peaks + headroom: tiny ≤0.9 GB · base ≤1.0 GB · small ≤1.5 GB · medium ≤3.0 GB (Proposed, OD-7/OD-9) |
| H-2 | **Graceful termination of whisper-cli on Windows is unproven** — P1-C never ran the cancellation probe (A5 NOT_RUN); a CLI without signal handling may only be force-killable. The design degrades safely (hard kill; no partial-transcript persistence; temp cleanup; DB consistency), but "graceful → hard kill" sequencing is an assumption | NOT VERIFIED → PASS WITH CONDITIONS | M8 must verify actual termination behavior on the pinned CLI (TEST-10/TEST-11 cancellation cases); no design change needed because partials are never persisted |
| H-3 | **Model-download pipeline scope** — the content-type exemption for model downloads must not weaken IP/redirect validation | PASS WITH CONDITIONS (clarified) | `ARCHITECTURE` §5.2 now states downloads use the same §4.5 pinned connector; only the content-type expectation differs. Verified by TEST-05 extension in M8 |

## E. Medium-priority issues

| ID | Finding | Class | Resolution |
|---|---|---|---|
| M-1 | **IP-literal URL fast path was implicit** — the SSRF spec described DNS resolution + blocklist, but pure IP-literal hostnames (`http://127.0.0.1/`, `http://[::1]/`, `http://2130706433/`) skip DNS entirely and must be classified directly | DOCUMENTATION ONLY → **corrected** | `ARCHITECTURE` §4.5 item 1 now requires direct blocklist classification of IP literals without a DNS step (TEST-05 covers them) |
| M-2 | **FTS rows of merged resources unspecified** — trigger-synced FTS and the `merged_into` redirect could together return redirect-only search rows | DOCUMENTATION ONLY → **corrected** | `ARCHITECTURE` §3.4: merge removes/updates the merged resource's FTS rows via the same triggers; TEST-04 verifies |
| M-3 | **Progress-event flooding** — unthrottled `job:progress` on long transcription jobs would generate heavy IPC traffic | DOCUMENTATION ONLY → **corrected** | `ARCHITECTURE` §2.6: events throttled (≥250 ms or per-N segments); PERF-08 soak verifies |
| M-4 | **`resource_links` created in M2 but no milestone task populated it** | DOCUMENTATION ONLY → **corrected** | Minimal manual link/unlink affordance assigned to M6 (`ARCHITECTURE` §6, MILESTONES M6); richer management Phase 4 |
| M-5 | **Process-tree measurement reproducibility** — the methodology requires enumerating WebView2 child processes but did not name the enumeration mechanism | DOCUMENTATION ONLY → PASS WITH CONDITIONS | M0's script deliverable must implement explicit child-process enumeration (e.g., parent-PID recursion over `Win32_Process`) and be committed; the OD-7 methodology approval should reference the committed script |
| M-6 | **Restore file-swap mechanics** — swapping the SQLite file requires closing the active connection first; implicit in the design | DOCUMENTATION ONLY | M9 tests cover the close→swap→reopen sequence; no spec change needed |

## F. Minor documentation issues

| ID | Finding | Class | Resolution |
|---|---|---|---|
| m-1 | `PHASE_HANDOFF.md` §9 still carried the pre-closure "Phase 1 IN_PROGRESS / owner approval outstanding" status text | FAIL (stale current-state) → **corrected** | A clearly-marked current-status note was added at the top of §9 (D-021 closure, Phase 2 planning status); the historical bullets are preserved verbatim |
| m-2 | Geist font self-hosting assumes the typeface's license permits bundling | PASS WITH CONDITIONS | Verify the license file at adoption (M0/M1); Inter fallback is specified |
| m-3 | WebView2 Evergreen runtime assumed present on target machines | DEFERRED | Installer bootstrapping is a Phase 5 packaging concern; Windows 11 carries the runtime |
| m-4 | Battery usage is only indirectly covered (via idle-CPU budget) | DEFERRED | Explicit battery budgets belong to the Android track (deferred) |
| m-5 | `tasks/phase-1/` drafts remain stale relative to `docs/phase1-plan/` | DEFERRED | Known since Phase 0 closure; docs/ governs; no action needed |

## G. Security findings (all 20 SEC requirements independently challenged)

Each finding: risk → attack scenario → existing mitigation → missing mitigation → correction → requirement → milestone → verification test.

| # | Boundary | Assessment |
|---|---|---|
| G-1 | **SSRF / DNS rebinding** | Risk: fetch pipeline tricked into touching internal hosts. Attack: rebinding DNS (public→loopback between check and connect); IP-literal URLs; decimal-encoded hosts. Existing: full §4.5 pipeline — fail-closed all-records blocklist (IPv4+IPv6, loopback/private/link-local/multicast/reserved/metadata), **pinned connections** (validated `SocketAddr` is the connect target; no re-resolution — the TOCTOU window is closed by construction), per-hop redirect validation, scheme/port gate. Missing: IP-literal fast path was implicit (**corrected — M-1**). Correction applied. Req: SEC-08/09/11. Milestone: M4. Test: TEST-05 (incl. rebinding simulation). Residual, documented: the DNS resolver itself remains trusted (public-IP SSRF residual). |
| G-2 | **Redirect validation** | Risk: open-redirect into private networks or credential leakage. Attack: public URL 302→`http://169.254.169.254/`; cross-origin redirect carrying `Authorization`. Existing: per-hop re-validation + pinned connect; credential-header stripping on cross-origin. Missing: none found. Req: SEC-10. Milestone: M4. Test: TEST-05 redirect chain incl. stripping verification. |
| G-3 | **TLS validation** | Risk: MITM via disabled verification. Existing: rustls defaults; "never disable to work around failures" is explicit. Missing: none. Req: SEC-12. Milestone: M4. Test: code review + rustls defaults. PASS. |
| G-4 | **Tauri capabilities** | Risk: over-granted IPC surface. Existing: least-privilege grants, `opener` rejected (P1-I), `fs` postponed unless used, `dialog` deferred to M3. Missing: none. Req: SEC-04. Milestone: M0/M3. Test: capability audit vs used APIs. PASS WITH CONDITIONS (audit repeated whenever a plugin is added). |
| G-5 | **CSP compatibility** | Risk: CSP breaks app functionality or is loosened to fix breakage. Attack scenario n/a — misconfiguration risk. Existing: dev/prod split + automated `check-csp`; directives derived from the actual build (external stylesheets, Tauri IPC allowances). Missing: runtime verification that no component injects inline style *attributes* (CSP would block them in production). Correction: none needed in spec — M1 code review + devtools negative checks cover it. Req: SEC-01/02/03. Milestone: M0/M1/M10. Test: `check-csp` + devtools. PASS WITH CONDITIONS (production strictness proven at M0, not assumed). |
| G-6 | **Filesystem boundaries / path traversal** | Risk: crafted paths escape the app dirs. Attack: backup zip entries with `../` names; attachment names from untrusted sources. Existing: internal filenames, safe joins, Category separation, extraction path validation. Missing: none. Req: SEC-07/14. Milestone: M3/M9. Test: traversal negatives. PASS. |
| G-7 | **Archive extraction / zip bombs** | Risk: extraction DoS (ratio/entry/depth bombs). Attack: malicious "backup" zip. Existing: only the app's own format accepted; ratio/entry/depth/total-size caps; hash-verified manifest; restore-into-fresh-workspace. Missing: none. Req: SEC-14. Milestone: M9. Test: zip-bomb negative. PASS WITH CONDITIONS (test to be built). |
| G-8 | **Untrusted imported content** | Risk: stored content executed or rendered as markup. Existing: content stored as plain text data; no HTML rendering; frontend performs no fetches; strict CSP. Missing: none. Req: ARCH-05/SEC-16. Milestone: M3/M4. Test: render review + CSP checks. PASS. |
| G-9 | **Secret handling / logs** | Risk: credential leakage via logs, bundles, or exports. Existing: Phase 2 stores no credentials; placeholder-only provider records; log sanitizer rules; diagnostics sanitized; no keys in frontend. Missing: none. Req: SEC-15/16/18. Milestone: M0–M2, M10. Test: bundle scan; log review; zero-credential verification. PASS. |
| G-10 | **Supply chain** | Risk: malicious/compromised dependency. Existing: lockfiles, pins, minimal features, no git deps, cargo/npm audits at M10, milestone-scoped adoption, FFmpeg build audit gate. Missing: none beyond documented audits. Req: SEC-19. Milestone: M10. Test: audit reports + license inventory. PASS WITH CONDITIONS (audits are future evidence). |

**Security overall: PASS WITH CONDITIONS** — the design is sound; every condition is a stated future test (M4/M8/M9/M10), and the two spec gaps found were corrected.

## H. Performance findings

| # | Finding | Class |
|---|---|---|
| P-1 | **RAM-gate contradiction** (small ≤900 MB vs measured 1261 MB peak; medium headroom ~17 MB) | FAIL (found) → **corrected**: gates now tiny ≤0.9 GB · base ≤1.0 GB · small ≤1.5 GB · medium ≤3.0 GB (Proposed) |
| P-2 | Unthrottled progress events could dominate IPC/CPU on long jobs | DOCUMENTATION ONLY → **corrected** (throttle specified; PERF-08 verifies) |
| P-3 | Measurement methodology reproducible only if child enumeration is explicit | PASS WITH CONDITIONS (M0 script requirement — M-5) |
| P-4 | W2 browsing memory-delta guard (+25 MB) and virtualization targets are reasonable proposals | DOCUMENTATION ONLY (Proposed, OD-7) |
| P-5 | Approved 150 MB idle target is correctly **not claimed achieved** anywhere; no target was weakened during the audit | PASS |
| P-6 | Lightweight invariants (no idle workers, bounded caches/queues, streamed attachments, lazy loading, no polling) are specified as measurable, not aspirational | DOCUMENTATION ONLY |

## I. Architecture findings

| # | Area | Assessment |
|---|---|---|
| I-1 | Tauri 2 process model | PASS — single process pair, subprocesses per job only, no background services; WebView2-as-runtime is the P1-A-validated pattern |
| I-2 | Rust layering | PASS — domain framework-free; commands thin; no empty stub modules |
| I-3 | IPC/event lifecycle | PASS WITH CONDITIONS — typed envelope + taxonomy solid; throttling added (M-3); contract tests specified |
| I-4 | SQLite/FTS5 + schema v1 + migrations | PASS WITH CONDITIONS — guarded migrations and merge/undo are P1-evidenced; WAL and the new tables await M2 evidence (honestly gated); FTS-on-merge clarified (M-2) |
| I-5 | Identity/merge/undo | PASS — strong-identifier-only matching; explicit user-confirmed merges; snapshot undo; no confidence fabrication |
| I-6 | Attachments/retention | PASS — three storage categories with lifecycle isolation; cleanup never touches user files |
| I-7 | Backup/restore | PASS WITH CONDITIONS — atomic, versioned, validated; close→swap→reopen detail is an M9 test item (M-6) |
| I-8 | Job lifecycle/cancellation | PASS WITH CONDITIONS — C6 states + cancellation consistency specified; actual CLI termination behavior is the H-2 condition |
| I-9 | Imports/extraction | PASS — explicit format matrix; unsupported formats typed, never claimed |
| I-10 | Network adapters | PASS WITH CONDITIONS — SSRF mechanism concrete; YouTube automation correctly deferred (OD-5) |
| I-11 | Whisper/FFmpeg integration | PASS WITH CONDITIONS — CLI adapter, sidecar decode, model gates corrected (P-1); termination behavior (H-2) and audit record are the conditions |
| I-12 | Provider abstraction boundary | PASS — disabled placeholders, replaceable seam, no stubs, local-first independence |

No unnecessary complexity was found; no feature required relocation out of Phase 2; hidden dependencies were checked (dialog→M3, HTTP→M4, FFmpeg→M8 audit-gated — all declared).

## J. Traceability findings

- **Counts verified by grep during this audit:** 12/12 OD rows · 25/25 R-dispositions · 25 ARCH · 20 SEC · 15 PERF · 16 UI · 12 TEST · 12/12 milestones with acceptance criteria.
- **Mapping depth verified by spot-check:** security requirements appear inside milestone task lists as implementation work, not just references (e.g., SEC-08..13 are M4 task 3 verbatim; ARCH-18..21 are M8 tasks; TEST-05 is M4's acceptance matrix; TEST-09 is M1's plan).
- **Duplicates:** none — requirement IDs are unique and documents cross-reference rather than restate.
- **Ambiguities corrected during the audit:** RAM-gate numbers (H-1); FTS-merge behavior (M-2); resource_links population (M-4).
- **Labeling nuance (no change required):** R-001..R-004 marked "Approved (P1-A/P1-F evidence)" is grounded in the owner's Phase 2 kickoff directive, which lists the stack as "the current architectural direction" to be respected, plus the measured validation — the nuance is recorded here for transparency.
- **Status integrity:** no item is marked Implemented or Verified; "Approved" appears only with a cited decision ID or measured evidence.

**Traceability overall: PASS WITH CONDITIONS** (conditions: keep statuses synchronized as evidence appears; refresh at M10).

## K. Milestone readiness (feasibility per milestone)

| Milestone | Scope clear | Deps correct | Decisions identified | Sequence practical | Tests can prove completion | Rollback possible | Verdict |
|---|---|---|---|---|---|---|---|
| M0 | Yes | Yes (minimal, milestone-scoped) | OD-6 named | Yes | Yes (build/check-csp/contract/baseline) | Yes (deletable scaffold) | **PASS WITH CONDITIONS — safe to start after OD-6 approval + separate implementation authorization** |
| M1 | Yes | Yes | OD-6/OD-8 named | Yes | Yes (component/a11y/visual) | Yes (revert UI commits) | **PASS WITH CONDITIONS — additionally requires OD-8 approval; not startable on OD-6 alone** |
| M2 | Yes | Yes (M0 + OD-4) | OD-4 named (blocks) | Yes | Yes (migration/invariant/WAL suites) | Yes (versioned migrations) | Blocked by OD-4 — correctly gated |
| M3 | Yes | Yes | OD-5/OD-9 named | Yes | Yes | Yes | Practical after M2 |
| M4 | Yes | Yes | OD-5/OD-9 named | Yes | Yes (mock-server SSRF matrix) | Yes (flag-gate adapters) | Practical after M3 |
| M4b | Yes | Yes | Owner call named | Yes | Yes | Yes | Correctly optional |
| M5–M7 | Yes | Yes | OD-4 upstream | Yes | Yes | Yes | Practical; M7 correctly needs M6 data |
| M8 | Yes | Yes (M2/M3 + OD-2/OD-3 + audit + OD-11) | All five named | Yes | Yes (mock engine + owner-assisted real runs) | Yes (additive behind job model) | Correctly multi-gated; H-2 condition applies |
| M9 | Yes | Yes | OD-4/OD-9 named | Yes | Yes (roundtrip/bomb/interruption) | Yes (fresh-workspace restore) | Practical; parallel after M2 |
| M10 | Yes | All | OD-7/OD-11 named | Yes | Yes (full regression + reports) | n/a (measurement phase) | Correctly last |

No milestone claims unconditional readiness; every gate maps to an unapproved OD or an unfinished predecessor, exactly as required.

## L. Owner approvals required

Priority order (full decision pack with suggested wording: `PHASE_2_OWNER_APPROVAL_PACK.md`):
1. **OD-6** strict CSP — gates unconditional M0.
2. **OD-8** in-house primitives — gates unconditional M1 (in addition to OD-6).
3. **OD-4** schema v1 — gates M2.
4. **OD-2** CLI adapter and **OD-3** FFmpeg sidecar (+ build/audit review before distribution) — gate M8.
5. **OD-5 / OD-7 methodology / OD-9 / OD-10** — approve at their consuming milestones.
Owner **actions** (not approvals): **OD-11 fixtures** (gate M8 closure) · **OD-1 asset delivery** (placeholder already authorized) · **OD-12 key revocation** (standing security action).

## M. Recommended corrections (applied during this audit)

| # | Correction | Where | Rationale |
|---|---|---|---|
| 1 | **RAM gates re-derived from measured peaks** (tiny ≤0.9 GB · base ≤1.0 GB · small ≤1.5 GB · medium ≤3.0 GB; correction note recorded) | PERF §3.3; ARCH §5.5 | The old small gate contradicted the measured 1261 MB peak (H-1/P-1) |
| 2 | **Current-status note added to HANDOFF §9** (Phase 1 CLOSED per D-021; historical text preserved verbatim) | PHASE_HANDOFF §9 | Stale "IN_PROGRESS" current-state (m-1) |
| 3 | **IP-literal fast path made explicit** in the SSRF pipeline | ARCH §4.5 | Security-critical gap (M-1) |
| 4 | **FTS-on-merge behavior specified** (merged resource's FTS rows removed by the sync triggers) | ARCH §3.4; MILESTONES M6 | Internal consistency of trigger-sync vs redirect strategy (M-2) |
| 5 | **Progress-event throttling specified** (≥250 ms or per-N segments) | ARCH §2.6 | IPC-flood prevention (M-3) |
| 6 | **Model downloads bound to the same pinned pipeline** (only content-type expectation differs) | ARCH §5.2 | Closes an ambiguity in the downloader's security scope (H-3) |
| 7 | **`resource_links` minimal manual link/unlink affordance assigned to M6** | ARCH §6; MILESTONES M6 | Table existed without a populating task (M-4) |

Recommended but **not** applied (no contradiction; owner/methodology decisions): none blocking — M-5's enumeration detail is a stated M0 deliverable condition rather than a spec edit.

## N. Final implementation-readiness assessment

**PASS WITH CONDITIONS — documentation-ready; not implementation-ready.**

- **What this audit certifies:** the Revision 1.3 package (+ corrections above) is internally consistent, evidence-grounded where it claims evidence, adversarially reviewed across architecture/security/performance, fully traceable, and feasible milestone-by-milestone with named gates and rollback paths.
- **Conditions for implementation:** (1) separate explicit owner approval of the gating ODs — OD-6 (+OD-8) for M0/M1, OD-4 for M2, OD-2/OD-3 (+audit record) for M8; (2) the three owner actions (OD-11 fixtures, OD-1 assets, OD-12 revocation) where flagged; (3) every "DOCUMENTATION ONLY" item becomes Verified only through its named test at its milestone; (4) M0/M1 may proceed **only** on separate implementation authorization after the relevant OD approvals.
- **What remains NOT VERIFIED by design:** WAL behavior, 100k FTS latency, CLI termination behavior, long-duration/multilingual transcription, real-media decode coverage, CSP-on-real-build strictness, all performance budgets — each has a named test and milestone and is honestly labeled.
- **No FAIL classification remains** in the record; the one found (H-1) is corrected and logged.

---

**End of PHASE_2_INDEPENDENT_AUDIT_REPORT.md**
