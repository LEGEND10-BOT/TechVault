# TechVault M0 — Dependency Audit Analysis (npm findings)

**Document status:** Post-implementation review deliverable (2026-11-14). Analysis only — **no package was installed, upgraded, removed, or pinned during this review** (per the owner's authorization boundaries). Data captured from `npm audit --json`, the installed `node_modules` manifests, and the npm registry (version queries only).
**Formal audit cadence note:** `cargo audit` + `npm audit` are formally scheduled at M10 (SEC-19, `PHASE_2_DEPENDENCY_REVIEW.md` §8). This document analyzes the current `npm audit` findings early because the M0 report disclosed them.

---

## 1. Summary

`npm audit` reports **5 findings, all low severity, 0 moderate/high/critical** (metadata: `{ info: 0, low: 5, moderate: 0, high: 0, critical: 0, total: 5 }`). They reduce to **four distinct advisories** across **four packages**, all inside the SvelteKit build/tooling subtree. **None of the affected code paths ships in the TechVault production binary** — the production frontend is a static SPA with no SvelteKit server, no form actions, and no prerendered pages — but each finding is assessed on its own merits below rather than dismissed.

## 2. Per-finding analysis

### Finding 1 — `@sveltejs/kit` — GHSA-pfhg-q3qv-9q6r

| Field | Value |
|---|---|
| Advisory | **SvelteKit: URL redirection to untrusted site via enhanced form submission** — https://github.com/advisories/GHSA-pfhg-q3qv-9q6r |
| Vulnerable range | `< 3.0.0` |
| Installed | `@sveltejs/kit` **2.70.4** (direct dependency) |
| Dependency path | direct (`package.json` devDependencies) |
| Dev/build or runtime? | The vulnerable behavior lives in SvelteKit's server-side form-action handling — a runtime surface TechVault does not ship or run. Kit's client runtime *is* bundled into the SPA, but this advisory's vector is the server action redirect flow. |
| Exploitability in TechVault | **Not exploitable as shipped:** the app defines no `+page.server`/`+server` endpoints, no form actions, and no `<form method="POST">` enhanced submissions (verified: only `+page.svelte`/`+layout.*` exist under `src/routes/`). There is no HTTP server in production to receive a forged form post. |
| Non-breaking remediation | None — the advisory covers all of 2.x. |
| Breaking remediation | `@sveltejs/kit` **3.2.0** (major; npm flags `isSemVerMajor: true`), pulling `@sveltejs/adapter-static` 4.0.1. |
| Recommendation | Accept for M0 (documented non-exploitability); bundle the kit-3 major upgrade decision into the M1 dependency review or M10 audit with a full regression pass. |

### Finding 2 — `@sveltejs/kit` — GHSA-27mw-82g8-phjj

| Field | Value |
|---|---|
| Advisory | **SvelteKit: XSS via untrusted cache-control header in prerendered page** — https://github.com/advisories/GHSA-27mw-82g8-phjj |
| Vulnerable range | `< 3.0.0` |
| Installed | `@sveltejs/kit` **2.70.4** (same direct dependency) |
| Dependency path | direct |
| Dev/build or runtime? | Affects **prerendered page output served by an HTTP server** — TechVault has none. |
| Exploitability in TechVault | **Not exploitable as shipped:** `prerender = false` everywhere (`src/routes/+layout.ts`); the build emits only the SPA fallback (`index.html`) + static assets, loaded via the `tauri://`/`http://tauri.localhost` custom protocol, not a server that could reflect attacker-influenced cache headers. |
| Non-breaking remediation | None — all of 2.x affected. |
| Breaking remediation | `@sveltejs/kit` 3.2.0 (same upgrade as Finding 1). |
| Recommendation | Same as Finding 1 — one upgrade decision covers both kit advisories. |

### Finding 3 — `cookie` — GHSA-pxg6-pf52-xh8x

| Field | Value |
|---|---|
| Advisory | **cookie accepts cookie name, path, and domain with out of bounds characters** — https://github.com/advisories/GHSA-pxg6-pf52-xh8x |
| Vulnerable range | `< 0.7.0` |
| Installed | **0.6.0** (transitive) |
| Dependency path | `@sveltejs/kit` → `cookie` (kit declares `cookie: ^0.6.0`; also listed in kit's dev-time `ssr.external` set) |
| Dev/build or runtime? | **Dev/build tooling only.** `cookie` is used by SvelteKit's server-side request handling (parsing `Cookie` headers); TechVault's production SPA performs no cookie handling and no kit server runs. |
| Exploitability in TechVault | **None in production.** In dev, the Vite/Kit dev server parses cookies from local browser requests on 127.0.0.1 — no attacker-controlled input reaches it in normal use. |
| Non-breaking remediation | **Possible but not applied here:** an npm `overrides` entry forcing `cookie@^0.7.0` (the fix line; 0.7.0 is the security release — current latest is 2.0.2, a major). This changes kit's transitive tree against kit's declared `^0.6.0` range — it must be tested (kit's usage is plain parse/serialize, so compatibility is likely but **unverified because this task prohibits dependency changes**). |
| Breaking remediation | `@sveltejs/kit` 3.2.0 (declares a newer cookie range). |
| Recommendation | If the owner wants action before the kit-3 upgrade: authorize a one-line `overrides` test (`cookie@^0.7.0`) + full test suite re-run. Otherwise defer to the kit-3 decision. |

### Finding 4 — `deepmerge` — GHSA-gcqx-w48m-w2h4

| Field | Value |
|---|---|
| Advisory | **deepmerge mergeObject() allows prototype poisoning of returned objects** — https://github.com/advisories/GHSA-gcqx-w48m-w2h4 |
| Vulnerable range | `>= 4.2.0 <= 4.3.1` |
| Installed | **4.3.1** (transitive) |
| Dependency path | `@sveltejs/vite-plugin-svelte` 7.3.1 → `deepmerge ^4.3.1` |
| Dev/build or runtime? | **Build tooling only** (config-object merging inside the Vite plugin). Never shipped to the WebView. |
| Exploitability in TechVault | **Negligible as used:** prototype poisoning here would require attacker-controlled plain objects reaching `mergeObject` during the build/dev process. TechVault feeds it only its own static `vite.config.js`/kit config. It is, however, a genuine supply-chain hygiene item — the project does **not** get a pass merely for severity. |
| Non-breaking remediation | **None exists.** The vulnerable range spans the entire ≥4.2.0 line and **4.3.1 is the latest published version** (registry-verified during this review) — upstream has released no patched 4.x, and `@sveltejs/vite-plugin-svelte` pins `^4.3.1`. Fix requires either an override to a hypothetical patched release (none exists), a major-version override (deepmerge 5 — ESM/major, untested, out of scope), or upstream action in `vite-plugin-svelte`. |
| Breaking remediation | Indirect: whatever upstream kit-3-era toolchain replaces the vulnerable merge path. |
| Recommendation | Record and monitor (the advisory is acknowledged, not waived): re-check at M10 audit and at every kit/toolchain upgrade. No TechVault-side action is currently possible without untested major overrides that this task prohibits. |

### Finding 5 — `@sveltejs/adapter-static` (and the `vite-plugin-svelte` row)

Not independent advisories: npm lists them as findings **because they depend on vulnerable `@sveltejs/kit` / `deepmerge`**. Resolved by the same upstream upgrades. `@sveltejs/adapter-static` fix line = **4.0.1** (major).

## 3. Aggregate assessment

| Question | Answer |
|---|---|
| Do any findings affect the shipped production runtime? | **No.** The production frontend is a static SPA: no kit server, no form actions, no prerendered pages, no cookie processing. Findings 1–4 live in server/dev/build code paths TechVault does not execute in production. |
| Do any findings affect dev machines? | Findings 1–4 exist in the dev toolchain; practical exploitability on a localhost-only dev server with no attacker-controlled input is negligible, and the dev WebView is additionally CSP-restricted. |
| Is anything blocked by severity policy? | No moderate/high/critical findings exist. All 5 are low. |
| What is the single decision that clears most of this? | `@sveltejs/kit` 2.x → 3.2.0 (+ adapter-static 4.0.1) — a **breaking major upgrade** outside the approved M0 dependency review (which pins the kit 2.x line), therefore an owner decision, not an agent action. |
| Is there any non-breaking remediation available today? | Only the `cookie@^0.7.0` npm override (Finding 3) — testable, untested. Findings 1/2/4 have no non-breaking fix. |

## 4. Recommended disposition (for owner decision)

1. **Accept for M0** with this document as the rationale record (non-exploitability in TechVault's architecture + low severity + no non-breaking fix for 3 of 4 advisories). This matches the M0 report's AUD-1 entry.
2. **Schedule the kit-3 major upgrade decision** at the M1 dependency review (natural point: M1 adds `lucide-svelte`/`clsx`/`tailwind-merge` anyway) or no later than M10's formal `npm audit` gate, with a full regression pass (svelte-check, vitest, dev HMR verification, release build, CSP runtime checks) as its acceptance criteria.
3. **Optional interim hardening** (smallest possible step): authorize testing the `cookie@^0.7.0` override now; adopt only if the full suite stays green.
4. **Track deepmerge upstream** — no action possible in-tree today; re-verify at each toolchain upgrade.

**Explicit non-claims:** no upgrade was performed; no override was tested; no claim is made that kit 3.x is compatible with the M0 codebase (its breaking changes have not been assessed).

---

**End of PHASE_2_M0_DEPENDENCY_AUDIT.md**

## 5. Owner decision record (2026-11-14)

**DECIDED — kit 3.x upgrade deferred, recorded as D-025** in `docs/DECISION_LOG.md` §4 (explicit owner instruction, "M0 Owner Decisions and Verification Record"):

> The SvelteKit 3.x major upgrade is deferred to the **M1 dependency review** (evaluated together with M1's planned additions: `lucide-svelte`, `clsx`, `tailwind-merge`). No upgrade is performed now; **no cookie overrides or other dependency changes are applied now.** The existing audit findings and their documented risk assessment (this document §2–§3) are preserved unchanged.

- **No dependency was changed** by this decision — versions, lockfiles, and the audit findings remain exactly as analyzed in §2.
- **Standing M1 agenda item:** assess `@sveltejs/kit` 3.2.0 / `@sveltejs/adapter-static` 4.0.1 compatibility; if adopted, run the full regression pass (svelte-check, vitest, dev HMR verification, release build, CSP config + runtime checks) as acceptance criteria.
- **deepmerge (GHSA-gcqx-w48m-w2h4):** still no patched release exists upstream; re-check at every toolchain upgrade and at the M10 audit. Not waived — tracked.
- The M10 formal `npm audit` / `cargo audit` gates are unaffected.

---

**End of PHASE_2_M0_DEPENDENCY_AUDIT.md** *(decision record appended 2026-11-14)*

## 6. Final verification note (2026-11-14)

`npm audit --json` re-run during the M0 final verification: inventory **identical** to §2 (5 low; GHSA-pfhg-q3qv-9q6r, GHSA-27mw-82g8-phjj, GHSA-pxg6-pf52-xh8x, GHSA-gcqx-w48m-w2h4 + 2 dependent rows). No upgrade, override, or lockfile change performed — D-025 (defer kit 3.x to the M1 dependency review) re-confirmed by the owner and stands. Secret-pattern scan of the new sources and the application log: 0 real hits.

---

**End of PHASE_2_M0_DEPENDENCY_AUDIT.md** *(§6 appended 2026-11-14)*
