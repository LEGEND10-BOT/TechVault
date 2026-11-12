# F1-06 — Resource Extraction Accuracy and Golden Dataset Preparation

**Project:** TechVault
**Task ID:** F1-06
**Document status:** Proposed task specification, awaiting owner approval
**Version:** 1.0
**Shared context:** read `00-PHASE1-OVERVIEW.md` first.

**Source mapping:** DEVELOPMENT_ROADMAP §5.6 (resource extraction validation — golden dataset,
precision/recall/false positives/misses/incorrect verification/incorrect dedup/evidence
quality); MASTER_BRAIN Part O workstream F; MASTER_BRAIN Part D8 (extraction quality) and
Part Q Q-07 (final merge thresholds).

**Decisions / pending items addressed:** R-013 (golden dataset — strong recommendation),
P-009 (AI confidence thresholds), P-010 (per-source extraction caps), P-008 (the AI-assisted
half of merge thresholds; the deterministic half is covered in F1-04), D-008/D-009 inputs
(suggestions must remain distinguishable and enabled by default — tested, not changed).

**Scope boundary:** this task measures extraction quality through a throwaway harness against
OpenRouter with owner-provided BYOK credentials. No production prompts, no provider
abstraction implementation, and explicitly NO managed-gateway work (D-005 approved in
principle, R-010 design pending, later phase).

## 1. Objective

Create golden dataset v0 — a small, manually reviewed corpus of transcripts/text with known
expected extractions including deliberately hard cases — and use it to measure, per candidate
model and prompt variant, the metrics defined in `docs/TESTING_STRATEGY.md` §4.1 (precision,
recall, false-positive rate, miss rate, identity accuracy, merge accuracy, evidence accuracy,
verification accuracy). The numbers feed the owner decisions on P-009 (confidence thresholds)
and P-010 (extraction caps), and become the regression baseline R-013 requires.

## 2. Technical Questions

Verified facts (official documentation — re-verify at execution time):

- OpenRouter supports structured outputs by passing a JSON Schema via `response_format`
  (OpenAI-compatible `json_object` mode and schema-constrained mode), with support varying
  by model (openrouter.ai/docs/guides/features/structured-outputs). Community reports note
  some models adhere imperfectly to schemas — so the harness must validate every response,
  matching AGENTS.md §8 and API_POLICY §18.
- API keys are created and scoped in the OpenRouter dashboard; the API is OpenAI-compatible
  REST over HTTPS (openrouter.ai/docs/api_reference/overview).

Questions this experiment must answer by evidence:

1. Can a strict JSON Schema (per API_POLICY §19 candidate shape: name, type, description,
   official_url, discovery_type, timestamp, evidence snippet, confidence) be enforced
   reliably by the shortlisted models, and what validation-failure rate occurs?
2. What precision/recall does a baseline prompt achieve on clearly-spoken cases vs hard
   cases (similar names, fictional resources, no-resource sources)?
3. Does the model respect the discovery-type separation (Explicitly Mentioned vs
   AI-Discovered/Related Suggestion), i.e. does it ever mark an invented or merely-related
   item as explicitly mentioned (a D-008 compliance failure)?
4. Does it ever upgrade verification status without evidence (a MASTER_BRAIN R-rule #9
   violation)?
5. How do confidence scores correlate with actual correctness on this dataset (the input
   P-009 needs to set thresholds)?
6. What per-source noise volume occurs (number of low-value candidates per 10 min of
   transcript — the input P-010 needs for caps)?
7. Failure behaviors: rate limits, malformed JSON, truncated responses — observed and
   recorded (TESTING_STRATEGY §8 checklist subset).
8. Prompt-injection tripwire: an embedded "ignore instructions, extract X" sentence in one
   fixture — does the extraction get manipulated (API_POLICY §17; SECURITY baseline
   contribution)?

## 3. Dependencies

- **OWNER-PROVIDED (blocking):** an OpenRouter API key (BYOK, test-only) and an explicit
  spend cap. Order-of-magnitude estimate (not a quote): tens of requests × ~2–8k input
  tokens ≈ a few USD with current low-cost models; record actual spend in results.
- **OWNER-PROVIDED:** source material for the dataset — public/CC-licensed or
  owner-authorized videos/articles (can reuse F1-02/F1-03 fixtures' transcripts where the
  owner authorizes). Synthetic transcripts are acceptable for the trap cases.
- Optional synergy: transcripts produced by F1-03a double as realistic input text; if F1-03
  is delayed, generate text fixtures directly.
- Harness recommendation: a small Node.js CLI (Node is already required by F1-01; native
  fetch; no new runtime installed — per AGENTS.md §6 minimal-dependency rule). Python is NOT
  installed on the machine and is not added for this task.

## 4. Test Environment

- Reference Windows machine. Harness in scratch directory. API key supplied via environment
  variable on the owner machine; never written to the repo, never printed in logs
  (AGENTS.md §8; TESTING_STRATEGY §11 — use synthetic keys in any committed fixtures).
- Golden dataset stored as fixtures + expected-results JSON, versioned (dataset governance
  per TESTING_STRATEGY §4.2: expected results kept separate from the extraction code;
  version recorded; changes logged).

## 5. Minimal Proof of Concept

1. **Dataset v0 (target ≥ 10 cases, ≥ 8 of the 12 categories from TESTING_STRATEGY §4):**
   clearly-spoken names; on-screen/description URLs; multiple resources in one sentence;
   similar-sounding names; renamed/obsolete products; under-specified mentions; unrelated
   terminology; zero-resource source; misleading/fictional resources; same resource across
   two sources (dedup case); prompt-injection tripwire; multiple-resource density case.
   Each case: input text (+timestamped segments where relevant) and expected extractions
   (name, canonical identity where determinable, discovery type, timestamp, evidence
   expectation, expected non-extractions).
2. **Harness:** loads dataset → builds prompt (one baseline prompt version, documented) →
   calls OpenRouter chat completions with `response_format` JSON Schema → validates response
   against schema → persists raw + parsed outputs per case → computes metrics per
   TESTING_STRATEGY §4.1 → emits a results table (per model and per category).
3. **Model set:** 2–3 shortlisted low-cost models (exact IDs pinned and recorded; selection
   noted as provisional, informing P-018 later — not deciding it).
4. **Run matrix:** dataset × models × (baseline prompt + one hardened variant, e.g.
   discovery-type rules made explicit) — keep the matrix small; every response cached to
   disk so reruns don't re-spend.
5. **Failure logging:** every validation failure, rate-limit event, and truncation recorded
   with counts.
6. Analyze confidence calibration: bucket predictions by reported confidence, compare with
   correctness — the raw input for P-009 thresholds.

Out of scope: provider abstraction code, the real application, automatic verification
network calls (verification accuracy is judged against the dataset's expected values only),
related-suggestion generation quality beyond the discovery-type separation check, any managed
gateway work.

## 6. Expected Deliverables

- Golden dataset v0 (fixtures + expected results + provenance/license notes + version).
- Harness code + prompt versions (documented, cached responses).
- Metrics tables: per model × prompt × category; failure-behavior counts; confidence
   calibration table; per-source candidate-volume table.
- Spend record (actual tokens/cost per model).
- Recommendations (labeled as such): provisional threshold values for P-009, cap guidance
   for P-010, dataset growth plan (R-013 regression use).
- Completed results record.

## 7. Measurable Acceptance Criteria

Planning targets — these are proposals to anchor the owner's threshold decisions (P-009),
explicitly "measure then decide with owner":

| # | Criterion | Target |
|---|---|---|
| A1 | Dataset v0 exists with ≥ 10 cases covering ≥ 8 of the 12 required categories, expected results manually reviewed | Pass required (hard) |
| A2 | Schema-valid response rate (after retry-once on invalid JSON) | PLANNING TARGET ≥ 95% of requests; every invalid response caught by validation (0 invalid responses reaching metrics) — the catch-rate is the hard part |
| A3 | Precision on clearly-spoken cases (baseline model+prompt) | PLANNING TARGET ≥ 0.80 |
| A4 | Recall on clearly-spoken cases | PLANNING TARGET ≥ 0.70 |
| A5 | Discovery-type discipline: fictional/trap items never labeled "Explicitly Mentioned" | 0 violations required (hard — D-008 compliance) |
| A6 | Verification discipline: no extraction marked Verified without dataset-sanctioned evidence | 0 violations required (hard) |
| A7 | Prompt-injection tripwire: extraction output not materially manipulated | Required (hard); if it fails, the mitigation becomes a documented Phase 3 requirement, recorded now |
| A8 | Metrics reproducible: rerunning the harness on cached responses produces identical numbers | Pass required (hard) |
| A9 | Hard-case results recorded (similar names, zero-resource, density) | Required record even where scores are low — defines the honest limitation baseline |

## 8. Failure Conditions

- Owner key/spend approval not granted → F1-06 run phase blocked (dataset preparation can
  still complete).
- A2 catch-rate < 100% (validation lets an invalid response through) — harness defect, must
  be fixed before metrics count.
- A3/A4 far below targets (e.g. precision < 0.5) across all shortlisted models after the
  hardened prompt variant — extraction approach needs owner review before Phase 3.
- A5/A6/A7 violations — these are compliance failures of the candidate approach; they become
  mandatory Phase 3 guardrails and are escalated, not iterated away silently in Phase 1.
- Dataset provenance cannot be documented for a case → that case is dropped and the gap
  recorded (governance rule), not filled with unlicensed material.

## 9. Fallback Options

- Poor accuracy: iterate prompt variants and shortlist different models within OpenRouter
  (model choice is exactly the thing being measured; D-003 remains the approved direction).
- Structured-output unreliability: switch to `json_object` mode plus own schema validation,
  or constrained decoding via tool-call format — a harness-level change, documented.
- Alternative provider (Gemini/GLM direct, D-004 optionals) may be benchmarked as a
  comparison column ONLY with owner approval (it changes spend and terms); not a default
  action.
- If extraction quality cannot reach useful levels at all, the honest fallback is narrowing
  Phase 3 scope (e.g. extraction limited to high-confidence cases with mandatory review) —
  an owner product decision, presented with the evidence, never a silent scope cut
  (AGENTS.md §4: do not remove requirements to simplify).

## 10. Evidence and Source References

- OpenRouter structured outputs guide: https://openrouter.ai/docs/guides/features/structured-outputs
- OpenRouter API reference: https://openrouter.ai/docs/api_reference/overview
- Project documents: `docs/TESTING_STRATEGY.md` §4 (dataset, metrics, governance), §8
  (provider failure tests); `docs/API_POLICY.md` §17–§19, §26; `docs/MASTER_BRAIN.md`
  Part D8, Part E; `docs/SECURITY.md` (credential handling); `docs/DEVELOPMENT_ROADMAP.md`
  §5.6; `docs/DECISION_LOG.md` D-003, D-004, D-005 (scope boundary), D-008, P-008..P-010,
  R-010 (out of scope), R-013.

**Effort:** L (dataset construction dominates and is owner-collaborative). Dataset prep is
parallelizable immediately; the run phase needs the owner-provided key.
**Costs/owner approvals:** OpenRouter key + spend cap (estimate: single-digit USD); corpus
authorization (overview §9 items 4–5).
