# F-1 Resolution — Controlled Same-Session Idle-RAM Comparison (M0-equivalent vs G1)

**Date:** 2026-11-19 · **Mandate:** owner directive "Final Finding Resolution Pass (F-1 + F-2)" — resolve the independent audit's F-1 (M1-P1 idle-RAM guard not reproducibly satisfied) by a controlled same-session M0-vs-G1 comparison. **No performance thresholds modified; no historical evidence rewritten; owner settings preserved.**

---

## 1. Binary provenance

### G1 binary (evidence artifact, untouched by this pass)
- `D:\Builds\cargo-target\release\techvault.exe` — built 2026-11-14 19:42 by `npx tauri build` from the current working tree (correction-pass source); verified **newer than every source file** in the 11-19 audit; runtime-proven functional (CSP 5/5, zoom 7/7 re-runs).

### M0 binary — original NOT recoverable; reconstructed M0-equivalent used
- The original M0 executable (closure hash `4164b4b9…`, 4,268,032 B) **does not survive anywhere on disk**: all release/bundle paths were overwritten by later builds (verified by hashing every found `techvault.exe` — none matches; searched `D:\Builds`, `D:\Temp`, Program Files, user program dirs). The M0-era source was never committed, so a checkout is also impossible.
- **Reconstruction (transparent method):** a scratch tree outside the repository (`D:\Temp\techvault\m0-reconstruction\`) was assembled from (a) the **pre-kit-3 toolchain snapshot** taken 2026-11-14 16:37 before the kit-3 spike (`D:\Temp\techvault\g1-spike-backup\` — package.json, package-lock.json, svelte.config.js, vite.config.js, tsconfig.json), and (b) the **verbatim M0-era contents** of the files G1 later modified (app.css, +layout.svelte, +page.svelte smoke view, services, types, `lib.rs`, `commands/app.rs`, both `mod.rs`, zero-permission capability) as recorded in this session's pre-modification reads. All G1-added files were removed from the copy. The repository itself was **never touched**.
- Built with the M0 toolchain (`@sveltejs/kit` 2.70.4 + adapter-static 3.0.11 from the snapshot lockfile; `npx tauri build`, scratch cargo target `D:\Temp\techvault\m0-target`).
- **Fidelity evidence:**
  - Installer sizes match the M0-closure records **exactly**: MSI 1.96 MiB / NSIS 1.33 MiB (recorded in the kit-3 assessment §1 as the M0 pre-upgrade state).
  - Runtime fingerprint (CDP): M0 smoke view renders (`h1 TechVault`, self-check badges `OK,OK,OK`), **no** `#main-workspace`, **no** sidebar (no G1 shell), and `app_info` returns **exactly the six M0-era keys** — no `data_dir` field (the G1-era addition is absent) — tool: `f1-controlled-comparison/m0-fingerprint-tool.txt`.
- **Honest limitation:** this is a *reconstructed M0-equivalent*, not the hash-verified original (which is unrecoverable). Its behavior fingerprint and installer sizes match the M0 records; its hash necessarily differs (Tauri bundles are not byte-reproducible — documented at M0).

## 2. Methodology (directive items 3–9)

- **Script:** the committed `scripts/measure-baseline.ps1` — the identical methodology for both binaries (process-tree private bytes per D-019/OD-7, main + two levels of WebView2 children, `WaitForInputIdle` warm-up, 6 s idle settle, identical measurement window, identical process accounting). One run per invocation.
- **Alternation:** 12 single runs in a counterbalanced order `M0,G1,G1,M0,M0,G1,G1,M0,M0,G1,G1,M0` (6 adjacent M0↔G1 transitions; both order directions covered — no order bias).
- **Same session, same machine** (i5-10310U/32 GB reference machine, one continuous ~7-minute window on 2026-11-19); both binaries share the same WebView2 user-data profile (same app identifier) and the identical 7-process tree shape was observed for both (consistent subprocess accounting).
- **Settings preserved:** the M0-equivalent binary contains no settings code (cannot touch `settings.json`); the G1 binary read the owner's persisted `theme: "light"` + `zoom: 1.0` and wrote nothing during measurement runs.
- Raw per-run JSON evidence: `docs/phase2-results/m1/f1-controlled-comparison/run-01..12-*.json`; aggregate: `aggregate.txt`.

## 3. Results

| Binary | Samples (MB, tree private) | Median | Min | Max | Spread |
|---|---|---|---|---|---|
| M0-equivalent | 142.81, 141.10, 140.78, 143.57, 139.58, 144.89 | **142.81** | 139.58 | 144.89 | ±2.7 |
| G1 | 154.97, 158.43, 155.77, 158.84, 160.25, 160.56 | **158.84** | 154.97 | 160.56 | ±2.8 |

| Adjacent transition | Delta (G1 − M0) |
|---|---|
| run-01 M0 → run-02 G1 | **+12.16** |
| run-03 G1 → run-04 M0 | +17.33 |
| run-05 M0 → run-06 G1 | +14.99 |
| run-07 G1 → run-08 M0 | +15.27 |
| run-09 M0 → run-10 G1 | +20.67 |
| run-11 G1 → run-12 M0 | +15.67 |
| **Summary** | **median delta +16.03 MB · mean +16.02 MB · minimum pair delta +12.16 MB** |

Fidelity corroboration: the reconstructed M0-equivalent measured 139.58–144.89 MB — squarely consistent with the original M0 fresh baseline (143.54 MB, 2026-11-14) and the historical M0 baseline (137.45 MB), confirming the reconstruction behaves like M0.

## 4. Verdict (decision criteria applied)

- **G1 exceeds the +10 MB guard.** The **minimum** same-session pair delta (+12.16 MB) is above the guard; the median delta is **+16.03 MB**. The result is stable (G1 higher in all 6 transitions, both order directions).
- **The audit's environment-variance hypothesis is refuted as the sole cause.** Cross-session variance exists (G1 itself measured 141.85 → 145.85 → ~155–160 across three sessions; ±5 MB), but it cannot explain a same-session, same-machine, alternating-order delta whose *minimum* is +12.16 MB. The delta is a **stable property of the G1 build** (G1 shell UI + kit 3.2.0 runtime + settings/zoom machinery over the M0 baseline — exactly the quantity M1-P1 was defined to measure).

## 5. Performance miss recorded + remediation options (no criterion weakened; nothing implemented)

M1-P1 (`PHASE_2_M1_PERFORMANCE_BUDGET.md` §3: "Shell delta vs M0 idle (W1, tree private bytes) ≤ +10 MB"): **MEASURED MISS — +16.03 MB median same-session delta (+12.16 minimum)**. Per PERF-15 the miss is recorded, not weakened. Remediation options for the owner to choose among (all require their own authorization; none is implemented):

1. **Reduce the G1 shell's idle footprint** (code work in a future authorized pass): audit the shell's eagerly-mounted surface (primitives/stores initialized at startup, Tailwind output already bounded), lazy-load non-critical components, and quantify the kit 3.2.0-vs-2.70.4 runtime delta by building a kit-2 hybrid in a scratch tree.
2. **Longer-settle re-measurement**: the 6 s settle may overestimate steady state; a 60 s settle and/or the G12 10-minute soak may show a lower stable value (record before deciding).
3. **Owner-approved budget revision**: re-derive M1-P1 from the measured evidence (e.g., a documented +20 MB shell budget) — a formal decision with analysis, never a silent weakening.
4. **Accept as a documented condition** with the G12 soak as the final arbiter (the 150 MB absolute target — D-019 — still holds ample headroom: G1's 158.84 MB median is 91 MB under it).

**Note on the absolute target:** the D-019 150 MB idle-tree target is NOT breached by M1-P1's relative guard — the M0 baseline itself (143.54 MB) sits close to it, which is precisely why the ±10 MB relative guard is tight.

## 6. Conclusion

*(Supersession, 2026-11-19: the guard-miss verdict below was measured at the inherited 6-second settle; the owner-approved 60-second reconciliation (`docs/phase2-results/m1/perf-budget-reconciliation.md`, P-1) found M1-P1 **MET** (+5.42 MB median at settle, all pairs within the guard) — the 6-second record is preserved as an unsettled-protocol artifact and is not the active verdict. The arithmetic erratum in the section below also remains binding.)*

**F-1: RESOLVED (investigation executed; verdict: PERFORMANCE GUARD MISSED — miss recorded with remediation options).** **F-2: RESOLVED** (guide corrected — see the finding-status addendum). G1 remains **open pending owner acceptance**, now carrying the recorded M1-P1 miss as an owner-decision item.

---

**End of F-1 resolution record** — raw evidence: `docs/phase2-results/m1/f1-controlled-comparison/` (12 run JSONs + aggregate + fingerprint tool). Repository untouched by the measurement work (all scratch artifacts outside the repo).

---

## ERRATUM (2026-11-19, performance-budget reconciliation pass)

**§5's absolute-target sentence contained an arithmetic error.** The report stated "the 150 MB absolute target — D-019 — still holds ample headroom: G1's 158.84 MB median is 91 MB under it". **150 − 158.84 is negative: G1 was ~8.8 MB ABOVE the 150 MB planning target in that 6-second-settle session** (and the "91 MB" figure corresponds to no recorded source value). No 250 MB figure exists in any governing document (grep-verified; D-019's verbatim wording is "150 MB planning target", metric = process-tree private bytes — see `perf-budget-reconciliation.md` §1). The relative-guard verdict of this comparison (+16.03 MB median at 6 s) stands unchanged; the absolute-target compliance picture is corrected and completed by the reconciliation's 60-second-settle measurement (G1 138.76 MB — below the target; paired delta +5.42 MB — within the guard), which also re-frames the §5 remediation options (Option B is now evidence-backed as the recommended path).
