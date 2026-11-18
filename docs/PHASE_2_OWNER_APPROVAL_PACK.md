# TechVault Phase 2 Owner Approval Pack

**Document status:** Rev 1.0 (2026-11-14) — prepared by the independent engineering audit per the owner directive. **This pack approves nothing.** Every OD below remains **Proposed** until the owner records an explicit approval in `DECISION_LOG.md` using wording of their choice (suggested wording is provided for convenience only).
**Status update (2026-11-14, after pack delivery):** the owner explicitly approved **OD-6 (recorded as D-022)** and **OD-8 (recorded as D-023)** exactly as specified in this pack; entries 1–2 above are now historical recommendations whose approvals are recorded in `DECISION_LOG.md` §4. All other entries remain **Proposed**; the owner-action items (OD-11 fixtures, OD-1 assets, OD-12 revocation) are unchanged. The approvals are **not** implementation authorization.
**Priority order (per the audit):** OD-6 → OD-8 → OD-4 → OD-2/OD-3 → remaining ODs at their milestones. Owner-action items (OD-11 fixtures, OD-1 assets, OD-12 revocation) are listed separately at the end.
**Companions:** `PHASE_2_OPEN_DECISIONS.md` (full 8-point register), `PHASE_2_INDEPENDENT_AUDIT_REPORT.md` (audit basis), `PHASE_2_TRACEABILITY_MATRIX.md` (IDs/milestones).

Per-entry structure: ID · current status · exact question · recommendation · benefits · risks · alternatives · cost/performance implications · milestone affected · unblocked after approval · remains blocked · suggested approval wording.

---

## 1. OD-6 — Content Security Policy (gates unconditional M0)

- **Current status:** Proposed (recorded in `DECISION_LOG.md` §5).
- **Exact question:** Do you approve the two-policy CSP design — a strict production CSP (`default-src 'self'`; no remote script/style origins; no `unsafe-eval`; `connect-src` limited to self + the Tauri IPC allowances; self-hosted fonts; no disabled certificate checks) plus a separately configured development CSP carrying only the Vite/HMR allowances, with an automated `scripts/check-csp` configuration check proving production strictness at M0/M1/M10?
- **Recommendation:** Approve as specified (`PHASE_2_ARCHITECTURE.md` §7.3).
- **Benefits:** closes the P1-I carry-forward (PoC CSP was null); makes renderer remote-content/script-injection classes structurally impossible; verifiable by an automated check rather than intent.
- **Risks:** minor build-configuration effort; dev tooling changes (e.g., a new HMR requirement) must be re-justified against the devCsp allowlist.
- **Alternatives:** looser single CSP (rejected — re-introduces the flagged risk and lets dev exceptions leak); no CSP until Phase 5 (rejected — security regression vs P1-I).
- **Cost/performance implications:** negligible runtime cost; ~one build-config task + one check script.
- **Milestone affected:** M0 (implements + verifies), M1 (re-verified), M10 (final check).
- **Unblocked after approval:** M0 implementation authorization becomes possible (with separate authorization).
- **Remains blocked:** M1 also needs OD-8; M2 needs OD-4; nothing else.
- **Suggested approval wording:** "OD-6 is approved as specified in `docs/PHASE_2_ARCHITECTURE.md` §7.3 and `docs/PHASE_2_OPEN_DECISIONS.md` (strict production CSP, restricted devCsp, automated check-csp). Record as a new approved decision."

## 2. OD-8 — In-house Svelte 5 UI primitives (gates unconditional M1)

- **Current status:** Proposed.
- **Exact question:** Do you approve lightweight in-house accessible Svelte 5 primitives (Tailwind + Lucide, WAI-ARIA APG patterns, no third-party UI framework), with accessibility proven by the explicit M1 test plan (automated per-primitive suites + manual keyboard walkthrough + manual screen-reader smoke test)?
- **Recommendation:** Approve as specified.
- **Benefits:** zero additional UI dependencies; exact fit to the approved design system; smaller bundle/supply-chain surface.
- **Risks:** development and maintenance effort in-repo; accessibility correctness is our responsibility — mitigated by APG patterns + TEST-09 suites (focus traps, Escape, focus return, roles/states, visible focus, labels, reduced motion).
- **Alternatives:** bits-ui/melt-ui (headless libraries — rejected per your 2026-11-14 directive; would need a new decision); hand-rolled without a formal test plan (rejected — untestable claims).
- **Cost/performance implications:** slightly more M1 effort than a library; no runtime overhead; bundle smaller.
- **Milestone affected:** M1 (builds + tests), M5/M6/M7 (consume primitives).
- **Unblocked after approval:** M1 implementation authorization becomes possible (after M0).
- **Remains blocked:** nothing OD-specific.
- **Suggested approval wording:** "OD-8 is approved as specified (in-house Svelte 5 primitives per `docs/PHASE_2_MILESTONES.md` M1 with the stated accessibility test plan). Record as a new approved decision."

## 3. OD-4 — Database schema v1 (blocks M2)

- **Current status:** Proposed — **blocks M2**.
- **Exact question:** Do you approve production schema v1 exactly as documented in `PHASE_2_ARCHITECTURE.md` §3.2–§3.8 — Phase 2 entity set including the new `attachments` and `resource_tags` tables, provenance classification of every decision ([AD]/[P1E]/[P2R]), additive guarded migrations with defined failure/recovery, transactional merge with snapshot/undo/`merged_into` marker, transcript segments with stable ordering, WAL enabled only after concurrency AND backup-under-WAL tests, no invented confidence scores — acknowledging that P1-F's 9/9 validates the mechanisms, not the entire schema?
- **Recommendation:** Approve; the P1-evidenced items carry measured support and the new items are minimal and each has a named test.
- **Benefits:** M2 (and everything downstream) starts against a reviewed schema; provenance makes future changes traceable.
- **Risks:** late schema changes after data exists are expensive — this review is the cheap moment.
- **Alternatives:** defer schema approval (blocks the whole Phase 2 chain); approve with amendments (state them explicitly — each amendment re-enters this pack).
- **Cost/performance implications:** none beyond the documented budgets; FTS/attachment/tag designs follow the lightweight invariants.
- **Milestone affected:** M2 (blocked), M3/M5/M6/M9 (build on it).
- **Unblocked after approval:** M2 (then M3→M4, M5→M6→M7, M9).
- **Remains blocked:** M8 (OD-2/OD-3/OD-10/OD-11 + M3).
- **Suggested approval wording:** "OD-4 is approved: schema v1 per `docs/PHASE_2_ARCHITECTURE.md` §3.2–§3.8 (including `attachments` and `resource_tags`) with the stated provenance classification. Record as a new approved decision."

## 4. OD-2 — Whisper engine adapter (M8 decision)

- **Current status:** Proposed — an **M8 decision only** (not an M0/M1 blocker).
- **Exact question:** Do you approve whisper.cpp CLI subprocess behind a Rust `TranscriptionEngine` adapter as the initial integration, with a Rust binding permitted only if benchmarks or required capabilities later prove the CLI insufficient (new decision required)?
- **Recommendation:** Approve — the only measured path (P1-C built/ran the CLI at pinned `371b5a7`); subprocess isolation; trait keeps a swap cheap.
- **Benefits:** evidence-backed; crash isolation; no added build complexity.
- **Risks:** CLI stdout parsing must be version-pinned and tolerant; graceful-terminate behavior of whisper-cli on Windows is **unproven** (P1-C A5 NOT RUN) — the design degrades safely (hard kill; no partial persistence), and M8 tests must verify actual behavior.
- **Alternatives:** whisper-rs binding (unmeasured, heavier build); paid/cloud STT (rejected — violates local-first/R-007).
- **Cost/performance implications:** negligible spawn cost vs job durations; engine memory is a separate workload (gates corrected in the audit).
- **Milestone affected:** M8.
- **Unblocked after approval:** M8 design freeze (implementation still needs M2/M3 + OD-3 + OD-10 + OD-11 fixtures).
- **Remains blocked:** M8 closure until OD-11 fixtures are tested.
- **Suggested approval wording:** "OD-2 is approved: whisper.cpp CLI subprocess behind a replaceable Rust adapter; any binding switch requires new measured evidence and a new decision."

## 5. OD-3 — FFmpeg audio-decode sidecar (M8 decision)

- **Current status:** Proposed — an **M8 decision only**.
- **Exact question:** Do you approve FFmpeg as the optional bundled sidecar converting supported inputs to 16 kHz mono PCM WAV — with the exact build and licensing audited and recorded **before any distribution** (LGPL build preferred; a GPL build never silently bundled; fallback paths: user-configured external `ffmpeg` and/or a pure-Rust decoder) and no Python/PyTorch requirement?
- **Recommendation:** Approve the direction; the audit record remains a hard gate before bundling.
- **Benefits:** widest real-world codec coverage; decode decoupled from the engine.
- **Risks:** tens of MB installed size; native binary on untrusted media (mitigated: OD-9 validation, size caps, timeouts, patched build); LGPL obligations (dynamic-link configuration or relink offer + notices) must be met.
- **Alternatives:** symphonia-only (narrower coverage, pure Rust — the defined fallback); user-provided ffmpeg (no bundling, setup friction); bundling Python/PyTorch (rejected outright).
- **Cost/performance implications:** installed-size growth recorded against PERF-12; decode is its own workload row.
- **Milestone affected:** M8 (integration; distribution gate), M10 (audit record verified).
- **Unblocked after approval:** M8 decode-path implementation (dev-machine use; bundling still waits for the audit record).
- **Remains blocked:** distribution until the audit record exists.
- **Suggested approval wording:** "OD-3 is approved: FFmpeg sidecar per `docs/PHASE_2_OPEN_DECISIONS.md`, with the build/licensing audit record required before any bundled distribution; fallbacks as documented."

## 6. Remaining ODs (approve at their milestones)

| OD | Exact question (summary) | Milestone | Unblocks | Suggested wording pattern |
|---|---|---|---|---|
| OD-5 | YouTube URL records + user-provided transcript/audio import; automated ingestion deferred until a policy/reliability/technical review? | M3 | YouTube source flows | "OD-5 approved as specified; automated YouTube ingestion requires a future decision." |
| OD-7 (methodology) | Process-tree measurement + five named workloads + RAM gates as corrected by the audit? | M0/M10 | Reproducible reporting | "OD-7 methodology approved as specified; the 150 MB target remains governed by D-019." |
| OD-9 | Type-specific configurable limits + archive-bomb protection + validation-first parsing (defaults as listed, adjustable)? | M3/M4/M8/M9 | Intake validation defaults | "OD-9 approved with the stated defaults (adjustments may be requested)." |
| OD-10 | No bundled models; Base default; Tiny/Small/Medium options; consent-gated checksummed downloads; inventory/removal? | M8 | Model manager implementation | "OD-10 approved as specified." |

## 7. Owner actions (not approvals — physical inputs)

| Item | Exact action | What it unblocks |
|---|---|---|
| OD-11 fixtures | Provide representative fixtures: long-duration (≥90 s, ideally 5–10 min) speech; material for cancellation/recovery runs; **Urdu, English, and Urdu-English mixed** samples (provenance/authorization documented) | M8 closure (until then M8 cannot close) |
| OD-1 assets | Place the approved shield + T logo files (original asset, unchanged) for commitment to `assets/logo/` | Real branding swap in the shell (placeholder remains authorized meanwhile) |
| OD-12 revocation | Revoke the previously exposed OpenRouter key in the provider dashboard (owner-only action; agents never touch credentials) | Phase 3 live-API work (no Phase 2 dependency) |

---

**Rule reminder:** none of the suggested wordings takes effect unless you, the owner, state it and it is recorded in `DECISION_LOG.md` as an approved decision. Everything not approved remains Proposed.

---

**End of PHASE_2_OWNER_APPROVAL_PACK.md**
