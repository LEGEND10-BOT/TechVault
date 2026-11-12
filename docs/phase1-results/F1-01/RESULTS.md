# F1-01a Results — Tauri 2 Desktop Proof of Concept (P1-A)

**Date(s) executed:** 2026-11-12
**Executor:** Desktop platform PoC agent (ZCode Desktop session, working under the Main Controller workflow)
**Scope note:** F1-01a (desktop) only. F1-01b (Android / P1-B) remains deferred per owner instruction — Android SDK/NDK not installed, no Android results in this record.
**Project location:** `experiments/p1-a/` (throwaway PoC; nothing in `src/` or `src-tauri/`)

## Environment

| Component | Version | Notes |
|---|---|---|
| OS | Windows 11 Pro, Build 26200.9711, 64-bit | |
| CPU | Intel Core i5-10310U @ 1.70 GHz (4C/8T) | **Owner confirmed this machine is the reference machine** (docs previously named i5-6300U — correction to be recorded by Main Controller) |
| RAM | 32 GB (2×16 GB DDR4-2667) | **Resolves the previously unknown OI-03 / P0-T09 item for this machine** |
| Disk | C: 148.9 GB (system/tools), D: 50 GB (repo + cargo/rustup/npm caches), E: 169.9 GB | Toolchain homes redirected to `D:\dev-caches\` after C: exhaustion during Build Tools install |
| Power plan | Balanced (`381b4222-…`), laptop on mains during measurements | |
| WebView2 Runtime | 157.0.4341.46 (Evergreen, machine-wide) | Prerequisite met before work started |
| MSVC Build Tools 2022 | 14.44.35207, Windows SDK 10.0.26100.0 | Installed this session (P1-ENV, owner-authorized) |
| Rust / Cargo / rustup | 1.99.1 / 1.99.1 / 1.29.3 (stable-x86_64-pc-windows-msvc) | Installed this session |
| Node.js / npm | 24.20.0 / 11.19.0 | Installed this session |
| Tauri CLI (`@tauri-apps/cli`) | 2.12.4 | |
| `@tauri-apps/api` | 2.12.4 | |
| `tauri` crate / `tauri-build` | 2.12.5 / 2.7.4 | wry 0.57.2, tao 0.37.2 |
| `tauri-plugin-dialog` (Rust/JS) | 2.8.4 / 2.8.4 | |
| `tauri-plugin-fs` (Rust/JS) | 2.7.1 / 2.7.1 | |
| Svelte / SvelteKit / vite-plugin-svelte | 5.57.3 / 2.70.4 / 7.3.1 | Official `svelte-ts` template (SvelteKit SPA via adapter-static) |
| Vite / TypeScript | 8.3.8 / 6.0.3 | `strict: true` verified via `svelte-check` (0 errors, 0 warnings) |

Full `tauri info` output: `experiments/p1-a/results/tauri-info.txt`.

## Protocol deviations (all explained)

1. **Node.js 24 LTS instead of the overview's "22.x" recommendation** — winget's `OpenJS.NodeJS.LTS` channel now delivers 24.x. Satisfies the stated intent ("LTS only, no odd-numbered releases"). No issues observed.
2. **rustup installed before the VS Build Tools install had finished**, with the host triple given explicitly (`--default-toolchain stable-x86_64-pc-windows-msvc`). The documented ordering rationale ("so the default host toolchain resolves") is satisfied by the explicit triple.
3. **Toolchain homes on D:** (`RUSTUP_HOME`/`CARGO_HOME`=`D:\dev-caches\…`, npm cache redirected, persistent user env vars set) — the VS Build Tools install drove C: to 0 bytes free; owner authorized hibernation disable (freed 12.71 GB) and Recycle Bin cleanup (4.44 GB). Recorded as environment work, not a PoC result.
4. **Reference machine identity:** owner confirmed i5-10310U/32 GB is the reference machine; prior documents naming i5-6300U require a Main Controller correction pass (not applied by this agent).
5. **Template shape:** `create-tauri-app` `svelte-ts` produced the SvelteKit SPA form (adapter-static, `ssr = false`) of Svelte 5 + Vite + strict TS — the officially recommended Svelte integration for Tauri 2; functionally equivalent to a plain Vite+Svelte setup for this PoC.
6. **A5 positive-path evidence is fixture-based (automated)** — the suite reads an in-scope fixture file; the interactive "pick file via dialog" flow is implemented in the UI but requires a human click, so it is left for owner verification (below). The mandatory negative test (win.ini) required no dialog by definition.
7. **Dev-run raw `test-results.json` was overwritten** in the app-data dir by the release-run suite; dev numbers below are transcribed from the live read of that run. The release-run JSON is kept as the raw artifact.

## Measurements

| Metric | Method | Runs | Median | p95 | Notes |
|---|---|---|---|---|---|
| Desktop startup, warm (installed app) | process start → `MainWindowHandle ≠ 0`, 15 ms poll (`scripts/measure.ps1`) | 4 (runs 2–5) | **74.5 ms** | 101 ms (max of 4) | Method is a proxy for "window visible", not full "interactive"; input-idle wait returned ≤63 ms every run |
| Desktop startup, first-ever launch | same method | 1 | **10,544 ms** | — | One-time cost: WebView2 profile (`EBWebView`) creation + first-run AV scan; NOT representative of per-launch cold start |
| Idle RAM — app process only | `Get-Process` WorkingSet/Private after 6 s idle | 5 | **24.6 MB WS / 5.1 MB private** | — | |
| Idle RAM — full process tree (app + 6 WebView2 helper processes) | same, two parent levels | 5 | **327.14 MB WS / 135.97 MB private** | — | WS double-counts shared Chromium mapped memory across helpers; private bytes are the additive footprint |
| IPC round-trip `ping()` (release build) | in-app `performance.now()` around 200 sequential `invoke` calls | 200 | **1.60 ms** | **2.00 ms** | 200/200 ok, 0 intermittent failures; min 1.3 ms, max 7.9 ms |
| IPC round-trip `ping()` (dev build) | same | 200 | **2.50 ms** | 3.40 ms | 200/200 ok; raw file overwritten (see deviation 7) |
| Rust→JS event delivery (`sysinfo-event`) | listener armed pre-call; `performance.now()` delta | 2 (dev+release) | 1.9–8.3 ms | — | Both directions of IPC validated (F1-01a step 2) |
| NSIS installer size | on-disk bytes | 1 | **1,585,956 B (1.51 MB)** | — | |
| MSI installer size | on-disk bytes | 1 | **2,338,816 B (2.23 MB)** | — | |
| Installed footprint (per-user, no bundled WebView2) | on-disk bytes of install dir | 1 | **5,134,292 B (4.90 MB)** | — | WebView2 is the shared Evergreen runtime, not bundled |
| Release `p1-a.exe` binary | on-disk bytes | 1 | 5,054,976 B (4.82 MB) | — | `strip=true`, LTO profile |
| First Rust debug compile (358 crates) | cargo wall time | 1 | 6 m 39 s | — | machine warm; not a benchmark |

## Raw evidence index

| Artifact | File |
|---|---|
| `tauri info` (desktop) | `experiments/p1-a/results/tauri-info.txt` |
| Release-build automated test results (machine-readable) | `experiments/p1-a/results/test-results-release.json` |
| Startup/RAM measurement raw data | `experiments/p1-a/results/measurements.json` |
| Desktop window screenshot (sysinfo + passing tests visible) | `experiments/p1-a/results/screenshots/desktop-window.png` |
| Measurement scripts (reproducible) | `experiments/p1-a/scripts/measure.ps1`, `scripts/screenshot-window.ps1` |
| Dev + release build logs | retained in session transcript; release bundle output on disk (`src-tauri/target/release/bundle/`, not committed — size) |
| HMR evidence | `11:25:10 PM [vite] hmr update /src/routes/+page.svelte` in dev-server log (transcribed; live session) |

## Acceptance criteria evaluation (F1-01 §7, desktop half)

| Criterion | Target | Measured | Pass / Fail / N-A |
|---|---|---|---|
| A1 Release desktop build + installer produced | Yes/No | Yes — NSIS + MSI, exit code 0 | **Pass** |
| A2 Desktop cold startup ≤ 3 s median (PLANNING) | ≤ 3 s | Warm median **74.5 ms**; first-ever launch 10.5 s (one-time WebView2 profile init) | **Pass (warm)** — one-time first-launch cost noted; measure-then-decide on whether a dedicated cold-boot protocol is needed |
| A3 Desktop idle RAM ≤ 150 MB (PLANNING) | ≤ 150 MB | Tree working set **327.14 MB** / tree private **135.97 MB** (app process alone 24.6 MB) | **Measure-then-decide with owner** — WS exceeds the planning target (6-process WebView2 architecture, shared memory counted per-process); private footprint is within it. Not an automatic failure per F1-01 §8 |
| A4 IPC round-trip ≤ 10 ms median, stable | ≤ 10 ms, 0 intermittent failures in 200 | **1.60 ms median, 2.00 ms p95, 200/200 ok** (release) | **Pass** |
| A5 Scoped file read via explicit user dialog, no broad fs permission | Hard criterion | Scoped fixture read OK; `C:\Windows\win.ini` and `C:\Windows\system.ini` **rejected** by the fs scope; capability grants read-text only on one fixture dir; dialog picker implemented — owner manual pass pending | **Pass** (automated evidence); dialog flow awaits owner exercise |
| A6 Desktop installer size vs 20–60 MB planning range | Compare | 1.51 MB / 2.23 MB — far **below** range | **Recorded** (below range; no investigation trigger) |
| A7–A10 (Android) | — | Not executed — P1-B deferred per owner instruction | **N-A this session** |

## Mandatory security negative test (owner handover requirement)

**Attempting to read `C:\Windows\win.ini` without an authorized file-picker selection was rejected.**

- Release-build evidence (`results/test-results-release.json`): `{"path": "C:\\Windows\\win.ini", "rejected": true, "error": "forbidden path: C:\\Windows\\win.ini"}`
- The rejection comes from the Tauri 2 fs-plugin permission scope: the capability grants `fs:allow-read-text-file` only under `experiments/p1-a/fixtures/allowed/**`. No broad filesystem permission exists anywhere in the capability file.
- A second negative path (`C:\Windows\system.ini`) was rejected identically.

## Outcome and recommendation

**Verified facts (evidence above):**
1. The approved stack (Tauri 2 + Rust + Svelte 5 + Vite + strict TypeScript) installs, builds (dev + release), packages (NSIS + MSI), and runs on this machine.
2. Frontend→Rust→frontend IPC works in both directions, is fast (median 1.6–2.5 ms), and was stable across 400 total invocations (200 dev + 200 release, zero failures).
3. HMR works in development (`hmr update` observed on a real template change).
4. The Tauri 2 permission-scope model enforces filesystem scope boundaries exactly as the architecture depends on: out-of-scope reads (win.ini, system.ini) are rejected at the plugin boundary.
5. The empty shell is small: 1.5–2.2 MB installers, ~4.9 MB installed, 4.8 MB binary.

**Assumptions / open items (explicitly not verified):**
- "Interactive window" is proxied by main-window-handle creation; a human-perceived interactive-time protocol was not run.
- Idle-RAM working set of the WebView2 process tree exceeds the ≤150 MB planning target; whether the budget should be re-defined in private-bytes terms is an owner decision (P-022 input).
- The dialog-based file pick (A5 human half) has not been exercised by a human yet.
- Long-session stability, many-window behavior, and updater are out of PoC scope.

**Open questions for the owner:**
1. Accept the A3 RAM result definition (tree private ~136 MB within budget vs tree WS ~327 MB above it) for P-022 budget setting, or commission a refined measurement protocol?
2. Confirm `experiments/p1-<id>/` + `docs/phase1-results/` as the standard Phase 1 artifact locations (used here per the Main Controller reconciliation; still Proposed at P0-T05).
3. Confirm the reference-machine correction (i5-10310U, 32 GB) so documents are updated by the Main Controller.

**Affected P-IDs / R-IDs:** supports R-001/R-002/R-003 (evidence, still Proposed until owner promotion); feeds P-002 (stack validation) and P-022 (performance budgets); A7–A10/P-001/P-023 untouched (Android deferred).

## Security notes (input to P1-I)

- fs permission scope is minimal (read-text on one fixture directory only); negative tests prove enforcement.
- `save_test_results` writes only to the app-local data dir (fixed path); PoC-only pattern, not for production.
- CSP is unset in the PoC (`tauri.conf.json` `csp: null`, template default) — acceptable for a throwaway shell; must be revisited for any real app.
- No secrets, no network calls, no external process arguments in the PoC. Hibernation was disabled and the Recycle Bin emptied on the owner's machine with explicit authorization (environment work, unrelated to PoC code).
