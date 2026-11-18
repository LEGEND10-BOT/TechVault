# M1 Pre-task A — kit-3 dependency assessment (D-025 → DP-12 rule) — evidence record

**Date:** 2026-11-14 · **Executed under:** the owner's explicit M1 implementation authorization ("begin with G1"), G1 item 3 pre-task ("the M1 dependency review incl. the D-025 kit-3 assessment under the approved DP-12 rule"), and D-026 ruling 12 ("Kit 3 adoption only after a complete green regression pass; an adoption outcome is recorded as its own decision record").
**Outcome: ADOPT (@sveltejs/kit 3.2.0 + @sveltejs/adapter-static 4.0.1) — every assessment leg green. Recorded as its own decision record: `DECISION_LOG.md` D-027.**

---

## 1. Baseline (before)

- `npm audit`: 5 low — GHSA-pfhg-q3qv-9q6r + GHSA-27mw-82g8-phjj (`@sveltejs/kit` 2.70.4), GHSA-pxg6-pf52-xh8x (`cookie` 0.6.0), GHSA-gcqx-w48m-w2h4 (`deepmerge` 4.3.1) — exactly as recorded in D-025; all in dev/build/server paths the production static SPA does not execute.
- Toolchain: kit 2.70.4, adapter-static 3.0.11, svelte 5.57.3, vite 8.0.16, vite-plugin-svelte 7.3.1.

## 2. Compatibility spike (upgrade)

- Installed `@sveltejs/kit@3.2.0` + `@sveltejs/adapter-static@4.0.1`.
- Version checks: kit 3.2.0 requires node ≥22.17 (host: v26.13.1 ✓), vite ^8.0.12 (✓), svelte ^5.57.1 (✓), vite-plugin-svelte ^7.0.0 (7.3.1 ✓), typescript ^6.0.0 (~6.0.3 ✓). `cookie` transitive → 2.0.2 (advisory fixed).
- Audit after: **4 low** — only `deepmerge` remains (no patched release exists upstream; latest is still 4.3.1). Per the D-025 assessment plan, deepmerge is re-checked at every toolchain upgrade and will be re-checked at the closure audit. All remaining findings stay in dev/build paths.

## 3. Breaking changes encountered and migrated (evidence of the spike)

1. **`svelte.config.js` no longer supported** (`config_file_unsupported`) → kit config moved into the `sveltekit(…)` Vite plugin options in `vite.config.js`; `svelte.config.js` deleted.
2. **`kit` namespace flattened** (`config_kit_namespace`) → `adapter` passed directly to the plugin options.
3. **`$lib` alias removed** (`module_removed_lib`) → all imports migrated to `#lib` (kit-3 convention); resolution declared via the package.json `imports` field (`"#lib/*": "./src/lib/*"`); explicit `paths` added to `tsconfig.json` so svelte-check/tsc share the mapping.
4. **tsconfig extends target changed** (`tsconfig_extends_missing`) → `extends: "$app/tsconfig"` (the `$app` virtual package written by sync), with an explicit `include: ["src", "tests"]` so svelte-check does not sweep unrelated trees (the Phase-1 `experiments/` artifacts are outside application scope), preserving the M0 check surface.
5. Vite dev server port/HMR configuration unchanged; adapter-static `fallback: "index.html"` unchanged (static-SPA posture per PHASE_2_ARCHITECTURE §7.3 unchanged).

## 4. Full regression pass (DP-12 requirement — every leg executed)

| Leg | Command | Result |
|---|---|---|
| svelte-check | `npm run check` | **0 errors, 0 warnings** (M0 baseline: 0/0) |
| Frontend unit + contract tests | `npm test` (vitest) | **17/17 passed** (2 files) — includes the IPC contract round-trip fixtures |
| Production build | `npm run build` (vite build + adapter-static) | PASS — site written to `build/` |
| Cargo suite | `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo test` (CARGO_TARGET_DIR=D:\Builds\cargo-target) | fmt clean · clippy clean · **17/17 Rust tests passed** (Rust side unaffected by kit-3; verified, not assumed) |
| Release build | `npx tauri build` | **PASS** — `D:\Builds\cargo-target\release\techvault.exe`; MSI 2.04 MiB; NSIS 1.33 MiB |
| CSP configuration check | `npm run check:csp` | **39/39 PASS** — production strictness and dev/prod isolation unchanged on kit 3 |
| Runtime production CSP probes | `node scripts/verify-prod-csp.mjs <release exe>` | **5/5 PASS** — remote fetch blocked, inline script blocked, string-eval blocked, IPC invoke works, page origin tauri.localhost |
| Dev HMR | `tauri dev` + `node scripts/verify-dev-hmr.mjs 9344 baseline` → CSS marker edit → `… 9344 assert kit3hmrverify` | baseline **PASS** (dev origin localhost:1420, debug IPC OK, M0 smoke view rendered, self-checks OK,OK,OK); assert **PASS** ("marker 'kit3hmrverify' applied live"). Probe note: the first assert attempt used a marker placed in a CSS comment, which the Tailwind CSS output pipeline strips — the rule itself propagated live; re-run with the marker inside a real rule produced the recorded PASS. First baseline attempt also raced the kit-3 cold-start compile (probe evaluated before Vite finished first transform); re-run on the warmed server PASSED. Both are probe-timing/marker artifacts, not toolchain failures — documented for honesty. |

**No check failed. Per the DP-12 rule, kit 3 is adopted.**

## 5. Post-adoption state

- `@sveltejs/kit` 3.2.0 · `@sveltejs/adapter-static` 4.0.1 · `svelte` 5.57.3 (unchanged) · `vite` 8.3.8 (in-range bump pulled by the upgrade) · `@sveltejs/vite-plugin-svelte` 7.3.1 · `cookie` 2.0.2.
- `npm audit`: 4 low, all the `deepmerge` GHSA-gcqx-w48m-w2h4 chain (dev/build only, unpatched upstream — carried risk, re-check scheduled at every toolchain upgrade + closure audit per D-025).
- Files changed by this review: `package.json` (+`imports` field, dependency versions), `package-lock.json`, `vite.config.js` (kit config inline), `tsconfig.json` (extends/include/paths), `src/lib/services/app.ts`, `src/lib/services/ipc.ts`, `src/routes/+page.svelte` (`$lib` → `#lib`), deletion of `svelte.config.js`. No Rust, CSP, capability, or tauri.conf.json change.
- Raw outputs: `docs/phase2-results/m1/kit3-regression-outputs.md`.
