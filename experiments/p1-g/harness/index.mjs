#!/usr/bin/env node
// TechVault F1-06 (P1-G) extraction-accuracy harness — throwaway Phase 1 tooling.
// No runtime dependencies (AGENTS.md section 6): Node built-ins only.
//
// Usage:
//   node index.mjs --mock --prompt baseline --out ../results/mock-baseline
//   OPENROUTER_API_KEY=... node index.mjs --model openrouter/model-id --prompt baseline --out ../results/run1
//
// Security: the API key is read only from the environment, never logged, never written to any
// artifact. Mock mode performs no network I/O at all.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "./validate.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(readFileSync(join(HERE, "schema.json"), "utf8"));

function parseArgs(argv) {
  const args = { prompt: "baseline", mock: false, force: false, "max-cases": Infinity, "mock-override": null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mock") args.mock = true;
    else if (a === "--force") args.force = true;
    else if (a === "--dataset") args.dataset = argv[++i];
    else if (a === "--prompt") args.prompt = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--model") args.model = argv[++i];
    else if (a === "--max-cases") args["max-cases"] = parseInt(argv[++i], 10);
    else if (a === "--mock-override") args["mock-override"] = argv[++i];
    else throw new Error(`unknown argument: ${a}`);
  }
  if (!args.out) throw new Error("--out is required");
  if (!args.mock && !args.model) throw new Error("--model is required unless --mock is used");
  if (!args.dataset) args.dataset = join(HERE, "..", "dataset", "v0");
  if (!["baseline", "hardened"].includes(args.prompt)) throw new Error("--prompt must be baseline|hardened");
  return args;
}

function normName(s) {
  return String(s ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
function normUrl(u) {
  if (!u) return null;
  return String(u).toLowerCase().trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
}
function normWs(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}
function round(x) { return Math.round(x * 10000) / 10000; }

function matchExpected(candidate, expectedList) {
  const cn = normName(candidate.name);
  const cu = normUrl(candidate.official_url);
  for (let i = 0; i < expectedList.length; i++) {
    const e = expectedList[i];
    if (e.__matched) continue;
    const en = normName(e.name);
    const aliases = (e.aliases || []).map(normName);
    const eu = normUrl(e.canonical_url);
    if (cn === en || aliases.includes(cn) || (cu && eu && cu === eu)) {
      e.__matched = true;
      return e;
    }
  }
  return null;
}

function scoreCase(candidates, exp, caseObj) {
  const inputText = caseObj.input_text;
  const expected = exp.expected_extractions.map((e) => ({ ...e }));
  const traps = exp.expected_non_extractions.map((t) => ({ ...t }));
  const isOptional = (t) => /optional/i.test(t.reason || "");

  const rows = [];
  let tp = 0;
  let d008Violations = 0;
  let verificationViolations = 0;
  let injectionCompromised = false;

  for (const c of candidates) {
    const e = matchExpected(c, expected);
    const trap = e ? null : matchExpected(c, traps);
    const evidenceSupported = normWs(c.evidence).length > 0 && normWs(inputText).includes(normWs(c.evidence));
    const optionalTrap = trap && isOptional(trap);
    const isInjection = /inject/i.test(c.name) || /inject/i.test(normUrl(c.official_url) || "");
    if (isInjection) injectionCompromised = true;

    if (e) tp++;
    if (c.verification_status === "verified") verificationViolations++;
    if (c.discovery_type === "explicitly_mentioned" && !evidenceSupported) d008Violations++;
    if (trap && !optionalTrap && c.discovery_type === "explicitly_mentioned") d008Violations++;

    rows.push({
      candidate: { name: c.name, url: c.official_url, discovery_type: c.discovery_type, confidence: c.confidence, verification_status: c.verification_status, evidence: c.evidence },
      verdict: e ? "tp" : optionalTrap ? "optional_extracted" : trap ? "false_positive_trap" : "false_positive_unknown",
      matched_expected: e ? { name: e.name, canonical_url: e.canonical_url, merge_required: !!e.merge_required } : null,
      matched_trap: trap ? { name: trap.name } : null,
      identity_correct: e ? (!e.canonical_url || normUrl(c.official_url) === normUrl(e.canonical_url)) : null,
      evidence_supported: evidenceSupported,
    });
  }

  const missed = expected.filter((e) => !e.__matched).map((e) => ({ name: e.name }));
  const mergeChecks = exp.expected_extractions
    .filter((e) => e.merge_required)
    .map((e) => {
      const cn = normName(e.name);
      const aliases = (e.aliases || []).map(normName);
      const eu = normUrl(e.canonical_url);
      const covering = candidates.filter((c) => {
        const n = normName(c.name);
        const u = normUrl(c.official_url);
        return n === cn || aliases.includes(n) || (u && eu && u === eu);
      });
      return { expected: e.name, covering_candidates: covering.length, merge_correct: covering.length === 1 };
    });

  const fpCount = rows.filter((r) => r.verdict === "false_positive_trap" || r.verdict === "false_positive_unknown").length;
  const precision = candidates.length === 0 ? 1 : tp / candidates.length;
  const recall = expected.length === 0 ? 1 : tp / expected.length;
  const fpr = candidates.length === 0 ? 0 : fpCount / candidates.length;
  const missRate = expected.length === 0 ? 0 : missed.length / expected.length;

  return {
    case_id: exp.id,
    category: caseObj.category,
    candidates_extracted: candidates.length,
    expected_count: expected.length,
    tp, fp: fpCount, missed_count: missed.length,
    precision: round(precision), recall: round(recall),
    false_positive_rate: round(fpr), miss_rate: round(missRate),
    identity_checked: rows.filter((r) => r.verdict === "tp" && r.identity_correct !== null).length,
    identity_correct: rows.filter((r) => r.verdict === "tp" && r.identity_correct === true).length,
    evidence_supported: rows.filter((r) => r.evidence_supported).length,
    d008_violations: d008Violations,
    verification_violations: verificationViolations,
    injection_compromised: injectionCompromised,
    merge_checks: mergeChecks,
    missed,
    rows,
  };
}

function aggregate(perCase) {
  const sum = (f) => perCase.reduce((a, c) => a + f(c), 0);
  const tp = sum((c) => c.tp), cand = sum((c) => c.candidates_extracted), exp = sum((c) => c.expected_count);
  const fp = sum((c) => c.fp), missed = sum((c) => c.missed_count);
  const idChecked = sum((c) => c.identity_checked), idOk = sum((c) => c.identity_correct);
  const evRows = sum((c) => c.rows.length), evOk = sum((c) => c.evidence_supported);
  return {
    precision_micro: cand === 0 ? 1 : round(tp / cand),
    recall_micro: exp === 0 ? 1 : round(tp / exp),
    false_positive_rate_micro: cand === 0 ? 0 : round(fp / cand),
    miss_rate_micro: exp === 0 ? 0 : round(missed / exp),
    identity_accuracy: idChecked === 0 ? null : round(idOk / idChecked),
    evidence_accuracy: evRows === 0 ? null : round(evOk / evRows),
    d008_violations_total: sum((c) => c.d008_violations),
    verification_violations_total: sum((c) => c.verification_violations),
    injection_compromised_cases: perCase.filter((c) => c.injection_compromised).map((c) => c.case_id),
    merge_all_correct: perCase.every((c) => (c.merge_checks || []).every((m) => m.merge_correct)),
    total_candidates: cand, total_tp: tp, total_fp: fp, total_missed: missed,
  };
}

function calibrate(perCase) {
  const buckets = { "0.9-1.0": { n: 0, ok: 0 }, "0.8-0.9": { n: 0, ok: 0 }, "0.6-0.8": { n: 0, ok: 0 }, "0-0.6": { n: 0, ok: 0 } };
  for (const c of perCase) {
    for (const r of c.rows) {
      const conf = r.candidate.confidence ?? 0;
      const key = conf >= 0.9 ? "0.9-1.0" : conf >= 0.8 ? "0.8-0.9" : conf >= 0.6 ? "0.6-0.8" : "0-0.6";
      buckets[key].n++;
      if (r.verdict === "tp" || r.verdict === "optional_extracted") buckets[key].ok++;
    }
  }
  return Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, { n: v.n, precision: v.n ? round(v.ok / v.n) : null }]));
}

async function callOpenRouter({ apiKey, model, system, user, schema, timeoutMs = 90000 }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const t0 = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost/techvault-p1g-harness",
        "X-Title": "techvault-p1g-harness",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        response_format: { type: "json_schema", json_schema: { name: "extraction", strict: true, schema } },
        temperature: 0,
        max_tokens: 2000,
      }),
    });
    const durationMs = Date.now() - t0;
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      return { kind: res.status === 429 ? "rate_limited" : "http_error", status: res.status, durationMs, bodySnippet: bodyText.slice(0, 300) };
    }
    const data = await res.json();
    const choice = data?.choices?.[0];
    return {
      kind: "ok",
      content: choice?.message?.content ?? "",
      finishReason: choice?.finish_reason ?? null,
      usage: data?.usage ?? null,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - t0;
    if (err.name === "AbortError") return { kind: "timeout", durationMs };
    return { kind: "network_error", message: String(err?.message || err), durationMs };
  } finally {
    clearTimeout(timer);
  }
}

function safeParse(content) {
  try {
    const value = JSON.parse(content);
    const v = validate(value, SCHEMA);
    return { valid: v.ok, errors: v.errors, value };
  } catch (e) {
    return { valid: false, errors: [`JSON.parse failed: ${String(e?.message || e).slice(0, 120)}`] };
  }
}

function excludedCase(caseObj, exp, reason) {
  return {
    case_id: caseObj.id, category: caseObj.category, excluded: true, reason,
    candidates_extracted: 0, expected_count: exp.expected_extractions.length,
    tp: 0, fp: 0, missed_count: exp.expected_extractions.length,
    precision: null, recall: exp.expected_extractions.length ? 0 : 1,
    false_positive_rate: null, miss_rate: null,
    identity_checked: 0, identity_correct: 0, evidence_supported: 0,
    d008_violations: 0, verification_violations: 0, injection_compromised: false,
    merge_checks: [], missed: exp.expected_extractions.map((e) => ({ name: e.name })), rows: [],
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const datasetDir = resolve(args.dataset);
  const casesDoc = JSON.parse(readFileSync(join(datasetDir, "cases.json"), "utf8"));
  const expectedDoc = JSON.parse(readFileSync(join(datasetDir, "expected.json"), "utf8"));
  const prompts = JSON.parse(readFileSync(join(HERE, "prompts.json"), "utf8"));

  const promptDef = prompts[args.prompt];
  const cases = casesDoc.cases.slice(0, args["max-cases"]);
  const expById = Object.fromEntries(expectedDoc.cases.map((e) => [e.id, e]));
  const outDir = resolve(args.out);
  const rawDir = join(outDir, "raw");
  mkdirSync(rawDir, { recursive: true });

  const apiKey = process.env.OPENROUTER_API_KEY || null;
  if (!args.mock && !apiKey) {
    console.error("OPENROUTER_API_KEY is not set. The API run phase requires owner-supplied credentials and a spend cap (D-018 item 7). Use --mock for offline validation.");
    process.exit(2);
  }

  let mockSeq = null;
  if (args.mock) {
    const mockPath = args["mock-override"] ? resolve(args["mock-override"]) : join(HERE, "mock-responses.json");
    mockSeq = JSON.parse(readFileSync(mockPath, "utf8"));
  }

  const failures = { schema_invalid_first_attempt_recovered: 0, schema_invalid_after_retry: 0, http_error: 0, rate_limited: 0, timeout: 0, network_error: 0, truncated: 0 };
  const perCase = [];
  let totalTokensIn = 0, totalTokensOut = 0, apiCalls = 0;

  for (const caseObj of cases) {
    const exp = expById[caseObj.id];
    if (!exp) { console.error(`no expected results for ${caseObj.id}; case dropped per governance rules`); continue; }
    const user = promptDef.user_template.replace("{{input}}", caseObj.input_text);
    const cacheKey = createHash("sha256").update(JSON.stringify([args.model || "mock", promptDef.id, caseObj.id, caseObj.input_text])).digest("hex").slice(0, 16);
    const cacheFile = join(rawDir, `${caseObj.id}-${cacheKey}.json`);

    let contents = [];
    if (!args.mock && existsSync(cacheFile) && !args.force) {
      contents = JSON.parse(readFileSync(cacheFile, "utf8")).responses;
    } else if (args.mock) {
      const seq = mockSeq[caseObj.id]?.sequence || [];
      contents = seq.map((s) => s.content);
      writeFileSync(cacheFile, JSON.stringify({ cached_at: new Date().toISOString(), mock: true, responses: contents }, null, 2));
    } else {
      contents = [];
      for (let attempt = 1; attempt <= 2; attempt++) {
        const res = await callOpenRouter({ apiKey, model: args.model, system: promptDef.system, user, schema: SCHEMA });
        if (res.kind === "ok") {
          apiCalls++;
          totalTokensIn += res.usage?.prompt_tokens ?? 0;
          totalTokensOut += res.usage?.completion_tokens ?? 0;
          if (res.finishReason === "length") failures.truncated++;
          contents.push(res.content);
          if (safeParse(res.content).valid) break;
          if (attempt === 1) continue; // retry once on invalid JSON (A2)
        } else {
          failures[res.kind] = (failures[res.kind] || 0) + 1;
          break;
        }
      }
      writeFileSync(cacheFile, JSON.stringify({ cached_at: new Date().toISOString(), responses: contents }, null, 2));
    }

    // pick the first VALID response (retry-once semantics); all-invalid => case excluded, never scored
    let candidates = null;
    let recovered = false;
    for (let i = 0; i < contents.length; i++) {
      const parsed = safeParse(contents[i]);
      if (parsed.valid) { candidates = parsed.value.candidates; recovered = i > 0; break; }
    }
    if (candidates === null) {
      if (contents.length > 0) failures.schema_invalid_after_retry++;
      perCase.push(excludedCase(caseObj, exp, contents.length === 0 ? "no usable response" : "schema-invalid after retry-once"));
      continue;
    }
    if (recovered) failures.schema_invalid_first_attempt_recovered++;

    perCase.push(scoreCase(candidates, exp, caseObj));
  }

  const scored = perCase.filter((c) => !c.excluded);
  const result = {
    meta: {
      dataset: casesDoc.version, dataset_dir: datasetDir,
      prompt_id: promptDef.id, prompt_variant: args.prompt,
      model: args.mock ? "MOCK (offline pipeline validation)" : args.model,
      mode: args.mock ? "mock" : "live",
      executed_at: new Date().toISOString(),
      node_version: process.version,
      key_source: args.mock ? "none" : "OPENROUTER_API_KEY (env; never logged or stored)",
      cases_total: cases.length, cases_scored: scored.length, cases_excluded_schema_invalid: perCase.length - scored.length,
      spend: { api_calls: args.mock ? 0 : apiCalls, prompt_tokens: totalTokensIn, completion_tokens: totalTokensOut, cost_estimate: null, note: "token counts recorded; no cost table is hardcoded - compute cost from the provider pricing page when reviewing" },
    },
    failure_counts: failures,
    aggregate: aggregate(scored),
    confidence_calibration: calibrate(scored),
    per_case: perCase,
  };

  writeFileSync(join(outDir, "results.json"), JSON.stringify(result, null, 2));
  writeFileSync(join(outDir, "summary.md"), renderSummary(result));
  console.log(`wrote ${join(outDir, "results.json")}`);
  console.log(`aggregate: P=${result.aggregate.precision_micro} R=${result.aggregate.recall_micro} FPR=${result.aggregate.false_positive_rate_micro} D008v=${result.aggregate.d008_violations_total} Vv=${result.aggregate.verification_violations_total} inj=${result.aggregate.injection_compromised_cases.join("|") || "none"}`);
  if (result.meta.mode === "mock") {
    console.log("NOTE: mock verdicts validate the HARNESS pipeline (validation catch-rate, metric math, violation detection), not model quality.");
  }
}

function renderSummary(r) {
  const lines = [];
  lines.push(`# P1-G run summary — ${r.meta.prompt_variant} prompt, ${r.meta.model}`);
  lines.push("");
  lines.push(`- Executed: ${r.meta.executed_at} (Node ${r.meta.node_version}, mode: ${r.meta.mode})`);
  lines.push(`- Dataset: ${r.meta.dataset} (${r.meta.cases_total} cases; ${r.meta.cases_scored} scored, ${r.meta.cases_excluded_schema_invalid} excluded schema-invalid)`);
  lines.push(`- Aggregate (micro): precision ${r.aggregate.precision_micro}, recall ${r.aggregate.recall_micro}, FPR ${r.aggregate.false_positive_rate_micro}, miss rate ${r.aggregate.miss_rate_micro}`);
  lines.push(`- Identity accuracy: ${r.aggregate.identity_accuracy ?? "n/a"}; evidence accuracy: ${r.aggregate.evidence_accuracy ?? "n/a"}`);
  lines.push(`- D-008 violations: ${r.aggregate.d008_violations_total}; verification violations: ${r.aggregate.verification_violations_total}; injection-compromised cases: ${r.aggregate.injection_compromised_cases.join(", ") || "none"}`);
  lines.push(`- Merge invariant: ${r.aggregate.merge_all_correct ? "all merge cases correct" : "FAILED"}`);
  lines.push(`- Failures: ${JSON.stringify(r.failure_counts)}`);
  lines.push("");
  lines.push("| Case | Category | Cands | TP | FP | Miss | P | R | D008v | Vv | inj |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|");
  for (const c of r.per_case) {
    lines.push(`| ${c.case_id}${c.excluded ? " (excluded)" : ""} | ${c.category} | ${c.candidates_extracted} | ${c.tp} | ${c.fp} | ${c.missed_count} | ${c.precision ?? "-"} | ${c.recall ?? "-"} | ${c.d008_violations} | ${c.verification_violations} | ${c.injection_compromised ? "YES" : "no"} |`);
  }
  lines.push("");
  lines.push("## Confidence calibration");
  lines.push("");
  lines.push("| Bucket | n | precision |");
  lines.push("|---|---|---|");
  for (const [k, v] of Object.entries(r.confidence_calibration)) lines.push(`| ${k} | ${v.n} | ${v.precision ?? "-"} |`);
  return lines.join("\n") + "\n";
}

main().catch((e) => { console.error(e); process.exit(1); });
