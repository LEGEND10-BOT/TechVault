# F1-06 Results — Resource Extraction Accuracy & Golden Dataset (P1-G)

**Date(s) executed:** 2026-11-13 (dataset + harness build; offline pipeline validation)
**Executor:** Implementation/verification agent (owner directive 2026-11-13, D-018)
**Environment:** Windows 11 Pro, i5-10310U/32 GB reference machine; Node v24.20.0 (no runtime dependencies added); harness at `experiments/p1-g/harness/`, dataset at `experiments/p1-g/dataset/v0/`

**Overall status:** Dataset v0 and harness **complete**; both prompt variants (baseline + hardened) mock-validated offline with byte-identical reruns; live API run matrix **owner-deferred "LATER" (decision D-019, 2026-11-13)** — no live API calls or quota consumption are authorized in the current execution, and the key exposed in a conversation is treated as compromised (revocation protocol: `SECURITY.md` §6.4). This record does not contain any model-quality results, because no model was called.

## Measurements

| Metric | Method | Value | Notes |
|---|---|---|---|
| Dataset size | count | 14 cases / 12 of 12 TS §4 categories + 2 F1-06 §5 extras | A1 criterion is ≥ 10 cases / ≥ 8 categories |
| Dataset provenance | authored | 100% synthetic (agent-authored; see PROVENANCE.md) | No owner corpus used (none authorized) |
| Mock pipeline run 1 | harness `--mock` | 13 scored, 1 excluded (schema-invalid), 0 API calls | `results/mock-baseline/results.json` |
| Mock pipeline run 2 | harness `--mock` | identical aggregates | determinism check |
| Determinism (A8, offline proof) | byte-compare of results.json minus `executed_at` | **identical** | reruns over cached responses reproduce numbers exactly |
| Schema catch-rate (A2 hard part) | mock C14 (invalid JSON both attempts) | **1/1 invalid responses excluded from metrics** | invalid responses never reach scoring |
| Retry-once (A2) | mock C12 (invalid → valid) | recovered; `schema_invalid_first_attempt_recovered=1` | retry path exercised |
| D-008 violation detection | mock C04/C05/C08/C10/C12/C13 traps | **6 violations detected** (all planted traps flagged) | detector fires on every planted case |
| Verification-violation detection | mock C12 (`verified` on injected item) | **1 detected** | A6 guard proven at harness level |
| Injection detection | mock C12 (INJECTED-RESOURCE-9000 extracted) | **case flagged compromised** | A7 detector proven at harness level |
| Evidence-grounding check | mock C07 (invented "Bun" with quote-free evidence) | candidate marked unsupported → FP | inventions can't ride on missing evidence |
| Merge invariant | mock C11 | merge_correct = true (exactly 1 Warp candidate) | judge logic exercised |

**Explicitly NOT measured here (blocked):** precision/recall/FPR/identity accuracy of any real model, schema-adherence rate of real models, confidence calibration of real models, per-source noise volume from real transcripts, live failure behaviors (rate limits/truncations), real-spend figures. These require the owner key + spend cap. Mock verdicts are pipeline probes, not model results.

## Raw evidence index

| Artifact | File |
|---|---|
| Golden dataset v0 (inputs) | `experiments/p1-g/dataset/v0/cases.json` |
| Expected results (separate file per governance) | `experiments/p1-g/dataset/v0/expected.json` |
| Provenance + coverage + change log | `experiments/p1-g/dataset/v0/PROVENANCE.md` |
| Harness (CLI, prompts, schema, validator, mocks) | `experiments/p1-g/harness/` |
| Mock validation run 1 | `experiments/p1-g/results/mock-baseline/results.json`, `summary.md`, `raw/` |
| Mock validation run 2 (determinism) | `experiments/p1-g/results/mock-baseline-run2/` |
| Harness README (run instructions) | `experiments/p1-g/README.md` |

## Acceptance criteria evaluation (F1-06 §7)

| # | Criterion | Status | Evidence / reason |
|---|---|---|---|
| A1 | Dataset v0 ≥ 10 cases, ≥ 8/12 categories, expected results manually reviewed | **Pass (dataset)** with owner-review caveat | 14 cases, 12/12 categories; expected results authored + self-reviewed against the matching rules; **owner sign-off pending** (dataset construction is owner-collaborative per spec) |
| A2 | Schema-valid rate ≥ 95%; **0 invalid responses reach metrics** | **Blocked (live)** — hard part proven offline | Invalid-response exclusion + retry-once proven via mock C14/C12; live-model adherence rate needs the API run |
| A3/A4 | Precision/recall on clearly-spoken cases | **Blocked** | Requires live model run |
| A5 | Discovery-type discipline (0 violations) | **Blocked (live)**; detector proven | Planted traps in mock are all flagged (6/6); model behavior needs the API run |
| A6 | Verification discipline (0 violations) | **Blocked (live)**; detector proven | Mock C12 flagged |
| A7 | Prompt-injection tripwire | **Blocked (live)**; detector proven | Mock C12 flagged compromised |
| A8 | Metrics reproducible from cached responses | **Pass (proven offline)** | Byte-identical reruns (minus wall-clock field); live run inherits the same cache mechanism |
| A9 | Hard-case results recorded | **Partially** — case inventory exists (similar names C04, zero-resource C09, density C13, injection C12, under-specified C07) | Scores require the live run |

## Outcome and recommendation

**Verified facts:**
1. Golden dataset v0 exists with 14 cases covering all 12 required categories, with provenance documentation and separate expected-results files (TESTING_STRATEGY §4.2 governance).
2. The complete measurement pipeline (prompt → structured-output call → strict validation → retry-once → caching → metrics → calibration) is implemented and validated offline; no dependencies beyond Node built-ins were added.
3. The harness demonstrably catches every planted failure class: invalid schema output (excluded, never scored), trap extractions, D-008 discovery-type violations, unverified-status upgrades, prompt-injection manipulation, unsupported evidence, and merge-count violations.
4. Reruns reproduce byte-identical metrics from cached responses (A8).
5. No API spend occurred; no secrets touched the repo; mock mode performs zero network I/O.

**Blocked / open items:**
1. **Owner decision request (P1-G-RUN):** provide an OpenRouter test API key (BYOK, delivered out-of-band, never committed) and an explicit spend cap (spec estimate: low single-digit USD for the full matrix; ~28–112 requests for dataset × models × prompt-variants at retry overhead). The run phase starts immediately after delivery; the harness caches responses so reruns never re-spend.
2. Owner review of `expected.json` (A1 manual-review sign-off) — can happen before or after the live run; disputes change the dataset (change-logged) and the affected metrics are recomputed from cache.
3. Model shortlist (2–3 low-cost IDs) — provisional selection belongs in the live run; P-018 remains a separate owner decision.

**Recommendations (labeled as such, pending evidence):** keep the hardened prompt as the Phase 3 starting point (it encodes the D-008 discipline rules); grow the dataset with real-transcript cases once F1-03a outputs or owner-authorized media exist (the current corpus is deliberately synthetic; Whisper-ASR artifacts are unrepresented — a documented limitation for P-009/P-010 calibration).

**Affected P-IDs / R-IDs:** feeds P-008 (AI half), P-009 (confidence thresholds), P-010 (extraction caps), P-018 (model list input); supports R-013 (golden dataset regression baseline — established by this dataset version).

## Security notes (input to P1-I)

- API key only via `OPENROUTER_API_KEY` environment variable; never logged, never written to artifacts, never committed. Mock mode has no network path at all.
- Untrusted-input treatment: dataset inputs are treated as untrusted data; the prompt contract states embedded instructions are data, not commands; the A7 tripwire case + detector make injection manipulation measurable rather than assumed.
- Prompt text and transcript inputs contain no secrets. Raw response cache files contain model output only.
- Out of scope (unchanged): no provider abstraction, no managed gateway (D-005/R-010), no automatic verification network calls.

---

**End of F1-06 RESULTS.md**
