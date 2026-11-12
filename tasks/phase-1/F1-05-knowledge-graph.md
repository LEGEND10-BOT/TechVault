# F1-05 — Knowledge Graph Performance and Mobile Feasibility

**Project:** TechVault
**Task ID:** F1-05
**Document status:** Proposed task specification, awaiting owner approval
**Version:** 1.0
**Shared context:** read `00-PHASE1-OVERVIEW.md` first.

**Source mapping:** DEVELOPMENT_ROADMAP §5.7 (graph validation: small/medium/large datasets,
search, filtering, progressive rendering, mobile interaction); MASTER_BRAIN Part O workstream
G. Related `docs/MASTER_BRAIN.md` Part H5 (Knowledge Graph view), Part Q — none directly;
R-008 makes this benchmark mandatory before adoption.

**Decisions / pending items addressed:** R-008 (Sigma.js + Graphology — proposed, benchmark
required), R-017 (simplified mobile graph), P-022 (performance budgets; graph rendering is an
explicit budget item per `docs/ARCHITECTURE.md` §17).

---

## 1. Objective

Benchmark the proposed graph stack (Sigma.js rendering over Graphology graph model) at
dataset sizes representative of realistic TechVault libraries, on the reference low-resource
hardware and on mobile WebView, and determine: interactive frame rates for pan/zoom, initial
render/layout cost, search and filter latency, whether progressive expansion is needed and at
what size, and whether a capped mobile experience (R-017) is sufficient. The benchmark gates
R-008: if the stack fails, any alternative is a NEW proposal to the owner, never a silent
substitution.

## 2. Technical Questions

Verified facts (official/third-party documentation — re-verify versions at execution):

- Sigma.js is a WebGL-based graph renderer working on Graphology as its standard data model;
  its documentation states smooth interaction on graphs of tens of thousands of nodes/edges
  with default rendering (sigmajs.org/concepts/rendering).
- Third-party comparisons report strong WebGL performance vs SVG/D3 approaches at scale, but
  also that custom node renderers (images/icons) and running force-directed layouts are the
  typical bottlenecks (Ogma comparison; community reports of ~100k edges with default
  styles). Upstream claims are not our measurements — this experiment exists to measure on
  the i5-6300U's integrated GPU.

Questions this experiment must answer by evidence:

1. At which node/edge count does pan/zoom interaction on the reference hardware (WebView2 on
   i5-6300U integrated graphics) stop being fluid?
2. What is initial render time (data → first frame) and memory footprint per dataset size,
   inside WebView2 specifically (not just a dev browser)?
3. What is the cost of a force-directed layout pass (e.g. `graphology-layout-forceatlas2`)
   at each size, and is precomputed/random layout with lazy layout jobs the right product
   pattern?
4. Search (find node and center camera) and filter (edge/node reduction by type/category)
   latency at each size?
5. Progressive expansion: cost of adding a node batch to a rendered graph (the Phase 4
   interaction model, ARCHITECTURE §7.11) — does incremental addition avoid full re-layout?
6. Mobile: touch pan/zoom usability and frame rate on the Android test device at a capped
   dataset (e.g. ≤ 2k nodes); what cap is defensible for R-017?
7. Does label rendering (the practical bottleneck in many WebGL graph libs) change the
   thresholds materially at realistic label densities?

## 3. Dependencies

- Browser-only half: independent (needs Node only). Can start immediately.
- WebView2-in-Tauri measurements: after F1-01a (reuse its scratch shell or load the page in
  the dev window).
- Mobile half: after F1-01b (device available) — load the same benchmark page in the Android
  WebView.
- No owner-provided data: datasets are synthetic (seeded generator) modeled on realistic
  degree distributions (scale-free-ish, average degree ~3–4, a few high-degree hubs, typed
  edges and categories as in DATABASE_DESIGN §14 relationship types).

## 4. Test Environment

- One benchmark page (Vite + TypeScript, Sigma.js + Graphology at pinned versions), with:
  dataset sizes 1k / 5k / 20k / 50k nodes (edges proportional, ~3.5× nodes), built-in FPS
  meter (rAF counter over scripted pan/zoom animation), timing instrumentation exported as
  JSON, and a label-density toggle.
- Reference machine (GPU recorded — i5-6300U integrated HD Graphics 520 expected, verify),
  WebView2 pinned version; results additionally in Chrome/Edge for comparison only.
- Android test device, system WebView version recorded.
- Datasets generated deterministically; generator committed with the results.

## 5. Minimal Proof of Concept

1. Build the benchmark page with the four dataset sizes and instrumentation (FPS during a
   scripted 20 s pan/zoom+label pass; initial render ms; memory via
   `performance.memory` where available plus process-level capture; search/filter timings;
   batch-add timings for progressive expansion).
2. Run the full matrix: {1k, 5k, 20k, 50k} × {no labels, default labels} × {WebView2,
   desktop browser (comparison), Android WebView (≤ 5k and capped sizes only)}.
3. Measure one force-layout pass per size (timeout-capped; record if it must be
   asynchronous/limited-iteration in practice).
4. Record thermal/battery context on mobile (charging state) per the measurement protocol.
5. Produce the sizing recommendation: maximum comfortable default view size, progressive
   expansion batch size, mobile cap — each as a recommendation tied to R-008/R-017.

Out of scope: the real knowledge-graph product UI (H5), graph persistence, real data,
layout aesthetics, edge-bundling/canvas-2D rewrites.

## 6. Expected Deliverables

- Benchmark page + seeded generator (committed as evidence).
- Results matrix with all timings/FPS/memory per configuration and environment.
- Sizing recommendations (default caps, progressive batch size, mobile cap) labeled as
  recommendations for owner approval.
- Explicit R-008 verdict: adopt / adopt-with-caps / fail, with numbers.
- Completed results record.

## 7. Measurable Acceptance Criteria

Planning targets (validate by measurement; the reference GPU is weak by design — this
benchmark exists precisely because the numbers are uncertain):

| # | Criterion | Target |
|---|---|---|
| A1 | 20k nodes / ~70k edges, default styles, WebView2: sustained FPS during scripted interaction | PLANNING TARGET ≥ 30 FPS median; ≥ 20 FPS p5; measure then decide with owner |
| A2 | Initial render (data loaded → first frame), 20k nodes | PLANNING TARGET ≤ 3 s; measure then decide |
| A3 | Node search + camera center, 50k nodes | PLANNING TARGET ≤ 300 ms |
| A4 | Category filter re-render, 20k nodes | PLANNING TARGET ≤ 500 ms |
| A5 | Progressive batch add (100 nodes) without full re-layout | Functional pass required (hard — the Phase 4 interaction model depends on it) |
| A6 | Android WebView, capped dataset (≤ 2k nodes): touch pan/zoom usable, no hard freezes (> 1 s frame) | Qualitative pass + FPS record; cap value is the "measure then decide" output for R-017 |
| A7 | Memory footprint recorded per size; no unbounded growth during 10 min of interaction | Measured; growth trend must be flat-ish (no leak signature) |
| A8 | 50k-node behavior recorded even if below targets | Required record (defines the documented upper bound for the product) |

If A1/A2 fail at 20k but pass at 5k, that is an "adopt-with-caps" outcome (progressive
loading + view caps are the documented product pattern), not a task failure.

## 8. Failure Conditions

- Sigma.js cannot render or interact correctly in WebView2 (rendering artifacts, WebGL
  context unavailable) — genuine platform blocker for R-008.
- Even 5k nodes unusable on the reference hardware (below ~15 FPS median with labels off).
- Progressive batch addition forces full re-render (A5 fails), removing the documented
  scaling strategy.
- Mobile: hard freezes or WebView WebGL unsupported on the test device at even small sizes —
  mobile graph becomes a documented limitation or triggers the R-017-capped design review.

## 9. Fallback Options

- Within the proposed stack (no new approval needed): smaller default view sizes,
  progressive expansion, label-thinning, precomputed layouts, degree-based node capping —
  these are the documented mitigation patterns (R-008's own benchmark condition; R-017).
- If the stack genuinely fails: alternatives (canvas-2D renderers, other WebGL libs,
  server-side precomputed layouts — none currently proposed) are NEW proposals requiring an
  owner decision and DECISION_LOG entry. No substitution inside this task.
- Mobile failure only: ship desktop graph first with mobile capped/deferred per R-017 —
  owner confirms with the evidence.

## 10. Evidence and Source References

- Sigma.js rendering concept (WebGL, large graphs): https://www.sigmajs.org/concepts/rendering/
- Sigma.js documentation hub: https://www.sigmajs.org/docs/
- Graphology (graph model + layouts): https://graphology.github.io/
- Third-party scale observations (context, not proof): Ogma vs Sigma.js comparison
  (doc.linkurious.com/ogma/latest/compare/sigmajs.html); Memgraph visualization comparison.
- Project documents: `docs/ARCHITECTURE.md` §7.11, §17; `docs/MASTER_BRAIN.md` Part H5,
  Part K; `docs/DEVELOPMENT_ROADMAP.md` §5.7; `docs/TESTING_STRATEGY.md` §12;
  `docs/DECISION_LOG.md` R-008, R-017, P-022.

**Effort:** M. Browser half parallel immediately; WebView2 and mobile legs depend on F1-01.
**Costs/owner approvals:** device access only.
