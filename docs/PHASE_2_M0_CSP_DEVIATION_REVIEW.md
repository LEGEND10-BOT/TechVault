# TechVault M0 — CSP Deviation Review (DEV-CSP-1)

**Document status:** Post-implementation review deliverable (2026-11-14). Prepared under the owner's read-only review authorization. **No configuration was modified** — `tauri.conf.json` still carries the M0 state: strict production `csp` unchanged, `devCsp` carrying the `unsafe-inline` script allowance under review here.
**Decision requested from owner:** §6 (choose the development-CSP mechanism; production CSP is not affected by any option).

---

## 1. The deviation under review

D-022 defines the development CSP as the production base **plus only** the enumerated dev allowances: the dev-server origin (`http://localhost:1420`), the HMR websocket (`ws://localhost:1420`), and dev-time inline styles. M0 implementation found that the SvelteKit **dev** server additionally requires an inline **script** allowance, and M0 shipped `devCsp` as:

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self'; font-src 'self';
connect-src 'self' ipc: http://ipc.localhost http://localhost:1420 ws://localhost:1420
```

The production `csp` remains exactly as approved (`script-src 'self'`, no `unsafe-inline`) and was runtime-verified on the release build (`docs/phase2-results/m0/verify-prod-csp-output.txt`). This document reviews whether the script allowance can be narrowed.

## 2. Root cause (verified from sources, not inferred)

### 2.1 What SvelteKit injects in dev

The dev server HTML (captured live from `http://localhost:1420/` during this review) contains exactly **one inline script** (432 bytes, one occurrence):

```html
<script>
  {
    __sveltekit_dev = {
      base: new URL(".", location).pathname.slice(0, -1),
      env: {}
    };
    const element = document.currentScript.parentElement;
    Promise.all([
      import("/@fs/D:/TechVault/node_modules/@sveltejs/kit/src/runtime/client/entry.js"),
      import("/@fs/D:/TechVault/.svelte-kit/generated/client/app.js")
    ]).then(([kit, app]) => {
      kit.start(app, element);
    });
  }
</script>
```

This is the SvelteKit dev bootstrap (`kit.start`) — the dev-mode equivalent of the SSR bootstrap that `runtime/server/page/render.js` emits for server-rendered output. Without it, the SPA never boots in `tauri dev`.

### 2.2 Why the production policy blocks it

The release-build runtime probe already proved the mechanism: under `script-src 'self'` (no `unsafe-inline`), a page-injected inline `<script>` never executes (post-review evidence: `docs/phase2-results/m0/post-review-runtime-probe.txt` + `verify-prod-csp-output.txt`). The same enforcement necessarily applies to this dev bootstrap; hence dev cannot boot under the production-identical script policy.

### 2.3 Source-level verification (SvelteKit 2.70.4, installed)

| Fact | Evidence |
|---|---|
| The Vite dev server contains **no CSP handling at all** | `node_modules/@sveltejs/kit/src/exports/vite/dev/index.js` — zero matches for `csp`; same for `src/exports/vite/index.js` |
| `kit.csp` (nonce/hash support, `Csp` class) is wired only into the server-render/prerender paths | `node_modules/@sveltejs/kit/src/runtime/server/page/render.js` (imports `./csp.js`, `csp.add_script(init_app)`) — not reachable from the Vite dev pipeline in this project's shape |
| SvelteKit offers no configuration to externalize or suppress the dev bootstrap | No such option in the kit config schema (`types.d.ts` / documented `kit.csp` affects emitted CSP **headers for SSR/prerendered pages only**) |

**Consequence:** a *supported SvelteKit configuration* cannot remove the inline dev bootstrap, and `kit.csp.mode = 'nonce'` would not even be applied in `tauri dev`.

### 2.4 Tauri side (tauri-utils 2.10.2, installed)

| Fact | Evidence |
|---|---|
| Tauri injects the CSP as a **static** `<meta http-equiv="Content-Security-Policy">` tag into served HTML | `tauri-utils/src/html.rs` — `inject_csp` → `create_csp_meta_tag` |
| `csp` is used in built apps; `devCsp` (when set) is used in dev; config strings pass through **unchanged** | `tauri-utils/src/config.rs` `SecurityConfig` docs (lines ~3040–3056) |
| Tauri's runtime CSP "modification" only appends hashes/nonces for **Tauri's own injected scripts** (build-time); it cannot carry a per-request nonce for a foreign (SvelteKit) script | same sources; `dangerousDisableAssetCspModification` only disables that own-script handling |

**Consequence:** any mechanism that relies on a *per-request* value (nonce) cannot cross the SvelteKit↔Tauri boundary in dev.

## 3. Options analysis

### Option A — Nonce-based CSP (`kit.csp.mode = 'nonce'`)

| Aspect | Assessment |
|---|---|
| Technical feasibility | **Infeasible.** SvelteKit's dev server does not apply `kit.csp` (§2.3) — no nonce is ever generated or attached in `tauri dev`. Even under SSR, Tauri's static meta CSP cannot receive SvelteKit's per-request nonce (§2.4). |
| Security implications | n/a |
| Compatibility (Tauri 2 / Vite HMR) | None |
| Testing required | n/a |
| Maintenance | n/a |

**Verdict: rejected — mechanism does not exist for this pipeline.**

### Option B — Hash-pinned dev script (`'sha256-…'` in `devCsp script-src`)

| Aspect | Assessment |
|---|---|
| Technical feasibility | **Feasible.** The bootstrap is byte-stable: SHA-256 computed twice across dev-server restarts during this review — identical both times: `omexX53BM4kcFHqMOynB85uzz2PpUvgoHBJX+sDkf8E=` (432-byte script; exactly one inline script in the dev HTML). Tauri passes the config string through unmodified (§2.4), and WebView2/Chromium enforces hash sources from meta CSP. The resulting dev `script-src` would be `'self' 'sha256-omexX53BM4kcFHqMOynB85uzz2PpUvgoHBJX+sDkf8E='` (note: when a hash is present, `'unsafe-inline'` is ignored by the browser — it would be dropped, giving a *stricter* dev policy than today). |
| Security implications | Strictly stronger than the status quo: every inline script other than the pinned bootstrap is blocked in dev too. Remaining dev-specific allowances shrink to: dev-server origin, HMR websocket, dev inline styles. No remote origins in either case. |
| Compatibility (Tauri 2 / Vite HMR) | Meta-CSP hash sources are standard CSP; no interaction with HMR observed in principle — but the **Vite error overlay and any future Vite/Kit-injected inline script would be silently blocked**, so a full dev-workflow test pass is mandatory before adoption. |
| Testing required | Boot in `tauri dev`; HMR CSS update; HMR component update; full reload; trigger the Vite error overlay (introduce a deliberate error) and confirm it still renders; confirm `check-csp` (extended to assert the hash's presence and format). All automated where possible via the existing `scripts/verify-dev-hmr.mjs` pattern. |
| Maintenance | **The hash must be recomputed whenever the script text changes**, which happens on: (a) SvelteKit upgrades (entry path/whitespace), (b) moving/renaming the repository (the `/@fs/D:/TechVault/...` paths are baked into the script), (c) kit changes to the bootstrap template. A mismatch breaks dev boot with a console CSP error — easily diagnosed but a hard stop. A small helper script (or a `check-csp` extension that recomputes and warns) would be needed. |
| Risk | Low, contained to dev machines. |

**Verdict: feasible hardening path; requires its own small implementation + test pass (out of this task's scope) and adds a recurring maintenance trigger.**

### Option C — Externalize the dev bootstrap via a custom Vite middleware/plugin

| Aspect | Assessment |
|---|---|
| Technical feasibility | Possible in principle: a `configureServer` middleware could rewrite the dev HTML, moving the inline script into an external module file. Not a supported SvelteKit configuration — it rewrites HTML that SvelteKit owns and transforms. |
| Security implications | Would allow a dev CSP identical in shape to production (script-src 'self' only + HMR allowances) — strongest option on paper. |
| Compatibility (Tauri 2 / Vite HMR) | Fragile: depends on Kit's internal HTML shape; must interoperate with `kit.start`, the `element` reference (`document.currentScript.parentElement` becomes unavailable once externalized — the plugin would need to re-anchor it), and Vite's transform order. |
| Testing required | Full dev workflow plus edge cases (error overlay, HTML HMR, route changes). |
| Maintenance | New custom build tooling coupled to SvelteKit internals — the largest ongoing maintenance burden of all options, plus its own review surface. |

**Verdict: rejected for now — disproportionate complexity and fragility for a dev-only gain.**

### Option D — Keep the current dev-only `unsafe-inline` (status quo)

| Aspect | Assessment |
|---|---|
| Technical feasibility | Already implemented, built, and verified (dev boots; HMR end-to-end verified; `check-csp` asserts the allowance appears **only** in `devCsp`). |
| Security implications | Dev machines run with inline-script allowance; production unaffected (verified strict at runtime). Dev traffic is localhost-only (Vite dev server bound to 127.0.0.1, strictPort). No remote script origins are permitted in dev. The renderer already has no data worth stealing (M0 has no user data; DB is M2+). |
| Compatibility | Fully verified on the actual toolchain. |
| Testing required | None beyond what has already run. |
| Maintenance | None. |

**Verdict: smallest safe exception; the pragmatic default.**

## 4. What this review did NOT test (stated honestly)

- Option B was assessed analytically (hash computed, stability measured, pass-through semantics verified from source) but **not executed end-to-end** — switching would itself be a CSP modification, which this task prohibits. The mandatory test list is in Option B's row.
- No dev-boot experiment under a deliberately un-allowanced CSP was run (it would require temporarily editing `tauri.conf.json`); the "dev cannot boot" claim rests on the CSP blocking mechanism proven at runtime in the release build plus the source analysis in §2.

## 5. Comparison summary

| Option | Feasible | Dev security vs status quo | Prod impact | Maintenance | Recommendation |
|---|---|---|---|---|---|
| A — SvelteKit nonce | No | — | — | — | Rejected |
| B — Hash-pinned dev script | Yes | Stronger (only the pinned script allowed) | None | Recompute hash on kit upgrade / repo move + test pass | Viable hardening, separate authorization |
| C — Externalize bootstrap | Possible (custom tooling) | Strongest | None | High (fragile, Kit-internals coupled) | Rejected |
| D — Status quo `unsafe-inline` (dev only) | Yes (shipped) | Baseline | None | None | **Recommended default** |

## 6. Owner decision request

**Decision requested:** choose the development-CSP mechanism for M1+ (production CSP is identical under every option):

1. **(Recommended) Adopt Option D as the recorded, permanent dev baseline** — `devCsp` keeps `script-src 'self' 'unsafe-inline'` as a documented SvelteKit-dev requirement; `check-csp` continues to enforce that it never appears in production. Suggested wording: *"DEV-CSP-1 is accepted: the development CSP may include `script-src 'unsafe-inline'` solely because the SvelteKit dev server injects an inline bootstrap script; it is confined to `app.security.devCsp`, enforced by `scripts/check-csp` isolation checks, and must never appear in `app.security.csp`."*
2. **Adopt Option B (hash pinning) as a follow-up hardening task** — authorize a small dedicated task to switch `devCsp script-src` to `'self' 'sha256-omexX53BM4kcFHqMOynB85uzz2PpUvgoHBJX+sDkf8E='`, extend `check-csp` (format + presence assertions, recompute guidance), run the full dev-workflow test list, and document the recompute triggers (kit upgrade, repo relocation).
3. **Reject the exception** — direct a different approach (would require new owner direction; no other mechanism is supported by the current toolchain per §3).

Either way, **no change to the production CSP is requested or recommended.**

---

**End of PHASE_2_M0_CSP_DEVIATION_REVIEW.md**

## 7. Owner decision record (2026-11-14)

**DECIDED — Option D accepted, recorded as D-024** in `docs/DECISION_LOG.md` §4 (explicit owner instruction, "M0 Owner Decisions and Verification Record"):

> DEV-CSP-1 is accepted (Option D): `app.security.devCsp` may include `script-src 'self' 'unsafe-inline'` solely because the SvelteKit dev server injects an inline bootstrap script. The exception is confined to the development CSP only; the production `csp` remains strict and must never be weakened, modified, or relaxed. `scripts/check-csp` continues to enforce dev/prod isolation; the documented rationale and limitations (this document §2–§4) are preserved.

- **No CSP configuration was changed by this decision** — the M0 configuration already matches the accepted state exactly (production strict, dev-only allowance in `devCsp`); the decision records it as the permanent baseline.
- **Production CSP: unchanged.** Runtime proof stands (`docs/phase2-results/m0/verify-prod-csp-output.txt`); re-verification remains scheduled at M1 and M10.
- **Option B (hash pinning) remains available** as a separately-authorized future hardening task (feasibility analysis preserved in §3).
- **Conditional items resolved:** M0 acceptance criteria 10 and 16 conditions relating to DEV-CSP-1 are closed by D-024.

---

**End of PHASE_2_M0_CSP_DEVIATION_REVIEW.md** *(decision record appended 2026-11-14)*

## 8. Final verification note (2026-11-14)

During the M0 final automated verification, D-024 was re-confirmed by the owner (addendum in `DECISION_LOG.md`) and both CSP policies were re-proven on freshly built artifacts: `check-csp` 39/39 (config, including dev/prod isolation of every dev-only allowance) and the runtime probe suite 5/5 on the release exe (remote fetch, inline script, and string-eval all blocked; IPC allowed; ungranted core API denied by ACL). One new observation was recorded (not a defect in this decision): the production CSP correctly **enforces `style-src 'self'`** against an inline style applied by the Svelte 5 runtime bundle at startup — harmless, zero functional impact, and a candidate for a narrow hash allowance only if the owner ever wants a zero-error console. **No configuration change was made or requested by this note.**

---

**End of PHASE_2_M0_CSP_DEVIATION_REVIEW.md** *(§8 appended 2026-11-14)*
