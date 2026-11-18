#!/usr/bin/env node
/*
 * scripts/measure-bundle — G1 M1-P3 evidence (PHASE_2_M1_PERFORMANCE_BUDGET.md §3).
 *
 * Reports per-route bundle sizes from the built client output: each route
 * node chunk in `.svelte-kit/output/client/_app/immutable/nodes/` with its
 * raw and gzip size, plus the shared chunks. No pass/fail here — the
 * "no route chunk > 300 KB gzipped" guard is applied in the report.
 *
 * Usage: node scripts/measure-bundle.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const nodesDir = join(
	process.cwd(),
	".svelte-kit/output/client/_app/immutable/nodes"
);
const chunksDir = join(
	process.cwd(),
	".svelte-kit/output/client/_app/immutable/chunks"
);

function report(dir, label) {
	try {
		const files = readdirSync(dir).filter((f) => f.endsWith(".js"));
		return files.map((f) => {
			const raw = readFileSync(join(dir, f));
			const gz = gzipSync(raw);
			return {
				file: `${label}/${f}`,
				raw_kb: Number((statSync(join(dir, f)).size / 1024).toFixed(2)),
				gzip_kb: Number((gz.length / 1024).toFixed(2))
			};
		});
	} catch {
		return [];
	}
}

const routeNodes = report(nodesDir, "nodes");
const sharedChunks = report(chunksDir, "chunks");

const all = [...routeNodes, ...sharedChunks].sort((a, b) => b.gzip_kb - a.gzip_kb);
const worstRoute = routeNodes.reduce(
	(max, n) => (n.gzip_kb > max ? n.gzip_kb : max),
	0
);

console.log(
	JSON.stringify(
		{
			tool: "scripts/measure-bundle.mjs",
			route_nodes: routeNodes,
			shared_chunks: sharedChunks,
			summary: {
				route_node_count: routeNodes.length,
				worst_route_node_gzip_kb: worstRoute,
				total_client_js_gzip_kb: Number(
					all.reduce((sum, f) => sum + f.gzip_kb, 0).toFixed(2)
				)
			},
			note: "measure-only; M1-P3 guard (no route node > 300 KB gzipped) applied in the report"
		},
		null,
		2
	)
);
