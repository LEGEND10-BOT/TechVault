# kit-3 regression — raw outputs (2026-11-14)

Companion raw evidence for `docs/phase2-results/m1/kit3-assessment.md` (D-027).

## npm audit after adoption

```
# npm audit report

deepmerge  >=4.2.0
deepmerge mergeObject() allows prototype poisoning of returned objects - https://github.com/advisories/GHSA-gcqx-w48m-w2h4
fix available via `npm audit fix --force`
Will install @sveltejs/kit@0.0.30, which is a breaking change
node_modules/deepmerge
  @sveltejs/vite-plugin-svelte  *
  Depends on vulnerable versions of deepmerge
  node_modules/@sveltejs/vite-plugin-svelte
    @sveltejs/kit  >=1.0.0-next.0
    Depends on vulnerable versions of @sveltejs/vite-plugin-svelte
    node_modules/@sveltejs/kit
      @sveltejs/adapter-static  >=1.0.0-next.0
      Depends on vulnerable versions of @sveltejs/kit
      node_modules/@sveltejs/adapter-static

4 low severity vulnerabilities
```

Note: the suggested `npm audit fix --force` would downgrade kit to 0.0.30 — NOT run.

## svelte-check

```
svelte-check found 0 errors and 0 warnings
```

## vitest

```
 Test Files  2 passed (2)
      Tests  17 passed (17)
```

## cargo (CARGO_TARGET_DIR=D:\Builds\cargo-target)

```
cargo fmt --check        -> (no output; clean)
cargo clippy --all-targets -- -D warnings -> Finished `dev` profile … (no warnings)
cargo test -> running 17 tests / test result: ok. 17 passed; 0 failed; 0 ignored
```

## npx tauri build

```
   Compiling techvault v0.1.0 (D:\TechVault\src-tauri)
    Finished `release` profile [optimized] target(s) in 2m 32s
       Built application at: D:\Builds\cargo-target\release\techvault.exe
     Running light to produce D:\Builds\cargo-target\release\bundle\msi\TechVault_0.1.0_x64_en-US.msi
     Running makensis to produce D:\Builds\cargo-target\release\bundle\nsis\TechVault_0.1.0_x64-setup.exe
    Finished 2 bundles at:
        …\TechVault_0.1.0_x64_en-US.msi (2.04 MiB)
        …\TechVault_0.1.0_x64-setup.exe (1.33 MiB)
```

## check-csp

```
check-csp: ALL 39 CHECKS PASSED
```

## verify-prod-csp (kit-3 release exe, port 9333)

```
verify-prod-csp against: D:\Builds\cargo-target\release\techvault.exe
PASS  page origin  — http://tauri.localhost/
PASS  remote fetch blocked (connect-src)  — BLOCKED: Failed to fetch | console: "Fetch API cannot load https://example.com/. Refused to connect because it violates the document's Content Security Policy."
PASS  inline script blocked (script-src 'self')  — BLOCKED: inline script did not run
PASS  string-eval blocked (no unsafe-eval)  — timer string was never executed (blocked)
PASS  IPC invoke works  — IPC_OK:{"ok":true,"data":{"app_name":"TechVault","version":"0.1.0","tauri_version":"2.12.5","os":"windows","arch":"x86_64","build_profile":"release"}}
verify-prod-csp: ALL RUNTIME CHECKS PASSED
```

## verify-dev-hmr (tauri dev, CDP 9344)

```
baseline:
{ "origin": "http://localhost:1420/", "ipc": "IPC_OK:TechVault:debug",
  "rendered": "TechVault", "checks": "OK,OK,OK" }
verify-dev-hmr baseline: PASS

hmr-assert (after appending `.kit3hmrverify { outline: 1px solid currentColor; }` to src/app.css):
verify-dev-hmr hmr-assert: PASS (marker 'kit3hmrverify' applied live)
```

Honest probe notes (artifacts, not toolchain failures):
1. First baseline run evaluated during the kit-3 cold-start compile (page not yet mounted) → FAIL; re-run on the warmed dev server → PASS.
2. First assert run used a marker placed in a CSS comment; the Tailwind output pipeline strips comments so the marker text never appeared although the rule itself propagated live (verified by rule-name probe). Re-run with the marker inside a real rule → PASS.
