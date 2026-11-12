# experiments/p1-g — F1-06 extraction-accuracy harness (throwaway Phase 1 tooling)

This directory is the P1-G package workspace (`docs/PHASE_1_TASK_PACKAGES.md` P1-G / spec `docs/phase1-plan/F1-06-extraction-golden-dataset.md`). It contains **evidence tooling, not product code**. Nothing here is imported by or into the production application.

## Layout

- `dataset/v0/` — golden dataset v0: `cases.json` (inputs), `expected.json` (expected results, kept separate per TESTING_STRATEGY §4.2), `PROVENANCE.md` (synthetic-provenance statement, coverage table, change log).
- `harness/` — Node CLI (no runtime dependencies):
  - `index.mjs` — loads dataset → builds prompt → calls OpenRouter with a strict JSON Schema (`response_format`) → validates every response → retries once on invalid JSON → persists raw responses to the run's `raw/` cache (reruns never re-spend) → computes metrics (TESTING_STRATEGY §4.1 + D-008/A5/A6/A7 discipline checks + confidence calibration) → writes `results.json` + `summary.md`.
  - `prompts.json` — baseline + hardened prompt variants (documented; the exact Phase 1 matrix).
  - `schema.json` — the output contract (API_POLICY §19 shape; discovery-type enum per D-008).
  - `validate.mjs` — dependency-free JSON-Schema subset validator.
  - `mock-responses.json` — canned payloads (including deliberately invalid and policy-violating ones) used to validate the harness pipeline offline.
- `results/` — run outputs. `mock-baseline/` + `mock-baseline-run2/` are the offline pipeline-validation runs (mock verdicts validate the **harness**, not any model).

## Running

```bash
# offline pipeline validation (no network, no spend)
node harness/index.mjs --mock --prompt baseline --out results/mock-baseline

# live run (requires owner-supplied key via env + spend cap; never commit the key)
OPENROUTER_API_KEY=... node harness/index.mjs --model <openrouter-model-id> --prompt baseline --out results/run1
```

## Status (2026-11-13)

- Dataset v0 + harness: **complete** (mock-validated).
- Live API run matrix: **blocked on owner inputs** — OpenRouter test key + explicit spend cap (Gate 0 item 3a; D-018 item 7 standing rule). See `docs/phase1-results/F1-06/RESULTS.md`.
