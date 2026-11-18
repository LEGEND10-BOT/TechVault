# TechVault Phase 2 Open Decisions Register

**Document status:** Revision 1.2 (2026-11-14, approval-semantics correction). Every OD carries a fully documented **recommended decision**.
**Status update (2026-11-14, owner instruction):** **OD-6 is approved — D-022** and **OD-8 is approved — D-023** (see `DECISION_LOG.md` §4). **Update (2026-11-14, D-026):** **OD-4 is approved WITH AMENDMENTS**, **OD-7's methodology is approved** (target remains Approved via D-019), and **OD-9's M1 intake subset is approved (DP-07)** — see the per-OD item-8 lines, which govern. Still **Proposed:** the OD-1 full decision (placeholder interim approach remains authorized), OD-2, OD-3, OD-5, OD-9's non-M1 subsets, OD-10, OD-11; **OD-12 is a standing owner action**. No approval constitutes M0 or M1 implementation authorization.
**Approval rule (as reconciled with D-022/D-023/D-026):** OD recommendations become decisions only through separate, explicit owner approval recorded in `DECISION_LOG.md`. **Approved to date:** OD-6 (D-022), OD-8 (D-023), OD-4 with amendments (D-026), OD-7's methodology (D-026), OD-9's M1 intake subset (DP-07, D-026), plus the OD-1 neutral-placeholder interim approach (explicit owner directive). Owner approval is never invented; no OD may be treated as resolved merely because its recommended approach is documented. The per-OD section bodies below are the v1.2 recommendation records — their item-8 lines carry the governing status.
**Scope note:** no implementation is authorized by this document.

Per-OD structure: 1 recommended decision · 2 reason · 3 benefits · 4 trade-offs · 5 security/performance impact · 6 dependencies & milestone impact · 7 acceptance criteria · 8 owner approval status.

---

## OD-1 — Approved logo asset files (P0-T08)

1. **Recommended decision:** M1 ships with a **neutral placeholder** (plain TechVault wordmark slot, no shield/T approximation). The exact owner-provided shield/T asset is integrated verbatim the moment the files are delivered. A missing logo must **not** block the initial shell scaffold.
2. **Reason:** the approved identity (D-012) must not be redesigned or approximated; blocking the whole shell on an owner-input item would stall Phase 2 for zero technical gain.
3. **Benefits:** shell work proceeds; zero risk to the approved identity; asset swap is a small, isolated change.
4. **Trade-offs:** interim UI is unbranded; window icon remains the Tauri default until files arrive.
5. **Security/performance impact:** none.
6. **Dependencies & milestone impact:** M1 unblocked; asset integration is a small follow-up task touching `assets/logo/`, the shell header, and the window icon set.
7. **Acceptance criteria:** placeholder is visibly neutral (no invented shield/T artwork); when files arrive they are committed unchanged to `assets/logo/` and integrated verbatim; owner visual check confirms the approved asset is unmodified.
8. **Owner approval status:** the **neutral-placeholder approach is explicitly authorized** by the owner's 2026-11-14 correction directive (interim measure). Full logo integration and the standing recommendation remain **Proposed**; **asset delivery is a pending owner action**. Formal recording of the complete decision is recommended once assets are delivered.

## OD-2 — Whisper engine adapter

1. **Recommended decision:** **whisper.cpp (ggml-org) CLI subprocess behind a Rust `TranscriptionEngine` adapter** as the initial integration. A Rust binding may be evaluated **only if** benchmarks or required capabilities demonstrate the CLI architecture is insufficient.
2. **Reason:** the CLI path is the only measured integration (P1-C built and ran the CLI at pinned upstream commit `371b5a7`); subprocess isolation protects the app from engine crashes; the adapter trait keeps a later binding swap cheap.
3. **Benefits:** evidence-backed; crash isolation; no added build complexity; engine invoked per job with nothing resident between jobs.
4. **Trade-offs:** stdout parsing must be version-pinned and tolerant; per-job process spawn cost (negligible against job durations); progress reporting is best-effort (CLI flush semantics are not a contract).
5. **Security/performance impact:** structured, validated process arguments (SECURITY §11); engine-subprocess memory budgeted **separately** (OD-7 methodology); hard-kill fallback after graceful terminate.
6. **Dependencies & milestone impact:** **an M8 decision only** — not an M0/M1 blocker. whisper.cpp stays pinned at the verified upstream commit; no new Rust dependency from the CLI choice.
7. **Acceptance criteria:** adapter passes mock-engine tests (cancel semantics, error mapping) plus real integration on the pinned CLI; cancellation terminates the subprocess safely, cleans temp files, leaves the DB consistent; no resident process after a job ends.
8. **Owner approval status:** **Proposed** — recommended per the owner's 2026-11-14 directive; owner approval not yet recorded; not to be treated as approved until separately recorded in `DECISION_LOG.md`.

## OD-3 — Audio decoding (P-006 path)

1. **Recommended decision:** **FFmpeg as an optional bundled sidecar** for supported audio conversion to 16 kHz mono PCM WAV. The exact FFmpeg build and its licensing are **audited before any distribution**; an **LGPL-compatible build is preferred and a GPL build is never silently bundled**. Users are never required to install Python or PyTorch. Inputs are validated (formats, malformed, oversized rejected safely). Audio decoding stays a separate module from the transcription-engine adapter. If the audit cannot secure an acceptable LGPL build, the fallback is a user-configured external `ffmpeg` path and/or a pure-Rust decoder for common codecs.
2. **Reason:** widest real-world container/codec coverage; decoupling decode from the engine keeps the adapter portable and isolates P-006.
3. **Benefits:** broad format support; single well-tested conversion path to the whisper.cpp input contract.
4. **Trade-offs:** tens of MB installed size; a native binary processing untrusted media (mitigated by validation, size caps, timeouts, current patched build); LGPL compliance obligations before distribution.
5. **Security/performance impact:** bounded subprocess with timeouts and input-size caps (OD-9); typed errors for malformed/oversized inputs; decode memory a separately recorded workload.
6. **Dependencies & milestone impact:** **an M8 decision only** — not an M0/M1 blocker. M8 integration gated on the audit outcome for **bundling/distribution**; dev-machine use may proceed once OD-3 is approved.
7. **Acceptance criteria:** decode suite converts supported inputs to spec-compliant 16 kHz mono PCM WAV; malformed/oversized/unsupported inputs → typed errors, no crash, no orphan temp; audit record (build provenance, configuration, license classification, obligations) exists **before** any bundled distribution.
8. **Owner approval status:** **Proposed** — owner approval not yet recorded; the specific build selection/audit record is also a review item before bundling.

## OD-4 — Database schema v1

1. **Recommended decision:** approve the schema v1 documented in `PHASE_2_ARCHITECTURE.md` §3, with every decision's provenance classified (**[AD]** approved decision / **[P1E]** demonstrated Phase 1 evidence / **[P2R]** new recommendation requiring approval) and this full register reviewed **before M2 implementation authorization**. Key contents: additive versioned migrations; Resource vs Source/Mention identity kept distinct; stable UUIDv7 TEXT identifiers; **no automatic destructive similarity merges**; explicit user-confirmed merges; transactional merge with reversible snapshot/history; transcript segments with timestamps and stable ordering; **no invented confidence scores**; **SQLite WAL enabled only after concurrency and backup tests pass**; defined migration failure/recovery behavior; attachments support (three storage categories).
2. **Reason:** consolidates approved decisions, Phase 1 evidence, and new Phase 2 recommendations into one reviewable, honestly-labeled schema — the P1-F 9/9 result validates the *mechanisms*, not every new table or policy.
3. **Benefits:** M2 starts against a reviewed schema with no hidden assumptions; provenance makes later disputes traceable.
4. **Trade-offs:** one more owner review step before implementation.
5. **Security/performance impact:** FK enforcement always on; no secrets in DB fields; WAL gated by tests; attachment files kept out of the DB (metadata + SHA-256 only).
6. **Dependencies & milestone impact:** **blocks M2**; M5 (attachments UI) and M9 (backup incl. attachments) build on it.
7. **Acceptance criteria:** provenance table reviewed; approval recorded in `DECISION_LOG.md` as Approved; M2 migrations implement exactly the approved schema.
8. **Owner approval status:** **APPROVED WITH AMENDMENTS — D-026 (2026-11-14).** Schema v1 is approved subject to the six mandatory amendments, incorporated in `PHASE_2_M1_DATABASE_DESIGN.md` v1.1; the schema approval gate for M1-G2/M2 is cleared. Implementation remains separately unauthorized.

## OD-5 — YouTube sources

1. **Recommended decision:** Phase 2 supports **adding a YouTube URL as a source record** (URL preserved, `playback_type=Embed` capability note, status lifecycle) **plus user-provided transcript or audio import** processed through the Tier 3 path. **Automated YouTube ingestion (metadata/captions/audio retrieval) is deferred** until a policy, reliability, and technical review.
2. **Reason:** automated platform access raises ToS, availability, and credential questions needing their own review; the user-assisted path delivers transcript-driven value now with zero platform-side risk.
3. **Benefits:** honest capability; no fragile scraping dependency in the core release; adapter slot preserved.
4. **Trade-offs:** manual effort to supply transcripts/audio for YouTube sources.
5. **Security/performance impact:** no automated YouTube network surface in Phase 2.
6. **Dependencies & milestone impact:** M3 implements URL-record + user import; automated YouTube work is a future decision, not a Phase 2 deliverable.
7. **Acceptance criteria:** a YouTube URL can be saved as a source with correct metadata and status flow; user transcript/audio imports process through the standard Tier 3 pipeline; no automated YouTube fetch code ships in Phase 2.
8. **Owner approval status:** **Proposed** — owner approval not yet recorded; any future automated ingestion needs a new owner decision with policy review.

## OD-6 — Content Security Policy baseline (development and production policies separated)

1. **Recommended decision:** two explicit CSP configurations (details and exact directives in `PHASE_2_ARCHITECTURE.md` §7.3):
   - **Production (`app.security.csp`):** strict — `default-src 'self'`; **no remote script or style origins; no `unsafe-eval`; no unnecessary WebView network access** (the frontend performs no fetches; network lives in the Rust core); **no disabling certificate or security checks**; only explicitly required local application resources (plus the Tauri 2 IPC allowances required for `invoke()`); inline assets only via build-pipeline hashes/nonces as Tauri provides.
   - **Development (`app.security.devCsp`):** the production base **plus only the restricted local development-server connectivity Vite/HMR requires** (dev-server origin, HMR websocket on the dev port, dev-time inline styles injected by the HMR runtime). **No arbitrary remote script origins. No development exception is carried into production builds.**
   - **Automated configuration checks** (`scripts/check-csp`): parse `tauri.conf.json` and prove the production CSP is strict and that dev-only allowances never appear in it; run at M0, M1, and M10.
2. **Reason:** closes the P1-I carry-forward (PoC shells shipped `csp: null`) without breaking dev ergonomics; separating the two configurations prevents dev exceptions leaking into production.
3. **Benefits:** eliminates remote-content/script-injection classes in the renderer; verifiable, not aspirational.
4. **Trade-offs:** small build-configuration effort; dev conveniences must be re-justified whenever tooling changes.
5. **Security/performance impact:** high security benefit; negligible runtime cost.
6. **Dependencies & milestone impact:** lands in M0 (both configurations + the check script); re-verified M1/M10. **M0 implementation authorization is gated on this OD's approval** (see readiness matrix).
7. **Acceptance criteria:** production CSP present, strict per the directives above; `devCsp` differs only by the enumerated dev allowances; the automated check passes on every relevant build; devtools negative checks (remote origin fetch/script blocked) in the production build; HMR functional in dev.
8. **Owner approval status:** **Approved — D-022 (2026-11-14, explicit owner instruction, recorded in `DECISION_LOG.md` §4).** The approval clears M0's approval gate; implementation still requires separate M0 authorization, and CSP behavior on the real build remains NOT VERIFIED until M0 executes its tests.

## OD-7 — Performance budget methodology and targets

1. **Recommended decision:** **retain the 150 MB idle private-bytes planning target** (already approved via D-019) with an explicit methodology: private bytes measured over the **complete application process tree** (Rust main process + every WebView2 child the application spawns), with **idle, startup, search, and transcription recorded as separate workloads**; engine/decode subprocess memory measured as its own workload row and never folded into idle budgets; acceptance criteria never weakened.
2. **Reason:** removes ambiguity (WebView2 children dominate the number); separates idle honesty from heavy-work reality.
3. **Benefits:** reproducible, honest numbers; prevents a transcription job being judged against an idle target.
4. **Trade-offs:** process-tree aggregation needs more tooling than single-process counters.
5. **Security/performance impact:** methodology only.
6. **Dependencies & milestone impact:** scripts at M0 (baseline) and M10 (full report); per-workload rows in the performance budget document.
7. **Acceptance criteria:** methodology documented + scripts committed; M10 report shows the separate workload rows over the full process tree; misses reported as misses.
8. **Owner approval status:** **APPROVED — D-026 (2026-11-14):** the process-tree methodology and five-workload separation are approved and operate as **enforceable gates**. The 150 MB idle private-bytes target remains **Approved via D-019** (separate target approval preserved).

## OD-8 — Svelte UI primitives

1. **Recommended decision:** **lightweight, accessible in-house Svelte 5 primitives** (Tailwind + Lucide). **Avoid a heavy UI framework** unless a real requirement justifies it. `bits-ui`/`melt-ui` are **not adopted**. Accessibility is proven by explicit tests, not ARIA presence (test plan in `PHASE_2_MILESTONES.md` M1).
2. **Reason:** minimizes dependencies; exact control over the approved design system; Svelte 5 runes make small primitives cheap to own.
3. **Benefits:** zero additional UI dependencies; smaller bundle; no third-party abstraction over design tokens.
4. **Trade-offs:** development/maintenance effort in-repo; **accessibility correctness is our responsibility** — mitigated by WAI-ARIA APG patterns and the explicit M1 test plan (focus traps, Escape behavior, focus return, roles/states synchronization, automated a11y checks, manual keyboard walkthrough, manual screen-reader smoke test).
5. **Security/performance impact:** smaller supply-chain and bundle surface.
6. **Dependencies & milestone impact:** M1 builds the primitive set; `lucide-svelte`, `clsx`, `tailwind-merge` are the only M1 additions. **M1 implementation authorization is gated on this OD's approval** (see readiness matrix).
7. **Acceptance criteria:** primitives cover button, card, badge, table, dialog, sheet, dropdown, tabs, toast, tooltip, input; **the full M1 accessibility test plan passes** (per-primitive automated suites + manual keyboard walkthrough + manual screen-reader smoke test); visible focus, labels, reduced-motion verified.
8. **Owner approval status:** **Approved — D-023 (2026-11-14, explicit owner instruction, recorded in `DECISION_LOG.md` §4).** The approval clears M1's approval gate; M1 still requires M0 completion and separate M1 authorization, and all accessibility claims remain NOT VERIFIED until M1 executes TEST-09.

## OD-9 — Intake size limits and safe parsing

1. **Recommended decision:** **file-type-specific size limits, configurable in Settings**, with defaults: local audio/video intake 100 MB/file; archive formats 50 MB **with archive-bomb protection** (extraction-ratio, entry-count, nesting-depth caps); documents/text 20 MB; pasted text 5 MB; HTTP response cap 5 MB. Validation-first parsing; malformed inputs → typed errors with clear messaging and safe override affordances.
2. **Reason:** resolves P-027 / MASTER_BRAIN C8 with evidence-informed defaults while keeping the user in control.
3. **Benefits:** bounded memory/disk; explicit failures; abuse resistance.
4. **Trade-offs:** conservative defaults may reject legitimate large media without an override; overrides configurable and logged.
5. **Security/performance impact:** bounds decode memory and disk growth; archive-bomb caps prevent extraction DoS.
6. **Dependencies & milestone impact:** M3 (intake), M4 (response caps), M8 (decode bounds), M9 (backup size).
7. **Acceptance criteria:** limit matrix tested (each default, each override path, each typed error); archive-bomb negative test passes; no crash paths for malformed inputs.
8. **Owner approval status:** **M1 INTAKE SUBSET APPROVED — DP-07, D-026 (2026-11-14):** exactly as ruled — **100 MB media, 20 MB documents, 5 MB pasted text, configurable logged overrides.** **Not covered by the ruling and therefore still Proposed:** the archive-format intake limit (50 MB default) and the HTTP response cap (5 MB) — M1 rejects archives as sources entirely and the HTTP cap attaches to the post-M1 web-ingestion milestone; both require explicit owner approval with that work.

## OD-10 — Whisper model catalog and defaults

1. **Recommended decision:** **no model bundled in the installer.** Catalog: **Base multilingual = initial default**, **Small = optional quality**, **Tiny = low-resource**, **Medium = advanced** (documented non-real-time on the reference hardware). Download only on explicit user choice; storage **outside the application directory**, configurable (preferred default `D:\Models\whisper`); integrity via **trusted checksums** from a pinned, versioned registry; **size, estimated storage, and hardware suitability displayed before download**; removal and inventory supported.
2. **Reason:** implements MASTER_BRAIN F2 with the Phase 1 measured baseline.
3. **Benefits:** small installer; user-controlled disk spend; honest hardware guidance.
4. **Trade-offs:** first-use friction; registry maintenance as upstream models evolve.
5. **Security/performance impact:** checksum verification prevents tampered models; no bundled payload keeps the installer in range; models outside the app dir.
6. **Dependencies & milestone impact:** M8 (model manager, downloader, settings UI); registry format in the Whisper section of the architecture document.
7. **Acceptance criteria:** negative test — no network download without explicit consent; checksum mismatch → typed error + discard; disclosure accurate with the fixture-scope caveat; removal updates inventory with no orphans.
8. **Owner approval status:** **Proposed** — owner approval not yet recorded.

## OD-11 — Transcription durability and multilingual testing before M8 closure

1. **Recommended decision:** **M8 cannot close** until representative owner-provided fixtures exist and tests run for: **long-duration** (≥90 s, ideally 5–10 min) transcription, **cancellation and recovery**, and **Urdu, English, and Urdu-English mixed-language** transcription checks.
2. **Reason:** Phase 1 established only a short English baseline. **Urdu, Roman Urdu, and mixed-language quality are not proven** and must not be claimed.
3. **Benefits:** M8 closure rests on evidence across the owner's actual language use.
4. **Trade-offs:** owner effort sourcing fixtures; results may reveal real limitations (recorded honestly).
5. **Security/performance impact:** long-duration runs validate temp-cleanup and memory gates; cancellation/recovery tests validate DB consistency under interruption.
6. **Dependencies & milestone impact:** **gates M8 closure**; feeds the M10 report.
7. **Acceptance criteria:** fixtures documented with provenance and authorization; tests executed with results recorded (pass/fail, no silent promotion); the UI states honestly what quality is/isn't validated.
8. **Owner approval status:** direction **Proposed**; **fixture supply is a required owner action** — M8 closure is blocked until fixtures are provided and tests are recorded.

## OD-12 — Exposed OpenRouter key (carryover security action)

1. **Recommended decision:** the **owner revokes** the previously exposed OpenRouter key in the provider dashboard. **API activation remains blocked** until secure provider configuration exists **and** the owner explicitly approves activation (D-019 per-execution rules continue to apply).
2. **Reason:** a clean repository does not make a leaked key safe (GATE1 §4); standing owner security action since D-019/D-021.
3. **Benefits:** closes the credential-incident loop before any Phase 3 live work.
4. **Trade-offs:** none for Phase 2 (no credentials exist in Phase 2).
5. **Security/performance impact:** security hygiene only.
6. **Dependencies & milestone impact:** gates Phase 3 live-API work; no Phase 2 milestone depends on it.
7. **Acceptance criteria:** owner confirms revocation; no agent involvement (SECURITY §6.4).
8. **Owner approval status:** **owner action** — no agent action permitted or needed.

---

## Register summary

| ID | Short name | Status |
|---|---|---|
| OD-1 | Logo files (P0-T08) | **Placeholder approach explicitly authorized** (owner directive 2026-11-14); full decision Proposed; **asset delivery = owner action** |
| OD-2 | Whisper engine adapter = CLI subprocess | **Proposed** — M8 decision only, not an M0/M1 blocker |
| OD-3 | FFmpeg sidecar + licensing audit | **Proposed** — M8 decision only; audit review required before bundling |
| OD-4 | Schema v1 (provenance-classified) | **APPROVED WITH AMENDMENTS — D-026** (schema gate cleared; implementation separate) |
| OD-5 | YouTube: URL + user import; automated deferred | **Proposed** |
| OD-6 | Strict CSP (dev/prod split + automated checks) | **Approved — D-022** (M0 approval gate cleared; implementation authorization separate) |
| OD-7 | 150 MB target + process-tree methodology | Target **Approved (D-019)**; methodology **APPROVED — D-026** (enforceable gates) |
| OD-8 | In-house Svelte primitives | **Approved — D-023** (M1 approval gate cleared; M1 still needs M0 + separate authorization) |
| OD-9 | Type-specific limits + archive-bomb protection | **M1 intake subset APPROVED — DP-07/D-026** (100/20/5 MB + logged overrides); archive/HTTP subsets **Proposed** |
| OD-10 | No bundled models; Base default | **Proposed** |
| OD-11 | M8 closure gates (long-duration/cancel/multilingual) | **Proposed**; **fixture supply = owner action — gates M8 closure** |
| OD-12 | Key revocation | **Owner action** (standing security item) |

**Rule:** recommendations must not be converted into approvals by repetition or implementation. Owner approval is recorded only in `DECISION_LOG.md`. The implementing agent must not treat this register as authorization to implement.

---

**End of PHASE_2_OPEN_DECISIONS.md**
