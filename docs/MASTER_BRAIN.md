# TECHVAULT
## Master Brain, Product Constitution & Development Handbook

**Document version:** 1.0  
**Project status:** Planning consolidated, ready for controlled Phase 0 development  
**Product approach:** Local-first, privacy-focused, modular research workspace  
**Initial target:** Windows desktop  
**Future targets:** macOS, Linux and Android  
**Primary AI provider:** OpenRouter  
**Preferred application stack:** Tauri 2, Svelte 5, TypeScript, Rust and SQLite  
**Brand identity:** User-approved TechVault shield + T logo  
**Document purpose:** Single Source of Truth for all project discussions, design, architecture, implementation, testing and releases.

---

# PART A: PROJECT CONTROL

## A1. What TechVault is

TechVault is a personal research and resource-discovery workspace.

It takes information from videos, websites and other supported sources, identifies useful resources, explains them, records their evidence and organizes the discoveries into a searchable knowledge library.

It should eventually become a research environment where users can:
- Collect useful technical information.
- Discover tools, software, repositories and services.
- Understand what discovered resources actually do.
- Preserve source references and evidence.
- Organize research into notebooks.
- Ask questions about collected information.
- Explore connections between technologies and resources.
- Reuse knowledge without repeatedly watching the original content.

TechVault is NOT intended to be:
- A conventional video downloader.
- A permanent video-storage platform.
- A social media clone.
- A mandatory cloud account system.
- A tool that claims every internet URL is accessible.
- An application that silently sends user data to external services.

## A2. Project principles

Every design and technical decision must follow these principles:

1. Local-first wherever practical.
2. Privacy and explicit permission.
3. Low installation size and low resource consumption.
4. Modular architecture.
5. Evidence-backed AI results.
6. Honest reporting of technical limitations.
7. Reliable data storage and recovery.
8. User control over external access.
9. Open-source readiness.
10. Expandability without unnecessary complexity.
11. No feature should be added without a clear purpose.
12. Do not sacrifice core reliability to add more features quickly.

## A3. Decision status definitions

- APPROVED: Explicitly confirmed by the project owner.
- RECOMMENDED: Supported proposal awaiting owner approval or implementation validation.
- PENDING: Requires a decision, test or additional evidence.
- DEFERRED: Intentionally postponed to a later phase.
- REJECTED: Explicitly rejected by the owner.

A technical test passing does not automatically approve a product or business decision.

## A4. Owner-approved decision register

| ID | Decision | Status |
|---|---|---|
| D-01 | Desktop first, Android testing in parallel | APPROVED |
| D-02 | Transcript saved by default; user can delete | APPROVED |
| D-03 | OpenRouter default AI provider | APPROVED |
| D-04 | Other AI providers optional | APPROVED |
| D-05 | TechVault supplies default API access provisionally | APPROVED |
| D-06 | Exact API quota and billing policy | PENDING |
| D-07 | Cloud sync not in initial release | APPROVED |
| D-08 | Export/import first | APPROVED |
| D-09 | Related AI suggestions enabled by default | APPROVED |
| D-10 | Open-source license after legal review | APPROVED |
| D-11 | Android minimum version decided after testing | APPROVED |
| D-12 | Uploaded shield + T logo retained as approved reference | APPROVED |
| D-13 | Dark and Light theme support | APPROVED |
| D-14 | User-specified violet/navy design system | APPROVED |

## A5. Important audit recommendations

Two independent technical reviews were commissioned: Claude and Z.ai.

Their shared high-priority conclusions:

1. Resource identity and duplicate merging deserve a dedicated design phase.
2. Separate source mentions from canonical resources.
3. Android compatibility must be tested early.
4. Video playback must use capability-based fallbacks.
5. AI extraction requires a test dataset and accuracy measurements.
6. Partial processing results must survive failures.
7. Notebook AI needs source-grounded retrieval and citations.
8. API credentials must never be exposed in client applications.
9. No permanent original-video storage by default.
10. Database migration, backup and recovery must be planned from the beginning.

These are adopted as architecture recommendations, subject to implementation validation.

---

# PART B: PRODUCT SCOPE

## B1. Supported information sources

The intended source ecosystem includes:

- YouTube
- Facebook
- Instagram
- TikTok
- X/Twitter
- Reddit
- GitHub
- Telegram
- Medium
- Technical blogs
- Generic websites
- Educational websites
- Other publicly accessible sources where technically and legally supported

Platform support is capability-based, not guaranteed.

## B2. Source support levels

Recommended adapter tiers:

**Tier 1: Strong initial support**
- Generic websites
- GitHub public repositories
- YouTube metadata and permitted captions
- Reddit public content
- Medium accessible articles

**Tier 2: Conditional support**
- Facebook
- Instagram
- TikTok
- X/Twitter
- Telegram
- Other platforms requiring special handling

**Tier 3: User-assisted support**
- Local video uploads
- Pasted transcripts
- Pasted descriptions
- Imported text and documents

These tiers are an initial implementation priority, not a guarantee of universal extraction.

## B3. Resource categories

TechVault should be capable of identifying:

1. Software tools
2. Cybersecurity tools
3. AI tools and platforms
4. Websites and online services
5. GitHub repositories
6. Libraries and frameworks
7. Programming tools
8. Development environments
9. Applications
10. Courses and learning resources
11. Technical concepts
12. Technologies and protocols
13. Products and services
14. Other useful technical resources

Categories should be extensible rather than hard-coded into an inflexible structure.

## B4. Discovery types

Every discovery must have a clear origin:

- Explicitly Mentioned: directly named or visibly referenced in the source.
- AI-Discovered: inferred from the source context.
- Related Suggestion: discovered through additional research.
- Manual: added by the user.

AI-inferred discoveries must never be presented as direct source mentions.

## B5. Resource verification

Verification states:

- Verified
- Partially Verified
- Unverified
- Broken / Unavailable

Confidence scores are not proof of verification.

Generated descriptions must carry an appropriate warning:

"This information was generated or inferred by an AI model. It may contain inaccuracies and has not necessarily been independently verified."

---

# PART C: MEDIA AND SOURCE PROCESSING

## C1. Original video storage policy

- Original videos are not permanently retained by default.
- Local uploads are processed temporarily.
- Temporary media is cleaned up after processing.
- User-configured retention is permitted where technically practical.
- Transcripts are saved by default.
- Users can delete transcripts.
- Evidence should use compact metadata, snippets and timestamps instead of storing complete video copies.

## C2. Video playback

Three playback backends:

1. Local player for supported local files.
2. Embedded/platform player where officially and technically supported.
3. External browser/application with explicit user permission.

Never automatically open external URLs without user permission.

## C3. Desktop player layout

- Player normally appears on the right side.
- Single-click split-panel expansion/collapse.
- Resizable contextual panel.
- Close and restore without losing the current research context.
- Transcript navigation.
- Timestamp references.
- Play/pause, seek, volume, speed and fullscreen.
- Subtitles where available.
- Video information and chapters where available.

## C4. Mobile player layout

- Single-column or dedicated player view.
- Touch-friendly controls.
- Transcript beneath or alongside the player depending on available screen space.
- No forced desktop-style split layout.

## C5. Processing pipeline

Recommended pipeline:

1. Validate submitted source.
2. Identify source/platform.
3. Determine permitted access methods.
4. Retrieve available metadata, captions or content.
5. Extract accessible audio when necessary.
6. Transcribe when required.
7. Identify resources and concepts.
8. Gather compact evidence.
9. Verify candidate resource links where practical.
10. Save structured results.
11. Clean temporary media.
12. Report processing status.

## C6. Processing statuses

- Submitted
- Pending
- Processing
- Completed
- Partial Success
- Authentication Required
- Unsupported
- Failed
- Cancelled

Never silently discard submissions or claim success when processing is incomplete.

## C7. Failure recovery

- Preserve partial transcripts.
- Preserve already identified resources.
- Allow cancellation.
- Record clear error states.
- Avoid duplicate processing.
- Recover interrupted jobs where possible.
- Provide retry controls.

## C8. Source limits

PENDING: Define maximum source duration, upload size, concurrent jobs and processing time.

These must be configurable or clearly communicated. Do not impose arbitrary limits without testing and product approval.

---

# PART D: RESOURCE IDENTITY AND EVIDENCE

## D1. Core architecture

Use separate concepts for:

**Resource:** The canonical identity of a tool, repository, service or other item.

**Mention:** A specific occurrence of a resource in a video, article or other source.

A resource can have many mentions.

## D2. Resource information

Where available, store:

- Stable internal ID
- Canonical name
- Description
- Category
- Official website
- Repository URL
- Related links
- Functionality
- Source references
- Discovery type
- Verification status
- Confidence estimate
- Related resources
- Created and updated timestamps
- Last verification date

## D3. Evidence structure

Each mention should preserve useful evidence:

- Source ID
- Source URL
- Timestamp
- Short transcript snippet
- Discovery type
- Extraction method
- Confidence
- Verification status

Avoid duplicate copies of complete transcripts or media.

## D4. Deduplication rules

- Prefer strong identifiers such as official domains and repository URLs.
- Exact canonical identifiers can support reliable matching.
- Name similarity alone is insufficient.
- Similar names may belong to different products.
- Uncertain matches require review.
- Preserve original mentions when merging.
- Never destroy evidence through a merge.

## D5. User-facing aliases

Main resource row displays the canonical name.

A small expandable dropdown shows:
- Alternate names
- Previous names
- Relevant source references
- Other meaningful identity variants

This is a dropdown, not a carousel.

## D6. Merge controls

Provide:
- Merge preview
- Before/after comparison
- Evidence preservation
- Undo merge
- Permanent merge history
- Not-the-same decision
- Manual merge and separation controls

## D7. Resource history

Preserve meaningful changes:

- Name changes
- Owner changes
- Official website changes
- Functionality changes
- Availability changes

Show subtle update indicators, not distracting animations.

## D8. Extraction quality

Create a representative golden dataset containing:
- Known resources
- Correct timestamps
- Expected discovery type
- Expected canonical identity
- Known duplicate cases
- Similar-name false-positive cases
- Missing-resource cases

Measure:
- Precision
- Recall
- False positives
- Missed discoveries
- Bad merges
- Incorrect verification

Do not use an untested similarity threshold as the final merge rule.

---

# PART E: AI AND API ARCHITECTURE

## E1. Provider strategy

Default provider: OpenRouter.

Optional providers may include:
- Gemini
- GLM
- Ollama
- Other compatible services

Use a provider abstraction so future provider changes do not require rewriting core application logic.

## E2. Default API access

The project owner has provisionally approved TechVault supplying default API access.

Architecture requirements:

- Shared provider credentials stay on a secure backend.
- Never embed shared keys in desktop/mobile binaries.
- Never expose shared keys in frontend JavaScript.
- Enforce quotas, rate limits and spend limits.
- Prevent abuse.
- Maintain usage accounting.
- Clearly disclose cloud processing.
- Offer optional user-provided API keys.

The precise free allowance, payment model and account requirements are still pending.

## E3. API capability handling

Do not assume every model supports every feature.

Maintain capability information for:
- Text
- Vision
- Tool use
- JSON output
- Streaming
- Context window
- Embeddings

## E4. Model settings

Normal users should have:
- One default provider
- One default model

Advanced settings may allow task-specific overrides for:
- Extraction
- Summarization
- Notebook chat
- Research
- Other supported AI tasks

## E5. Notebook AI

Default scope is the selected notebook.

AI should:
- Summarize sources
- Compare sources
- Explain concepts
- Identify contradictions
- Find resources
- Generate notes
- Answer questions

Answers should cite source material and timestamps when available.

If evidence is insufficient, say so rather than inventing an answer.

## E6. Prompt injection protection

Treat transcripts, websites, descriptions and external content as untrusted data.

External content must never override trusted application instructions or authorize actions.

---

# PART F: TRANSCRIPTION

## F1. Initial engine

Whisper.cpp is the preferred initial local transcription engine.

## F2. Model selection

User-selectable models should cover Tiny through Medium as the initial normal range, with additional supported variants considered in advanced settings.

The application should:
- Download models only when needed.
- Avoid bundling all models.
- Show approximate model size.
- Explain RAM and performance trade-offs.
- Allow model removal.
- Recommend models based on hardware.

## F3. Processing approach

- Extract accessible audio.
- Process locally where selected.
- Preserve timestamps.
- Save transcript by default.
- Allow user deletion.
- Preserve partial output on failure.

## F4. Android

Do not promise identical transcription performance across devices.

Benchmark memory, battery, model compatibility and processing time before deciding Android defaults.

---

# PART G: APPLICATION DESIGN SYSTEM

## G1. Visual identity

Developer-first, high-density SaaS/research workspace.

Visual references:
- Linear
- Raycast
- Vercel

Use these as design inspiration, not as copied branding or exact interfaces.

## G2. Logo

The user-approved uploaded shield + T logo is the official visual reference.

Rules:
- Preserve the approved shape.
- Do not redesign it without owner approval.
- Do not substitute a generic shield.
- Use consistent brand colors.
- Prepare appropriate app icon and small-size variants when source artwork is available.

## G3. Color tokens

Light mode:
- Background: #FAFAFA
- Surface: #FFFFFF
- Foreground: #1E1B2E
- Border: #E2E8F0
- Muted: #F1F5F9
- Accent: #7C3AED
- Dark violet: #5B21B6

Dark mode:
- Background: #0F172A
- Surface: #1E1B4B
- Foreground: #F8FAFC
- Border: #312E81
- Muted: #312E81
- Accent: #A78BFA
- Dark violet: #7C3AED

Semantic colors:

| Status | Light | Dark |
|---|---|---|
| Success | #15803D | #22C55E |
| Warning | #B45309 | #F59E0B |
| Error | #B91C1C | #EF4444 |
| Info | #1D4ED8 | #3B82F6 |

## G4. Typography

- Geist Sans or Inter for normal UI.
- Geist Mono or JetBrains Mono for metrics, timestamps and technical data.

Hierarchy:
- Page titles: text-lg, semibold, tracking-tight.
- Section headers: text-sm, medium, muted foreground.
- Body: text-sm.
- Badges and microcopy: 10px or 12px, uppercase mono where appropriate.

## G5. Layout

Desktop:
- Fixed left sidebar, 220px.
- Topbar, 56px.
- Sticky topbar with subtle backdrop blur.
- Main content area.
- Right contextual panels and inspectors.
- High-density cards and split-pane workspaces.

Mobile:
- Responsive navigation.
- Single-column content.
- Dedicated player view.
- Touch-friendly controls.
- Adapted graph interaction.

## G6. Components

Preferred:
- Shadcn UI New York style.
- Radix primitives.
- Tailwind CSS 4.
- Lucide icons.
- CSS-variable theming.

Radius:
- --radius: 0.625rem.

## G7. Micro-interactions

- Subtle hover border highlights.
- Tinted status badges.
- Compact confidence meters.
- Accessible focus states.
- Reduced-motion support.
- No unnecessary animations.

## G8. Supplied frontend reference

The supplied TSX reference is a visual/component reference.

It includes patterns such as:
- Sidebar
- Dashboard metrics
- Theme switching
- Status badges
- Confidence meters
- Buttons and forms
- Data tables
- Dialogs
- Right-side sheets

Do not automatically assume its React/Next.js framework is the final application framework.

Adapt its visual patterns to the selected Svelte application stack.

---

# PART H: APPLICATION NAVIGATION

The proposed main navigation:

1. Dashboard
2. Sources
3. Resources
4. Notebooks
5. Knowledge Graph
6. Bookmarks
7. Research Analytics
8. Settings

## H1. Dashboard

Potential information:
- Source count
- Resource count
- Pending reviews
- Notebook count
- Recent activity
- Processing jobs
- Recent discoveries
- Graph preview

Avoid unnecessary dashboard clutter.

## H2. Sources

Display:
- Source title
- URL
- Platform
- Date submitted
- Processing status
- Transcript status
- Associated resources
- Notes

Provide search and filters.

## H3. Resources

Display:
- Canonical name
- Description
- Category
- Verification status
- Discovery type
- Source references
- Aliases
- Related resources
- History
- Evidence
- Bookmarks

## H4. Notebooks

Allow multiple independent research notebooks.

## H5. Knowledge Graph

Represent relationships among:
- Resources
- Videos
- Notebooks
- Technologies
- Concepts
- Categories

Provide progressive expansion, filters, search and contextual details.

## H6. Bookmarks

Dedicated saved-resource area.

## H7. Research Analytics

Show useful statistics:
- Resources discovered
- Sources processed
- Categories
- Frequently encountered tools
- Notebook activity
- Trends

Avoid unnecessary background tracking.

## H8. Settings

Suggested sections:
- Appearance
- AI provider and models
- API usage
- Transcription
- Storage
- Privacy
- Connectors
- Video playback
- Performance
- Backup and restore
- About and diagnostics

---

# PART I: DATABASE AND STORAGE

## I1. Storage approach

Hybrid storage:

- SQLite for structured application data.
- Filesystem for temporary media and optional supporting files.
- Separate model storage for downloaded AI models.

No unnecessary SQL server or database service.

## I2. Proposed core entities

The following is a logical starting schema, not a frozen SQL migration:

- sources
- source_metadata
- processing_jobs
- transcripts
- mentions
- resources
- resource_aliases
- resource_links
- resource_history
- evidence
- resource_merges
- notebooks
- notebook_sources
- notebook_resources
- notes
- bookmarks
- graph_nodes
- graph_edges
- settings
- provider_configs
- usage_records
- connector_configs
- schema_migrations

Review relationships and indexes before writing final migrations.

## I3. Search

Initial search:
- SQLite FTS5
- Keyword search
- Filters
- Category search
- Alias search

Embeddings and vector search are optional future enhancements.

## I4. Database reliability

- Stable IDs.
- Foreign-key integrity.
- Transactions.
- Migration tests.
- Backup/restore.
- Crash recovery.
- Merge history.
- Data export/import.

## I5. Retention

- Original videos: temporary by default.
- Transcripts: saved by default, user can delete.
- Evidence: compact and source-linked.
- Model files: user-managed.
- Logs: no secrets and no unnecessary personal content.

---

# PART J: SECURITY AND PRIVACY

## J1. Security objective

Secure-by-design architecture with measurable testing.

Never claim that the application is 100% secure.

## J2. Threat areas

- API credential exposure.
- Malicious URLs.
- Server-side request forgery (SSRF).
- Unsafe redirects.
- Malformed media.
- Unsafe file paths.
- Command injection.
- Database corruption.
- Dependency vulnerabilities.
- Prompt injection.
- Unauthorized connector access.
- Excessive data egress.
- Insecure updates.
- Sensitive logs.

## J3. Required protections

- HTTPS/TLS for network communication.
- OS secure credential storage for user-owned credentials.
- Server-side storage for shared TechVault API secrets.
- URL validation and redirect restrictions.
- Safe temporary file handling.
- Strict permission boundaries.
- Dependency review.
- Signed release packages.
- Secure update verification.
- Database integrity and recovery.
- No secrets in logs.
- External connectors require authorization.

## J4. Privacy transparency

Users should understand:
- What remains local.
- What is sent to cloud AI.
- Which connectors access external accounts.
- Which media files are temporary.
- How transcripts are retained.
- How to delete stored information.

## J5. Encryption

PENDING:
- Evaluate local database encryption.
- Evaluate optional encrypted backups.
- Evaluate key recovery and migration implications.

Do not add encryption without understanding its effect on usability and recovery.

## J6. Telemetry

Recommended default: disabled.

Any future optional telemetry must be transparent, minimal and user-controlled.

---

# PART K: PERFORMANCE AND INSTALLATION

## K1. Performance objectives

- Fast application startup.
- Low idle CPU.
- Limited memory use.
- No unnecessary background processing.
- User-controlled heavy tasks.
- Limited concurrency.
- Cancellable processing.
- Progressive graph loading.
- Efficient database queries.
- Lazy-loaded optional components.

## K2. Hardware testing

Include the project owner's reference machine in performance testing: Intel Core i5-10310U, 32 GB RAM, Windows 11 Pro (owner-confirmed 2026-11-12; supersedes the earlier i5-6300U reference — alignment edit per the 2026-11-13 Phase 0 closure pass).

## K3. Preliminary size targets

These are planning estimates, not measured build results:

| Package | Initial planning range |
|---|---:|
| Desktop installer | 20–60 MB |
| Desktop installed app | 50–120 MB |
| Android initial package | 25–60 MB |

Actual results depend on dependencies, packaging, platform and architecture.

Optional Whisper models and processing components may add tens of MB to multiple GB.

The base application must not bundle every optional model.

## K4. Performance budget

PENDING:
- Define startup-time target.
- Define idle RAM target.
- Define CPU target.
- Define maximum processing concurrency.
- Define storage growth limits.
- Benchmark on low-end hardware.

Targets must be based on measured builds.

---

# PART L: TECHNICAL STACK

Preferred starting stack:

| Layer | Preferred choice | Status |
|---|---|---|
| Desktop shell | Tauri 2 | Recommended |
| Backend | Rust | Recommended |
| Frontend | Svelte 5 | Recommended |
| Build tooling | Vite | Recommended |
| Language | TypeScript | Recommended |
| Styling | Tailwind CSS 4 | Owner-specified |
| UI components | Shadcn-style + Radix | Owner-specified |
| Icons | Lucide | Owner-specified |
| Database | SQLite | Recommended |
| Full-text search | FTS5 | Recommended |
| Transcription | Whisper.cpp | Recommended |
| AI default | OpenRouter | Approved |
| Graph | Sigma.js + Graphology | Recommended |
| Credential storage | OS keychain | Recommended |
| Version control | Git | Recommended |
| Repository hosting | GitHub | Proposed |

Important technical rule:

Keep core business logic independent of the UI framework so Android can use platform-specific implementations if required.

Do not add a Node or Python runtime to the installed backend without a demonstrated need.

---

# PART M: CONNECTORS

Connector architecture should be modular.

Potential connector types:
- Source platforms
- GitHub
- External research providers
- AI providers
- Future knowledge services

Rules:
- Built-in connector definitions can ship with the application.
- External account connections require explicit authorization.
- External connectors should remain disconnected until authorized.
- Show permissions and connection status.
- Provide disable/disconnect controls.
- Keep credentials secure.
- Chat-specific settings must not unexpectedly change global settings.

---

# PART N: DEVELOPMENT AND CHAT ORGANIZATION

## N1. Chat structure

Use one ChatGPT Project as the central workspace.

Recommended conversations:

00 - General / Master Control  
01 - Phase 0: Architecture and Foundation  
02 - Phase 1: Feasibility and Testing  
03 - Phase 2: Core Application  
04 - Phase 3: AI and Research  
05 - Phase 4: Advanced Workspace  
06 - Phase 5: Security, Testing and Release  

The General chat coordinates the project.

Each phase chat handles its own implementation work.

## N2. Context handoff

At the end of each phase, create:

- PHASE_HANDOFF.md
- Decisions made
- Files changed
- Tests performed
- Test results
- Known problems
- Unfinished tasks
- Next phase requirements

Update the Master Brain after significant approved changes.

Do not assume separate chats automatically share every previous message.

## N3. Repository documentation

Recommended project documentation:

- MASTER_BRAIN.md
- ARCHITECTURE.md
- DATABASE_DESIGN.md
- SECURITY.md
- UI_DESIGN_SYSTEM.md
- API_POLICY.md
- DEVELOPMENT_ROADMAP.md
- TESTING_STRATEGY.md
- PHASE_HANDOFF.md
- DECISION_LOG.md
- CHANGELOG.md

## N4. Git rules

- Initialize Git before major implementation.
- Use small, meaningful commits.
- Commit working milestones.
- Keep secrets out of the repository.
- Use environment templates without real credentials.
- Tag stable releases.
- Use branches for isolated features and phases where practical.

---

# PART O: DEVELOPMENT PHASES

## Phase 0: Project foundation and architecture

Purpose: Create a clean, buildable and documented project foundation.

Work:
1. Create repository.
2. Initialize Tauri 2.
3. Configure Svelte 5 and Vite.
4. Configure TypeScript.
5. Configure Tailwind CSS 4.
6. Integrate the approved design system.
7. Integrate the approved logo asset.
8. Establish Rust application structure.
9. Establish database module.
10. Define logging and error handling.
11. Establish configuration management.
12. Create documentation.
13. Create Git workflow.
14. Build initial Windows application.
15. Record actual package size.

Exit criteria:
- Application builds.
- Application launches.
- Light and Dark themes work.
- No exposed secrets.
- Database opens.
- Documentation and Git are in place.

**Alignment note (2026-11-12, owner decision D-014):** Phase 0 was executed documentation-only per `DEVELOPMENT_ROADMAP.md` §4 and the owner's standing instruction. The exit criteria above now apply to the Phase 1 desktop proof of concept (package P1-A) and the Phase 2 application shell. Work items 2–5 and 14–15 are covered by P1-A (see `docs/PHASE_1_TASK_PACKAGES.md`); item 7 (logo integration) additionally awaits delivery of the approved asset files (D-012).

## Phase 1: Technical feasibility

Purpose: Validate high-risk architecture decisions before committing to full implementation.

Workstreams:

A. Android Tauri 2 feasibility  
B. Video playback compatibility  
C. Whisper.cpp desktop feasibility  
D. Whisper.cpp Android feasibility  
E. SQLite schema and migration tests  
F. Resource extraction accuracy  
G. Knowledge Graph performance  
H. Security baseline  
I. Low-resource hardware benchmark  

Exit criteria:
- Each test has a written result.
- Unsupported assumptions are corrected.
- Major technical risks have an approved solution.
- Android minimum version remains evidence-based.

## Phase 2: Core application

Work:
- Application navigation.
- Dashboard.
- Source management.
- Processing queue.
- Resource library.
- Resource details.
- Search and filters.
- Review workflow.
- Database integration.
- Backup and export foundation.
- Local transcription foundation (Whisper.cpp integration, model management, transcript storage and deletion — owner decision D-016, per `DEVELOPMENT_ROADMAP.md` §6.6).

Exit criteria:
- Sources can be stored and managed.
- Resources can be added and reviewed.
- Data survives restart.
- Search works.
- No critical database defects.

## Phase 3: AI and research

Work:
- OpenRouter integration.
- Secure managed API gateway.
- Optional user API credentials.
- Resource extraction.
- Descriptions and summaries.
- Transcription consumption (transcription foundation delivered in Phase 2 — owner decision D-016).
- Evidence and citations.
- Notebook AI foundations (full notebooks are built in Phase 4 per `DEVELOPMENT_ROADMAP.md` §8.1 — reconciliation per audit finding F-06).
- Notebook AI.
- Related suggestions.

Exit criteria:
- AI output has provenance.
- Errors are handled.
- Cloud processing is disclosed.
- Notebook answers are source-grounded.
- API usage limits work.

## Phase 4: Advanced workspace

Work:
- Knowledge Graph.
- Graph filtering and progressive expansion.
- Video contextual player.
- Advanced resource history.
- Bookmarks.
- Research Analytics.
- Advanced settings.
- Connector management.

Exit criteria:
- Graph performs acceptably on tested datasets.
- Player fallback rules work.
- Advanced interfaces remain usable on mobile.

## Phase 5: Hardening and release

Work:
- Full security review.
- Dependency and license review.
- Performance optimization.
- Backup/restore validation.
- Accessibility review.
- Crash and recovery tests.
- Release packaging.
- Documentation.
- Open-source readiness.
- Installation and update testing.

Exit criteria:
- No unresolved critical security defects.
- Release build is reproducible.
- Backup and recovery tested.
- Known limitations documented.
- License approved.

## Phase 6: Android release

(Tracked as the parallel Android development track per `DEVELOPMENT_ROADMAP.md` §10 rather than a sequential phase after Phase 5; release approval remains separate — audit finding F-06.)

Work:
- Android-specific implementation.
- Minimum version selected from testing.
- Storage and battery validation.
- Audio and playback compatibility.
- Mobile UI polish.
- Release distribution preparation.

This phase may overlap with earlier desktop work, but release approval remains separate.

---

# PART P: QUALITY ASSURANCE

Every phase must include:

1. Build verification.
2. Functional testing.
3. Error handling tests.
4. Regression tests.
5. Data integrity tests.
6. Security checks relevant to the changed code.
7. Performance measurements where relevant.
8. Documentation updates.

Never accept:
- Fake placeholder functionality presented as complete.
- Hard-coded sample data presented as live data.
- Silent errors.
- Unverified resource links presented as verified.
- Incomplete builds described as release-ready.
- Secret credentials committed to Git.

---

# PART Q: OPEN DECISION REGISTER

The following are intentionally not finalized:

| ID | Question | Required action |
|---|---|---|
| Q-01 | Android minimum version | Device and dependency testing |
| Q-02 | API free quota and billing | Product/business decision |
| Q-03 | Open-source license | Legal and dependency review |
| Q-04 | Exact app size | Build measurement |
| Q-05 | RAM/CPU budgets | Hardware benchmarks |
| Q-06 | Video support per platform | Adapter feasibility tests |
| Q-07 | Final resource merge thresholds | Golden dataset evaluation |
| Q-08 | Local database encryption | Threat model and usability review |
| Q-09 | Embeddings/vector search | Performance and storage evaluation |
| Q-10 | Android playback implementation | Prototype |
| Q-11 | Model update mechanism | Security and licensing review |
| Q-12 | Desktop distribution methods | Platform release review |
| Q-13 | Cloud sync | Deferred; not initial release |
| Q-14 | Final connector list | Product prioritization |
| Q-15 | Exact source size/duration limits | Benchmark and abuse analysis |

---

# PART R: NON-NEGOTIABLE PROJECT RULES

1. Do not rewrite the architecture without justification.
2. Do not remove a requirement without owner approval.
3. Do not silently change approved design tokens.
4. Do not redesign the approved logo without permission.
5. Do not expose shared API keys.
6. Do not store original videos permanently by default.
7. Do not merge resources based only on similar names.
8. Do not claim universal platform support.
9. Do not treat AI confidence as verification.
10. Do not silently send private data to external services.
11. Do not add unnecessary dependencies.
12. Do not bundle large models unnecessarily.
13. Do not ignore Android compatibility.
14. Do not skip database migrations.
15. Do not claim a feature is complete without testing.
16. Do not overwrite user data without backup and permission.
17. Do not execute destructive commands without approval.
18. Preserve partial results when processing fails.
19. Keep phase handoffs and decision records current.
20. Prefer a working, tested feature over a large collection of placeholders.

---

# PART S: CURRENT PROJECT STATE

**Product vision:** Consolidated  
**Core owner decisions:** Recorded  
**Design system:** Supplied and approved  
**Logo reference:** Approved  
**AI provider direction:** Approved  
**Preferred technology stack:** Selected as starting recommendation  
**Claude audit:** Reviewed  
**Z.ai audit:** Reviewed  
**Database schema:** Logical design pending detailed validation  
**Resource identity design:** Detailed design pending  
**Security threat model:** Pending  
**Feasibility prototypes:** Pending  
**Actual application code:** Not yet started in this workflow  
**Actual build size:** Not measured  
**Actual performance:** Not measured  
**Actual security certification:** Not performed  

## Immediate next action

Start Phase 0 in a dedicated conversation.

Before coding:
1. Confirm available development environment.
2. Inspect any existing project folder and code.
3. Establish the repository.
4. Create the documentation files.
5. Initialize the application.
6. Produce the first working Windows build.
7. Record the actual installation size and startup behavior.

---

# FINAL PROJECT RULE

TechVault must be built as a reliable, lightweight, privacy-conscious research application, not merely as a visually impressive interface.

The Master Brain is the authoritative project reference. New requirements, approved changes, test evidence and implementation decisions must be recorded here or in its linked project documents.

**No silent scope changes. No undocumented architecture changes. No unverified claims.**
