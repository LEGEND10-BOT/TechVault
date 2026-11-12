# F1-01 — Tauri 2 Desktop and Android Compatibility Proof of Concept

**Project:** TechVault
**Task ID:** F1-01 (sub-parts F1-01a desktop, F1-01b Android)
**Document status:** Proposed task specification, awaiting owner approval
**Version:** 1.0
**Shared context:** read `00-PHASE1-OVERVIEW.md` first (prerequisites, measurement protocol,
results template, scope rules).

**Source mapping:** DEVELOPMENT_ROADMAP §5.1 (desktop) + §5.2 (Android); MASTER_BRAIN Part O
workstream A (Android feasibility). Note: the basic desktop build appears in MASTER_BRAIN
Part O under Phase 0 (items 2, 3, 14, 15), but Phase 0 was executed documentation-only per
roadmap §4; F1-01 therefore covers that deferred validation (ONE-SOURCE-FLAG, see overview §2).

**Decisions / pending items addressed:** D-001 (desktop-first, Android in parallel), D-010
(minimum Android version only after testing), P-001 (Tauri Android feasibility), P-002 (final
frontend/backend stack), P-003 (Android fallback strategy), P-022/P-023 (budgets, Android
version), R-001/R-002/R-003 (stack recommendations requiring validation), R-022 (Flutter
contingency — fallback only).

---

## 1. Objective

Prove with a minimal throwaway application that the approved stack (Tauri 2 + Rust + Svelte 5 +
Vite + strict TypeScript) builds, launches and communicates on the reference Windows machine
(F1-01a), and that the same project cross-compiles, packages and runs on Android with the Rust
core intact (F1-01b). Produce measured startup, size and communication-latency baselines that
later phases can be compared against. This experiment validates the shell only — no product
features.

## 2. Technical Questions

Verified facts (current, from official documentation — re-verify at execution time):

- Tauri 2 Windows development requires the Microsoft C++ Build Tools and the WebView2
  runtime; WebView2 ships with current Windows 10/11 and is supported back to Windows 7.
  (v2.tauri.app/start/prerequisites; v2.tauri.app/reference/webview-versions)
- Tauri 2 Android development requires Android Studio, JDK 17 (`JAVA_HOME`), the NDK
  (side-by-side, `NDK_HOME`), `ANDROID_HOME`, and Rust Android targets such as
  `aarch64-linux-android`. Tauri CLI ≥ 2.9 auto-detects default SDK/NDK locations.
  (v2.tauri.app/start/prerequisites; v2.tauri.app/reference/environment-variables)

Questions this PoC must answer by evidence:

1. Does the full toolchain install and build cleanly on the owner machine (which currently
   lacks Node, Rust, JDK, Android SDK — see overview §4)?
2. Do Tauri 2.x + Svelte 5 + Vite + strict TypeScript work together in one minimal project,
   including HMR in development?
3. Is frontend→Rust→frontend IPC (invoke/event) functional, and what is its round-trip
   latency on the reference hardware?
4. Does scoped file access work as required for later phases (read a user-chosen file through
   a dialog, respecting the permission scope model)?
5. What are cold/warm startup times, idle RAM and installer/installed size of the empty shell
   (baseline for every later performance budget, P-022)?
6. Android: does `tauri android init` + debug build produce an installable APK for
   `aarch64-linux-android`? Does it launch, render the same Svelte frontend, and invoke the
   same Rust command? What is the debug APK size?
7. Android: which minimum API level actually works on the available test device(s), feeding
   the evidence-based minimum-version decision (D-010, P-023)?
8. Are there WebView rendering gaps on the test device (system WebView version) that would
   affect later experiments (F1-02, F1-05)?

Assumptions (not yet verified): that a current LTS Node and stable Rust are mutually
compatible with the latest Tauri 2.x — verify at execution; that the owner machine can run
Android Studio (RAM unknown until measured — capture before starting F1-01b).

## 3. Dependencies

- Prerequisite installs from overview §4, steps 1–8 (F1-01a needs 1–4; F1-01b needs all).
- **OWNER-PROVIDED:** one physical Android test device, USB-debuggable, ideally mid-range;
  record model, SoC, RAM, Android API level. A second, lower-spec device is useful but
  optional. An emulator is acceptable only as a supplementary data point, never as proof of
  on-device feasibility.
- No test data fixtures beyond one small text file for the file-access check.
- Blocking relation: F1-01a → F1-01b → (Android halves of F1-02, F1-03b, F1-05). Nothing
  blocks F1-01a.

## 4. Test Environment

- Reference Windows machine (i5-6300U; RAM to be captured), mains power, default power plan
  recorded.
- Android device connected via USB with `adb devices` verified; wireless debugging only if
  USB is impossible (record which).
- Throwaway project outside the production tree (overview §7).

## 5. Minimal Proof of Concept

F1-01a — Desktop:

1. Create a minimal Tauri 2 project (official template; Svelte-TS variant or equivalent
   manual setup) with strict TypeScript. Pin and record versions of: Rust, Node, Tauri CLI,
   `@tauri-apps/api`, `tauri` crate, Svelte, Vite.
2. Add one Rust command `sysinfo()` returning OS, arch, app version and a timestamp; call it
   from a Svelte component and render the result (validates IPC both ways via a return event
   or a second command).
3. Add a file-read flow: dialog plugin → read a small user-chosen text file through a scoped
   fs access → display content. This validates the permission model the real app depends on.
4. Build dev (HMR check) and release (NSIS/MSI installer). Run `tauri info` and save output.

F1-01b — Android:

1. `tauri android init` on the same project; add `aarch64-linux-android` target.
2. Build a debug APK; install via adb; launch; verify the same `sysinfo()` command returns
   Android-specific values (validates that the Rust core is genuinely reused, R-002).
3. Exercise one scoped file access if available on Android or record precisely what differs
   (storage permissions are an expected difference — document, do not work around silently).
4. Record WebView/Chromium version on device; run a short render sanity page (CSS grid, CSS
   variables, ES modules) and note any failures.

Explicitly out of scope: app icons/branding, signing for release, multiple windows, tray,
updater, any product UI.

## 6. Expected Deliverables

- Working throwaway project (scratch directory) + exact version pin list.
- `tauri info` outputs (desktop and Android environments).
- Build logs for release desktop build and Android debug build.
- Measurement table: cold/warm startup (desktop), idle RAM (desktop), IPC round-trip
  distribution, installer size, installed size, debug APK size, device launch time (rough,
   tap-to-first-frame via screen recording or manual stopwatch, method recorded).
- Screenshots: desktop window, Android screen, `sysinfo()` results on both.
- Completed results record (overview §6 template).

## 7. Measurable Acceptance Criteria

Planning targets — validate by measurement; "measure then decide with owner" where marked:

| # | Criterion | Target |
|---|---|---|
| A1 | Release desktop build + installer produced | Yes/No |
| A2 | Desktop cold startup (installer-run app, i5-6300U) | PLANNING TARGET ≤ 3 s median to interactive window; measure then decide with owner |
| A3 | Desktop idle RAM (working set, empty shell) | PLANNING TARGET ≤ 150 MB; measure then decide with owner |
| A4 | IPC round-trip (single small payload) | PLANNING TARGET ≤ 10 ms median; must be stable (no intermittent failures in 200 calls) |
| A5 | Scoped file read works with explicit user dialog, no broad filesystem permission | Pass required (hard criterion) |
| A6 | Desktop installer size | Compare against MASTER_BRAIN K3 planning range 20–60 MB; exceed → investigate dependency causes, no auto-pass |
| A7 | Android debug APK builds, installs, launches on test device | Pass required (hard criterion) |
| A8 | Same Rust command executes on Android (core reuse demonstrated) | Pass required (hard criterion) |
| A9 | Debug APK size | Record; compare against K3 planning range 25–60 MB (note: debug builds inflate size; record a release build only if trivially possible, otherwise flag) |
| A10 | Minimum working Android API level on available device(s) | Measured record for D-010/P-023; no pre-set target |

## 8. Failure Conditions

- F1-01a: no runnable release build after documented toolchain/install attempts; or window
  fails to render on WebView2; or IPC unreliable.
- F1-01b: `tauri android init`/build blocked by toolchain issues that cannot be resolved with
  documented effort; APK does not install or launch; Rust command fails on device; or the
  Svelte frontend does not render in the device WebView.
- Ambiguous outcomes (works but violates a planning target by a wide margin, e.g. idle RAM
  triple the target) are NOT failures — they are "measure then decide with owner" results.

## 9. Fallback Options

- Desktop blockers: fix toolchain/versions first; escalate to owner with evidence before any
  stack discussion. Desktop stack replacement is not an authorized fallback.
- Android blockers (genuine, documented): per roadmap §5.2 and R-022, **Flutter is a
  contingent fallback proposal only**, requiring explicit owner approval via a new decision
  record (P-003). It must not be started as part of this task. Intermediate options to
  attempt and document first: CLI/NDK version matrix changes, target ABI reduction
  (aarch64-only), minimal-plugin configuration.
- If Android stalls but desktop passes, record partial results and continue other
  experiments; Android-dependent sub-parts become blocked items in the phase handoff.

## 10. Evidence and Source References

Evidence artifacts: see §6, stored under the results location confirmed per overview §6/§9.
Authoritative references:

- Tauri 2 prerequisites (Windows and Android): https://v2.tauri.app/start/prerequisites/
- Tauri environment variables (ANDROID_HOME/NDK_HOME/JAVA_HOME):
  https://v2.tauri.app/reference/environment-variables/
- WebView2 support/versions: https://v2.tauri.app/reference/webview-versions/
- Windows installer guide: https://v2.tauri.app/distribute/windows-installer/
- Project documents: `docs/ARCHITECTURE.md` §12, §16; `docs/DEVELOPMENT_ROADMAP.md` §5.1–5.2,
  §10; `docs/DECISION_LOG.md` D-001, D-010, P-001..P-003, P-022, R-001..R-003, R-022.

**Effort:** F1-01a S–M; F1-01b M–L (first Android toolchain setup on this machine dominates).
**Costs/owner approvals:** toolchain installs; test device access (overview §9 items 2–3).
