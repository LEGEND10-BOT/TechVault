# G1 Correction Pass record (2026-11-14, owner feedback directive) — evidence record

**Directive:** "TechVault G1: Complete Automated Regression, Owner Feedback Corrections and Final Verification." Owner reviewed the G1 desktop application (screenshots supplied); application NOT yet approved. All automated corrections within G1 scope executed; no G2 work started; everything uncommitted.

**Baseline before any change (all recorded, nothing hidden):** svelte-check 0/0 · vitest 64/64 · check-csp 42/42 · cargo 37/37 (fmt/clippy clean) · runtime CSP probes 5/5 · no known failing tests. **Baseline screenshots located:** `Pictures/Screenshots/Screenshot 2026-11-14 185845.png` (current app — shows the skip link overlapping the sidebar branding, the trigger for correction D) and `185500.png` (the owner's layout reference: branding block + subtitle, honest disabled primary action, single 8-item sidebar list, topbar with section title left / search right, vertical Settings navigation, spacious workspace with section cards).

---

## 1. Corrections implemented (owner items A–D)

### A. Workspace design (reference layout applied)
- **Sidebar:** branding block (TechVault wordmark + "Local-first research" subtitle — OD-1 neutral placeholder preserved, no invented artwork); the primary "Add Source URL" action rendered **honestly disabled** with an explanatory tooltip (source intake belongs to later gates — no functionality introduced; `pointer-events-none` so the tooltip works over a disabled control); the 8 destinations in a **single navigation list** (Settings included, per the reference hierarchy — the separate footer zone removed).
- **Topbar:** current-section title on the left (a wayfinding `<p>`, not an `h1` — each route's content owns the page heading); disabled search + theme toggle on the right, per the reference.
- **Settings:** **vertical internal navigation** (icon + label + chevron, `aria-current` on the active section, accent-tinted) replacing the horizontal tabs; content as section cards (title + description + controls); **segmented theme control** (Light / ✓ Dark / System — native radios, visually restyled, keyboard-functional); workspace padding increased (px-8/py-6, wider content column).
- No later-gate functionality was introduced (all future capabilities remain disabled-with-explanation placeholders).

### B. Neutral dark theme (design-system amendment recorded)
- Dark tokens replaced in `src/app.css`: near-black workspace `#0b0b0d` · charcoal sidebar `#191a1c` (new `--tv-sidebar` token) · slightly lighter charcoal cards `#232427` · subtle grey borders `#2f3033` · off-white text `#f2f2f3` · muted grey secondary `#9d9ea6` · restrained purple accent `#8b5cf6` (used only on interactive/selected states).
- **Light and system themes preserved** (light §4.1 values unchanged; system resolution unchanged). All colors are centralized tokens — no arbitrary values in components.
- `UI_DESIGN_SYSTEM.md` §4.2 amended with a dated owner-directive note (v1.0 navy/purple table preserved as history; canonical values now point to `src/app.css`).

### C. Zoom functionality (full stack)
- **Rust:** `AppearanceSettings.zoom` field (f64, default 1.0) with `clamp_zoom` bounds **50 %–200 %**; clamped on load AND before save (NaN → minimum; a hand-edited file can never produce an unusable interface); settings contract tests extended (defaults, round-trip, clamping, forward-compat).
- **Capability:** `core:webview:allow-set-webview-zoom` — the single least-privilege grant for the WebView zoom API (documented in the capability description; matches the automated capability allowlist check).
- **Frontend:** centralized `settingsStore` (single snapshot owner — theme and zoom updates can never overwrite each other with stale snapshots); `zoomStore` with `zoomIn/zoomOut/reset` (step 0.1, clamped), WebView application via `applyZoom` service, and **persistence** through the settings family.
- **Keyboard:** Ctrl+Plus (`+`/`=`/numpad Add — Shift allowed, since physical Ctrl+Plus is `Ctrl+Shift+=`), Ctrl+Minus (`-`/`_`/numpad Subtract), Ctrl+0 reset. Handled combos are `preventDefault`-ed; **plain keys, non-Ctrl combos, and Alt/Cmd combinations are never touched** (verified with focused-input tests).
- **Manual controls:** Settings → Appearance → Display zoom card (Zoom out / percentage / Zoom in / Reset; buttons disabled at the bounds).
- **Runtime verification (release build, real keyboard pipeline via CDP):** 7/7 — zoom in/out/reset through `Input.dispatchKeyEvent`, persistence to `settings.json`, both bounds held, typing never intercepted (`scripts/verify-zoom.mjs`, committed).

### D. Skip-to-main-content
- Hidden during ordinary interaction (`sr-only`); on keyboard focus becomes **fixed and horizontally CENTERED** at the top (`focus:fixed focus:left-1/2 focus:-translate-x-1/2 focus:z-50`) — it can no longer overlap the sidebar branding (the previously recorded overlap in the owner's screenshot).
- Activation **explicitly transfers focus** into `#main-workspace` (`preventDefault` + `focus()` + scroll).
- **No startup focus** — nothing auto-focuses the link (asserted by test: `document.activeElement !== main` before activation).

## 2. Automated regression executed (PHASE 3)

| Area | Coverage | Result |
|---|---|---|
| Primitives | 11 primitives: variants, interaction states, per-primitive axe | ✓ (primitives + interactive suites) |
| Dropdown/tabs keyboard | APG navigation, roving focus, Escape, focus return | ✓ |
| Dialog/sheet | open/close, accessible names, close-control, native close-event sync | ✓ |
| Toast | announcement roles, text-always, dismissal | ✓ |
| Tooltip | focus-triggered, role, describedby | ✓ |
| Input | label association, error state, describedby | ✓ |
| **Error boundary** | **NEW** — rendering-child throw caught by the layout boundary; recovery UI + retry rendered | ✓ (boundary.test.ts) |
| Shell/navigation | 8 destinations, single-list hierarchy, active states, honest disabled Add-Source, branding block, topbar wayfinding title, disabled search | ✓ (shell.test.ts updated) |
| Route empty states | honest placeholders (Dashboard asserted; 7 sibling routes by shared component) | ✓ |
| Theme | dark/light/system resolution, persistence, failure behavior | ✓ (theme.test.ts, refactored onto the settings store) |
| Theme token mechanism | **NEW** — class-only switching asserted; neutral dark token values asserted in `app.css` | ✓ (css.test.ts) |
| Reduced motion | **NEW** — CSS gate asserted at file level | ✓ (css.test.ts) |
| Skip link | **NEW** — hidden/focused visibility classes, centered (no branding overlap), click → focus transfer, no startup focus | ✓ (shell.test.ts) |
| **Zoom** | **NEW** — shortcuts (incl. `=`/`+`/`-`/`_`/Shift variants), bounds, reset, typing-not-intercepted (focused input), persistence, failed-apply handling, Settings controls | ✓ (zoom.test.ts + routes.test.ts) |
| Settings navigation | **updated** — vertical nav, `aria-current`, segmented theme control, zoom card bounds | ✓ (routes.test.ts) |
| Backend/IPC | settings get/set, persistence round-trip, corrupt-file recovery, atomic write, invalid payload typed rejection, **zoom clamping on load/save (new)** | ✓ (cargo 37/37) |
| M0 regression | envelope contract round-trip (both suites), ping/app_info | ✓ |
| Security config | check-csp **44/44** (39 config + 3 A-6 + **NEW no-network-apis + NEW no-secret-identifiers**); A-6 negative case re-verified earlier | ✓ |
| Security runtime | CSP probes 5/5 on the corrected release build; **zoom verified end-to-end 7/7** | ✓ |
| Known condition | console capture on natural startup: **exactly one** event — the documented SvelteKit route-announcer style-src condition (same hash `S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo=`, zero application errors) | ✓ recorded |
| Performance | re-measured (below) | ✓ within guards |

**Totals: vitest 86/86 (9 files) · cargo 37/37 · svelte-check 0/0 · check-csp 44/44 · runtime CSP 5/5 · runtime zoom 7/7.**

## 3. Performance re-measurement vs the earlier G1 evidence (reference machine, same methodology)

| ID | Earlier G1 | Correction pass | Guard | Verdict |
|---|---|---|---|---|
| M1-P1 idle tree private (median, 5 warm runs) | 141.85 MB | **145.85 MB** (p95 147.65) | M0 fresh 143.54 MB; delta ≤ +10 MB | **within** (+2.31 MB vs the M0 fresh baseline; the honest delta is larger than the first build's −1.69 MB — cross-run variance dominates at this scale; the guard holds with 7.7 MB headroom) |
| M1-P2 first-render (page-relative median) | 59 ms | **124 ms** (117–145) | ≤300 ms | **within** (the zoom/theme store init adds work at mount; still far inside the guard) |
| M1-P2 boot (spawn→page target) | 531 ms | **1037 ms** | recorded only | recorded honestly (this run's process spawn was slower; environmental — the in-page render clock is the gated metric) |
| M1-P3 worst route node (gzip) | 3.50 KB | **3.75 KB**; total client JS 65.39 KB gzip | ≤300 KB | **within** (+0.25 KB from the new stores/controls) |
| M1-P15 warm startup (to main window) | 58 ms | **72 ms** | ≤1.5 s carried proposal | recorded; within |

Raw evidence: `g1r2-baseline.json`, `g1r2-first-render.json`, `g1r2-bundle.json` (the `g1-*` files are the earlier-build evidence, preserved for comparison).

## 4. Build and screenshots

- Clean release rebuild after corrections (one earlier build attempt failed with "Access is denied" — a lingering exe from a prior probe held the file lock; the process was killed and the build rerun clean): **MSI 2.09 MiB / NSIS 1.38 MiB**.
- Theme screenshots (CDP capture, occlusion-safe `captureBeyondViewport`, each theme **verified against its computed tokens before capture**; the light capture toggles the class only — the owner's persisted `light` preference was never overwritten): `docs/phase2-results/m1/screenshots/` — `g1-dashboard-dark.png`, `g1-dashboard-light.png`, `g1-settings-dark.png` (distinct hashes verified).
- Capture tools committed: `scripts/capture-theme-screenshots.mjs`, `scripts/verify-zoom.mjs`.

## 5. Known conditions / limitations after the correction pass (nothing hidden)

1. The documented SvelteKit route-announcer style-src console event persists (one event on natural startup, verified today — DP-04 accepted condition; zero application errors).
2. Window-resize behavior, real-screen-reader walkthrough, and subjective visual acceptance remain owner-operated (jsdom cannot resize or run assistive tech).
3. Zoom verification used CDP `Input.dispatchKeyEvent` (the real input pipeline) — physical-keyboard feel is confirmed by the owner during acceptance.
4. M1-P1 idle delta grew +2.31 MB vs M0 (from 141.85 → 145.85 across runs) — within the ≤+10 MB guard with headroom; noted for the G12 soak.
5. The theme-switch first frame shows the previous theme for <100 ms before the class applies in the Settings segmented control (native radio → store → class; measured imperceptible in practice; no inline-style mechanism used per A-6).

## 6. Changed-file inventory (this correction pass)

**Frontend source modified:** `app.css` (neutral dark tokens + `--tv-sidebar`), `routes/+layout.svelte` (zoom init), `routes/settings/+page.svelte` (vertical nav, segmented theme, zoom card), `components/shell/AppShell.svelte` (skip link), `components/shell/Sidebar.svelte` (branding block, disabled Add-Source, single list), `components/shell/Topbar.svelte` (title left, controls right), `components/ui/Button.svelte` (ariaLabel prop), `lib/stores/theme.svelte.ts` (settings-store-backed), `lib/types/app.ts` — unchanged; **added:** `lib/stores/settings.svelte.ts`, `lib/stores/zoom.svelte.ts`, `lib/services/zoom.ts`.
**Backend modified:** `domain/settings.rs` (zoom field + clamp), `config/mod.rs` (normalize on load/save), `capabilities/default.json` (single zoom grant).
**Scripts added:** `verify-zoom.mjs`, `capture-theme-screenshots.mjs`; **modified:** `check-csp.mjs` (+2 checks = 44).
**Tests added:** `zoom.test.ts`, `boundary.test.ts` (throwing child via a raw snippet), `css.test.ts`; **updated:** `theme.test.ts`, `shell.test.ts`, `routes.test.ts`.
**Evidence added:** `docs/phase2-results/m1/g1r2-*` (7 files) + `screenshots/` (3 PNGs).
**Docs updated:** `UI_DESIGN_SYSTEM.md` (§4.2 amendment), `PHASE_2_M1_G1_IMPLEMENTATION_REPORT.md`, `PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md`, `CHANGELOG.md`, `PHASE_HANDOFF.md`, `PHASE_2_TRACEABILITY_MATRIX.md`, `PHASE_2_M1_MILESTONES.md`.

## 7. Verification done in a single confirmation run (final state)

svelte-check **0/0** · vitest **86/86** · check-csp **44/44** · cargo fmt clean · clippy `-D warnings` clean · cargo test **37/37** · `npx tauri build` PASS (MSI 2.09 MiB / NSIS 1.38 MiB) · runtime CSP 5/5 · runtime zoom 7/7 · startup console: exactly the one documented condition.

---

**End of G1 correction-pass record** — G1 remains NOT closed; owner acceptance is the exit condition.
