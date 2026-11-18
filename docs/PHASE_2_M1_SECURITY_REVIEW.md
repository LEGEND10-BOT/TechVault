# TechVault Phase 2 M1 — Security Review

**Document status:** v1.1 (2026-11-14, owner rulings recorded — see revision note below). Planning specification — **no implementation authorized.**
**v1.1 changes (owner directive §C, recorded as DP-04 APPROVED WITH AMENDMENTS / D-026):** the style-src condition strategy is fixed — production CSP remains strict under D-022 (D-024's dev-only exception unchanged); a short, time-boxed investigation of the Svelte runtime style-src event is conducted; if the runtime event cannot reasonably be eliminated, it is documented and accepted as a known condition; an **enforceable application coding rule prohibits `style:` directives and `style=` attributes in application components**, enforced by extended automated CSP checks; **no production hash allowance is introduced and CSP is not weakened — any such change requires separate owner authorization.** DP-13/OD-7 is APPROVED: performance criteria are enforceable gates. §8.1 rewritten accordingly.
**v1.0:** Prepared Draft (2026-11-14). Applies the SEC-01..20 requirement set (`PHASE_2_TRACEABILITY_MATRIX.md` §4) to M1 scope, inherits the independent audit's security assessment (PASS WITH CONDITIONS — every condition is a stated future test), and treats the two inherited M0 conditions as explicit M1 review items. Threat posture: **M1 adds zero network surface** — every security boundary below is local (filesystem, database, IPC, archive, UI rendering).

---

## 1. Threat model for M1 scope

| # | Threat | M1 exposure | Primary defense |
|---|---|---|---|
| T1 | Path traversal via crafted filenames/paths | attachment import, backup extraction | internal UUID filenames; `original_name` display-only; safe joins + negative tests (SEC-07) |
| T2 | Malicious file content executed/rendered | imported files, pasted text | content stored as data; never rendered as HTML; strict CSP; frontend performs no fetches |
| T3 | Resource-exhaustion intake (huge/deep files) | file import | OD-9 type-specific limits, validation-first parsing, streamed hashing (no full-file memory), bounded jobs |
| T4 | Malicious "backup" archive (zip bomb, traversal entries, tampered manifest) | restore/import of archives | only the app's own format accepted; ratio/entry/depth/size caps; hash-verified manifest; fresh-workspace restore (SEC-14) |
| T5 | Data corruption / partial writes | DB + filesystem | transactions everywhere; guarded migrations; integrity checks; atomic rename placement; validated restore |
| T6 | Secret leakage | logs, bundles, exports | Phase 2 stores no credentials; secret-free logging rules (SEC-15); placeholder-only provider configs (SEC-16); log + bundle scans |
| T7 | IPC over-privilege | new plugins | least-privilege capability file; `dialog` plugin arrives only at G4 with a used-API audit (SEC-04); zero unused grants |
| T8 | CSP regression on real UI | G1/G9 UI work | D-022: production CSP strict, dev allowances isolated, `check-csp` at G1+G12; devtools negative checks |
| T9 | SSRF / network abuse | **none — no network code in M1** | structural absence; the SSRF suite (SEC-08..13/TEST-05) belongs to the post-M1 web-ingestion milestone, unchanged |
| T10 | Supply chain | new dependencies | milestone-scoped adoption; lockfiles; pins; audits at Phase 2 closure; license verification at adoption |

## 2. Requirement mapping (SEC rows applicable to M1)

| ID | Requirement | M1 treatment |
|---|---|---|
| SEC-01/02/03 | Strict production CSP; dev isolation; automated check | **D-022 approved.** Re-verified at G1 (real UI) and G12; `check-csp` extended if new asset classes appear (none planned); devtools negative checks on the release build |
| SEC-04 | Least-privilege capabilities | zero-grant baseline preserved; `tauri-plugin-dialog` added at G4 **only** with the minimal permission set + audit note; no `opener`/`fs`/`http` plugins |
| SEC-05/06 | Typed IPC; validated payloads | M0 envelope extended per command family; every new command validates args before service calls (oversized/invalid → typed `validation.*`) |
| SEC-07 | Safe filesystem; traversal protection | storage design §3–§5; traversal negative-test suite at G3/G10 |
| SEC-08..13 | SSRF pipeline, redirects, blocklist, TLS, fetch caps | **Not exercised in M1** (no network) — requirements remain attached to the post-M1 web milestone, unchanged |
| SEC-14 | Safe archive extraction; zip-bomb caps | backup restore (G10) + data-import attachment sidecars (G11); TEST-08 negative suite |
| SEC-15 | Secret-free logs | M0 logger unchanged; new services log names/outcomes/counts only; log review at G12 |
| SEC-16 | No keys in frontend; providers disabled | unchanged; provider settings section renders placeholders only; bundle scan at G12 |
| SEC-17 | Model checksum verification | n/a in M1 (no models) — attaches to the transcription milestone |
| SEC-18 | No-encryption-at-rest documented accurately | Settings → Backup notes + docs state the limitation explicitly; never claimed secure |
| SEC-19 | Dependency/license audits | formal gates remain at Phase 2 closure; M1 keeps the inventory current at each adoption |
| SEC-20 | Concrete negative-test suites | TEST-06 (intake), TEST-08 (archive), traversal suite, job/crash consistency tests — gate-assigned |

## 3. Database security

FK enforcement always on · no secrets in any DB field · attachments stored as metadata+hash+relative path (binaries out of the DB) · DB-directory ACLs restricted to the user · corruption → typed error + restore guidance, never silent auto-repair · WAL enabled only after its evidence gate (concurrency + backup-under-WAL) — otherwise the tested DELETE-journal mode ships.

## 4. Filesystem and intake security (G3/G4)

Internal filenames only; two-level sharding; atomic rename placement (no partially-written finals); temp workspace ownership+age-validated cleanup; original names length-capped and sanitized for display; magic-byte type validation (extension never trusted); OD-9 size limits with typed errors naming the limit; archives rejected as source material; overrides configurable and logged; no shell invocation anywhere in M1 (no external process arguments exist — that surface arrives with the transcription milestone's subprocess work and its own review).

## 5. UI rendering security

All imported content is data: evidence snippets, descriptions, and pasted text render as text nodes — no `innerHTML`, no markdown-to-HTML rendering of untrusted content in M1 (if a future feature wants rich rendering, that is a new decision with a sanitizer review) · CSP blocks inline script/style (dev exception confined per D-024) · no remote images/fonts (all assets bundled) · external links never auto-opened (no opener plugin; any future "open in browser" affordance is a separate reviewed feature).

## 6. Logging and diagnostics

M0 rotating size-capped logger reused. M1 additions follow the same rules: command names + outcomes + error codes + counts; never transcript/paste/file content, never full paths beyond the configured roots, never hashes-of-secrets (none exist). Diagnostics export (G12, optional) is sanitized and user-triggered.

## 7. Crash-recovery security

Startup sweep validates ownership+age before deleting temp entries; orphan quarantine (M1-OD-8) prevents crash-orphan user files from being silently destroyed; restore never overwrites the live DB without validation + safety backup; interrupted jobs leave typed, retryable states — no half-committed data is ever presented as committed.

## 8. Inherited condition 1 — production-CSP `style-src` console event (DP-04 APPROVED WITH AMENDMENTS, D-026)

**Facts (from M0 closure evidence, plus this audit's grep):** the release console records exactly one error-level entry — a CSP `style-src 'self'` enforcement event caused by an inline style applied by the Svelte 5 client runtime chunk (`sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo=`); zero application errors; the production CSP is behaving exactly as D-022 requires. The independent audit additionally verified that **M0 application code contains zero `style:` directives and zero `style=` attributes** — the event originates in the Svelte runtime/SvelteKit internals, not in TechVault code.

**Recorded ruling (owner directive §C, D-026):**
1. Production CSP remains **strict under D-022**; the D-024 development-only exception is unchanged.
2. A **short, time-boxed investigation** of the Svelte runtime style-src event is conducted (G1): identify the runtime call site and eliminate it only if it can reasonably be done without weakening CSP.
3. If the runtime event **cannot reasonably be eliminated**, it is **documented and accepted as a known condition** — M1's console criterion becomes "zero application errors; the documented runtime CSP-enforcement event is listed as a known condition" (the v1.0 Option C).
4. An **enforceable application coding rule prohibits `style:` directives and `style=` attributes in application components** (A-6): CSS classes and design tokens only — enforced by an extended `scripts/check-csp` assertion (and/or lint) so application code can never regrow inline-style CSP events.
5. **No production hash allowance is introduced and the CSP is not weakened.** Any such change (v1.0 Option B) requires separate owner authorization and is not part of this ruling.

**G1 evidence obligations:** investigation outcome recorded (eliminated, or accepted-as-condition with the time-box result); extended check-csp passing with the new inline-style assertion; production CSP runtime probes unchanged and strict.

## 9. Inherited condition 2 — D-025 kit-3 dependency assessment (M1 dependency review)

**Facts:** `npm audit` at M0 reported 5 low-severity findings (GHSA-pfhg-q3qv-9q6r + GHSA-27mw-82g8-phjj in `@sveltejs/kit` 2.70.4; GHSA-pxg6-pf52-xh8x in `cookie` 0.6.0; GHSA-gcqx-w48m-w2h4 in `deepmerge` 4.3.1 — no patched deepmerge release exists), all in dev/build/server paths the production static SPA does not execute. D-025 deferred the only complete fix — the breaking `@sveltejs/kit` 3.2.0 + `adapter-static` 4.0.1 major — to this review.

**Assessment plan (before G1 adoption decisions):** compatibility spike (Svelte 5 API usage, adapter-static 4 config, `check-csp` against the new build) → full regression pass (svelte-check, vitest, cargo suite unaffected, dev HMR, release build, CSP config + runtime probes) → adopt **only if every check is green**; otherwise stay on 2.x with the documented risk assessment, and re-check `deepmerge` upstream at every toolchain upgrade + at the closure audit. Per D-026 ruling 12: if the outcome is **adopt**, it is recorded as its own decision record in `DECISION_LOG.md`; if the outcome is **stay on 2.x**, a dated note under the D-025 entry suffices. The D-025 deferral decision itself is unchanged. *(F-1 correction applied 2026-11-14 — the prior sentence contradicted D-026 ruling 12.)*

**Outcome (2026-11-14, G1 pre-task):** the assessment executed; **every leg green — kit 3.2.0 + adapter-static 4.0.1 ADOPTED**, recorded as its own decision record **D-027**. Breaking changes migrated (kit config inline in the Vite plugin, flattened namespace, `$lib`→`#lib`, tsconfig `$app/tsconfig`); `npm audit` 5 low → 4 low (only the unpatched-upstream `deepmerge` dev/build chain remains — re-check obligation retained). CSP configuration, capability files, and the runtime CSP posture verified unchanged on the kit-3 release build. Evidence: `docs/phase2-results/m1/kit3-assessment.md`.

## 10. Security acceptance for M1 (embedded in gate exits)

G1: `check-csp` green on the real UI; devtools negatives on the release build; console state per the recorded DP-04 ruling (D-026) · G2: FK/integrity/migration-failure tests · G3: traversal negatives; orphan sweep behavior · G4: OD-9 limit matrix + malformed-input negatives; capability audit for the dialog plugin · G8: query-escaping tests · G10/G11: archive/zip-bomb/traversal/restore-safety suite · G12: consolidated security closure (bundle scan, log review, secret scan, capability audit vs used APIs, dependency inventory refresh) — with the formal `cargo audit`/`npm audit` gates still scheduled at Phase 2 closure.

---

**End of PHASE_2_M1_SECURITY_REVIEW.md**
