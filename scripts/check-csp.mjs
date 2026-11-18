#!/usr/bin/env node
/*
 * scripts/check-csp — automated CSP configuration check (D-022 / OD-6).
 *
 * Proves, from the checked-in configuration alone:
 *   1. The production CSP (`app.security.csp`) is present and strict:
 *      - `default-src 'self'`
 *      - explicit `script-src 'self'`
 *      - no `unsafe-eval`, no `unsafe-inline`, no `wasm-unsafe-eval`
 *      - no remote http(s):// origins in script-src / style-src / font-src
 *      - no websocket allowances anywhere in production
 *      - `connect-src` limited to 'self' plus the enumerated Tauri IPC
 *        allowances (`ipc:`, `http://ipc.localhost`)
 *      - no asset-protocol allowance (must be added deliberately, scoped,
 *        when a feature justifies it)
 *   2. The development CSP (`app.security.devCsp`) differs from production
 *      ONLY by the enumerated Vite/SvelteKit dev allowances derived from
 *      `build.devUrl` (dev-server origin + HMR websocket) and dev inline
 *      styles. No other origins; no arbitrary remote script origins.
 *   3. No dev-only allowance (inline styles, websockets, dev-server origins)
 *      appears in the production CSP.
 *   4. Capability files (`src-tauri/capabilities/*.json`) grant only
 *      permissions on the M0 allowlist (core:*, no plugin permissions) and
 *      target only the declared app windows.
 *
 * Run: `npm run check:csp`   (wired into package.json)
 * Required by PHASE_2_MILESTONES.md M0 acceptance criteria; re-verified M1/M10.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const confPath = join(repoRoot, "src-tauri", "tauri.conf.json");
const capsDir = join(repoRoot, "src-tauri", "capabilities");

const conf = JSON.parse(readFileSync(confPath, "utf8"));

const prodCsp = conf?.app?.security?.csp;
const devCsp = conf?.app?.security?.devCsp;
const devUrl = conf?.build?.devUrl ?? "";

/** Parse a CSP string into a Map of lowercased directive -> [sources]. */
function parseCsp(csp) {
	const directives = new Map();
	if (typeof csp !== "string" || csp.trim() === "") return directives;
	for (const part of csp.split(";")) {
		const tokens = part.trim().split(/\s+/).filter(Boolean);
		if (tokens.length === 0) continue;
		const [name, ...sources] = tokens;
		directives.set(name.toLowerCase(), sources);
	}
	return directives;
}

const prod = parseCsp(prodCsp);
const dev = parseCsp(devCsp);

// Dev allowances allowed by D-022, derived from the configured dev server URL.
let devOrigin = null;
let devWs = null;
try {
	const u = new URL(devUrl);
	devOrigin = `${u.protocol}//${u.host}`;
	if (u.protocol === "http:") devWs = `ws://${u.host}`;
	if (u.protocol === "https:") devWs = `wss://${u.host}`;
} catch {
	/* invalid devUrl — checked below */
}

// Production connect-src: 'self' + the Tauri 2 IPC allowances for Windows.
const PROD_CONNECT_ALLOWED = new Set(["'self'", "ipc:", "http://ipc.localhost"]);

// Dev connect-src: production set + the dev-server origin + the HMR websocket.
const DEV_CONNECT_EXTRA_ALLOWED = new Set([devOrigin, devWs].filter(Boolean));

// M0 capability allowlist: core plugin permission sets only, no third-party
// plugin permissions, no permissions for features M0 does not use.
const CAP_PERMISSION_RE = /^core:[a-z0-9-]+:(default|allow-[a-z0-9-]+)$/;

const results = [];
function check(id, pass, detail) {
	results.push({ id, pass: Boolean(pass), detail });
}

// ---------------------------------------------------------------------------
// 1. Production policy is present and strict
// ---------------------------------------------------------------------------
check(
	"prod.csp-present",
	typeof prodCsp === "string" && prodCsp.trim() !== "",
	"app.security.csp must be a non-empty string (P1-I carry-forward: csp: null is forbidden)"
);
check(
	"prod.default-src-self",
	(prod.get("default-src") ?? []).includes("'self'"),
	`default-src must include 'self' (got: ${(prod.get("default-src") ?? []).join(" ") || "absent"})`
);
check(
	"prod.script-src-self",
	(prod.get("script-src") ?? []).includes("'self'"),
	"script-src must explicitly include 'self'"
);

// connect-src is governed separately by `prod.connect-src-ipc-only`
// ('self' + the enumerated Tauri IPC allowances `ipc:` and `http://ipc.localhost`,
// which are required for invoke() on Windows and explicitly approved by D-022).
const PROD_DIRECTIVES_TO_SCAN = [
	"default-src",
	"script-src",
	"style-src",
	"img-src",
	"font-src",
	"worker-src",
	"object-src",
	"frame-src"
];
for (const dir of PROD_DIRECTIVES_TO_SCAN) {
	const sources = prod.get(dir) ?? [];
	const bad = sources.filter(
		(s) => s.startsWith("http://") || s.startsWith("https://")
	);
	check(
		`prod.no-remote-origins.${dir}`,
		bad.length === 0,
		bad.length === 0
			? `${dir} has no remote http(s) origins`
			: `${dir} contains remote origins: ${bad.join(", ")}`
	);
}

const PROD_FORBIDDEN_TOKENS = ["'unsafe-eval'", "'unsafe-inline'", "'wasm-unsafe-eval'"];
for (const [dir, sources] of prod) {
	const bad = sources.filter((s) => PROD_FORBIDDEN_TOKENS.includes(s));
	check(
		`prod.no-unsafe.${dir}`,
		bad.length === 0,
		bad.length === 0
			? `${dir} has no unsafe-eval/unsafe-inline`
			: `${dir} contains forbidden tokens: ${bad.join(", ")}`
	);
}

const prodConnect = prod.get("connect-src") ?? [];
const badConnect = prodConnect.filter((s) => !PROD_CONNECT_ALLOWED.has(s));
check(
	"prod.connect-src-ipc-only",
	badConnect.length === 0,
	badConnect.length === 0
		? "connect-src limited to 'self' + Tauri IPC allowances"
		: `connect-src contains non-IPC sources: ${badConnect.join(", ")}`
);

const prodWs = [...prod.entries()]
	.filter(([d]) => d === "connect-src" || d === "default-src")
	.flatMap(([, sources]) => sources)
	.filter((s) => s.startsWith("ws://") || s.startsWith("wss://"));
check(
	"prod.no-websocket",
	prodWs.length === 0,
	prodWs.length === 0 ? "no ws:// allowances in production" : `websocket sources in production: ${prodWs.join(", ")}`
);

const assetSources = [...prod.entries()]
	.filter(([d]) => d === "connect-src" || d === "img-src" || d === "default-src")
	.flatMap(([, sources]) => sources)
	.filter((s) => s.startsWith("asset:") || s.includes("asset.localhost"));
check(
	"prod.no-asset-protocol",
	assetSources.length === 0,
	assetSources.length === 0
		? "asset protocol absent (add deliberately and scoped when a feature needs it)"
		: `asset-protocol allowances found: ${assetSources.join(", ")}`
);

check(
	"prod.font-src-self",
	(prod.get("font-src") ?? []).includes("'self'"),
	"font-src must include 'self' (self-hosted/bundled fonts only, no CDN)"
);
check(
	"prod.img-src-self",
	(prod.get("img-src") ?? []).includes("'self'"),
	"img-src must include 'self'"
);

// ---------------------------------------------------------------------------
// 2. Development policy: production base + ONLY the enumerated dev allowances
// ---------------------------------------------------------------------------
check(
	"dev.csp-present",
	typeof devCsp === "string" && devCsp.trim() !== "",
	"app.security.devCsp must be a non-empty string"
);
check(
	"build.devUrl-valid",
	devOrigin !== null,
	`build.devUrl must be a valid URL for deriving dev allowances (got: "${devUrl}")`
);

if (dev.size > 0) {
	// Compare directive by directive: dev sources minus prod sources must all
	// be enumerated dev allowances.
	for (const [dir, devSources] of dev) {
		const prodSources = new Set(prod.get(dir) ?? []);
		const additions = devSources.filter((s) => !prodSources.has(s));

		if (dir === "style-src" || dir === "script-src") {
			// Dev-only allowances:
			// - style-src: inline styles injected by the HMR runtime.
			// - script-src: SvelteKit dev injects an inline bootstrap <script>
			//   into the dev HTML (kit.start(...)); without 'unsafe-inline' the
			//   dev app cannot boot. Deviation from the literal D-022 dev
			//   allowance list, recorded in the M0 report — production keeps
			//   script-src 'self' (verified at runtime by verify-prod-csp).
			const unexpected = additions.filter((s) => s !== "'unsafe-inline'");
			check(
				`dev.${dir}-inline-only`,
				unexpected.length === 0,
				unexpected.length === 0
					? `${dir} adds only 'unsafe-inline' for the dev runtime`
					: `${dir} has unexpected dev additions: ${unexpected.join(", ")}`
			);
		} else if (dir === "connect-src") {
			const unexpected = additions.filter((s) => !DEV_CONNECT_EXTRA_ALLOWED.has(s));
			check(
				"dev.connect-src-hmr-only",
				unexpected.length === 0,
				unexpected.length === 0
					? "connect-src adds only the dev-server origin and HMR websocket"
					: `connect-src has unexpected dev additions: ${unexpected.join(", ")}`
			);
		} else {
			check(
				`dev.no-extra.${dir}`,
				additions.length === 0,
				additions.length === 0
					? `${dir} is identical to production`
					: `${dir} adds non-enumerated dev sources: ${additions.join(", ")}`
			);
		}
	}

	// Directives present in prod must also be present in dev (base preserved).
	for (const dir of prod.keys()) {
		check(
			`dev.keeps-base.${dir}`,
			dev.has(dir),
			dev.has(dir) ? `${dir} preserved in devCsp` : `${dir} missing from devCsp`
		);
	}
}

// ---------------------------------------------------------------------------
// 3. Dev-only allowances never leak into production
// ---------------------------------------------------------------------------
const devOnlyTokens = new Set(
	["'unsafe-inline'", devWs, devOrigin].filter(Boolean)
);
const leaked = [];
for (const [dir, sources] of prod) {
	for (const s of sources) {
		if (devOnlyTokens.has(s)) leaked.push(`${dir}: ${s}`);
	}
}
check(
	"prod.no-dev-allowances",
	leaked.length === 0,
	leaked.length === 0
		? "no dev-only allowance appears in the production CSP"
		: `dev allowances leaked into production: ${leaked.join("; ")}`
);

// ---------------------------------------------------------------------------
// 4. Capability files: least-privilege for M0
// ---------------------------------------------------------------------------
let capFiles = [];
if (existsSync(capsDir)) {
	capFiles = readdirSync(capsDir).filter((f) => f.endsWith(".json"));
}
for (const file of capFiles) {
	const cap = JSON.parse(readFileSync(join(capsDir, file), "utf8"));
	const perms = (cap.permissions ?? []).map((p) =>
		typeof p === "string" ? p : p?.identifier ?? ""
	);
	const badPerms = perms.filter((p) => !CAP_PERMISSION_RE.test(p));
	check(
		`caps.${file}.m0-allowlist`,
		badPerms.length === 0,
		badPerms.length === 0
			? `${file}: ${perms.length} permission(s), all core:* within the M0 allowlist`
			: `${file} grants non-M0 permissions: ${badPerms.join(", ")}`
	);
	const windows = cap.windows ?? [];
	const badWindows = windows.filter((w) => w !== "main");
	check(
		`caps.${file}.windows`,
		badWindows.length === 0 && windows.length > 0,
		windows.length > 0 && badWindows.length === 0
			? `${file} targets only the declared app windows: ${windows.join(", ")}`
			: `${file} targets undeclared windows: ${windows.join(", ") || "(none)"}`
	);
}

// ---------------------------------------------------------------------------
// 5. Application no-inline-style rule (A-6, DP-04/D-026)
//
// The enforceable application coding rule: `style:` directives and `style=`
// attributes are prohibited in application components (CSS classes and
// design tokens only), and the CSP-blocking DOM style applications
// (setAttribute("style"), .style.cssText) are prohibited anywhere in the
// application frontend. This keeps application code from ever regrowing
// inline-style CSP enforcement events like the documented SvelteKit
// runtime one (docs/phase2-results/m1/style-src-investigation.md).
//
// Scan scope: all Svelte components, the HTML template, and frontend TS.
// For the markup scans of Svelte files, <script> blocks and HTML comments
// are stripped first (strings inside component script are checked by the
// DOM-application scan instead).
// ---------------------------------------------------------------------------
const SRC_DIR = join(repoRoot, "src");

function walkSrc(dir, exts) {
	const found = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) {
			found.push(...walkSrc(p, exts));
		} else if (exts.some((e) => entry.name.endsWith(e))) {
			found.push(p);
		}
	}
	return found;
}

function stripBlocks(source) {
	return source
		.replace(/<script[\s\S]*?<\/script>/gi, "") // component scripts (covered by the DOM scan)
		.replace(/<!--[\s\S]*?-->/g, ""); // comments may legitimately mention the rule
}

const svelteFiles = walkSrc(SRC_DIR, [".svelte"]);
const htmlFiles = walkSrc(SRC_DIR, [".html"]);
const tsFiles = walkSrc(SRC_DIR, [".ts"]);

const styleAttrHits = [];
const styleDirectiveHits = [];
const domStyleHits = [];

for (const file of [...svelteFiles, ...htmlFiles]) {
	const raw = readFileSync(file, "utf8");
	const markup = stripBlocks(raw);
	// style= attribute in markup (quotes optional to catch sloppiness).
	for (const match of markup.matchAll(/\bstyle\s*=/g)) {
		styleAttrHits.push(`${relative(repoRoot, file)}:${markup.slice(0, match.index).split("\n").length}`);
	}
	if (file.endsWith(".svelte")) {
		// style: directive in markup (attribute position).
		for (const match of markup.matchAll(/\bstyle\s*:/g)) {
			styleDirectiveHits.push(`${relative(repoRoot, file)}:${markup.slice(0, match.index).split("\n").length}`);
		}
	}
}
for (const file of [...tsFiles, ...svelteFiles, ...htmlFiles]) {
	const raw = readFileSync(file, "utf8");
	for (const pattern of [/setAttribute\(\s*["']style["']/g, /\.style\s*\.\s*cssText/g]) {
		for (const match of raw.matchAll(pattern)) {
			domStyleHits.push(
				`${relative(repoRoot, file)}:${raw.slice(0, match.index).split("\n").length} (${pattern.source})`
			);
		}
	}
}

check(
	"app.no-style-attributes",
	styleAttrHits.length === 0,
	styleAttrHits.length === 0
		? `no style= attributes in ${svelteFiles.length + htmlFiles.length} markup file(s) (A-6)`
		: `style= attributes found (A-6 violation): ${styleAttrHits.join(", ")}`
);
check(
	"app.no-style-directives",
	styleDirectiveHits.length === 0,
	styleDirectiveHits.length === 0
		? `no style: directives in ${svelteFiles.length} Svelte file(s) (A-6)`
		: `style: directives found (A-6 violation): ${styleDirectiveHits.join(", ")}`
);
check(
	"app.no-dom-style-application",
	domStyleHits.length === 0,
	domStyleHits.length === 0
		? `no setAttribute("style")/cssText applications in the frontend (A-6)`
		: `DOM inline-style applications found (A-6 violation): ${domStyleHits.join(", ")}`
);

// ---------------------------------------------------------------------------
// 6. Zero-network boundary and secret-free frontend (ARCH-05 / SEC-16)
//
// The frontend performs no network fetches (network lives in the Rust core;
// M1 adds zero network surface) and stores no secrets. These checks scan
// the application frontend for the APIs and identifiers that would indicate
// a violation.
// ---------------------------------------------------------------------------
const NETWORK_PATTERNS = [
	[/\bfetch\s*\(/, "fetch()"],
	[/\bXMLHttpRequest\b/, "XMLHttpRequest"],
	[/\bnew\s+WebSocket\b/, "WebSocket"],
	[/\bEventSource\s*\(/, "EventSource"],
	[/\bnavigator\s*\.\s*sendBeacon\b/, "navigator.sendBeacon"]
];

const networkHits = [];
for (const file of [...tsFiles, ...svelteFiles, ...htmlFiles]) {
	const raw = readFileSync(file, "utf8");
	for (const [pattern, label] of NETWORK_PATTERNS) {
		for (const match of raw.matchAll(new RegExp(pattern.source, "g"))) {
			networkHits.push(
				`${relative(repoRoot, file)}:${raw.slice(0, match.index).split("\n").length} (${label})`
			);
		}
	}
}
check(
	"app.no-network-apis",
	networkHits.length === 0,
	networkHits.length === 0
		? `no renderer network APIs in ${tsFiles.length + svelteFiles.length + htmlFiles.length} frontend file(s) (ARCH-05 zero-network boundary)`
		: `renderer network APIs found (ARCH-05 violation): ${networkHits.join(", ")}`
);

const SECRET_PATTERN = /\b(?:api[_-]?key|secret|token|password)\s*[:=]/i;
const secretHits = [];
for (const file of [...tsFiles, ...svelteFiles, ...htmlFiles]) {
	const raw = readFileSync(file, "utf8");
	for (const match of raw.matchAll(new RegExp(SECRET_PATTERN.source, "g"))) {
		secretHits.push(
			`${relative(repoRoot, file)}:${raw.slice(0, match.index).split("\n").length}`
		);
	}
}
check(
	"app.no-secret-identifiers",
	secretHits.length === 0,
	secretHits.length === 0
		? "no API-key/secret/token/password identifiers in the frontend (SEC-16)"
		: `secret-like identifiers found (SEC-16 review required): ${secretHits.join(", ")}`
);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const failed = results.filter((r) => !r.pass);
for (const r of results) {
	console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id}  — ${r.detail}`);
}
console.log("");
console.log(
	failed.length === 0
		? `check-csp: ALL ${results.length} CHECKS PASSED`
		: `check-csp: ${failed.length} of ${results.length} CHECKS FAILED`
);
process.exit(failed.length === 0 ? 0 : 1);
