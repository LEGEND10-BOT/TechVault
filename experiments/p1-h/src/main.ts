// TechVault F1-05 (P1-H) Sigma.js + Graphology benchmark — throwaway evidence tooling.
// Deterministic seeded generator; scripted interaction; all numbers measured, none estimated.
// URL params: ?size=5000&labels=1&autostart=1&env=webview2&soak=0
//   size    : node count (1000 | 5000 | 20000 | 50000)
//   labels  : 0 = labels off, 1 = default labels (density 1, threshold 7)
//   soak    : minutes of continuous interaction AFTER the standard phases (A7 leak check)
// Results: window.__RESULTS; document.title becomes "BENCH_DONE" when finished.

import Graph from "graphology";
import Sigma from "sigma";
import forceAtlas2 from "graphology-layout-forceatlas2";

const qp = new URLSearchParams(location.search);
const SIZE = parseInt(qp.get("size") || "5000", 10);
const LABELS = parseInt(qp.get("labels") || "1", 10);
const AUTOSTART = qp.get("autostart") === "1";
const ENV = qp.get("env") || "browser";
const SOAK_MIN = parseInt(qp.get("soak") || "0", 10);
const SEED = 0x5eed;

const CATEGORIES = ["tool", "library", "service", "repository", "website", "concept"];
const RELATIONSHIPS = ["Uses", "Integrates With", "Alternative To", "Depends On", "Developed By", "Related Concept", "Replaced By"];
const COLORS = ["#b8a6ff", "#6fe0a8", "#ffd479", "#ff7a7a", "#8f8ab0", "#5fb8ff"];

const statusEl = document.getElementById("status")!;
function status(msg: string) { statusEl.textContent = msg; }

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Scale-free-ish graph: initial ring + preferential attachment (avg degree ~3.5).
function generateGraph(n: number): { genMs: number; edgeCount: number; graph: Graph } {
  const t0 = performance.now();
  const rnd = mulberry32(SEED);
  const graph = new Graph({ multi: false, type: "undirected" });
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const catIdx = Math.floor(rnd() * CATEGORIES.length);
    const cat = CATEGORIES[catIdx]!;
    const id = `n${i}`;
    const ang = i * 2.399963; // golden-angle spiral
    const rad = 0.02 * Math.sqrt(i);
    graph.addNode(id, {
      x: rad * Math.cos(ang), y: rad * Math.sin(ang),
      size: 2 + Math.floor(rnd() * 4),
      color: COLORS[catIdx],
      label: `res-${i}-${cat}`,
      category: cat,
    });
    ids.push(id);
    if (i > 0) graph.addEdge(id, ids[i - 1]!, { rel: "Related Concept" });
  }
  const attachCount = new Float64Array(n).fill(1);
  const extraTotal = Math.max(0, Math.floor(n * 0.75));
  let added = 0;
  for (let i = 1; i < n && added < extraTotal; i++) {
    if (rnd() < 0.75) {
      let total = 0;
      for (let j = 0; j < i; j++) total += attachCount[j]!;
      let r = rnd() * total;
      let pick = 0;
      for (let j = 0; j < i; j++) { r -= attachCount[j]!; if (r <= 0) { pick = j; break; } }
      const a = ids[i]!, b = ids[pick]!;
      if (a !== b && !graph.hasEdge(a, b)) {
        graph.addEdge(a, b, { rel: RELATIONSHIPS[Math.floor(rnd() * RELATIONSHIPS.length)]! });
        attachCount[i]!++; attachCount[pick]!++;
        added++;
      }
    }
  }
  return { genMs: performance.now() - t0, edgeCount: graph.size, graph };
}

function heap(): number | null {
  const pm = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  return pm ? pm.usedJSHeapSize : null;
}
function round2(x: number): number { return Math.round(x * 100) / 100; }

function grabGpu(): string | null {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  } catch { return null; }
}

type CameraLike = { setState: (s: { x: number; y: number; ratio: number; angle: number }) => void };

function measureFps(seconds: number, scripted: (pct: number) => void): Promise<{ frames: number; medianMs: number; meanMs: number; p5Ms: number; p95Ms: number; worstSecondFps: number }> {
  const deltas: number[] = [];
  const fpsWindows: number[] = [];
  let last = performance.now();
  let frames = 0;
  let winStart = last, winFrames = 0;
  const t0 = last;
  return new Promise((resolve) => {
    function frame(now: number) {
      const dt = now - last;
      last = now;
      frames++;
      winFrames++;
      deltas.push(dt);
      if (now - winStart >= 1000) { fpsWindows.push((winFrames * 1000) / (now - winStart)); winStart = now; winFrames = 0; }
      const pct = (now - t0) / (seconds * 1000);
      scripted(pct);
      if (pct >= 1) {
        const sorted = [...deltas].sort((a, b) => a - b);
        const pick = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]!;
        resolve({
          frames,
          medianMs: round2(sorted[Math.floor(sorted.length / 2)]!),
          meanMs: round2(deltas.reduce((a, b) => a + b, 0) / deltas.length),
          p5Ms: round2(pick(0.05)),
          p95Ms: round2(pick(0.95)),
          worstSecondFps: fpsWindows.length ? round2(Math.min(...fpsWindows)) : frames,
        });
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

function timeSync(fn: () => void, runs: number): { medianMs: number; all: number[] } {
  const all: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    fn();
    all.push(performance.now() - t0);
  }
  all.sort((a, b) => a - b);
  return { medianMs: round2(all[Math.floor(all.length / 2)]!), all: all.map(round2) };
}

// build the graph once at load; generation time recorded
status(`generating ${SIZE} nodes…`);
const GEN = generateGraph(SIZE);
const g = GEN.graph;
(window as unknown as Record<string, unknown>).__p1h_graph = g;

async function rafGap(): Promise<void> { return new Promise((r) => requestAnimationFrame(() => r())); }

async function runBenchmark(): Promise<void> {
  const R: Record<string, unknown> = {
    meta: {
      size: SIZE,
      labels_mode: LABELS === 0 ? "off" : "default(density1,threshold7)",
      env_tag: ENV, seed: SEED,
      user_agent: navigator.userAgent,
      device_pixel_ratio: window.devicePixelRatio,
      hardware_concurrency: navigator.hardwareConcurrency ?? null,
      webgl_renderer: grabGpu(),
      started_at: new Date().toISOString(),
    },
  };
  (window as unknown as Record<string, unknown>).__RESULTS = R;
  const container = document.getElementById("container")!;

  // 1) generation (measured at load; recorded here)
  R.generation = { ms: round2(GEN.genMs), nodes: SIZE, edges: GEN.edgeCount, avg_degree: round2((2 * GEN.edgeCount) / SIZE) };
  R.memory_after_generation = heap();
  await rafGap();

  // 2) first render: sigma construction (already done below) + first frame after refresh
  const renderer = new Sigma(g, container, {
    allowInvalidContainer: true,
    renderEdgeLabels: false,
    labelDensity: LABELS === 0 ? 0 : 1,
    labelRenderedSizeThreshold: LABELS === 0 ? Infinity : 7,
    defaultEdgeColor: "#3a3550",
    defaultNodeColor: "#b8a6ff",
    labelColor: { color: "#c5c1d6" },
    labelSize: 12,
    stagePadding: 40,
  });
  const firstFrameMs = await new Promise<number>((resolve) => {
    const t0 = performance.now();
    renderer.refresh();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(round2(performance.now() - t0))));
  });
  R.first_render = { ms: firstFrameMs, note: "refresh() -> first rendered frame (double rAF)" };
  R.memory_after_first_render = heap();
  await rafGap();

  // 3) scripted pan/zoom FPS (20 s)
  status("scripted pan/zoom 20 s…");
  const camera = renderer.getCamera() as unknown as CameraLike;
  const fps = await measureFps(20, (pct) => {
    const t = pct * Math.PI * 4;
    camera.setState({ x: 0.15 * Math.sin(t), y: 0.1 * Math.cos(t * 0.7), ratio: 1 + 0.6 * Math.sin(t * 0.9), angle: 0 });
  });
  R.fps_20s = fps;
  R.memory_after_fps = heap();
  await rafGap();

  // 4) search: label->id index (product pattern) + instant camera centering
  status("search + camera center…");
  const indexT0 = performance.now();
  const labelIndex = new Map<string, string>();
  g.forEachNode((id, attrs) => { labelIndex.set((attrs as { label: string }).label, id); });
  R.search_index_build_ms = round2(performance.now() - indexT0);
  const search = timeSync(() => {
    const i = Math.floor(Math.random() * SIZE);
    const id = labelIndex.get(`res-${i}-tool`) || labelIndex.get(`res-${i}-library`) || labelIndex.get(`res-0-tool`);
    if (id) camera.setState({ x: 0, y: 0, ratio: 1, angle: 0 });
  }, 20);
  R.search_center_ms = { median: search.medianMs, runs: 20, note: "index lookup + camera setState (instant centering)" };

  // 5) filter: category filter re-render via nodeReducer
  status("category filter re-render…");
  renderer.setSetting("nodeReducer", (node: string, data: Record<string, unknown>) => {
    if (data.category === "service") return { ...data, hidden: true };
    return data;
  });
  const filter = timeSync(() => { renderer.refresh(); }, 5);
  renderer.setSetting("nodeReducer", null);
  renderer.refresh();
  R.filter_rerender_ms = { median: filter.medianMs, runs: 5, note: "hide category 'service', refresh() wall time" };

  // 6) progressive batch add (100 nodes, no re-layout)
  status("progressive batch add…");
  const base = g.order;
  const batchT0 = performance.now();
  for (let i = 0; i < 100; i++) {
    const id = `add-${i}`;
    g.addNode(id, { x: Math.cos(i) * 0.05, y: Math.sin(i * 1.7) * 0.05, size: 3, color: "#5fb8ff", label: `added-${i}`, category: "tool" });
    if (i > 0) g.addEdge(`add-${i - 1}`, id, { rel: "Related Concept" });
    if (i % 25 === 0) g.addEdge(id, `n${i % SIZE}`, { rel: "Uses" });
  }
  const batchAddMs = round2(performance.now() - batchT0);
  const refreshT0 = performance.now();
  renderer.refresh();
  const batchRefreshMs = round2(performance.now() - refreshT0);
  R.progressive_batch_add = { nodes_added: g.order - base, add_ms: batchAddMs, refresh_after_ms: batchRefreshMs, full_relayout_required: false };
  await rafGap();

  // 7) one FA2 layout pass (fixed low iteration count = timeout-capped in practice)
  status("forceatlas2 pass…");
  const fa2T0 = performance.now();
  try {
    const iters = SIZE >= 20000 ? 5 : 20;
    forceAtlas2.assign(g, {
      iterations: iters,
      settings: { barnesHutOptimize: SIZE >= 20000, gravity: 1, scalingRatio: 10, slowDown: 1 + Math.log(SIZE) },
    });
    R.forceatlas2_pass = { ms: round2(performance.now() - fa2T0), iterations: iters, barnes_hut: SIZE >= 20000 };
  } catch (e) {
    R.forceatlas2_pass = { error: String(e).slice(0, 200) };
  }
  renderer.refresh();
  R.memory_after_fa2 = heap();
  await rafGap();

  // 8) optional soak (A7 leak check)
  if (SOAK_MIN > 0) {
    status(`soak ${SOAK_MIN} min…`);
    const samples: { t_s: number; fps_1s: number; heap: number | null }[] = [];
    const t0 = performance.now();
    const end = t0 + SOAK_MIN * 60000;
    while (performance.now() < end) {
      const elapsed = (performance.now() - t0) / 1000;
      const oneSec = await measureFps(1, (pct) => {
        const t = elapsed + pct;
        camera.setState({ x: 0.2 * Math.sin(t), y: 0.15 * Math.cos(t * 1.3), ratio: 0.8 + 0.5 * Math.abs(Math.sin(t * 0.5)), angle: 0 });
      });
      samples.push({ t_s: round2((performance.now() - t0) / 1000), fps_1s: oneSec.frames, heap: heap() });
    }
    R.soak = {
      minutes: SOAK_MIN,
      samples_count: samples.length,
      first_sample: samples[0] ?? null,
      last_sample: samples[samples.length - 1] ?? null,
      heap_growth_bytes: heap() !== null && samples.length > 1 && samples[0]!.heap !== null
        ? (heap() as number) - (samples[0]!.heap as number)
        : null,
      all_samples: samples,
    };
  }

  R.finished_at = new Date().toISOString();
  status("DONE");
  document.getElementById("results-json")!.textContent = JSON.stringify(R, null, 2);
  document.title = "BENCH_DONE";
}

(window as unknown as Record<string, unknown>).__p1h_start = runBenchmark;
if (AUTOSTART) window.addEventListener("load", () => { void runBenchmark(); });
