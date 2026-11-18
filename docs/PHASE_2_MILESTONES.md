# TechVault Phase 2 Milestones

**Document status:** Revision 1.3 (2026-11-14, final integration pass). Draft for owner review; **no implementation authorization is granted by this document**.
**Revision 1.3 changes:** every milestone restructured to the twelve-field specification (objective, scope, implementation tasks, dependencies, security considerations, performance considerations, automated tests, manual tests, acceptance criteria, exit gate, deferred work, OD references); requirement IDs (ARCH-xx, SEC-xx, PERF-xx, UI-xx, TEST-xx) introduced and defined in `PHASE_2_TRACEABILITY_MATRIX.md` — cross-referenced here, not duplicated; import-format matrix and archive-safety boundaries referenced from the architecture document.
**Revision 1.2 changes:** all OD recommendations recorded as **Proposed** in `DECISION_LOG.md`; readiness matrix corrected to four categories — M0 and M1 are **not unconditionally ready** while OD-6/OD-8 are Proposed; production and development CSP policies separated with automated configuration checks (OD-6); explicit M1 accessibility test plan added (OD-8); OD-2/OD-3 confirmed as M8-only decisions.
**Revision 1.1 changes:** milestone-scoped dependency adoption; in-house UI primitives; attachments model; expanded M4 SSRF acceptance matrix; M8 rewritten (FFmpeg sidecar, CLI adapter, model catalog, final-segments persistence, closure gates incl. Urdu/mixed-language fixtures); hardened M9 backup format.

**Companions (all Rev 1.2/1.3 as labeled):** `PHASE_2_MASTER_PLAN.md` (Rev 1.3), `PHASE_2_ARCHITECTURE.md` (Rev 1.3), `PHASE_2_OPEN_DECISIONS.md` (Rev 1.2), `PHASE_2_PERFORMANCE_BUDGET.md` (Rev 1.3), `PHASE_2_DEPENDENCY_REVIEW.md` (Rev 1.2), `PHASE_2_TRACEABILITY_MATRIX.md` (Rev 1.0), `PHASE_2_FINAL_READINESS_REPORT.md` (Rev 1.0).

Classification vocabulary: **IN** = implement now · **PA** = prepare architecture now, implement later · **DE** = defer · **RJ** = reject unless new evidence justifies it. Status vocabulary (traceability matrix): Proposed / Approved / Implemented / Verified / Deferred / Blocked — **nothing is Implemented or Verified before repository evidence exists**.

General rules: small meaningful commits; tests written with the code and run before "done" is claimed; no milestone claims completion without recorded evidence; failed tests are reported, never hidden; acceptance criteria are never weakened to pass performance targets; dependencies are adopted milestone-scoped only (`PHASE_2_DEPENDENCY_REVIEW.md`).

---

## Sequencing overview

```
M0 scaffold ──► M1 shell ──► (M3 needs M2; M4 needs M3)
M0 ──► M2 database+jobs ──► M3 sources(T3 + YouTube URL records) ──► M4 web(T1a) ──► M4b (optional)
              │                 └──────────► M5 library+attachments ──► M6 identity ──► M7 search
              ├──► M8 transcription (design from M2; impl needs M3 media intake; gated by OD-3 audit + OD-11 fixtures)
              └──► M9 backup/export (parallel after M2)
M10 closure (needs all)
```

---

## M0 — Production scaffold and conventions

1. **Objective:** a real Tauri 2 + Svelte 5 workspace in `src/` + `src-tauri/` with build/test/measurement conventions and zero product features.
2. **Scope:** IN — workspace init, tooling, conventions, measurement baseline. OUT — every product feature (M1+).
3. **Required implementation tasks:** workspace init; `Cargo.toml` + `tauri.conf.json` (identifier `com.techvault.app`; CSP per OD-6: strict production `csp` + separately configured `devCsp` with only the enumerated Vite/HMR allowances); least-privilege capabilities (only what M0 uses — no file-dialog plugin until M3; no `opener`, ARCH-04/SEC-04); SvelteKit static-adapter SPA + strict TS + Tailwind 4 tokens (all assets bundled locally, no CDN); `svelte-check`/`clippy`/`rustfmt`; vitest + cargo test layouts; typed-error IPC envelope + contract test (ARCH-02, TEST-01); rotating secret-free file logger (SEC-15); process-tree measurement script (PERF-01/02); automated CSP configuration check `scripts/check-csp` (SEC-01/02/03).
4. **Dependencies:** M0-scoped list only (`PHASE_2_DEPENDENCY_REVIEW.md` §2). None deferred-into-M0.
5. **Security considerations:** CSP both configurations (SEC-01/02/03); least-privilege grants (SEC-04); logging rules from day one (SEC-15); no frontend network (ARCH-05).
6. **Performance considerations:** M0 baseline for every later comparison (PERF-02/03); measurement script committed.
7. **Automated tests:** build smoke; IPC envelope contract test (TEST-01); svelte-check; clippy; `check-csp`.
8. **Manual tests:** owner launches the installed app; window, title, no console errors.
9. **Acceptance criteria:** release build passes; stub page renders; `svelte-check` 0 errors; `clippy` clean; installer builds + size recorded; **both CSP configurations tested** (dev HMR functional; production strict via script + devtools negative check); zero unused capability grants; baseline recorded (cold/warm startup, idle private bytes over the full process tree — **baseline only, no pass/fail**).
10. **Exit gate:** automated suite green + owner launch confirmation + baseline recorded. Gate reviewed by owner before M1 authorization.
11. **Deferred work:** none (all product features belong to later milestones by design).
12. **OD references:** OD-6 (CSP — Proposed; gates authorization), OD-7 (methodology — methodology additions Proposed).
- **Readiness (update 2026-11-14):** **OD-6 approved (D-022)** — the approval gate is cleared; M0 is technically ready and awaits **separate implementation authorization** (explicitly not granted by the approval). CSP behavior on the real build remains NOT VERIFIED until M0 executes its tests.
- **Execution status (2026-11-14, post-decision — appended; the readiness line above is the pre-authorization record):** M0 was implemented under the owner's separate authorization, verified, and reviewed. Owner decisions **D-024** (DEV-CSP-1 accepted — dev-only `unsafe-inline`, production CSP unchanged) and **D-025** (kit 3.x deferred to the M1 dependency review) are recorded in `DECISION_LOG.md` §4. The owner installed, launched, inspected, and uninstalled the release app with the smoke view fully passing (owner-confirmed; console-error and title-bar checks not evidenced — recorded as identified residual items in `PHASE_2_M0_OWNER_VERIFICATION_GUIDE.md` §8). **Exit gate evidence complete; owner launch-confirmation requirement explicitly WAIVED by the owner for M0 only (unnumbered addendum, DECISION_LOG §4) with automated evidence accepted. Final verification executed; **PHASE 2 M0: CLOSED** (effective 2026-11-14; `PHASE_2_M0_CLOSURE_REPORT.md`). Preserved conditions: the documented production-CSP style-src console event (console not clean) and the D-025 kit-3 deferral. M1 requires separate authorization.**
- **Classification:** IN.

## M1 — Application shell and design system

1. **Objective:** the approved visual direction as real UI (D-011). The missing logo must not block this milestone (OD-1).
2. **Scope:** IN — shell, routing, themes, primitives, settings shell, a11y. OUT — data-bound features (M2+); notebooks/graph/bookmarks/analytics content (later-phase empty states only).
3. **Required implementation tasks:** AppShell (220 px sidebar + 56 px topbar + main + contextual panel, UI-01); route skeleton for all 8 nav items; dark/light theme with persistence (UI-02); design tokens + typography (UI-03); **in-house primitives** — dialog, sheet, dropdown, table, tabs, toast, tooltip, button, card, badge, input (UI-04, OD-8); global error boundary; job-status indicator (inert until M2); Settings shell (providers section renders R-023 placeholder state, SEC-16); **accessibility test plan execution** (UI-07/08/09/10, TEST-09).
4. **Dependencies:** M0; M1-scoped dependency additions only (`lucide-svelte`, `clsx`, `tailwind-merge`).
5. **Security considerations:** CSP re-verified on real UI (SEC-01/02/03); no secrets in frontend (SEC-16); provider section shows disabled placeholders only.
6. **Performance considerations:** shell delta vs M0 ≤ +10 MB private bytes (proposed guard, PERF-03); first-render time recorded.
7. **Automated tests:** component tests (theme store, nav, each primitive variant); **per-primitive accessibility suites** — dialogs/sheets (focus into surface, focus trap, Escape where appropriate, focus return to invoker, background interaction disabled); dropdowns/tabs (keyboard navigation, correct ARIA roles/states, focus-selection synchronization); all primitives (visible focus, screen-reader labels, reduced-motion); `check-csp`; visual smoke (P1-A screenshot pattern adapted).
8. **Manual tests:** owner visual acceptance vs `UI_DESIGN_SYSTEM.md` in both themes; **manual keyboard walkthrough of every primitive; manual screen-reader smoke test (Narrator/NVDA) with recorded results**; reduced-motion check. ARIA attribute presence alone is never accepted as compliance evidence.
9. **Acceptance criteria:** all nav items render with designed empty states (UI-05); theme persists across restart; keyboard traversal with visible focus; **every primitive passes the full accessibility test plan**; shell matches design tokens; production CSP strict (script + devtools negative check); no console errors.
10. **Exit gate:** owner visual + accessibility acceptance recorded.
11. **Deferred work:** logo asset swap on OD-1 delivery; later-phase pages (DE).
12. **OD references:** OD-1 (placeholder authorized; asset pending), OD-6 (Proposed), OD-8 (Proposed).
- **Readiness (update 2026-11-14):** **OD-6 (D-022) and OD-8 (D-023) approved** — the approval gates are cleared; M1 remains gated on **M0 completion + separate implementation authorization** (explicitly not granted by the approvals). Accessibility claims remain NOT VERIFIED until M1 executes TEST-09.
- **Classification:** IN (logo: PA; later-phase pages: PA/DE).

## M2 — Database foundation and job lifecycle

1. **Objective:** production SQLite + migrations + repositories + typed errors + the cancellable job model.
2. **Scope:** IN — schema v1 (incl. attachments, tags), migration framework, repositories, job runner, FTS skeleton, WAL decision. OUT — notebooks/bookmarks/graph tables (migration plan only); any AI.
3. **Required implementation tasks:** rusqlite (bundled) connection management (ARCH-06); guarded migration runner with **defined failure/recovery behavior** — rollback → previous version → typed startup error → restore guidance; pre-migration backup for altering migrations (ARCH-11); **schema v1 per ARCHITECTURE §3.2** incl. `attachments` and `resource_tags` (ARCH-07, OD-4); FK enforcement; repositories; transaction helpers; typed error taxonomy (ARCH-02); FTS5 external-content skeleton + triggers (ARCH-22, TEST-04); job runner — C6 states, progress events, cancellation, retry idempotency, crash recovery, **worker lifecycle** (workers spawned per job and joined at completion; no idle workers) (ARCH-03, PERF-08, TEST-07); startup integrity checks; **WAL enabled only after both tests pass**: concurrent reader/writer stress **and** backup-under-WAL validation (ARCH-12).
4. **Dependencies:** M0; **OD-4 approval (Proposed — blocks this milestone)**.
5. **Security considerations:** FK enforcement always on; no secrets in DB fields; attachment metadata only (files outside DB); restrictive DB-directory ACLs.
6. **Performance considerations:** FTS latency harness @ 100k (PERF-06); write overhead (PERF-07); DB size after seeding (PERF-13); bounded prepared-statement cache (PERF-08).
7. **Automated tests:** **P1-F 9-invariant suite ported and passing** (caveat introduced in Rev 1.1 and retained in Rev 1.2: validates mechanisms, not the whole schema — TEST-02); migration suite (fresh + upgrade + injected-failure + recovery, TEST-03); FTS sync (TEST-04); job-runner tests (transitions, cancel semantics, idempotent retry, TEST-07); corruption detection.
8. **Manual tests:** app starts against an empty library.
9. **Acceptance criteria:** fresh DB creates and opens; migration apply + rollback + failure-recovery verified; FK violations rejected; repositories transactional; job state machine unit-tested; kill-during-merge leaves consistent state; FTS triggers keep indexes synced; startup after simulated crash recovers; WAL decision recorded with test evidence (pass or documented stay-on-DELETE).
10. **Exit gate:** schema implemented exactly as OD-4-approved; regression suite green; WAL evidence recorded.
11. **Deferred work:** notebooks/bookmarks/graph tables (PA — additive migrations in their phases).
12. **OD references:** OD-4 (Proposed — **blocks M2**), OD-7 (methodology).
- **Readiness:** **blocked by OD-4 review** (awaiting owner approval).
- **Classification:** IN (notebook/graph tables: PA).

## M3 — Source management (Tier 3 + YouTube URL records)

1. **Objective:** submit and manage sources with zero automated network surface: pasted content, local files (with the **save-as-attachment choice**), and **YouTube URLs recorded with user-provided transcript/audio import** (OD-5).
2. **Scope:** IN — Tier 3 adapters, intake validation, retention choices, duplicate-submission handling, sources UI, import-format matrix (ARCH-17). OUT — automated fetching (M4); OCR/PDF/office/image extraction (typed `Unsupported` — no claim).
3. **Required implementation tasks:** `pasted_text` + `local_file` adapters with capability reporting (ARCH-14/15); source records (original URL/input preserved + normalized); duplicate-submission detection (normalized URL / content hash) linking, never auto-deleting; C6 status lifecycle end-to-end; **import-format matrix** (ARCH-17): supported = pasted text, `.txt`, `.md`, local audio/video (for transcription via OD-3 decode), YouTube URL records; unsupported formats → typed `Unsupported` error with guidance; **`local_file` intake asks: save as user-owned attachment (Category 1) or process temporarily (Category 2)** — recorded (ARCH-13); OD-9 type-specific limits + validation-first parsing; attachment registration with streamed SHA-256 (PERF-10); intake jobs on the M2 runner; sources list + filters + detail UI.
4. **Dependencies:** M2; **`tauri-plugin-dialog` introduced at this milestone** (directive §2.F timing rule); OD-5, OD-9 defaults.
5. **Security considerations:** safe filesystem + path-traversal defenses (SEC-07); size/type validation (SEC-13/14 posture; no archives accepted as sources); attachment files never touched by cleanup passes.
6. **Performance considerations:** 100 pasted sources ≤5 s (proposed); streamed hashing (PERF-10); temp dir empty after batch; no orphan temps.
7. **Automated tests:** unit (normalization, hash dedup, validation, attachment registration, unsupported-format errors); integration (service+repo+adapter incl. cancel, crash sweep, category-choice flows, TEST-06 malformed-input negatives).
8. **Manual tests:** paste flow; add local media (both retention choices); duplicate submission; YouTube URL + pasted transcript; unsupported file → clear error; cancel button.
9. **Acceptance criteria:** paste → source with provenance; local file → correct category honored; duplicate submission → one row + linked record + informational status; YouTube URL → source record saved, user transcript/audio imports correctly; invalid/oversized/unsupported input → typed errors with clear messaging; cancel mid-intake leaves no orphan temp (verified incl. simulated crash + startup sweep); attachments never touched by cleanup passes.
10. **Exit gate:** owner manual pass recorded; integration suite green.
11. **Deferred work:** automated YouTube ingestion (DE per OD-5); document formats beyond .txt/.md (DE — explicit non-claim).
12. **OD references:** OD-5 (Proposed), OD-9 (Proposed), OD-4 (attachments schema — approved upstream gate).
- **Readiness:** blocked by M2.
- **Classification:** IN.

## M4 — Web ingestion Tier 1a (generic website + GitHub public)

1. **Objective:** first automated network adapters behind the complete SSRF mechanism (ARCHITECTURE §4.5 — concrete mechanism; DNS validation without connection pinning is insufficient).
2. **Scope:** IN — `web` + `github` adapters, URL validation pipeline, pinned-connection connector, redirect handling, negative-test suite. OUT — YouTube/Reddit/Medium automation; archive sources; any credential use.
3. **Required implementation tasks:** `url_validator.rs` + pinned-resolution connector (SEC-08/09/10/11/12): scheme gate; resolve-all-records; fail-closed blocklist incl. IPv6; **validated-IP-only connections** (custom connector passes the validated `SocketAddr` as the resolution override — the connection step cannot re-resolve); per-hop redirect validation; credential-header stripping on cross-origin redirect; timeouts/size/content-type limits (SEC-13); cert validation never disabled; shared `http.rs` client (rustls); `web` adapter (fetch → main-content plain-text extraction → data-only storage); `github` adapter (public REST + README; `github_repo` identifier rows; rate-limit → `RateLimited`); capability reporting; `playback_type` capture.
4. **Dependencies:** M3; M4-scoped dependencies (`reqwest`, `url`, HTML-extraction crate).
5. **Security considerations:** the full SSRF surface (SEC-08..13); TEST-05 matrix; fetched content stored as plain text data only.
6. **Performance considerations:** fetch budget verification (≤10 s timeout, ≤5 MB cap — PERF-08/SEC-13); idle CPU unchanged (PERF-04).
7. **Automated tests:** **TEST-05 SSRF matrix** — localhost/127.0.0.1/::1; RFC1918/private; link-local + `169.254.169.254`; **IPv6 loopback/ULA/link-local**; redirect chains incl. **cross-origin redirect with credential headers stripped (verified)** and redirect-into-private rejected; **DNS-rebinding simulation rejected by the pinned connector**; oversized/slow responses; disallowed content-types; unusual ports; blocked schemes — all against a **local mock server**; adapter integration tests.
8. **Manual tests:** submit real URLs (blog post, GitHub repo, auth-walled page); review statuses.
9. **Acceptance criteria:** the full TEST-05 matrix passes; real website + public GitHub repo ingest; failure statuses correct; no external network dependency in automated runs.
10. **Exit gate:** owner security review sign-off on the M4 report.
11. **Deferred work:** Reddit/Medium (M4b, owner call); YouTube automation (DE per OD-5).
12. **OD references:** OD-5 (Proposed), OD-9 (Proposed — response caps).
- **Readiness:** blocked by M3.
- **Classification:** IN (Reddit/Medium: PA; YouTube automation: DE).

## M4b — Web ingestion Tier 1 remainder (optional/stretch)

1. **Objective:** Reddit public content and Medium accessible articles, if the owner wants them in Phase 2. **YouTube automated ingestion is not part of M4b** (OD-5 deferral).
2. **Scope:** IN — two read-only public-content adapters. OUT — YouTube automation; authenticated access.
3. **Tasks:** adapters behind the same §4.5 pipeline; per-adapter documented limitations.
4. **Dependencies:** M4; owner call on inclusion.
5. **Security:** same SEC-08..13 surface. **Performance:** same fetch budgets. **Tests:** same matrix per adapter.
6. **Acceptance criteria:** same validation pipeline; capability reporting honest.
7. **Exit gate:** owner acceptance per adapter.
8. **Deferred work:** YouTube automation (new owner decision required).
9. **OD references:** OD-5.
- **Readiness:** blocked by M4 + owner call.
- **Classification:** PA.

## M5 — Resource library, tags, attachments, and evidence viewer

1. **Objective:** canonical resources as first-class UI objects, with tags, the attachment model, and evidence visibility.
2. **Scope:** IN — resource CRUD, extensible categories, tags, aliases, mentions (manual), attachments UI, evidence viewer, history. OUT — AI verification/suggestions (Phase 3); notebooks/graph UI (Phase 4).
3. **Required implementation tasks:** resource CRUD (manual `discovery_origin=Manual`); extensible categories (B3 — seeded, user-extensible, ARCH-07); **tags** (`resource_tags` — lightweight user organization; UI-13); verification status display (4 states + unverified warning; confidence never shown as proof); aliases + expandable dropdown (D5); mentions list (manual creation/linking — the only Phase 2 mention source); **attachment management: upload to Category 1 storage, list on resource detail, remove with confirmation, SHA-256 + size shown** (ARCH-13); evidence viewer (compact snippets, provenance, timestamps); `resource_history` on meaningful edits (D7); archive/unarchive.
4. **Dependencies:** M2 (schema incl. attachments/tags), M3 (mention sources).
5. **Security considerations:** attachment path handling (traversal defenses, SEC-07); evidence rendered as data only.
6. **Performance considerations:** virtualized library (UI-11/PERF-09); p95 ≤100 ms @ 10k rows (proposed); streamed attachment hashing.
7. **Automated tests:** unit (categories, tags, verification transitions, history, attachment hash/registration); integration (service+repo; evidence-survives-transcript-deletion contract test).
8. **Manual tests:** browse a 100-resource synthetic library; tag and untag; attachment upload/remove; edit flows; status displays.
9. **Acceptance criteria:** create/edit/archive a resource; meaningful edits append history; aliases with type; tags add/remove; manual mention with evidence snippet; **attachment upload/list/remove with retention semantics honored (no cleanup pass ever deletes them)**; unverified banner renders; delete-resource asks about attachments explicitly; empty/loading/error states present (UI-05).
10. **Exit gate:** owner manual pass recorded.
11. **Deferred work:** AI link population (Phase 3); collections = notebooks (Phase 4).
12. **OD references:** OD-4 (schema), OD-1 (placeholder slot only).
- **Readiness:** blocked by M2/M3.
- **Classification:** IN.

## M6 — Identity and deduplication

1. **Objective:** safe identity: identifier-based candidates, review queue, transactional merge with preview/undo/history.
2. **Scope:** IN — normalization, candidate generation (identifier-equality only), review queue, merge/undo/history, "not the same". OUT — fuzzy/similarity matching (P-008); auto-merges of any kind.
3. **Required implementation tasks:** identifier normalization service; candidate generation (identifier-equality only — ARCH-09); review queue UI with side-by-side comparison; merge preview (winning fields, affected records); transactional merge (ARCH-10): snapshot → re-point → `merged_into` marker → history (+ FTS rows of merged resources removed by the sync triggers — TEST-04); exact undo; immutable history; "not the same" recording; **minimal manual resource-link/unlink affordance in the resource detail view (populates `resource_links`; richer management Phase 4)**; **mentions carry no invented confidence (NULL unless a reliable provider supplies one — never in Phase 2)**.
4. **Dependencies:** M5.
5. **Security considerations:** merge transaction integrity (SEC posture: no partial states); concurrent-merge guard.
6. **Performance considerations:** candidate scan ≤1 s @ 10k; merge ≤250 ms @ 10 mentions (proposed).
7. **Automated tests:** **extended P1-F invariant suite** (original 9 + new: uncertain matches never auto-candidate; preview equals outcome; undo-twice fails cleanly; history immutable; not-the-same suppresses re-candidacy) — TEST-02; property test for merge/undo round-trip; concurrent-merge guard test.
8. **Manual tests:** review queue walkthrough; merge + undo on seeded data; evidence visibly preserved.
9. **Acceptance criteria:** extended suite green; no code path upgrades verification via merge; aliases/identifiers/history preserved; no confidence fabrication.
10. **Exit gate:** regression gate passed (Phase 2 test centerpiece).
11. **Deferred work:** fuzzy matching (DE per P-008 — golden-dataset evidence first).
12. **OD references:** OD-4 (merge semantics provenance).
- **Readiness:** blocked by M5.
- **Classification:** IN.

## M7 — Search and filters

1. **Objective:** working search across the library with filters and honest latency numbers.
2. **Scope:** IN — query pipeline, global search UI, filters, sorting, instrumentation. OUT — command palette (R-020 Proposed — owner-optional add-on); semantic search (RJ now).
3. **Required implementation tasks:** query pipeline (FTS MATCH + escaping + relational filters + sorting, prepared statements); global topbar search with entity-type grouping (UI-12); filters (type, verification, discovery, date, platform, transcript presence); deep links; latency instrumentation.
4. **Dependencies:** M6 (merged/consistent data).
5. **Security considerations:** query input escaping (injection-safe FTS MATCH).
6. **Performance considerations:** PERF-06 targets measured at 10k and 100k; reindex cancellable/non-blocking (PERF-08).
7. **Automated tests:** FTS sync suite after edit/merge/delete (TEST-04); filter composition; latency harness.
8. **Manual tests:** realistic search scenarios; filter interactions.
9. **Acceptance criteria:** index consistency; filters compose; empty/no-result states designed; p95 measured vs carried ≤50 ms @100k target; transcript content searchable after M8.
10. **Exit gate:** latency report recorded.
11. **Deferred work:** command palette (PA — R-020 Proposed); semantic/vector search (RJ).
12. **OD references:** OD-7 (measurement), OD-4 (FTS schema).
- **Readiness:** blocked by M6.
- **Classification:** IN (palette: PA).

## M8 — Whisper transcription foundation (R-024; directive §2.B design)

1. **Objective:** local, free, open-source transcription (whisper.cpp) with model management, consent-gated downloads, final-segment persistence, safe cancellation, temp cleanup, per-job monitoring. **No paid transcription API; no Python/PyTorch/ML runtime.**
2. **Scope:** IN — engine adapter (CLI), FFmpeg sidecar decode, model manager/downloader/inventory, job semantics, transcript lifecycle, monitoring. OUT — models > Medium; partial-transcript persistence; Android (P1-D held); any cloud STT.
3. **Required implementation tasks:** `TranscriptionEngine` trait + **whisper.cpp CLI subprocess implementation** (ggml-org, pinned `371b5a7`; structured args; stdout parsing into typed segment events; best-effort progress; graceful terminate → hard kill) — ARCH-18, OD-2; **FFmpeg sidecar decode** to **16 kHz mono PCM WAV** in Category 2 temp space; input validation (formats, malformed, oversized per OD-9); **licensing/build audit record required before any bundled distribution** — ARCH-19, OD-3; **model manager** (ARCH-20, OD-10): pinned versioned registry (Tiny low-resource ~75 MB · **Base default** ~142 MB · Small quality ~466 MB · Medium advanced ~1.5 GB, multilingual variants; checksums; variants); pre-download disclosure (size, estimated storage, hardware suitability incl. measured RTF/RAM with the fixture-scope caveat); **no bundled models**; storage outside app dir, default `D:\Models\whisper\`; **trusted-checksum verification** (mismatch → typed error + discard, SEC-17); resumable, cancellable downloads; **model removal and inventory**; **minimum-hardware guidance + resource fallback**: pre-flight free-RAM check against the model's measured peak (tiny ~0.7 GB · base ~0.8 GB · small ~1.3 GB · medium ~2.6 GB peak private, reference machine) → UI recommends Tiny/Base on low-spec machines; gate exceeded → typed error + smaller-model suggestion; **job semantics** (ARCH-21): job-level best-effort progress + cancellation (safe terminate + temp clean + DB consistent); **final timestamped segments persisted only after successful processing — no partial-transcript persistence**; stage-level partials per ARCHITECTURE §2.6; transcript lifecycle (retention default-on, user deletion with evidence preservation); per-job CPU/RAM monitor (engine + decode as **separate workload rows**, PERF-11); RAM gates (OD-9); language honesty: selection + auto-detection exposed; **Urdu/Roman-Urdu/mixed quality NOT claimed** anywhere.
4. **Dependencies:** M2 (jobs), M3 (media intake/attachments); **gates:** OD-3 audit record (bundled distribution); **OD-11 fixtures (M8 closure)**.
5. **Security considerations:** checksum verification (SEC-17); subprocess hardening (SEC posture §11); temp-file hygiene (Category 2 cleanup + crash sweep); no network without consent (negative test).
6. **Performance considerations:** PERF-11 separate workload rows; RTF + peak private bytes recorded per model; long-duration results from OD-11; post-job residency zero.
7. **Automated tests:** unit (segment mapping, consent gate, checksum, temp cleanup, limits, hardware-gate logic); integration with a mock engine (cancel semantics, error mapping, persistence semantics — TEST-10); integration with the real pinned CLI on an owner-consented model fixture (owner-assisted, marked as such).
8. **Manual tests:** consent + download flow (incl. disclosure review); transcribe real media; cancel mid-run; delete a transcript; remove a model; verify inventory; **OD-11 fixture runs** (long-duration ≥90 s / 5–10 min; cancellation + recovery; **Urdu + English + Urdu-English mixed**) with results recorded honestly.
9. **Acceptance criteria:** no network download without explicit consent; checksum mismatch → typed error + discard; disclosure accurate; end-to-end transcription with final segments + timestamps stored; cancel mid-run → subprocess safely terminated, temp cleaned, DB consistent, no partial transcript claimed; corrupt file → typed error, no crash; delete transcript → evidence retained + marked; per-job private bytes recorded as a separate workload; no resident process after job ends; resource-insufficient fallback behaves as specified; **M8 closure additionally requires the OD-11 fixture tests run and recorded**.
10. **Exit gate:** all functional AC + **OD-11 fixture results recorded** — M8 cannot close without them.
11. **Deferred work:** models > Medium (DE); partial-transcript persistence (DE — future owner decision with engine-interface evidence); Android transcription (DE — P1-D held).
12. **OD references:** OD-2, OD-3, OD-9, OD-10, OD-11 (all Proposed; OD-11 fixtures = owner action).
- **Readiness:** **blocked** — by M2/M3 completion, OD-2/OD-3 approval, the OD-3 audit record, and OD-11 fixtures.
- **Classification:** IN (models > Medium: DE; partial persistence: DE; Android: DE).

## M9 — Backup/export foundation

1. **Objective:** local data portability per D-007 with the hardened format.
2. **Scope:** IN — versioned archive export, atomic creation, validated restore, attachment inclusion, interrupted-operation recovery. OUT — cloud sync (D-006); MD/CSV formats (PA); encryption (P-014).
3. **Required implementation tasks:** **versioned archive format** (zip: `manifest.json` + DB snapshot + `attachments/`; manifest with format/app/schema versions, timestamps, DB SHA-256, per-attachment hashes — ARCH-23); **atomic creation** (temp assembly → hash → atomic move; interrupted export leaves no partial final file); **attachment inclusion + integrity checks** at export and import; **restore validation before replacing** (format compatibility → DB integrity on the restored copy → attachment hash verification → guarded migrations if backup schema is older → automatic pre-restore safety backup → confirmed swap); **interrupted-restore recovery** (workspace discarded, live DB untouched); **safe archive extraction with zip-bomb protection** — the only archive Phase 2 accepts is its own backup format; extraction enforces maximum compression ratio, entry count, nesting depth, and total uncompressed size (SEC-14); Settings → Backup & restore UI with progress + cancellation.
4. **Dependencies:** M2; best after M6/M7 data exists.
5. **Security considerations:** SEC-14 (zip-bomb); restore never silently overwrites; path-traversal-safe extraction (SEC-07); **no-encryption-at-rest documented accurately** (SEC-18).
6. **Performance considerations:** PERF-14 export/restore ≤60 s @ 10k (proposed); streamed hashing; bounded memory during restore.
7. **Automated tests:** roundtrip integration incl. attachments (TEST-08); malformed-import negative suite; interruption tests (export and restore); zip-bomb negative test.
8. **Manual tests:** full restore drill (owner performs export → restore).
9. **Acceptance criteria:** roundtrip preserves all Phase 2 entities **including attachments** (hash-verified); corrupted/foreign/newer-version imports rejected with typed errors; restore never overwrites without confirmation; interrupted export/restore leaves the live library untouched; pre-restore safety backup exists.
10. **Exit gate:** owner restore drill completed.
11. **Deferred work:** MD/CSV export (PA — R-018); encrypted backups (P-014).
12. **OD references:** OD-4 (backup compatibility), OD-9 (limits).
- **Readiness:** blocked by M2 (best after M6/M7).
- **Classification:** IN (MD/CSV: PA).

## M10 — Hardening, performance validation, and Phase 2 closure

1. **Objective:** verify everything against budgets and security requirements; close the phase honestly.
2. **Scope:** IN — full budget suite, security closure, audits, documentation, handoff. OUT — new features; criteria weakening.
3. **Required implementation tasks:** full budget suite with the **process-tree methodology** and the **five named workloads** (idle application / normal resource browsing / large-library search / active transcription / import-export — PERF-03; engine/decode subprocess memory separate); security closure vs SECURITY §25 applicable items (URL/SSRF suite, file tests, credential absence, DB recovery incl. migration-failure recovery, Tauri permission boundaries, package integrity — SEC-20); P1-I carry-forward closure check (CSP, zero unused grants, bounded payloads); **OD-11 fixture test results consolidated** (long-duration, cancellation/recovery, Urdu/English/mixed — recorded honestly); `cargo audit` + `npm audit` (SEC-19); FFmpeg audit record verified present **before any bundled distribution**; documentation updates; known-limitations list (no encryption at rest; no partial-transcript persistence; language-quality status per OD-11 results; all carried Phase 1 deferrals); traceability-matrix status refresh; Phase 2 handoff prepared.
4. **Dependencies:** all milestones.
5. **Security considerations:** the full SEC-01..20 set re-verified.
6. **Performance considerations:** every PERF row measured and reported (pass/fail — criteria not weakened).
7. **Automated tests:** full regression pass (TEST-01..12 as applicable); committed measurement scripts (TEST-12).
8. **Manual tests:** roadmap §6 workflow acceptance walkthrough; performance report review.
9. **Acceptance criteria:** every budget measured and reported; roadmap §6 exit criteria verified with evidence; no critical security findings; regression suites green; limitations recorded; traceability matrix statuses refreshed against evidence.
10. **Exit gate:** **Phase 2 exit gate — owner reviews the closure and approves Phase 3.**
11. **Deferred work:** everything classified DE/PA (carried explicitly into the handoff).
12. **OD references:** OD-7 (report), OD-11 (results), plus closure status for all.
- **Readiness:** blocked by all milestones.
- **Classification:** IN.

---

## Milestone readiness matrix (corrected per the owner's approval-semantics directive, 2026-11-14)

Categories: **1 = Technically ready** (engineering prerequisites complete in plan) · **2 = Awaiting owner approval** (an OD recommendation is Proposed) · **3 = Blocked by another milestone** · **4 = Owner action required**.

| Milestone | 1 Technically ready | 2 Awaiting owner approval | 3 Blocked by milestone | 4 Owner action required |
|---|---|---|---|---|
| **M0** | **Yes** | — (OD-6 **approved, D-022** — approval gate cleared 2026-11-14) | — | **CLOSED 2026-11-14** (executed under the owner's authorization; final verification complete; owner launch-confirmation waived for M0 via unnumbered addendum; D-024/D-025 recorded) |
| **M1** | **Yes** (after M0) — logo placeholder explicitly authorized (OD-1) | — (OD-6 **D-022** and OD-8 **D-023 approved** — approval gates cleared) | **M0** | Separate M1 implementation authorization |
| **M2** | Yes — schema v1 fully documented with provenance | **Yes — OD-4** (schema v1, Proposed): owner review/approval required before implementation authorization | **M0** | — |
| **M3** | Yes (design) | OD-5/OD-9 (Proposed) before defaults freeze | **M2** | — |
| **M4** | Yes (design; security matrix defined) | OD-5/OD-9 (Proposed) | **M3** | — |
| **M4b** | Yes (optional scope) | Owner call on inclusion | **M4** | — |
| **M5/M6/M7** | Yes (design) | OD-4 upstream | Prior milestones (M2→M5→M6→M7) | — |
| **M8** | Yes (design) | **Yes — OD-2** and **OD-3** (Proposed; **M8 decisions only** — not M0/M1 blockers); OD-3 audit before bundled distribution | **M2, M3** | **Yes — OD-11 fixtures** (long-duration, cancellation/recovery, Urdu + English + mixed) before M8 closes |
| **M9** | Yes (design) | OD-4 upstream | **M2** (best after M6/M7) | — |
| **M10** | Yes (design) | OD-7 methodology (Proposed) determines gate vs report-only mode | All milestones | — |

**OD approval status (updated 2026-11-14; consistent with `DECISION_LOG.md` §4/§5 and `PHASE_2_OPEN_DECISIONS.md`):** **OD-6 is approved as D-022 and OD-8 as D-023** (explicit owner instruction; the M0/M1 approval gates are cleared — implementation authorization remains a separate owner decision). All other OD recommendations (OD-2, OD-3, OD-4, OD-5, OD-7 methodology, OD-9, OD-10, OD-11) remain **Proposed** — none resolved merely because its approach is documented. The OD-1 neutral-placeholder approach remains the separately authorized interim measure (not approval of final branding). **Owner approvals still outstanding:** OD-4 (gates M2), OD-2/OD-3 (M8), OD-5/OD-9/OD-10 (M3/M8 defaults), OD-7 methodology (M10 mode). **Owner actions outstanding:** OD-1 asset delivery; OD-11 fixture supply; OD-12 key revocation. The approved Phase 1 record is unchanged. Full per-item mapping: `PHASE_2_TRACEABILITY_MATRIX.md`.

---

**End of PHASE_2_MILESTONES.md**
