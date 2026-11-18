# M1 Pre-task B — production-CSP `style-src` event investigation (DP-04, D-026) — evidence record

**Date:** 2026-11-14 · **Mandate:** security review §8.1 ruling 2 — "a short, time-boxed investigation of the Svelte runtime style-src event is conducted (G1): identify the runtime call site and eliminate it only if it can reasonably be done without weakening CSP."
**Outcome: ROOT CAUSE IDENTIFIED — the event originates in `@sveltejs/kit`'s own runtime (upstream code), not TechVault application code, and cannot reasonably be eliminated without weakening CSP or patching upstream dependencies. Documented and ACCEPTED AS A KNOWN CONDITION per DP-04 ruling 3. Production CSP unchanged (strict, D-022). No hash allowance introduced (ruling 4/5).**

---

## 1. Reproduction on the current build

Release exe (kit-3 build, `D:\Builds\cargo-target\release\techvault.exe`) launched with WebView2 CDP; console captured via `Log.entryAdded` during a startup observation:

```
[error] (security) Applying inline style violates the following Content Security Policy
directive 'style-src 'self''. Either the 'unsafe-inline' keyword, a hash
('sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo='), or a nonce ('nonce-...')
is required to enable inline execution. Note that hashes do not apply to event
handlers, style attributes and javascript: navigations unless the 'unsafe-hashes'
keyword is present. The action has been blocked.
  url: http://tauri.localhost/_app/immutable/chunks/CvWvvkQL.js line 0
  at Zn CvWvvkQL.js:0:22632
```

Same event, same hash as the M0 closure record — the kit-3 upgrade did **not** change or fix it.

## 2. Call-site chain (verified in the built output and upstream sources)

1. Blocked function `Zn` in the Svelte runtime chunk is Svelte 5's template creator:
   `function Zn(e){var t=Yt('template'); return t.innerHTML=Xn(e.replaceAll('<!>','<!---->')), t.content}`
   — it assigns a compiled component's HTML template to `template.innerHTML`.
2. The parsed template string contains a **style attribute**. Scanning every string literal in all built client chunks found exactly one:
   `style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"`
3. That string is the visually-hidden **route announcer** in SvelteKit's runtime root component — `node_modules/@sveltejs/kit/src/runtime/components/root.svelte` line 50:
   ```svelte
   <div id="svelte-announcer" aria-live="assertive" aria-atomic="true"
       style="position: absolute; … clip-path: inset(50%); …">
   ```
   It is the screen-reader page-title announcer (an accessibility feature). When Svelte parses the root template via `innerHTML`, the WebView2 CSP engine blocks the inline style attribute application → the single console error at startup.
4. **TechVault application code is not involved:** the independent audit verified zero `style:`/`style=` in app components; the only inline-style string in the entire built output is the one above (single occurrence, upstream). Svelte's own `style.cssText` path (`svelte/src/internal/client/dom/elements/style.js:41`) is tree-shaken out of our build entirely (no `cssText`/`set_style` in any chunk).

## 3. Elimination options assessed (time-box respected)

| Option | Assessment |
|---|---|
| Fix in TechVault code | Impossible — the style attribute is inside `@sveltejs/kit`'s runtime component; no application surface can change it. |
| Hash allowance | **Already ruled out (DP-04 ruling 5)** — and technically worse than understood at M0: the console message states hashes **do not apply to style attributes** without the `'unsafe-hashes'` keyword, so the previously imagined "add the one hash" remedy would actually require the substantially broader `'unsafe-hashes'` weakening. No hash allowance is introduced; any such change requires separate owner authorization. |
| Patch upstream (`patch-package`/vendored override) | Would modify dependency source via a non-standard toolchain addition (new dev dependency + postinstall hook + a forked upstream file to maintain on every kit bump). Disproportionate supply-chain/maintenance cost for removing one console event; rejected under AGENTS.md §6 dependency discipline. |
| Upstream fix | The correct long-term fix is upstream (move the announcer's visually-hidden styles out of the template's inline attribute). Still present in kit 3.2.0 (verified today). Recorded as an upstream-follow candidate; no M1 dependency on it. |

**Conclusion per DP-04 ruling 3:** the event cannot reasonably be eliminated within TechVault's scope without weakening CSP or patching upstream — **documented and accepted as a known condition.** M1's console criterion operates as "zero application errors; the documented runtime CSP-enforcement event is listed as a known condition" (the recorded fallback). The production CSP remains exactly as D-022/D-026 require; `check-csp` and the runtime probes pass unchanged.

## 4. Diagnostics tooling note

The capture used a one-off CDP console dump script (`D:\Temp\techvault\cdp-console-dump.mjs`, outside the repository — a diagnostic, not committed tooling). The committed verification scripts (`scripts/check-csp.mjs`, `scripts/verify-prod-csp.mjs`) are unchanged and pass unchanged.
