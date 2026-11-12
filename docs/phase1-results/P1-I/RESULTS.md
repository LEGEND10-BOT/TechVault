# P1-I Results — Security Baseline Review of Phase 1 Artifacts

**Date:** 2026-11-13
**Reviewer:** Implementation/verification agent (read-only review; no code changed by this review)
**Scope:** security-relevant posture of the executed Phase 1 PoC artifacts: `experiments/p1-a/` (P1-A), `experiments/p1-g/` (P1-G), `experiments/p1-h/` (P1-H). Reference requirements: `SECURITY.md` §7–12, AGENTS.md §8–9, `docs/phase1-plan/00-PHASE1-OVERVIEW.md` §7 (untrusted-data rule).

## 1. Review checklist and findings

| # | Check (task package P1-I) | Finding | Severity | Location |
|---|---|---|---|---|
| 1 | Filesystem permission boundaries (P1-A) | **Pass.** Capability grants `fs:allow-read-text-file` on exactly one fixture directory (`experiments/p1-a/fixtures/allowed/**`); negative tests prove out-of-scope reads (`C:\Windows\win.ini`, `system.ini`) are rejected at the plugin boundary (`results/test-results-release.json`). Dialog selection itself is not a permission grant — a picked system file is still rejected by the fs scope (by design; manual owner pass of the dialog flow remains pending per the closure addendum). | Info | `experiments/p1-a/src-tauri/capabilities/default.json` |
| 2 | No broad filesystem grants anywhere in Phase 1 | **Pass.** P1-G/P1-H contain no fs permissions at all (no Tauri fs plugin; p1-h shell has zero IPC commands). | Info | all three artifacts |
| 3 | No hardcoded API secrets / no key in client code | **Pass.** No secrets in any PoC source. P1-G reads the OpenRouter key exclusively from `OPENROUTER_API_KEY` (env), never logs it, never persists it; mock mode performs zero network I/O. Committed cache files contain model outputs only (verified by design of the writer). | Info | `experiments/p1-g/harness/index.mjs` |
| 4 | No unauthorized external network requests / silent upload | **Pass.** P1-A: no fetch to non-local origins in frontend; Rust side has no HTTP client. P1-G: network only to `https://openrouter.ai/api/v1/chat/completions` in live mode, sends only dataset text + prompt (no local file data, no telemetry). P1-H: page loads only local assets; no outbound calls. | Info | reviewed sources |
| 5 | URL/SSRF posture | **N/A this phase (with note).** No Phase 1 PoC fetches user-supplied URLs; SSRF-relevant behavior belongs to production connectors (Phase 2+). The F1-06 harness posts dataset text to the configured AI endpoint only. Security.md URL-validation requirements remain design requirements for Phase 2, not exercised here. | Info | — |
| 6 | External process arguments | **Pass.** No PoC spawns external processes with user-controlled arguments. The evidence tooling (`measure.ps1`, `dialog-uia-verify.ps1`, `cdp-matrix.mjs`) takes only operator-supplied paths; they run in the dev session, not in any shipped artifact. | Info | `experiments/p1-a/scripts/`, `experiments/p1-h/harness/` |
| 7 | Temp-file handling / leakage | **Pass with notes.** P1-A writes exactly one fixed app-data file (`<app-local-data-dir>/test-results.json`) — app-owned path, no traversal, but **unbounded payload size** (PoC-acceptable; production must limit size per approved storage design). P1-H automation uses `%TEMP%` browser profiles and cleans them on the next run (best-effort `rmSync`; Windows file locks can leave residue — dev-tooling only). | Low | `lib.rs save_test_results`, `cdp-matrix.mjs` |
| 8 | Prompt-injection resistance (F1-06 tripwire) | **Framework proven; model behavior pending.** The dataset's injection tripwire (C12) and the harness detector make injection manipulation measurable; prompts instruct that embedded instructions are data. Live-model verdict requires the blocked API run — recorded as blocked, not assumed. | Info | `experiments/p1-g/` |
| 9 | Credential storage | **Pass.** No user credentials in any PoC. BYOK handling (P1-G) is env-only for the throwaway harness; production BYOK storage (R-009 OS secure storage) remains a Phase 3+ design requirement. | Info | — |
| 10 | CSP | **Known limitation (documented).** Both Tauri shells (`p1-a`, `p1-h`) set `csp: null` (template defaults, throwaway PoCs). Any real application must define a restrictive CSP — carried in P1-A limitations and repeated here as a Phase 2 requirement. | Medium (carry-forward) | `tauri.conf.json` (both shells) |
| 11 | Least-privilege permission audit (P1-A) | **Minor finding.** The `opener:default` permission is granted in the capability file but the opener plugin is never invoked by the PoC UI — unused grant; should be removed in any reused shell. Not exploitable as-is (opener:default only opens links in the system browser). | Low | `capabilities/default.json` |
| 12 | Untrusted external content ingestion | **N/A this phase.** No webpage/video ingestion exists in the PoCs (Phase 2 connectors). The F1-06 dataset treats transcript content as untrusted in the prompt contract (API_POLICY §17 alignment). | Info | — |

## 2. Artifacts reviewed (evidence)

- `experiments/p1-a/src-tauri/src/lib.rs` (3 commands; fixed-path evidence sink), `capabilities/default.json`, `tauri.conf.json`, `src/routes/+page.svelte` (no network, dialog flow).
- `experiments/p1-a/results/test-results-release.json` (negative-test evidence).
- `experiments/p1-g/harness/index.mjs`, `validate.mjs`, `prompts.json`, `schema.json`, `mock-responses.json`, `dataset/v0/*` (key handling, injection tripwire, no-secret evidence).
- `experiments/p1-h/src/main.ts`, `src-tauri/*` (no-IPC shell), `harness/cdp-*.mjs` (dev tooling only).

## 3. Carry-forward items for production (Phase 2+)

1. Restrictive CSP required in the production shell (both PoCs ran with CSP unset — documented).
2. Remove unused `opener:default` grant if the p1-a capability file is ever copied as a base.
3. Bound the size of any "save results" style command payload; route production evidence through the approved storage design.
4. URL validation/SSRF defenses (`SECURITY.md` §8–9) must land with the first real connector — no Phase 1 code exercises them.
5. Prompt-injection guardrails become Phase 3 requirements per F1-06 §8 if the live A7 run fails (harness detector already in place).

**Verdict:** no high/critical findings in the executed Phase 1 artifacts; 2 low findings and 1 medium carry-forward (CSP), all documented above.

---

**End of P1-I RESULTS.md**
