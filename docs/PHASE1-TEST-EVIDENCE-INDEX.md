# TechVault Phase 1 — Test Evidence Index

**Date:** 2026-11-13 · Every Phase 1 evidence artifact, by task. All paths relative to `D:\TechVault\` unless marked absolute. No secrets in any listed file (security re-scan 2026-11-13).

## Canonical results records (`docs/phase1-results/`)

| Task | Record | Key raw data |
|---|---|---|
| P1-A / F1-01a | `F1-01/RESULTS.md` · `F1-01/CLOSURE-ADDENDUM.md` | `experiments/p1-a/results/measurements.json`, `test-results-release.json`, `tauri-info.txt`, `screenshots/` |
| P1-C / F1-03a | `experiments/p1-c/results/P1-C-AI-AUDIT-REPORT.md` (corrected RTF authoritative) · `P1-C-RUNNER-FIX-REPORT.md` | `experiments/p1-c/results/P1-C-desktop-results.json`; `results/logs/` (build console, per-model stdout/stderr/JSON, invalid-input rejection, env audit, fix diff/tests) |
| P1-E / F1-02 | `F1-02/RESULTS.md` | `experiments/p1-e/results/webview2-playback.json`, `webview2-playback-visible.json`; fixtures manifest `experiments/p1-e/fixtures/MANIFEST.md` (media gitignored) |
| P1-F / F1-04 | `F1-04/RESULTS.md` | `experiments/p1-f/results/p1-f-results.json` (9/9 ×3 runs — latest rebuilt from clean target on `D:\Builds\cargo-target`) |
| P1-G / F1-06 | `F1-06/RESULTS.md` | `experiments/p1-g/results/mock-baseline*/`, `mock-hardened*/`, `regression-2026-11-13/` (deterministic ×5 total); dataset `experiments/p1-g/dataset/v0/` |
| P1-H / F1-05 | `F1-05/RESULTS.md` | `experiments/p1-h/results/` — 8 Edge + 8 WebView2 JSONs + `webview2-soak10min-20000-labels1.json` |
| P1-I | `P1-I/RESULTS.md` · `P1-I/ADDENDUM-2.md` | scan outputs quoted inside; architecture-preservation checklist |
| P1-J | `P1-J/RESULTS.md` | cites F1-01 measurements.json + P1-C audit §4 for transcription figures |

## Docs & decision evidence

`docs/PHASE_1_STATUS_MATRIX.md` §9 (task statuses) · `docs/PHASE_1_GATE1_READINESS.md` (A–J + K) · `docs/WHISPER_CORE_PLAN.md` (tiers) · `docs/API_CONFIGURATION.md` + `config/api/providers.schema.json` + `config/api/providers.placeholder.json` (offline validation PASS 5/5) · `docs/DECISION_LOG.md` D-014..D-020 (+R-023..R-025, D-020 execution addendum) · `docs/PHASE_0_CLOSURE.md` · `docs/PHASE_HANDOFF.md` §9/§12 · `docs/CHANGELOG.md`.

## Closure-mission deliverables (2026-11-13)

`docs/PHASE1-FINAL-CONSOLIDATED-STATUS.md` · `docs/PHASE1-REMAINING-ACTIONS.md` · `docs/GATE1-FINAL-ACCEPTANCE-REPORT.md` · this index · `experiments/p1-c/results/P1-DOCS-CONSISTENCY-REPORT.md` · `experiments/p1-c/results/P1-BACKUP-SECURITY-CHECK.md`.

## Regression evidence (this mission, 2026-11-13)

| Check | Result | Where |
|---|---|---|
| Runner-fix verification | **8/8 PASS** | `experiments/p1-c/results/logs/runner-fix-test-results.json` |
| P1-G offline mock | **reproduced exactly** (P=0.7778, R=0.9655; detectors fire) | `experiments/p1-g/results/regression-2026-11-13/results.json` |
| P1-F identity harness | **9/9 PASS** (clean rebuild on `D:\Builds\cargo-target`) | `experiments/p1-f/results/p1-f-results.json` |
| P1-A type-check | **0 errors, 0 warnings** | `npx svelte-check --threshold error` (p1-a) |
| Security scan | **clean** (0 tracked secret files; 0 content hits; benign self-match in the security report itself) | `experiments/p1-c/results/P1-BACKUP-SECURITY-CHECK.md` |

## Known-invalid data (disclosed, not hidden)

`experiments/p1-c/results/P1-C-desktop-results.json` fields `fixture.duration_seconds`, all `realtime_factor` values, and null `exit_code`s were produced by the pre-fix runner — superseded by `P1-C-AI-AUDIT-REPORT.md` §4 (corrected RTF) and fixed by the verified runner patch. The file is preserved as original evidence.

---

**End of PHASE1-TEST-EVIDENCE-INDEX.md**
