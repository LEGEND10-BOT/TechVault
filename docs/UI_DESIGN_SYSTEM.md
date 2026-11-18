# TechVault UI Design System

**Document:** UI_DESIGN_SYSTEM.md  
**Project:** TechVault  
**Version:** 1.0  
**Status:** Owner-Approved Visual Direction  
**Last Updated:** 2026-11-11

---

# 1. Purpose

This document defines the visual identity, design principles, component standards, layout rules and interaction behavior of TechVault.

It serves as the primary UI reference for developers and AI coding agents.

All screens must follow this design system unless the owner explicitly approves a change.

The uploaded TechVault shield + T logo is approved and must be retained unchanged. Do not redesign, replace or reinterpret it.

# 2. Design Philosophy

TechVault is a developer-first research and knowledge-management workspace.

The interface should feel:

- Professional.
- Minimal.
- Technical.
- Fast.
- Organized.
- Information-dense without becoming cluttered.
- Comfortable for extended research sessions.

Design inspiration:

- Linear.
- Raycast.
- Vercel.

These are visual references only. Do not copy their branding, exact layouts or proprietary interface designs.

# 3. Core Visual Principles

1. Prefer clarity over decoration.
2. Use subtle borders and restrained shadows.
3. Avoid oversized cards.
4. Keep information density practical.
5. Use consistent spacing.
6. Maintain readable typography.
7. Make important actions easy to discover.
8. Avoid unnecessary animations.
9. Keep desktop and mobile experiences purpose-built.
10. Use color meaningfully rather than decoratively.

# 4. Color System

Use CSS variables through Tailwind CSS 4.

## 4.1 Light Theme

| Token | Value |
|---|---|
| Background | #FAFAFA |
| Surface | #FFFFFF |
| Foreground | #1E1B2E |
| Border | #E2E8F0 |
| Muted | #F1F5F9 |
| Primary | #7C3AED |
| Primary Dark | #5B21B6 |

## 4.2 Dark Theme

**Amended 2026-11-14 (owner G1 correction directive — supersedes the v1.0 dark palette):** the dark theme is **neutral**, not navy/purple-dominant — near-black workspace background, charcoal sidebar, slightly lighter charcoal cards, subtle grey borders, off-white primary text, muted grey secondary text, and a **restrained purple interactive accent** (accent used only on interactive/selected states; large surfaces stay neutral). The canonical dark values live in the centralized token layer `src/app.css` (`:root` block); light theme values below are unchanged.

| Token | v1.0 value (superseded) | Current source of truth |
|---|---|---|
| Background | #0F172A | `--tv-bg: #0b0b0d` (`src/app.css`) |
| Surface | #1E1B4B | `--tv-surface: #232427` (`src/app.css`) |
| Foreground | #F8FAFC | `--tv-text: #f2f2f3` (`src/app.css`) |
| Border | #312E81 | `--tv-surface-border: #2f3033` (`src/app.css`) |
| Muted | #312E81 | `--tv-muted: #2a2b2e` (`src/app.css`) |
| Primary | #A78BFA | `--tv-accent: #8b5cf6` (`src/app.css`) |
| Primary Dark | #7C3AED | `--tv-accent-hover: #7c3aed` (`src/app.css`) |

The v1.0 table is preserved below for history.

| Token | Value |
|---|---|
| Background | #0F172A |
| Surface | #1E1B4B |
| Foreground | #F8FAFC |
| Border | #312E81 |
| Muted | #312E81 |
| Primary | #A78BFA |
| Primary Dark | #7C3AED |

Dark mode is the primary visual direction.

Light mode must also be fully supported.

The selected theme should persist between application sessions.

## 4.3 Semantic Colors

| Meaning | Light | Dark |
|---|---|---|
| Success | #15803D | #22C55E |
| Warning | #B45309 | #F59E0B |
| Error | #B91C1C | #EF4444 |
| Information | #1D4ED8 | #3B82F6 |

Semantic colors must always be accompanied by readable labels or icons where appropriate.

Never communicate critical status through color alone.

# 5. Typography

Preferred fonts:

- Primary: Geist Sans.
- Alternative: Inter.
- Monospace: Geist Mono.
- Alternative monospace: JetBrains Mono.

Usage:

| Element | Style |
|---|---|
| Page title | text-lg font-semibold tracking-tight |
| Section title | text-sm font-medium text-muted-foreground |
| Body | text-sm |
| Secondary text | text-xs |
| Micro labels | 10px or 12px uppercase mono |
| Metrics | Monospace |
| Timestamps | Monospace |
| Confidence values | Monospace |

Typography must remain readable at normal desktop and mobile scaling.

# 6. Layout System

## 6.1 Desktop Layout

Recommended structure:

- Left sidebar: 220px.
- Topbar: 56px.
- Main workspace: flexible width.
- Contextual right panel: optional.

The topbar should remain sticky where useful.

Use a subtle blurred surface behind the topbar if it does not affect performance or readability.

## 6.2 Sidebar

The sidebar should contain:

- TechVault logo.
- Main navigation.
- Workspace or notebook navigation.
- Settings access.
- Optional collapse behavior.

Navigation:

1. Dashboard.
2. Sources.
3. Resources.
4. Notebooks.
5. Knowledge Graph.
6. Bookmarks.
7. Research Analytics.
8. Settings.

Active navigation must be visually distinguishable without excessive color.

## 6.3 Main Workspace

The main workspace should:

- Use available width efficiently.
- Avoid unnecessary horizontal scrolling.
- Keep consistent content margins.
- Use compact sections.
- Support contextual panels.
- Preserve important content during navigation.

## 6.4 Contextual Right Panel

The right panel may display:

- Video player.
- Resource details.
- Evidence.
- Source metadata.
- Notebook context.

It should be independently collapsible.

On desktop, a single-click split-panel experience is preferred where practical.

## 6.5 Mobile Layout

Mobile must use a responsive single-column layout.

Requirements:

- Adapted navigation.
- Touch-friendly controls.
- No forced desktop sidebar.
- Dedicated or single-column video player.
- Readable resource details.
- Simplified graph interaction.
- Avoid unnecessary horizontal scrolling.

Mobile is not simply a compressed desktop screen.

# 7. Component Standards

Preferred component direction:

- Shadcn-style New York components.
- Radix primitives.
- Tailwind CSS 4.
- Lucide icons.
- Accessible interaction patterns.

Components should be reusable.

Avoid creating multiple visually inconsistent implementations of the same control.

## 7.1 Buttons

Button variants:

- Primary.
- Secondary.
- Outline.
- Ghost.
- Destructive.

Buttons must have:

- Clear labels.
- Hover states.
- Focus states.
- Disabled states.
- Loading states where needed.

## 7.2 Cards

Use cards for meaningful groups of information.

Cards should use:

- Subtle borders.
- Minimal shadows.
- Consistent padding.
- Clear hierarchy.

Do not wrap every small element in a card.

## 7.3 Badges

Use badges for:

- Verification.
- Processing status.
- Resource categories.
- Discovery type.

Avoid decorative badges without a useful purpose.

## 7.4 Tables

Tables should support:

- Sorting.
- Filtering.
- Search.
- Row actions.
- Responsive behavior.
- Empty states.
- Loading states.

For mobile, use a suitable compact layout instead of forcing a wide table.

## 7.5 Dialogs and Sheets

Use dialogs for important confirmation tasks.

Use side sheets for contextual details where appropriate.

Destructive actions must explain their consequences.

# 8. Spacing and Shape

Preferred base radius:

0.625rem / 10px.

Use a consistent spacing scale.

Prefer compact layouts.

Avoid excessive padding in data-heavy views.

Use 1px subtle borders.

# 9. Interaction and Motion

Preferred interaction style:

- Fast.
- Subtle.
- Predictable.
- Accessible.

Examples:

- hover:border-primary/50.
- transition-colors.
- Subtle opacity transitions.
- Short contextual animations.

Respect reduced-motion settings.

Do not use decorative animation that increases CPU/GPU usage unnecessarily.

# 10. Dashboard

The dashboard should present useful project activity.

Possible sections:

- Source count.
- Resource count.
- Notebook count.
- Pending review count.
- Processing jobs.
- Recent discoveries.
- Recent sources.
- Graph preview.
- Recent activity.

Avoid unnecessary analytics or excessive widgets.

The dashboard must prioritize actionable information.

# 11. Sources Interface

The Sources page should support:

- Source URL.
- Platform.
- Title.
- Processing status.
- Submission date.
- Associated resource count.
- Transcript status.
- Notes.
- Playback access.

Source status must distinguish completed, partial, unsupported, failed and authentication-required states.

The user must be able to inspect source evidence.

# 12. Resources Interface

The Resources page is a core application screen.

Each resource row or card should display:

- Canonical name.
- Resource type.
- Short description.
- Verification status.
- Discovery type.
- Official link if verified.
- Source count.
- Relevant indicators.

Provide filters for:

- Resource category.
- Verification status.
- Discovery type.
- Date.
- Source platform.
- Notebook.

## 12.1 Alternate Names and History

The canonical name should be the main displayed name.

A subtle expandable dropdown should show:

- Alternate names.
- Previous names.
- Source-specific names.
- Relevant identity history.

Do not use a large carousel for aliases.

Meaningful resource changes should have a subtle change indicator.

## 12.2 Verification Presentation

Display distinct statuses:

- Verified.
- Partially Verified.
- Unverified.
- Broken/Unavailable.

Unverified resources must show a clear warning that AI-generated information may be incorrect.

Confidence must not be presented as proof of verification.

# 13. Notebook Interface

Notebook sections:

- Overview.
- Sources.
- Resources.
- Notes.
- Summary.
- AI Chat.
- Evidence.

The interface should support research across multiple sources.

Notebook AI context must be clearly scoped.

The user should be able to inspect which sources support an answer.

# 14. Video Player Interface

Desktop:

- Right-side contextual panel.
- Source metadata.
- Resource timestamps.
- Evidence navigation.

Mobile:

- Dedicated playback view or single-column layout.

Player controls must not interfere with normal application navigation.

Show playback limitations clearly.

Never silently redirect to an external website.

# 15. Evidence Interface

Evidence should be compact and useful.

Display:

- Source name.
- Timestamp.
- Relevant snippet.
- Evidence type.
- Provenance.
- Verification context.

Avoid displaying enormous raw evidence blocks by default.

Allow expansion when more context is needed.

# 16. Knowledge Graph

The graph should support:

- Pan.
- Zoom.
- Search.
- Filtering.
- Progressive expansion.
- Node selection.
- Relationship inspection.
- Contextual details.

Graph nodes may represent:

- Resources.
- Sources.
- Notebooks.
- Technologies.
- Concepts.
- Categories.

Mobile graph controls must be simplified.

Graph performance must be benchmarked using realistic datasets.

# 17. Search and Command Palette

Global search should be accessible from the topbar.

A keyboard command palette is recommended.

Suggested shortcut:

Ctrl+K or platform-appropriate equivalent.

Search should cover:

- Resources.
- Sources.
- Notebooks.
- Notes.
- Transcripts.

Search results should clearly distinguish entity types.

# 18. Loading, Empty and Error States

Every major screen must have:

- Loading state.
- Empty state.
- Error state.
- Partial-success state where applicable.

Errors should explain what happened and what the user can do next.

Avoid generic messages such as "Something went wrong" when a meaningful explanation is available.

# 19. Accessibility

Requirements:

- Keyboard navigation.
- Visible focus indicators.
- Appropriate contrast.
- Semantic controls.
- Accessible labels.
- Screen reader support where practical.
- Reduced motion support.
- Touch-friendly mobile controls.

# 20. Design Consistency

All screens must use shared design tokens and reusable components.

Do not introduce arbitrary colors, font sizes, border radii or spacing values without justification.

The approved uploaded logo must remain unchanged.

The existing TSX reference file is a visual reference only. It does not override the approved Svelte 5 frontend architecture.

# 21. Performance

UI implementation should avoid:

- Unnecessary component rerenders.
- Excessive DOM elements.
- Heavy animations.
- Rendering entire large datasets at once.
- Repeated expensive computations.
- Unbounded graph rendering.

Use pagination, virtualization or progressive rendering when justified by actual dataset size.

# 22. Definition of Done

A screen is considered complete when:

- It follows the approved visual system.
- It supports dark and light themes.
- It is responsive.
- It has loading, empty and error states.
- Keyboard accessibility is considered.
- It uses reusable components.
- It does not introduce unnecessary dependencies.
- It preserves the approved TechVault logo.
- It meets performance expectations.

---

**End of UI_DESIGN_SYSTEM.md**
