/*
 * Global-stylesheet behavior tests: the reduced-motion gate is a real,
 * file-level accessibility requirement (TEST-09; UI_DESIGN_SYSTEM §9) —
 * assert the CSS rule exists and covers the right properties.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// vitest transforms import.meta.url to a non-file scheme; resolve from the
// repo root (vitest's stable cwd).
const appCss = readFileSync(resolve(process.cwd(), "src/app.css"), "utf8");

describe("reduced-motion CSS gate", () => {
	it("gates transitions and animations behind prefers-reduced-motion", () => {
		expect(appCss).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
		expect(appCss).toContain("transition-duration: 0.01ms");
		expect(appCss).toContain("animation-duration: 0.01ms");
		expect(appCss).toContain("animation-iteration-count: 1");
		expect(appCss).toContain("scroll-behavior: auto");
	});
});

describe("theme token mechanism", () => {
	it("switches themes via the html.light class only — no inline-style mechanism", () => {
		// Dark tokens are the :root default (primary direction); light is a
		// class override. No other theme mechanism may exist (A-6).
		expect(appCss).toMatch(/html\.light \{/);
		expect(appCss).toMatch(/--tv-bg: #0b0b0d/); // near-black workspace (owner correction B)
		expect(appCss).toMatch(/--tv-sidebar: #191a1c/); // charcoal sidebar
		expect(appCss).toMatch(/--tv-surface: #232427/); // lighter charcoal cards
		expect(appCss).toMatch(/--tv-text: #f2f2f3/); // off-white primary text
		expect(appCss).toMatch(/--tv-accent: #8b5cf6/); // restrained purple accent
	});
});
