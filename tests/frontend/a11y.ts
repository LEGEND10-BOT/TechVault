/*
 * Automated accessibility helper for the TEST-09 per-primitive suites.
 *
 * axe-core ships as a UMD browser bundle; under Vite's ESM interop the
 * named import does not resolve to the axe object. The proven approach
 * (jest-axe's) is to execute the axe-core bundle inside the jsdom window
 * once and read `window.axe` from there. Runs against the rendered
 * container and fails with a readable summary on any violation. Nothing
 * is filtered: "incomplete" rules (jsdom cannot compute real layout, e.g.
 * color-contrast) are reported by axe as incomplete, not violations, and
 * are additionally covered by the manual walkthrough on the real runtime.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { expect } from "vitest";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

let injected = false;

function getAxe(): { run: (target: HTMLElement) => Promise<AxeResults> } {
	const win = window as unknown as { axe?: { run: (t: HTMLElement) => Promise<AxeResults> } };
	if (!injected) {
		// vitest's jsdom does not execute injected <script> elements, but
		// window.eval runs in the page context — execute the UMD bundle there
		// so it attaches itself to the window.
		window.eval(axeSource);
		injected = true;
	}
	if (!win.axe) {
		throw new Error("axe-core failed to initialize in the jsdom window");
	}
	return win.axe;
}

interface AxeResults {
	violations: {
		id: string;
		impact: string | null;
		help: string;
		nodes: { target: string[] }[];
	}[];
}

export async function expectNoAxeViolations(container: HTMLElement): Promise<void> {
	const axe = getAxe();
	const results = await axe.run(container);
	if (results.violations.length > 0) {
		const summary = results.violations
			.map(
				(v) =>
					`  ${v.id} [${v.impact ?? "unknown"}] — ${v.help} — ${v.nodes.length} node(s):\n` +
					v.nodes
						.map((n) => `    ${n.target.join(" ")}`)
						.join("\n")
			)
			.join("\n");
		throw new Error(`axe found ${results.violations.length} violation(s):\n${summary}`);
	}
	expect(results.violations).toHaveLength(0);
}
