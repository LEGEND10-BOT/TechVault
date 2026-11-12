# F1-02 Results — Video Playback Compatibility (P1-E)

**Date executed:** 2026-11-13
**Executor:** Implementation/verification agent (owner directive 2026-11-13, D-019)
**Environment:** Windows 11 Pro, i5-10310U/32 GB reference machine; **WebView2 Runtime 157.0.4341.46** hosting the p1-h test shell (no-IPC WebView2 host; results extracted via CDP on localhost); playback page served from `http://127.0.0.1:4180` (localhost-only harness server)
**Fixtures (NOT committed — media only; manifest committed):** `flower.mp4` (1.13 MB, ISO MP4 v2, CC0, MDN shared-assets), `flower.webm` (554 KB, WebM, CC0, MDN shared-assets), `broken.mp4` (60-byte controlled decode-failure fixture, synthetic)

**Method note (honest):** the first run executed in an **occluded** WebView2 window (the owner was actively using the display; the test deliberately does not seize the foreground). A **visible-window confirmation run** in the owner-approved display session reproduced identical outcomes. An initial harness metric bug (fixed 2026-11-13: wall-clock denominator) had mislabeled playback rate as "0.08×"; the corrected measurement shows near-real-time advance (≈0.8× over the 0.2 s startup window, threshold crossed almost immediately) with **no material difference between occluded and visible runs** — media playback and player events are unaffected by occlusion.

## Capability matrix (measured in WebView2 157.0.4341.46)

### Local playback (HTML5 `<video>`)

| Case | Load/decode | play() (muted) | time advanced | seek accepted | rate change | Notes |
|---|---|---|---|---|---|---|
| MP4 / H.264+AAC (flower.mp4, 5.06 s) | ✓ | ✓ | ✓ | ✓ | ✓ | **A1 target case — works** |
| WebM / VP8+Vorbis-family (flower.webm, 5.06 s) | ✓ | ✓ | ✓ | ✓ | ✓ | works |
| broken.mp4 (controlled failure) | ✗ | — | — | — | — | **error detected**: `code 4 / FFmpegDemuxer: open context failed` — failure is programmatically detectable |

`canPlayType` matrix: `mp4+avc1/mp4a` **probably**; `webm vp8/vorbis` **probably**; `webm vp9/opus` **probably**; `ogg theora` **""** (unsupported); `mp4 hev1` (HEVC) **""** (unsupported); `x-matroska avc1` **maybe** (declared "maybe" but no real MKV fixture was available — actual MKV decoding untested; recorded as a gap, not a pass).

### Platform embed (YouTube IFrame Player API)

| Case | Result | Evidence |
|---|---|---|
| API bootstrap | ✓ loaded (after fixing a harness race — resolve only after `YT.Player` is defined) | `youtube_api_loaded: true` |
| Embeddable video (`aqz-KE-bpKQ`, CC-licensed Big Buck Bunny) | **✓ READY and PLAYS (muted) in WebView2** — state events received: `[-1 (unstarted), 3 (buffering), 1 (playing)]` | **A3 target — works with usable state events** |
| Blocked video ID (`zzzzzzzzzzz`) | **✓ error event received: code 150** ("video not allowed" class) — restriction failures are programmatically detectable | A4 detection mechanism proven |

A4's per-video curated cases (embedding-disabled, age-restricted) require the owner's URL list (F1-02 §3 OWNER-PROVIDED input, not delivered) — the detection *mechanism* is proven; the curated restriction matrix is **PARTIAL**.

### External handoff + scheme validation (A5, security-relevant)

- Scheme allowlist logic (JS-level): `https`/`http` allowed; `file:`, `javascript:`, `data:` **rejected** — **pass** (`external_handoff.pass = true`).
- The shell-opener integration (Tauri opener plugin with permission scoping) is production wiring for Phase 2; no Phase 1 test shell exposes an opener-driven navigation surface, so the end-to-end handoff path is **PARTIAL** (logic tested, shell path pending production implementation).

## Acceptance criteria evaluation (F1-02 §7)

| # | Criterion | Verdict |
|---|---|---|
| A1 | Local MP4/H.264+AAC plays with programmatic control in WebView2 | **PASS** — confirmed in both occluded and visible-window runs; corrected rate metric shows near-real-time advance |
| A2 | Local playback on Android WebView | **N-A** (P1-B deferred per owner, D-018/D-019) |
| A3 | Embeddable YouTube plays via IFrame API in WebView2 with state/error events | **PASS** (states −1→3→1 received, reproduced in the visible run) |
| A4 | Restricted videos produce detectable error events | **PARTIAL** — detection mechanism proven (error 150 observed); curated restriction cases need the owner URL list |
| A5 | Handoff only on explicit action; disallowed schemes rejected | **PARTIAL** — allowlist logic pass; shell-opener path is Phase 2 wiring |
| A6 | Android embed usability | **N-A** (P1-B deferred) |
| A7 | Startup/memory overhead of video page vs empty page | **Recorded, noisy** (heap delta −8.3 MB, GC variance dominates — not a stable signal; re-measure with the production player in Phase 2) |

## Verdict for P-004 (playback strategy input)

The capability-based backend model (R-012) is supported by measured evidence on the desktop leg: local HTML5 playback works for the common codec sets, YouTube IFrame embedding works with usable state/error events, and restriction/decode failures are programmatically detectable (routing input for the "Authentication Required / Unsupported" status model). Formal P-004 closure needs the owner's curated restriction-URL list and the visible-window confirmation run.

## Raw evidence index

| Artifact | File |
|---|---|
| Playback test page | `experiments/p1-e/page/index.html` |
| Localhost harness server | `experiments/p1-e/harness/serve.mjs` |
| Raw WebView2 run output | `experiments/p1-e/results/webview2-playback.json` |
| Fixture manifest (media gitignored) | `experiments/p1-e/fixtures/MANIFEST.md` |

## Security notes (input to P1-I)

- All content muted and localhost-only; no credentials, no protected-content download, no stream extraction (ToS boundary respected — embed path only).
- Scheme-allowlist check implemented and negatively tested (`file:`/`javascript:`/`data:` rejected).
- Untrusted-content treatment: the embed test loads only a public CC video and a deliberately invalid ID; no user data sent.

---

**End of F1-02 RESULTS.md**
