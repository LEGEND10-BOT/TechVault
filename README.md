# TechVault

**A Local-First AI-Powered Research and Resource Discovery Workspace**

TechVault helps users discover, verify, organize, and research useful technical resources from videos and other supported content sources.

Instead of manually watching every saved video to find a tool, application, GitHub repository, service, library, or technical concept, users can submit a supported source and let TechVault identify potentially useful resources.

The goal is to turn scattered technical content into an organized, searchable research library.

> **Project status:** Pre-development planning and documentation. Application implementation has not started.

---

## 1. The Problem

Useful technical resources are scattered across:

- Facebook videos.
- YouTube videos.
- Instagram content.
- Websites and articles.
- Technical tutorials.
- GitHub repositories.
- Other supported sources.

Manually revisiting large collections of saved content is time-consuming.

TechVault aims to reduce that effort by extracting useful resources, explaining what they are, preserving evidence, and organizing discoveries for future research.

## 2. Core Capabilities

The planned product includes:

### Resource Discovery
Identify resources such as:

- Software and applications.
- Cybersecurity tools.
- AI platforms.
- Websites and online services.
- GitHub repositories.
- Programming libraries.
- Frameworks and technologies.
- Courses and learning resources.
- Other useful technical discoveries.

### Resource Information
For each resource, provide useful information such as:

- Canonical name.
- Description.
- Category.
- Official website or repository where identifiable.
- Verification status.
- Discovery type.
- Source references.
- Related resources.
- Historical names and aliases.

### Evidence and Verification
Distinguish between:

- Explicitly mentioned resources.
- AI-discovered resources.
- Related suggestions.
- Manually added resources.

Verification statuses should distinguish verified information from partial, unverified, or unavailable information.

AI confidence must not be treated as proof of verification.

### Research Notebooks
Organize multiple sources into research notebooks.

Planned notebook capabilities include:

- Source collections.
- Resource collections.
- Notes.
- Summaries.
- Evidence.
- Notebook-scoped AI research.
- Comparisons and explanations.

### Knowledge Graph
Explore connections between resources, sources, notebooks, technologies, and concepts.

### Search and Organization
Search, filter, sort, bookmark, and review discovered resources.

## 3. Product Principles

TechVault is guided by these principles:

1. **Local-first:** Keep the user's research data locally by default.
2. **Lightweight:** Avoid unnecessary storage consumption and background load.
3. **Evidence-based:** Preserve useful evidence for resource discoveries.
4. **Transparent:** Clearly distinguish verified information from AI suggestions.
5. **Modular:** Make future providers, platforms, and connectors easier to add.
6. **Privacy-conscious:** Explain when information is sent to external services.
7. **Recoverable:** Preserve partial results and support backup and restoration.
8. **Extensible:** Build a solid foundation without implementing every future feature immediately.
9. **Cross-platform direction:** Desktop first, with Android feasibility evaluated in parallel.

## 4. Media and Source Handling

TechVault is not intended to be a permanent video storage application.

The initial direction is:

- Accept supported video URLs.
- Allow optional local media input.
- Use permitted platform interfaces, captions, metadata, or extraction methods.
- Use user-assisted alternatives where automatic access is unavailable.
- Process uploaded media temporarily.
- Clean temporary media after processing according to the defined policy.
- Retain transcripts by default, with user-controlled deletion.
- Store resource information and compact evidence rather than unnecessary copies of original videos.

**Important:** Not every platform URL can be accessed automatically. Availability depends on platform restrictions, permissions, authentication, APIs, captions, geography, and other technical conditions.

TechVault must not promise universal video access or bypass DRM and private account restrictions.

## 5. Planned Technology Direction

The following is a proposed starting direction, subject to Phase 0 and Phase 1 validation.

| Area | Proposed direction |
|---|---|
| Desktop shell | Tauri 2 |
| Core/backend | Rust |
| Frontend | Svelte 5 |
| Build tooling | Vite |
| Language | Strict TypeScript |
| Styling | Tailwind CSS 4 |
| UI components | Shadcn-style components and Radix |
| Database | SQLite |
| Search | SQLite FTS5 |
| Transcription | Whisper.cpp |
| Default AI provider | OpenRouter |
| AI architecture | Provider abstraction |
| Graph | Sigma.js and Graphology, benchmark required |
| Credentials | Operating system secure storage |
| Version control | Git and GitHub |

The project must not treat this table as proof of technical compatibility.

Android compatibility, playback, transcription, database extensions, and performance require actual testing.

## 6. Repository Structure

```text
TechVault/
├── README.md
├── AGENTS.md
├── docs/
│   ├── MASTER_BRAIN.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── SECURITY.md
│   ├── UI_DESIGN_SYSTEM.md
│   ├── API_POLICY.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── TESTING_STRATEGY.md
│   ├── DECISION_LOG.md
│   ├── PHASE_HANDOFF.md
│   └── CHANGELOG.md
├── src/
├── src-tauri/
├── tests/
└── assets/
    └── logo/
```

This is the planned initial structure. Actual implementation directories may expand as justified by architecture decisions.

## 7. Documentation Guide

| Document | Purpose |
|---|---|
| `MASTER_BRAIN.md` | Central product vision and requirements |
| `ARCHITECTURE.md` | System architecture and technical boundaries |
| `DATABASE_DESIGN.md` | Data model, relationships, and migrations |
| `SECURITY.md` | Threat model and security requirements |
| `UI_DESIGN_SYSTEM.md` | Visual design and UI standards |
| `API_POLICY.md` | AI providers, API access, and data handling |
| `DEVELOPMENT_ROADMAP.md` | Phases and development sequence |
| `TESTING_STRATEGY.md` | Testing and acceptance criteria |
| `DECISION_LOG.md` | Approved decisions and pending proposals |
| `PHASE_HANDOFF.md` | Handoffs between development phases |
| `CHANGELOG.md` | Project change history |

Read `MASTER_BRAIN.md` and `DECISION_LOG.md` before making major product or architecture changes.

## 8. Development Status

Current stage: **Documentation and architecture planning**

| Area | Status |
|---|---|
| Product concept | Defined |
| Core requirements | Documented |
| Architecture | Draft |
| Database design | Draft |
| Security policy | Draft |
| UI design system | Draft |
| API policy | Draft |
| Development roadmap | Draft |
| Testing strategy | Draft |
| Decision log | Draft |
| Phase handoff | Draft |
| Changelog | Draft |
| Application implementation | Not started |
| Technical validation | Pending |

Documentation drafts must be reviewed and reconciled before they are treated as approved specifications.

## 9. Development Phases

The planned sequence is:

- **Phase 0:** Architecture and foundation.
- **Phase 1:** Technical feasibility and validation.
- **Phase 2:** Core application.
- **Phase 3:** AI and research intelligence.
- **Phase 4:** Advanced research workspace.
- **Phase 5:** Security, testing, and release.

Android feasibility is evaluated alongside the desktop-first roadmap.

See `DEVELOPMENT_ROADMAP.md` for detailed scope and phase gates.

## 10. Important Development Rules

- Do not silently remove approved requirements.
- Do not implement unapproved major features.
- Do not treat proposed technologies as validated.
- Keep core business logic independent of the UI.
- Keep credentials out of frontend code and public repositories.
- Preserve source evidence and resource identity.
- Avoid destructive resource merges.
- Write tests for important domain behavior.
- Document database migrations.
- Avoid unnecessary dependencies.
- Measure performance rather than guessing.
- Update the decision log when an owner-approved decision changes.
- Update the changelog after meaningful completed work.

See `AGENTS.md` for detailed instructions for AI coding agents and contributors.

## 11. Privacy and Security Direction

TechVault is designed around local ownership of research data.

Key principles:

- No permanent original video storage by default.
- No telemetry by default.
- Explicit authorization for external connectors.
- Secure handling of API credentials.
- Clear disclosure of cloud AI processing.
- Safe temporary media handling.
- Protection against unsafe URLs and malicious content.
- User control over stored transcripts and research data.

Review `SECURITY.md` before implementing network, media, AI, or credential-handling features.

## 12. Current Limitations

TechVault is not yet a working application.

The following remain unverified:

- Universal access to video links.
- Tauri 2 Android production suitability.
- Video playback across target platforms.
- Whisper.cpp desktop and Android integration.
- Final database configuration.
- Canonical resource identity and merge thresholds.
- Knowledge graph performance.
- Exact storage and memory footprint.
- Managed AI gateway and usage policy.

These must be investigated through prototypes and tests.

## 13. Contributing

Contributions should follow the documented architecture and project decisions.

Before submitting significant changes:

1. Read the relevant documentation.
2. Inspect the existing implementation.
3. Identify affected modules.
4. Explain architectural impact.
5. Add or update tests.
6. Update documentation.
7. Record significant decisions.
8. Include verification evidence.

Do not assume a contribution is accepted merely because it compiles.

## 14. License

**License:** Not selected yet.

The project intends to become open source after dependency and legal review.

Do not assume that the repository is already distributed under Apache-2.0, MIT, GPL, or another license.

## 15. Project Direction

TechVault aims to become a lightweight, extensible research workspace that transforms useful technical content into structured, searchable, evidence-backed knowledge.

The initial focus is to build a reliable foundation and validate the highest-risk technical choices before expanding functionality.