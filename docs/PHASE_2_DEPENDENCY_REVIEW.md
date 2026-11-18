# TechVault Phase 2 Dependency and Licensing Review

**Document status:** Revision 1.2 (2026-11-14, approval-semantics correction). Paper review only. **No package was installed, upgraded, removed, or fetched during this correction pass.** License entries reflect maintainer-published licensing as commonly documented and must be **verified against upstream license files at adoption time** (no network checks performed here). **Dependency decisions tied to ODs inherit the OD status: OD-2/OD-3/OD-8 are Proposed until separately approved in `DECISION_LOG.md`.**
**Revision 1.2 changes:** OD-tied dependency statuses aligned to the Proposed register; bits-ui/melt-ui marked "not adopted pending OD-8 approval" (previously "rejected per directive").
**Revision 1.1 changes:** **milestone-scoped adoption** (directive §2.F — M0 minimal; the file-dialog plugin waits for M3; each entry documents purpose, milestone, license, maintenance, platform impact, and existing-dependency overlap); in-house UI primitives per OD-8; FFmpeg sidecar as the OD-3 direction with a licensing-audit subsection.
**Policy basis:** AGENTS.md §6, D-009, SECURITY §21, directive §2.F.

---

## 1. Evaluation rules

1. **Timing rule (directive §2.F):** a milestone adopts only the dependencies it needs. Later-milestone dependencies are **not** pre-adopted ("keep M0 minimal; defer the file-dialog dependency until the milestone that introduces actual file picking").
2. Every proposed dependency documents: purpose, milestone, license, maintenance status, platform impact, and **whether an existing dependency already provides the functionality**.
3. Versions pinned at adoption; lockfiles (`package-lock.json`, `Cargo.lock`) committed; no `git` dependencies; minimal feature flags.
4. `cargo audit` + `npm audit` at M10; per-milestone availability.
5. License inventory maintained from M0 — the D-009 decision consumes it in Phase 5.

---

## 2. Frontend dependencies

| Package | Purpose | Milestone | Alternatives | Runtime/bundle impact | Maintenance | Platform impact | License (verify) | Existing-dependency overlap? | Now or postpone |
|---|---|---|---|---|---|---|---|---|---|
| `svelte` 5.x | UI framework (approved stack) | M0 | — (stack decision) | Compiled away; small runtime | Very active | None (WebView2 today; Android later inherits) | MIT | — | **Now (M0)** |
| `@sveltejs/kit` + `@sveltejs/adapter-static` | Routing + SPA static build (P1-A-validated) | M0 | Svelte without Kit | Build-time only | Very active | None | MIT | — | **Now (M0)** |
| `vite` (SvelteKit-pinned major) | Build tooling | M0 | Rollup direct | Build-time only | Very active | None | MIT | — | **Now (M0)** |
| `typescript` strict | Type system | M0 | JSDoc (rejected) | Build-time only | Very active | None | Apache-2.0 | — | **Now (M0)** |
| `tailwindcss` 4.x + `@tailwindcss/vite` | Styling (owner-specified) | M0 | CSS modules (rejected — departs from approved direction) | CSS output only | Very active | None | MIT | — | **Now (M0)** |
| `@tauri-apps/api` + `@tauri-apps/cli` | Tauri IPC + build CLI | M0 | — | Small shim | Very active | Tied to Tauri platform support | MIT / Apache-2.0 | — | **Now (M0)** |
| `vitest` + `@testing-library/svelte` | Component/unit tests | M0 | none | Dev-only | Active | Dev-only | MIT | — | **Now (M0)** |
| `lucide-svelte` | Icons (owner-specified) | M1 | unplugin-icons | Tree-shaken per icon | Active | None | ISC | — | **Now (M1)** |
| `clsx` + `tailwind-merge` | Class composition for the in-house primitives | M1 | template literals | Negligible | Active | None | MIT | Tailwind already present (these compose its classes) | **Now (M1)** |
| `bits-ui` / `melt-ui` | Third-party headless primitives | — | — | — | — | — | MIT | **Not adopted pending OD-8 approval** — OD-8 (in-house primitives) is Proposed; third-party libraries stay out unless the owner approves a change | **Not adopted for Phase 2 (OD-8 Proposed)** |

## 3. Rust dependencies

| Crate | Purpose | Milestone | Alternatives | Runtime impact | Maintenance | Platform impact | License (verify) | Existing-dependency overlap? | Now or postpone |
|---|---|---|---|---|---|---|---|---|---|
| `tauri` 2.12.x | Desktop shell (P1-A-validated) | M0 | Electron (rejected: size/RAM); Flutter (R-022 contingency, untriggered) | Core process | Very active | Defines platform support | MIT / Apache-2.0 | — | **Now (M0)** |
| `serde` + `serde_json` | IPC + config serialization | M0 | — | Negligible | Very active | None | MIT / Apache-2.0 | — | **Now (M0)** |
| `log` (+ minimal file sink) | Secret-free logging foundation | M0 | `tracing` (heavier; adopt later only if structured spans are needed) | Negligible | Very active | None | MIT / Apache-2.0 | — | **Now (M0)** |
| `rusqlite` 0.32.x (`bundled`) | SQLite access (P1-F-validated) | M2 | `sqlx`/`diesel` (rejected: ORM weight vs measured direct pattern) | Bundled SQLite ~1–2 MB in-binary | Active | Bundled SQLite is platform-neutral | MIT (SQLite: public domain) | — | **Now (M2)** |
| `tokio` (minimal features) | Async runtime for jobs/HTTP/IO | M2 | std threads (insufficient for mixed IO/CPU job model) | In-binary runtime | Very active | None | MIT | — | **Now (M2)** |
| `uuid` (v7) | Stable IDs (OD-4 item 1) | M2 | ULID; INTEGER keys (P1-F favors TEXT UUID) | Negligible | Active | None | MIT / Apache-2.0 | — | **Now (M2)** |
| `thiserror` | Typed error taxonomy | M2 | Manual impls | Negligible | Very active | None | MIT / Apache-2.0 | — | **Now (M2)** |
| `tauri-plugin-dialog` | Native file picker | **M3** (deferred from M0 per directive §2.F) | Backend-only file handling via commands | On-demand plugin | Active | Per-platform dialogs | MIT / Apache-2.0 | Plugin of the existing Tauri dependency | **Now (M3)** |
| `tauri-plugin-fs` | Scoped frontend file read | Postpone unless M3 requires it | Backend command handling (preferred) | On-demand | Active | — | MIT / Apache-2.0 | Tauri plugin | **Postpone unless needed; no unused grants (P1-I)** |
| `tauri-plugin-opener` | — | — | — | — | — | — | — | **Rejected** — P1-I flagged `opener:default` as an unused grant in the PoC | **Reject** |
| `reqwest` (rustls; blocking disabled) | HTTP for web/GitHub adapters | M4 | `ureq` (simpler/sync) | TLS stack ~1–3 MB | Very active | rustls avoids OpenSSL | MIT / Apache-2.0 | — | **Now (M4)** |
| `url` | URL parsing/normalization (identity + SSRF pipeline) | M4 | manual parsing (rejected) | Negligible | Very active | None | MIT / Apache-2.0 | `reqwest` re-exports `url` — direct dependency still justified (identity normalization uses it beyond HTTP) | **Now (M4)** |
| HTML-extraction crate (`lol_html`/`html5ever` or readability-style) | Main-content text extraction | M4 | regex stripping (rejected: unsafe/fragile) | Small | Active (servo-derived) | None | MIT/Apache-2.0 (per crate; verify) | — | **Now (M4); exact crate pinned after a small spike** |
| `keyring` | OS credential storage (BYOK, R-009) | — | none suitable | Small | Active | Per-OS keychain backends | MIT / Apache-2.0 | — | **Postpone to Phase 3** (Phase 2 stores no credentials) |
| `symphonia` (needed codecs) | Pure-Rust audio decode | — | FFmpeg sidecar (OD-3 primary) | Few MB | Active | Pure Rust — no C surface | MIT / Apache-2.0 | — | **Conditional fallback** only if the OD-3 FFmpeg audit fails or coverage gaps demand it |

## 4. External engines and binaries

### 4.1 FFmpeg sidecar (OD-3 — licensing-sensitive)

| Aspect | Decision |
|---|---|
| Purpose | Convert supported audio/video inputs to 16 kHz mono PCM WAV for whisper.cpp (separate module from the engine adapter) |
| Milestone | **M8** (integration); **bundling/distribution gated on the audit record** |
| Alternatives | `symphonia` (fallback); user-configured external `ffmpeg` (fallback); bundled Python/PyTorch (rejected — users never install Python or PyTorch) |
| Runtime impact | Tens of MB if bundled; subprocess invoked per conversion, nothing resident |
| License | **LGPL-compatible build preferred; a GPL build is never silently bundled.** The exact build (version, configuration, enabled components, source provenance) is audited and recorded **before distribution**; LGPL obligations (dynamic-link configuration or relink offer, license notices) must be met. |
| Security | Native binary processing untrusted media — mitigated by OD-9 input validation, size caps, timeouts, and a current patched build; decode runs as a bounded subprocess |
| Platform impact | Windows-first build; per-platform sidecars later (Phase 5 packaging concern) |
| Now or postpone | **M8, audit-gated for distribution**; fallback paths defined |

### 4.2 Other engines

| Component | Purpose | Milestone | Alternatives | License | Security | Now or postpone |
|---|---|---|---|---|---|---|
| **whisper.cpp** (ggml-org) @ pinned `371b5a7` (v1.9.3 line) | Local transcription via **CLI subprocess** (OD-2) | M8 | faster-whisper/CTranslate2, Vosk, sherpa-onnx, cloud STT — all rejected (R-007 fallbacks were ruled NOT authorized in F1-03) | MIT | Pinned upstream commit verified in P1-C; C code on untrusted input → keep pinned, review updates | **Now (M8)** |
| `whisper-rs` (binding) | In-process alternative | — | CLI (chosen) | MIT | Same upstream pin requirement | **Postpone** — only with measured justification + owner approval (OD-2) |
| yt-dlp | Broad YouTube access | — | oEmbed / Data API | Upstream licensing + platform-ToS considerations | Actively patched; needs own review | **Deferred** — automated YouTube ingestion is deferred entirely (OD-5) |

## 5. Recorded pins for later phases (no Phase 2 adoption)

| Package | Phase | Pinned (P1-H measured) | License (verify) |
|---|---|---|---|
| `sigma` | 4 | 3.0.2 | Apache-2.0 |
| `graphology` | 4 | 0.25.4 | ISC |
| `graphology-layout-forceatlas2` | 4 | 0.10.1 | ISC |

R-008 verdict ADOPT: reference graph stack for Phase 4.

## 6. Postpone/reject register (Phase 2)

| Item | Status | Reason |
|---|---|---|
| `bits-ui` / `melt-ui` | **Not adopted** | OD-8 (**Proposed**): in-house primitives; a third-party library would require a new owner decision |
| `sqlite-vec` / vector extensions | RJ now (P-013/R-011) | No demonstrated requirement |
| SQL ORMs (`sqlx`, `diesel`, `sea-orm`) | RJ for Phase 2 | rusqlite direct is P1-F-evidenced |
| `tauri-plugin-http` | RJ | Network lives in the Rust core only |
| `tauri-plugin-opener` | RJ | Unused-grant carry-forward (P1-I) |
| `keyring` | Postpone Phase 3 | No credentials in Phase 2 |
| TTS/audio-out libraries | DE Phase 3+ | D-019 capability model is documentation-only until authorized |
| Cloud SDKs / sync engines | RJ | D-006 |
| Telemetry/analytics crates | RJ | Default-off (P-028) |
| Heavy UI kits | RJ | In-house primitives (OD-8) |
| Bundled Python / PyTorch | RJ | OD-3: users never install Python or PyTorch |

## 7. Licensing posture and D-009 readiness

- Inventory from M0 (name, version, license, license-file path, purpose) feeds the D-009 decision in Phase 5.
- **The one license-sensitive Phase 2 item is the FFmpeg sidecar** — LGPL-preferred build with a recorded audit before any distribution (§4.1); the recommended rest of the tree is MIT/Apache-2.0/ISC-dominant with public-domain bundled SQLite and MIT whisper.cpp — no copyleft obligations.
- All entries verified against actual `LICENSE` files at adoption; transitive-license tooling (`cargo license`/license-check) runs in M10.

## 8. Supply-chain controls

1. **Milestone-scoped adoption** — no pre-adopting later-milestone dependencies.
2. Lockfiles committed; version pins per this review.
3. Minimal feature flags; no `git` dependencies.
4. `cargo audit` + `npm audit` at M10 (available per milestone); findings triaged before release.
5. Capabilities file grants only used permissions (dialog arrives with M3); CSP enforced (OD-6).
6. Tauri runtime kept current (SECURITY §16); engine/model binaries pinned by commit/checksum (whisper.cpp `371b5a7` verified pattern; model registry checksums per OD-10).

---

**End of PHASE_2_DEPENDENCY_REVIEW.md**
