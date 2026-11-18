# TechVault Phase 2 M1 — UI Specification

**Document status:** Prepared Draft v1.0 (2026-11-14) — blueprint only, **no implementation authorized**. Governs itself by `UI_DESIGN_SYSTEM.md` (owner-approved, D-011), D-023 (in-house Svelte 5 primitives + accessibility test plan), and OD-1 (neutral logo placeholder). No third-party UI framework is introduced (bits-ui/melt-ui remain not adopted).

---

## 1. Shell and navigation (G1)

- **Layout:** fixed left sidebar 220 px (logo slot + 8-item navigation + settings access), sticky topbar 56 px (global search input, job-status indicator, theme toggle), flexible main workspace, optional collapsible right contextual panel (reserved — populated by the detail view at G9).
- **Navigation items:** Dashboard, Sources, Resources, Notebooks, Knowledge Graph, Bookmarks, Research Analytics, Settings. Active state visually distinct without excessive color (design system §6.2).
- **Routes:** all 8 items exist from G1 with designed empty states. Dashboard/Sources/Notebooks/Graph/Bookmarks/Analytics render explicit "later phase"/"coming with data" placeholders — **never fake content**. Resources and Settings are fully real by G9/G1 respectively.
- **Themes:** dark-primary default + full light theme, persisted across restart (theme store; `prefers-color-scheme` respected on first run); token set per UI_DESIGN_SYSTEM §4 (the M0 `app.css` token layer is extended to the full token set at G1).
- **Typography:** system fonts (DP-11 APPROVED, D-026 — retain the current stack; **no Geist bundling in M1**). Monospace for IDs, hashes, sizes, timestamps.
- **Branding (OD-1):** neutral wordmark placeholder slot; the exact approved shield/T asset integrates verbatim on delivery; no approximation, no redesign; missing assets never block the shell.
- **Responsive behavior:** within desktop constraints — window resize from 900×600 (M0 minimums) reflows gracefully (sidebar collapse behavior, table column priority); no mobile layouts in Phase 2.

## 2. In-house primitives (D-023; G1)

Set: **button, card, badge, table, dialog, sheet, dropdown, tabs, toast, tooltip, input** — Svelte 5 runes + Tailwind + `lucide-svelte`, class composition via `clsx` + `tailwind-merge`. Variants per design system §7 (button: primary/secondary/outline/ghost/destructive; badges tinted for verification/status/category/discovery; destructive dialogs state consequences).

**Accessibility acceptance (TEST-09 — recorded results required; ARIA presence alone is never compliance):**
- Dialogs/sheets: focus moves into the opened surface; keyboard focus cannot escape a modal (focus trap); Escape closes where appropriate; focus returns to the invoking control; background interaction disabled for modal surfaces.
- Dropdowns/tabs: keyboard navigation per WAI-ARIA APG; correct ARIA roles and states; focus and selected state synchronized.
- All primitives: visible focus indicators; screen-reader labels; reduced-motion support; automated accessibility checks per component suite.
- Manual: full keyboard walkthrough of every primitive; manual screen-reader smoke test (Narrator/NVDA) with recorded results.

## 3. Resource library (G9) — the core screen

### 3.1 Library table

- Columns: canonical name (+ aliases count indicator), category, short description (truncated), verification badge, discovery badge, source count, updated (monospace). Row click → detail; row actions (edit/archive/delete) via row menu.
- **Virtualized** rendering (UI-11) — justified at ≥1k rows; page size 50 with keyset paging; column sorting and saved filter state.
- Toolbar: global-filter chips (category, verification, discovery, tags, date, attachments), search-input handoff to the topbar search, view density (comfortable/compact), import button.
- Performance: interaction p95 ≤100 ms @10k rows (proposed, W2); no full-dataset loads — paged queries only.

### 3.2 Resource detail view

- Header: canonical name (inline-editable), verification badge + unverified warning when applicable, category, archive toggle.
- **Aliases dropdown (D5):** compact expandable list — alternate/previous names with type labels; not a carousel.
- Sections (tabs or stacked): **Description** · **Identifiers** (typed, primary marked, verified-at shown) · **Mentions** (manual list; create/link affordance; each with source, snippet, timestamp) · **Evidence** (compact snippets with type/provenance/timestamp; expandable; never raw huge blocks) · **Attachments** (list with name/size/hash/retention; upload/remove with confirmation; retention semantics labeled "kept until you delete it") · **Tags** (chip editor) · **Relationships** (link/unlink with typed relationship picker; provenance shown) · **History** (append-only meaningful-change list).
- Verification display: the four states with distinct badges; **unverified resources carry the AI-generated-information warning**; confidence is never displayed as verification proof (M1 displays NULL confidence as nothing, never "0%").

### 3.3 Import workflow (G9 surface over the G4 engine)

- Dialog/sheet flow: choose **paste text** or **choose file(s)** (native dialog via `tauri-plugin-dialog`) → per-file retention choice for media/documents ("save as attachment" vs "process temporarily", with a one-line explanation) → validation results list (each file: accepted/importing/failed with typed reason) → job progress (stage, throttled events, cancel button) → completion report (imported/linked-duplicate/partial/failed counts).
- Duplicate result: informational status ("identical content already imported — linked to existing source"), never silent.
- Unsupported type: explicit typed message naming the type and the current matrix; no generic "failed".

### 3.4 Search UI

- Topbar global search: input → grouped results (Resources / Sources) → Enter/click navigates; recent-searches optional (local only).
- Results page: filter sidebar (same chips as library), relevance/updated/created/name sort, entity grouping, deep links. Empty/no-result states designed with suggested next actions (UI-05).

## 4. Settings (G1 shell + incremental sections)

Sections and their gate: Appearance (G1) · **Storage** — temp/attachments/backup paths, storage usage summary, orphan report + sweep action (G3/G12) · **Sources & limits** — OD-9 limit table with per-type limits + overrides (G4) · **Search** (G8) · **Backup & restore** — export destination, restore with explicit warnings + pre-restore safety note, data export/import (G10/G11) · **Providers** — R-023 placeholder state rendered clearly as "not configured — disabled" (SEC-16; G1) · **About/diagnostics** — versions, log location, sanitized diagnostics export (G1/G12).

## 5. States, errors, confirmations (UI-05/06 + module L)

- **Every screen ships:** loading (skeleton/spinner sized to content), empty (explains what will appear + the action that creates it), error (what happened + next action + retry affordance where applicable), partial-success (counts: imported/linked/partial/failed).
- Errors render the typed message + category-appropriate icon/label; internals never leak (sanitized messages only).
- Destructive actions (delete resource/source/attachment/transcript later, restore-overwrite, category delete) always use the confirmation dialog with consequence text listing what will and will not be affected.
- Toasts: non-blocking success/failure notices; errors also surface in the relevant screen state.

## 6. Accessibility and interaction (beyond primitives)

- Full keyboard traversal: sidebar → topbar → workspace → table (arrow-key row navigation) → detail tabs; visible focus everywhere; no keyboard traps outside modals.
- Reduced-motion respected (transitions gated on `prefers-reduced-motion`).
- Never color-only status (badges carry labels/icons).
- Desktop window resize: no horizontal scrolling in the workspace at ≥900 px; table columns degrade by priority.

## 7. Job-status indicator (G1 inert, G2 live)

Topbar indicator: idle (hidden) / active jobs (count + current stage) / any failure (attention state). Click → jobs popover (list, progress, cancel). Subscription per job via `job:*` events — no polling.

## 8. Definition of done for any M1 screen

Follows the approved visual system · dark + light themes · states complete (loading/empty/error/partial) · keyboard accessible with recorded TEST-09 results for its primitives · uses shared tokens and primitives (no arbitrary values) · no new dependencies · preserves the approved logo/placeholder rules · meets the performance expectations of the budget document.

---

**End of PHASE_2_M1_UI_SPECIFICATION.md**
