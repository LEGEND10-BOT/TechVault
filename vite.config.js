import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";
import tailwindcss from "@tailwindcss/vite";

// TechVault M0 frontend build configuration.
// Tauri dev/build invoke `vite dev` / `vite build` through the npm scripts.
//
// SvelteKit 3 (kit-3 review, 2026-11-14): `svelte.config.js` is no longer
// supported — the kit config (preprocess + static-SPA adapter) is passed
// through the `sveltekit()` plugin options below. TechVault still uses
// SvelteKit only as a static SPA build for the Tauri WebView: no Node
// server, no SSR endpoints, no server-side fetches
// (PHASE_2_ARCHITECTURE.md §7.3).
// See: https://svelte.dev/docs/kit/single-page-apps
// See: https://v2.tauri.app/start/frontend/sveltekit/
export default defineConfig({
	plugins: [
		tailwindcss(),
		// Kit 3 flattens the former `kit` namespace: adapter and other kit
		// options are passed directly to the plugin.
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({
				fallback: "index.html"
			})
		})
	],

	// Vite options tailored for Tauri development (same pattern as the
	// P1-A-validated configuration):
	// 1. prevent Vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: process.env.TAURI_DEV_HOST || "127.0.0.1",
		watch: {
			// 3. tell Vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"]
		}
	},

	// Vitest configuration (frontend unit + contract tests).
	// `resolve.conditions: ["browser"]` under vitest is the documented
	// @testing-library/svelte + SvelteKit pattern: it makes Svelte components
	// compile against the client (browser) build instead of the server build.
	resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
	test: {
		include: ["tests/frontend/**/*.test.ts"],
		environment: "jsdom",
		environmentOptions: {
			jsdom: {
				// Script execution in the jsdom window is required by the a11y
				// helper (axe-core bundle is executed inside the window context).
				runScripts: "dangerously"
			}
		},
		// globals: required by @testing-library/svelte's automatic cleanup
		// (afterEach hook) so rendered components do not leak across tests.
		globals: true,
		setupFiles: ["tests/frontend/setup.ts"]
	}
});
