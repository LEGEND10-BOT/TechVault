# TechVault Phase 2 M1 — G1 Owner Verification Guide (manual acceptance)

**Purpose:** G1's exit condition is **owner visual + accessibility acceptance recorded** (milestone G1 item 8/10). The automated suites (64/64 vitest incl. axe, svelte-check 0/0, cargo 33/33, check-csp 42/42, runtime CSP probes 5/5) already ran — see `PHASE_2_M1_G1_IMPLEMENTATION_REPORT.md`. This guide covers exactly what automation cannot: human visual judgment and real-assistive-technology behavior.

**What you will launch:** the release build at `D:\Builds\cargo-target\release\techvault.exe` (already built; MSI/NSIS installers also produced). Every step below takes a few minutes.

---

## 1. Visual acceptance vs `UI_DESIGN_SYSTEM.md` (both themes) — G1 item 8

Launch the exe and check, in **dark** (default) then **light** (toggle in the topbar):

| # | Check | Expected |
|---|---|---|
| 1.1 | Sidebar width/structure | 220 px; TechVault wordmark placeholder (OD-1 — deliberately no shield/T artwork until you deliver the assets); 7 nav items; Settings pinned below a divider |
| 1.2 | Topbar | 56 px; disabled search field with explanatory tooltip (hover/focus it); theme toggle button; (no job indicator — idle is hidden by design) |
| 1.3 | Colors | Background/surface/borders match the design-system §4 dark or light values; violet accent; no off-palette colors |
| 1.4 | Typography | System font stack (Segoe UI); monospace for the data-directory/log-path lines in Settings → About |
| 1.5 | Each of the 7 non-Settings routes | Honest placeholder (icon + explanation + phase badge). No fake content anywhere |
| 1.6 | Settings → Appearance | Three theme options; switching applies immediately |
| 1.7 | Settings → Providers | "Not configured — disabled" placeholder (SEC-16); nothing configurable |
| 1.8 | Settings → About | Version identity, OS/arch, build profile, data directory, log path |
| 1.9 | Theme persistence | Pick Light, close the app, relaunch — still Light (then set back as you prefer) |
| 1.10 | Toast behavior | (Optional) — toasts appear bottom-right; no toasts fire in normal G1 use except a theme-save failure |

## 2. Manual keyboard walkthrough (TEST-09) — every primitive + shell

With the release app running, using only the keyboard:

1. **Skip link**: Tab from app start → a "Skip to main content" link appears (visible focus); Enter jumps into the workspace.
2. **Sidebar**: Tab/Shift+Tab through all 8 destinations; active route is `aria-current` (visually distinct, not color-only). Enter navigates.
3. **Topbar**: the disabled search is skipped-or-focusable-disabled (disabled inputs are not focusable — the tooltip explanation covers pointer users; this is expected); theme toggle is reachable and `aria-pressed` reflects the state.
4. **Settings**: Tab into the vertical section navigation. Appearance, Providers and About are ordinary focusable buttons with a visible active state. Arrow-key roving navigation is not used. Enter/Space switches sections. *(Corrected 2026-11-19, finding F-2 — this item previously described the removed horizontal tablist.)*
5. **Theme radios**: Tab into the group; ArrowUp/ArrowDown switches options; the applied theme changes immediately.
6. **Dialog + Sheet**: (to exercise them beyond Settings, any future screen will use them — the automated suites verified the wiring; on-screen confirmation of the native focus trap can be done via the browser DevTools in the debug build if you want a live demonstration: `npm run dev` + open any dialog)
7. **General**: visible focus indicator everywhere (accent outline); no keyboard trap outside modals; Escape closes any open surface.

Record: any place the traversal order feels wrong, focus is invisible, or a control is unreachable.

## 3. Manual screen-reader smoke test (TEST-09) — Narrator or NVDA

Windows key + Ctrl + Enter (Narrator) or start NVDA, with the release app:

1. Sidebar announces "Main navigation" with 8 links; the active one is announced as "current page".
2. Topbar: search field announced with its explanation (disabled); theme toggle announces its label ("Switch to light theme" / "…dark…") and pressed state.
3. Routes: each placeholder announces its title and explanation text.
4. Settings: tabs announce role + selected state ("Appearance, tab, selected"); theme radios announce "Theme preference, System/Dark/Light, radio button, selected"; Providers announces "Not configured — disabled"; About announces the identity fields.
5. Errors: (the app cannot easily produce one in normal use — the automated suites verify the alert roles; skip if not practical).

Record: anything announced incorrectly or unlabeled.

## 4. Reduced-motion check (TEST-09)

Settings (Windows) → Accessibility → Visual effects → Animation effects **Off**, then use the app: hover transitions and any animation are effectively instant (the global CSS gate); no motion sickness-inducing animation remains.

## 5. Window-resize check (G1 item 8)

Resize the window down to the 900×600 minimum and back: no horizontal scrolling in the workspace; the sidebar and topbar hold their layout; content reflows.

## 6. What "acceptance" means for the gate

- Confirm each table/checklist item above (or note exactly what failed).
- On your confirmation, the G1 exit condition ("owner visual + accessibility acceptance recorded") is met and the gate closes with both the automated evidence (implementation report §5–§6) and this manual record.
- Known condition you will see (not a defect): exactly one console error-level entry at startup — the documented runtime CSP-enforcement event from SvelteKit's route announcer (accepted as a known condition per DP-04; zero application errors).

**Outstanding owner actions referenced by G1 (unchanged):** OD-1 logo asset delivery (the placeholder swaps verbatim on delivery); OD-12 key revocation (standing).

---

**End of PHASE_2_M1_G1_OWNER_VERIFICATION_GUIDE.md**

---

## v1.1 — owner correction pass (2026-11-14)

The layout, theme, and controls were revised per the owner's reference screenshot and feedback (full record: `docs/phase2-results/m1/g1r2-correction-pass.md`; screenshots: `docs/phase2-results/m1/screenshots/`). The checklist below **replaces §1's theme item and adds zoom checks**; §2–§5 remain valid **except §2 item 4, corrected 2026-11-19 (finding F-2 — the Settings screen now uses vertical section navigation, not tabs)**.

### Revised visual acceptance items (replaces 1.3, extends 1.6)
- **1.3R Dark theme (default)**: near-black workspace, charcoal sidebar, slightly lighter charcoal cards, subtle grey borders, off-white text, muted grey secondary text, restrained purple accent used only on interactive/selected states. Reference evidence: `screenshots/g1-dashboard-dark.png`.
- **1.6R Settings**: **vertical internal navigation** (Appearance / Providers / About) with active-section highlight; segmented theme control (Light / ✓ Dark / System); "Display zoom" card with Zoom out / percentage / Zoom in / Reset. Reference: `screenshots/g1-settings-dark.png`.
- **1.11R Sidebar**: branding block (wordmark + "Local-first research"), disabled "Add Source URL" button with explanatory tooltip (hover/focus), all 8 destinations in one list, Settings last.
- **1.12R Topbar**: current section title on the left; disabled search (tooltip explains) and theme toggle on the right.

### New — zoom acceptance (owner correction C)
Automated evidence already recorded: shortcuts work through the real input pipeline on the release build, bounds (50–200 %) hold, persistence to `settings.json` verified, typing never intercepted (`docs/phase2-results/m1/g1r2-verify-zoom-output.txt`; unit suite 15 zoom tests). Owner checks:
1. **Ctrl + Plus / Ctrl + Minus / Ctrl + 0** anywhere in the app — including while typing in a text field — zoom changes smoothly and Ctrl+0 restores 100 %.
2. The zoom **does not reset on restart** (change zoom, close, relaunch).
3. Settings → Appearance → Display zoom buttons work and disable at 50 % / 200 %.
4. Keyboard feel (no lag, no double-steps) — only confirmable physically.

### Skip link re-check (owner correction D)
Tab from app start: the "Skip to main content" link appears **centered at the top** — it must no longer overlap the "TechVault" branding; Enter moves focus into the workspace content. (Automated: shell suite asserts hidden/focused classes, centering, focus transfer, no startup focus.)

### Unchanged known condition
Exactly one startup console entry — the documented SvelteKit route-announcer CSP enforcement event (re-verified on the corrected build; zero application errors).
