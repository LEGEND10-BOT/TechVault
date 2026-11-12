# F1-02 — Video Playback and Platform Player Compatibility

**Project:** TechVault
**Task ID:** F1-02
**Document status:** Proposed task specification, awaiting owner approval
**Version:** 1.0
**Shared context:** read `00-PHASE1-OVERVIEW.md` first.

**Source mapping:** DEVELOPMENT_ROADMAP §5.4 (video playback validation); MASTER_BRAIN Part O
workstream B. Related MASTER_BRAIN Part C (C2 playback backends, C3/C4 layouts — layouts are
product UI and out of scope here) and Part Q Q-06/Q-10.

**Decisions / pending items addressed:** P-004 (video playback strategy), P-005 (connector
coverage — only insofar as playback evidence informs it), R-012 (capability-based playback
backends). Informs P-023 indirectly (Android behavior).

---

## 1. Objective

Determine, per platform (Windows/WebView2 desktop, Android WebView), which of the three
approved playback backend categories actually work and under what detectable conditions they
fail:

1. Local player for supported local files (HTML5 `<video>` inside the Tauri WebView).
2. Platform embed/player where officially supported (YouTube IFrame Player API as the primary
   case; one additional embeddable platform, e.g. Vimeo, as a comparison point).
3. External browser/application handoff with explicit user permission.

The output is a capability matrix and failure-detection evidence — the basis for the player
selection logic described in `docs/ARCHITECTURE.md` §10. This task never downloads or extracts
video streams (AGENTS.md §9; MASTER_BRAIN A1: never promise that every video URL can be
processed).

## 2. Technical Questions

Verified facts (from official documentation and known platform behavior — re-verify at
execution time):

- The officially supported way to play YouTube content inside an app web view is the IFrame
  Player API / iframe embed (developers.google.com/youtube/iframe_api_reference). Extracting
  direct stream URLs violates the YouTube Terms of Service and is out of scope.
- Embeddability is per-video and per-channel: uploaders can disable embedding; some videos
  are age-restricted or otherwise limited (developers.google.com/youtube/player_parameters).
  The IFrame API exposes an error event for such cases.
- WebView playback commonly requires enabling JavaScript, hardware acceleration, and on
  Android `mediaPlaybackRequiresUserGesture=false` (or a user gesture); `origin`/referrer
  mismatches can cause "Video unavailable". These are documented platform behaviors to test,
  not hypotheses to assume.

Questions this experiment must answer by evidence:

1. Windows/WebView2: do local MP4 (H.264/AAC) and WebM files play with seek/pause/rate
   control inside the WebView? What container/codec combinations fail (e.g. MKV, HEVC)?
2. Windows/WebView2: does the YouTube IFrame embed render, play, and expose usable state and
   error events? Same for the second embeddable platform.
3. Can each known restriction (embedding disabled, age restriction) be **detected
   programmatically** so the app can route to the external-handoff backend with a clear
   status (feeds the "Authentication Required / Unsupported" status model, MASTER_BRAIN C6)?
4. Android WebView: same questions, plus touch usability of embed controls and behavior with
   the system WebView version on the test device.
5. External handoff: can the shell open a URL in the system browser only after an explicit
   user action, with the opener API (never automatic — MASTER_BRAIN C2)?
6. URL handling: do obviously invalid/disallowed schemes get rejected by a minimal
   validation check (security-baseline contribution, per SECURITY.md direction)?

## 3. Dependencies

- F1-01a completed (working desktop shell). Android half needs F1-01b.
- **OWNER-PROVIDED:** test media corpus — a small set of local video files with known
  codecs/containers (at minimum: MP4/H.264+AAC, WebM/VP9, and one expected-failure case such
  as MKV or HEVC if available) and a curated list of public URLs: normal embeddable video,
  embedding-disabled video, age-restricted video, plus one embeddable non-YouTube video.
- No accounts, no API keys, no downloads of protected content.

## 4. Test Environment

- Reference Windows machine via the F1-01a scratch project extended with one test page per
  backend category (keep it throwaway).
- Android test device (from F1-01b) running the same pages.
- Record WebView2 version and Android System WebView version with results.

## 5. Minimal Proof of Concept

1. **Local playback page:** `<video>` element with the fixture files; script verifying
   play/pause/seek/playbackRate programmatically; record which fixtures fail to load/decode.
2. **Embed page:** YouTube IFrame API with the curated URL list; register error/state event
   handlers; record which videos play, which error, and which error codes are observable.
   Repeat for the second platform embed.
3. **External handoff:** a button that opens a URL via the shell opener; verify no code path
   opens a URL without the click; verify behavior with a disallowed scheme (e.g. `file://`,
   `javascript:`) after adding a minimal scheme allowlist check.
4. **Android pass:** repeat 1–3 in the Android build; additionally record whether embeds
   require user gesture and whether controls are usable by touch.
5. Capture screen recordings or screenshots of each outcome, including failure states.

Out of scope: player panel layout (C3/C4), transcript navigation, chapters, subtitles UX,
DRM circumvention, downloading, any metadata scraping.

## 6. Expected Deliverables

- Capability matrix: backend category × platform × test case → works / fails (with error
  signature) / needs user gesture / undetectable.
- Evidence: screenshots/recordings, console/WebView error logs, fixture manifest with
  codecs/containers, URL list (public URLs only, no credentials).
- Notes on which failure conditions are programmatically detectable (input for the player
  selection logic and C6 statuses).
- Completed results record.

## 7. Measurable Acceptance Criteria

| # | Criterion | Target |
|---|---|---|
| A1 | Local MP4/H.264+AAC plays with programmatic control in WebView2 | Pass required (hard criterion) |
| A2 | Local playback on Android WebView for at least one common codec set | Pass required; record which |
| A3 | Embeddable YouTube video plays via IFrame API in WebView2 with state/error events received | Pass required (hard criterion) |
| A4 | Embedding-disabled / age-restricted videos produce a detectable error event rather than silent black box | Detection rate 100% of curated cases; if a case is undetectable, that is a recorded finding, not an automatic fail |
| A5 | External handoff occurs only on explicit user action; disallowed schemes rejected | Pass required (hard criterion, security-relevant) |
| A6 | Android embed usability | Qualitative record (works / gesture-required / unusable); "measure then decide with owner" for the mobile default backend |
| A7 | Startup/memory overhead of a page with video vs empty page | Measured delta recorded (no pre-set target; feeds P-022) |

No numeric streaming-performance targets are pre-set: playback smoothness on the fixed
hardware is recorded qualitatively and by screencast, per the honest-measurement rules.

## 8. Failure Conditions

- Local playback fundamentally broken in WebView2 for standard MP4 (would be a genuine
  platform blocker).
- YouTube embeds broadly non-functional in WebView2 even for embeddable videos.
- External handoff impossible to gate behind explicit user action (security failure).
- Android: embeds broadly broken AND local playback broken — combined loss of in-app
  playback on mobile.
- Partial failures (specific codecs, per-video restrictions) are expected findings, not
  task failures; they become documented capability limits.

## 9. Fallback Options

All fallbacks stay inside the approved capability-based backend model (R-012):

- Codec gaps on local playback → restrict supported formats list (product documentation
  matter), no new player dependency without owner approval.
- Embed problems on Android → default to external-handoff backend on mobile with in-app
  embed where it works; this is a capability configuration within the approved design, to be
  confirmed with the owner using the evidence.
- A platform being undependable for embeds → recorded as an unsupported-for-playback
  platform (P-005 input). Introducing a native player framework or any stream extraction is
  NOT an authorized fallback (ToS/security); any such idea must go through a new proposal.

## 10. Evidence and Source References

- YouTube IFrame Player API reference: https://developers.google.com/youtube/iframe_api_reference
- Embedded players and parameters (embedding policies/restrictions):
  https://developers.google.com/youtube/player_parameters
- Tauri v2 opener plugin (external URL/file opening with permission scoping):
  https://v2.tauri.app/plugin/opener/ (re-verify exact plugin docs page at execution time)
- Project documents: `docs/ARCHITECTURE.md` §10; `docs/MASTER_BRAIN.md` Part C (C1–C2, C6);
  `docs/SECURITY.md` (URL/redirect validation); `docs/TESTING_STRATEGY.md` §6;
  `docs/DECISION_LOG.md` P-004, P-005, R-012.

**Effort:** M. Desktop half can start immediately after F1-01a; Android half after F1-01b.
**Costs/owner approvals:** test media corpus and curated public URL list (overview §9 item 5).
