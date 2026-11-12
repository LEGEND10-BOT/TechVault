# TechVault Architecture Specification

**Document:** ARCHITECTURE.md  
**Project:** TechVault  
**Version:** 1.0  
**Status:** Proposed Architecture Baseline  
**Audience:** Developers, AI Coding Agents, Technical Reviewers  
**Last Updated:** 2026-11-11

---

# 1. Purpose

This document defines the technical architecture of TechVault.

It establishes:

- Application architecture.
- Frontend and backend responsibilities.
- Internal module boundaries.
- Data flow between components.
- Media processing architecture.
- AI provider integration.
- Resource discovery and verification pipeline.
- Desktop and future Android compatibility.
- Background job management.
- Extensibility and maintenance principles.

This document is intended to guide implementation without unnecessarily restricting future architectural improvements.

The Master Brain remains the primary authority for product requirements and owner-approved decisions. If this document conflicts with an approved Master Brain decision, the Master Brain takes precedence until the owner approves an update.

# 2. Architectural Principles

TechVault must follow these principles.

## 2.1 Local-First

The application should operate primarily on the user's local device.

Local storage is responsible for:

- Source metadata.
- Resource records.
- Mentions and evidence.
- Notebooks.
- Notes.
- User settings.
- Processing history.
- Local transcripts.
- Application preferences.

Cloud services should only be used when required by a user-authorized feature, such as managed AI processing.

Cloud synchronization is not part of the initial release.

## 2.2 Modular Architecture

Each major capability must be implemented as a separate logical module.

Modules must communicate through clearly defined interfaces instead of directly accessing unrelated internal implementation details.

The architecture must allow future replacement of:

- AI providers.
- Media extraction engines.
- Transcription engines.
- Video playback backends.
- Database implementation details.
- Platform-specific integrations.
- Frontend presentation components.

## 2.3 Lightweight Operation

TechVault should minimize:

- Idle CPU usage.
- Background activity.
- Memory consumption.
- Unnecessary disk writes.
- Duplicate processing.
- Large mandatory dependencies.

Heavy capabilities such as transcription and media analysis should execute only when requested or required by an active processing job.

## 2.4 UI-Independent Core

Business logic must not depend on Svelte components or frontend-specific implementation.

The core resource identity, database operations, job management, verification rules and processing logic should remain reusable by a future native Android interface.

## 2.5 Extensibility Without Premature Complexity

The architecture must support future expansion, but the initial implementation should contain only necessary features.

Use interfaces and extension points where future changes are reasonably expected.

Do not create unnecessary microservices, distributed infrastructure or complex plugin systems for the initial desktop release.

# 3. High-Level Technology Stack

The following is the proposed initial stack.

| Layer | Technology | Status |
|---|---|---|
| Desktop shell | Tauri 2 | Preferred |
| Backend | Rust | Preferred |
| Frontend | Svelte 5 | Preferred |
| Frontend build | Vite | Preferred |
| Language | TypeScript, strict mode | Preferred |
| Styling | Tailwind CSS 4 | Approved design direction |
| UI components | Shadcn-style components, Radix | Preferred |
| Icons | Lucide | Preferred |
| Database | SQLite | Preferred |
| Search | SQLite FTS5 | Preferred |
| Transcription | whisper.cpp | Approved direction |
| AI provider | OpenRouter | Approved default |
| Graph | Sigma.js + Graphology | Proposed, requires benchmark |
| Version control | Git | Required |

Technology choices that depend on platform compatibility or performance must be validated before being treated as permanent.

# 4. Application Layers

TechVault should use a layered modular architecture.

## 4.1 Presentation Layer

Location:

`src/`

Responsibilities:

- Dashboard rendering.
- Source management interface.
- Resource library interface.
- Notebook workspace.
- Search interface.
- Video player presentation.
- Evidence viewer.
- Graph visualization.
- Settings.
- User interaction and validation.

The frontend must not directly access SQLite files or contain privileged secrets.

All privileged operations must go through validated backend commands or interfaces.

## 4.2 Application Layer

This layer coordinates application use cases.

Responsibilities include:

- Creating a source.
- Starting a processing job.
- Cancelling a job.
- Retrieving resources.
- Creating notebooks.
- Adding notes.
- Reviewing duplicate candidates.
- Confirming resource merges.
- Updating verification status.
- Managing user settings.

Application services should orchestrate modules without duplicating their internal business logic.

## 4.3 Domain Layer

The domain layer contains core business rules.

Important domain concepts:

- Source.
- Resource.
- Mention.
- Evidence.
- Notebook.
- NotebookSource.
- ProcessingJob.
- Verification.
- ResourceAlias.
- ResourceMerge.
- Connector.
- UserPreference.

Resource identity and deduplication rules must be implemented here or in a dedicated domain service.

They must not be scattered across frontend components.

## 4.4 Infrastructure Layer

Infrastructure provides external and platform-specific capabilities.

Examples:

- SQLite persistence.
- Filesystem operations.
- HTTP clients.
- AI provider clients.
- Whisper.cpp process integration.
- Media metadata extraction.
- Temporary file management.
- OS credential storage.
- Platform-specific player integrations.

The domain layer must not depend directly on a particular infrastructure implementation.

# 5. Suggested Backend Module Structure

The following is a logical module proposal, not a requirement to create every file immediately.

`src-tauri/src/`

- `main.rs`: application entry point.
- `lib.rs`: application initialization.
- `commands/`: frontend-facing Tauri commands.
- `application/`: use-case orchestration.
- `domain/`: business entities and rules.
- `infrastructure/`: external implementations.
- `database/`: database access and migrations.
- `providers/`: AI provider implementations.
- `media/`: media processing and metadata.
- `transcription/`: Whisper integration.
- `resource_discovery/`: extraction and candidate handling.
- `verification/`: resource verification.
- `jobs/`: processing queue and lifecycle.
- `security/`: validation and security controls.
- `platform/`: OS-specific functionality.
- `config/`: configuration management.

Avoid creating empty modules without an implementation purpose.

# 6. Suggested Frontend Structure

`src/`

- `app/`: application initialization and routing.
- `components/`: reusable UI components.
- `features/`: feature-specific interfaces.
- `layouts/`: application layouts.
- `lib/`: shared utilities.
- `services/`: frontend service wrappers.
- `stores/`: UI state.
- `types/`: shared TypeScript types.
- `assets/`: frontend assets.

Suggested feature areas:

- Dashboard.
- Sources.
- Resources.
- Notebooks.
- Knowledge Graph.
- Bookmarks.
- Analytics.
- Settings.

Frontend state must not become a second source of truth for persistent business data. The database remains authoritative.

# 7. Core Application Modules

## 7.1 Source Management

Purpose:

Manage submitted content sources.

Initial source-adapter priority (aligned to `MASTER_BRAIN.md` Part B2 tiers — owner decision D-015):

**Tier 1 — strong initial support:**

- Generic websites (direct website URLs).
- GitHub public repositories.
- YouTube metadata and permitted captions.
- Reddit public content.
- Medium accessible articles.

**Tier 2 — conditional support:**

- Facebook video links.
- Instagram.
- TikTok.
- X/Twitter.
- Telegram.
- Other platforms requiring special handling.

**Tier 3 — user-assisted support:**

- User-provided text (pasted transcripts/descriptions).
- Uploaded local media.
- Imported text and documents.

Future adapters may extend coverage to additional video platforms, websites, and external research sources.

Each platform must have an adapter or capability-specific implementation.

Do not assume that all platforms expose identical metadata or media access.

## 7.2 Source Adapter Interface

A source adapter should conceptually provide:

- Platform identification.
- URL validation.
- Source metadata extraction.
- Caption/transcript availability detection.
- Playback capability detection.
- Supported extraction methods.
- Authentication requirements.
- Failure and limitation reporting.

The adapter must return explicit capability information.

It must not claim that a source is accessible merely because its URL is valid.

## 7.3 Media Processing

Media processing is responsible for:

- Temporary media handling.
- Metadata extraction.
- Audio extraction where permitted.
- Transcription preparation.
- Temporary file cleanup.
- Processing failure recovery.

Original video storage is not enabled by default.

Uploaded media should be processed in a temporary workspace and cleaned according to the configured retention policy.

The system must preserve useful processing results even when a later processing stage fails.

## 7.4 Transcription

Initial preferred engine:

`whisper.cpp`

Responsibilities:

- Audio preprocessing.
- Model selection.
- Local transcription.
- Language detection where supported.
- Timestamp preservation.
- Partial transcript preservation.
- Error reporting.

Model selection should support Tiny through Medium as the normal initial range, with advanced options subject to hardware and platform validation.

Models must be downloaded on demand rather than bundled unnecessarily.

## 7.5 Resource Discovery

This module identifies possible resources from source content.

Inputs may include:

- Transcript.
- Video metadata.
- Captions.
- Description.
- User-provided notes.
- Permitted webpage content.

Output must be structured resource candidates.

Each candidate should contain:

- Candidate name.
- Resource type.
- Description.
- Official URL if found.
- Source reference.
- Timestamp if available.
- Discovery type.
- Confidence.
- Verification status.
- Supporting evidence.

Discovery types:

- Explicitly Mentioned.
- AI-Discovered.
- Related Suggestion.
- Manual.

Related Suggestions must remain distinguishable from actual resources found in the source.

## 7.6 Resource Identity and Deduplication

Resource identity must be separate from mention records.

A Mention represents an occurrence in a source.

A Resource represents the canonical identity of the discovered item.

Strong identity indicators include:

- Official website.
- Canonical domain.
- Repository identifier.
- Package identifier.
- Product identifier.
- Other stable provider-specific identifiers.

Name similarity alone is insufficient for automatic merging.

Uncertain matches must enter human review.

A confirmed merge must preserve:

- Previous names.
- Alternate names.
- Mentions.
- Evidence.
- Source references.
- Historical identity information.
- Merge history.

A merge must be reversible through an explicit recovery operation.

## 7.7 Verification

Verification should distinguish:

- Verified.
- Partially Verified.
- Unverified.
- Broken/Unavailable.

Confidence and verification must remain separate.

A high AI confidence score does not automatically establish that a resource is genuine.

Verification should consider available evidence, such as official websites, repositories and reliable metadata.

## 7.8 Notebook System

Notebooks organize multiple sources and discoveries.

A notebook may contain:

- Overview.
- Sources.
- Resources.
- Notes.
- Summary.
- AI Chat.
- Evidence.

Notebook AI must use the selected notebook's content by default.

Global research access must require an explicit user action or setting.

## 7.9 AI Provider System

OpenRouter is the approved default provider direction.

The application should use a provider abstraction so other supported providers can be added later.

Potential providers:

- OpenRouter.
- Gemini.
- GLM.
- Ollama.
- Compatible providers.

The provider interface should support capability declarations such as:

- Text generation.
- Vision.
- Structured JSON output.
- Streaming.
- Tool use.
- Embeddings.

The application must not assume every provider supports every capability.

API secrets must never be placed in frontend source code or shipped application binaries.

The managed API access model requires a secure server-side gateway and usage controls.

## 7.10 Search

Initial search should prioritize SQLite FTS5 and structured filters.

Search targets:

- Resource names.
- Aliases.
- Descriptions.
- Source titles.
- Transcript text.
- Notes.
- Notebook content.

Semantic/vector search is a possible later extension.

Do not introduce embeddings until keyword search limitations are demonstrated by real use cases.

## 7.11 Knowledge Graph

The graph should connect:

- Resources.
- Sources.
- Notebooks.
- Technologies.
- Concepts.
- Categories.

Proposed implementation:

Sigma.js + Graphology.

Required capabilities:

- Pan and zoom.
- Search.
- Filtering.
- Progressive expansion.
- Relationship inspection.
- Contextual details.

Mobile graph usability must be validated separately.

# 8. Processing Pipeline

A typical source processing flow:

1. User submits a URL or local media.
2. Application validates the input.
3. Source record is created.
4. Adapter identifies platform capabilities.
5. Application determines available processing methods.
6. User is informed if authentication or permissions are required.
7. Metadata and permitted transcript/caption data are collected.
8. If needed and authorized, audio is prepared for local transcription.
9. Resource discovery begins.
10. Candidate resources are normalized.
11. Verification checks are performed.
12. Duplicate candidates are compared.
13. Clear matches are linked to canonical resources.
14. Uncertain matches are sent for review.
15. Mentions and evidence are stored.
16. Source status is updated.
17. Temporary files are cleaned.
18. Results are displayed.

Each stage must have its own failure state.

The application must not discard successful results merely because a later stage failed.

# 9. Processing Job Lifecycle

Supported job states:

- Submitted.
- Pending.
- Processing.
- Completed.
- Partial Success.
- Authentication Required.
- Unsupported.
- Failed.
- Cancelled.

Jobs should support:

- Progress reporting.
- Cancellation.
- Error details.
- Retry where safe.
- Partial output retention.
- Recovery after application restart where feasible.

Retry operations must avoid creating duplicate source records, mentions or resources.

# 10. Video Playback Architecture

Video playback must be capability-based.

Supported backend categories:

1. Local player.
2. Supported platform embed/player.
3. External playback after explicit user permission.

The player selection logic must consider:

- Platform.
- WebView limitations.
- Authentication.
- Browser restrictions.
- DRM.
- Playback capability.
- User permissions.

No automatic external redirect is permitted.

On desktop, the player should appear in a right-side contextual panel.

On mobile, a dedicated or single-column playback view should be used.

Video playback must not be treated as equivalent to media downloading or extraction.

# 11. Storage Architecture

Use a hybrid storage approach.

## Structured storage

SQLite should store:

- Sources.
- Resources.
- Mentions.
- Evidence.
- Notebooks.
- Notes.
- Jobs.
- Aliases.
- Merge history.
- Settings.

## Filesystem storage

Filesystem storage may contain:

- Temporary media.
- Temporary audio.
- Downloaded Whisper models.
- Optional cached metadata.
- Export files.
- Backups.

Original videos must not be permanently retained by default.

Database and filesystem paths must be managed safely.

# 12. Platform Architecture

## Desktop

Initial development target:

- Windows.
- Linux.
- macOS.

Tauri 2 is the preferred desktop shell.

Platform-specific differences must be isolated behind interfaces.

## Android

Android is a planned expansion target and must be tested early.

The Rust core should remain reusable.

Android-specific components may require:

- Native audio handling.
- Different file permissions.
- Android-specific playback.
- Background task limitations.
- Different credential storage.
- Platform-specific model management.

A Tauri 2 Android proof of concept is mandatory before committing to the final mobile implementation.

Flutter is a fallback candidate only if the Tauri Android proof of concept fails to satisfy required functionality.

# 13. Background Processing and Concurrency

Heavy jobs must not execute on the UI thread.

The system should use controlled background execution.

Requirements:

- Configurable concurrency.
- Resource-aware processing.
- Cancellation.
- Progress reporting.
- Failure recovery.
- No unnecessary idle polling.
- No unbounded task queues.

Concurrency limits and CPU/RAM budgets must be established through benchmarking.

# 14. Error Handling and Observability

Errors should be classified.

Categories:

- Input validation.
- Network.
- Authentication.
- Platform restriction.
- Media decoding.
- Transcription.
- AI provider.
- Database.
- Storage.
- Verification.
- Internal application.

Logs must not contain API secrets, access tokens or unnecessary sensitive user data.

No telemetry by default.

If optional diagnostics are introduced, they must be transparent and user-controlled.

# 15. Configuration and Secrets

Configuration should distinguish:

- Non-sensitive application settings.
- User preferences.
- Provider configuration.
- Credentials.

Credentials must use OS secure credential storage where applicable.

Managed provider credentials must remain server-side.

The frontend must never receive a shared privileged API key.

# 16. Testing Strategy at Architecture Level

Before major implementation commitments, validate:

1. Tauri 2 desktop build.
2. Tauri 2 Android proof of concept.
3. Rust core independence from UI.
4. Whisper.cpp desktop integration.
5. Android audio/transcription feasibility.
6. Video playback backend compatibility.
7. SQLite schema and migration reliability.
8. Resource identity and merge correctness.
9. Graph performance.
10. AI provider abstraction.
11. Low-resource hardware performance.

Maintain a reproducible test environment and record results.

# 17. Performance Objectives

TechVault should prioritize low resource consumption.

The following targets must be measured rather than assumed:

- Startup time.
- Idle RAM.
- Peak RAM.
- CPU usage.
- Database growth.
- Temporary storage growth.
- Search latency.
- Graph rendering performance.
- Transcription throughput.
- AI processing latency.

The owner-confirmed reference machine (Intel Core i5-10310U, 32 GB RAM, Windows 11 Pro — confirmed 2026-11-12, supersedes the earlier i5-6300U reference) is the target for practical performance testing.

Exact RAM budgets and acceptance thresholds remain pending hardware measurements.

# 18. Extensibility

Future extension points should include:

- New source adapters.
- New AI providers.
- New transcription engines.
- New verification strategies.
- Additional resource types.
- Additional export formats.
- Connectors.
- Alternative playback backends.
- Mobile-specific presentation.

New modules must follow the same security and data ownership principles.

# 19. Architecture Decisions Requiring Validation

The following are not yet final:

- Tauri 2 Android production suitability.
- Android audio decoding approach.
- Whisper integration method per platform.
- FFmpeg distribution and licensing strategy.
- Graph library performance.
- SQLite vector extension requirement.
- Database encryption strategy.
- Exact managed API gateway architecture.
- Background job concurrency limits.
- Installer and package size targets.

No decision should be treated as final merely because it appears in a proposed architecture document.

# 20. Definition of Done

Architecture is sufficiently established when:

- Module responsibilities are documented.
- Core domain boundaries are clear.
- Data flow is understood.
- Platform-specific concerns are identified.
- External integrations have interfaces.
- Security boundaries are documented.
- Major feasibility risks have validation plans.
- No critical requirement is silently discarded.
- Owner approvals are recorded.

---

**End of ARCHITECTURE.md**
