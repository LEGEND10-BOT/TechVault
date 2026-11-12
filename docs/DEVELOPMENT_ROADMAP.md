# TechVault Development Roadmap

**Document:** DEVELOPMENT_ROADMAP.md  
**Project:** TechVault  
**Version:** 1.0  
**Status:** Proposed Development Plan  
**Last Updated:** 2026-11-11

---

# 1. Purpose

This document defines the planned development phases of TechVault.

It establishes:

- Development sequence.
- Phase objectives.
- Expected deliverables.
- Dependencies.
- Approval gates.
- Testing requirements.
- Technical risk reduction.
- Handover procedures.

The roadmap is a planning baseline, not permission to implement every phase automatically.

Each phase requires review and appropriate owner approval.

# 2. Development Strategy

TechVault will follow an incremental development strategy.

The project should prioritize:

1. Architectural correctness.
2. Data integrity.
3. Resource identity.
4. Platform feasibility.
5. Security.
6. Core functionality.
7. AI integration.
8. Advanced research capabilities.
9. Performance and release quality.

Do not prioritize feature quantity over reliability.

# 3. Development Rules

1. Follow the Master Brain.
2. Follow the approved architecture.
3. Never silently remove a requirement.
4. Keep documentation updated.
5. Use Git commits for meaningful milestones.
6. Test each major module.
7. Preserve existing user data.
8. Avoid unnecessary dependencies.
9. Avoid premature optimization.
10. Validate risky technology decisions early.
11. Do not begin a later phase while critical blockers remain unresolved.
12. Request approval before major architectural changes.

# 4. Phase 0: Architecture and Foundation

**Objective:** Establish a reliable project foundation before full application development.

**Owner confirmation (2026-11-12, decision D-014):** this documentation-only definition of Phase 0 is governing. MASTER_BRAIN Part O Phase 0 items 2–5, 14–15 are deferred to Phase 1 package P1-A and Phase 2; see `docs/PHASE_0_EXECUTION_PLAN.md`.

Scope:

- Review Master Brain.
- Review all architecture documents.
- Resolve documentation conflicts.
- Confirm technical boundaries.
- Define core domain entities.
- Review resource identity.
- Review database relationships.
- Define module interfaces.
- Define development conventions.
- Define initial test strategy.
- Establish Git workflow.

Expected deliverables:

- Approved architecture baseline.
- Reviewed database design.
- Security baseline.
- Initial repository structure.
- Development conventions.
- Decision log.
- Phase handoff.

Exit criteria:

- No unresolved critical architectural contradiction.
- Resource and Mention concepts clearly separated.
- Merge and undo requirements documented.
- Major technical risks identified.
- Owner approves Phase 1 feasibility work.

Do not generate the full application during Phase 0.

# 5. Phase 1: Feasibility and Technical Validation

**Objective:** Validate the riskiest technical decisions before large-scale implementation.

**Note (2026-11-12, decision D-017):** the approved Phase 1 scope of record is packages P1-ENV and P1-A..P1-J in `docs/PHASE_1_TASK_PACKAGES.md`, with experiment specifications F1-01..F1-06 in `docs/phase1-plan/`. MASTER_BRAIN Part O Phase 1 workstreams H (security baseline) and I (low-resource hardware benchmark), which are not listed individually below, are covered by packages P1-I and P1-J (audit finding F-05).

## 5.1 Tauri 2 Desktop Proof of Concept

Validate:

- Desktop build.
- Rust integration.
- Svelte integration.
- Frontend/backend communication.
- File access permissions.
- Application startup.
- Build and packaging behavior.

## 5.2 Android Proof of Concept

Validate:

- Tauri 2 Android build.
- Rust core compatibility.
- Android permissions.
- Audio handling.
- Video playback.
- Model storage.
- Background processing.
- Package size.

Flutter should only be considered if the Tauri Android proof of concept cannot satisfy required functionality.

## 5.3 Whisper.cpp Validation

Test:

- Desktop integration.
- Supported model sizes.
- CPU and memory usage.
- Transcription speed.
- Timestamp quality.
- Partial results.
- Interrupted processing.
- Android feasibility.

## 5.4 Video Playback Validation

Test:

- Local playback.
- Platform embed.
- External playback.
- WebView compatibility.
- YouTube-related playback limitations.
- Authentication restrictions.
- Mobile playback.

## 5.5 Database Validation

Test:

- Initial schema.
- Foreign keys.
- Resource identity.
- Duplicate candidates.
- Merge preview.
- Merge rollback.
- Merge undo.
- Migration strategy.
- FTS5 search.

## 5.6 Resource Extraction Validation

Create a representative golden dataset.

Measure:

- Precision.
- Recall.
- False positives.
- Missed resources.
- Incorrect verification.
- Incorrect deduplication.
- Evidence quality.

## 5.7 Graph Validation

Benchmark the proposed graph library.

Test:

- Small datasets.
- Medium datasets.
- Large datasets.
- Search.
- Filtering.
- Progressive rendering.
- Mobile interaction.

Expected deliverables:

- Feasibility report.
- Prototype results.
- Performance measurements.
- Architecture updates where justified.
- Approved technical choices.

Exit criteria:

- Critical technical risks have evidence-based outcomes.
- Tauri desktop path is validated.
- Android strategy is selected based on actual results.
- Database identity model passes critical tests.
- Owner approves Phase 2.

# 6. Phase 2: Core Application

**Objective:** Build the first usable local desktop application.

Scope:

## 6.1 Application Shell

- Tauri desktop application.
- Svelte interface.
- Navigation.
- Theme support.
- Shared components.
- Application settings.

## 6.2 Database Foundation

- SQLite integration.
- Schema migrations.
- Repository layer.
- Transaction management.
- Error handling.
- Backup foundation.

## 6.3 Source Management

- Submit URL.
- Add local media.
- Source metadata.
- Source list.
- Source detail.
- Source lifecycle.
- Processing status.

## 6.4 Resource Library

- Resource records.
- Resource categories.
- Search.
- Filters.
- Verification status.
- Discovery type.
- Aliases.
- Evidence viewer.
- Resource detail.

## 6.5 Identity and Deduplication

- Mention records.
- Canonical resources.
- Candidate matching.
- Duplicate review.
- Merge preview.
- Merge history.
- Undo functionality.

## 6.6 Local Transcription Foundation

- Whisper.cpp integration.
- Model management.
- Temporary audio.
- Transcript storage.
- Transcript deletion.
- Partial-result preservation.

Expected deliverables:

- Working desktop application.
- Source management.
- Resource library.
- Database-backed data.
- Basic local processing.
- Tested identity management.

Exit criteria:

- Core application workflows function.
- Resource data persists.
- Duplicate handling is safe.
- Critical data integrity tests pass.
- Owner approves Phase 3.

# 7. Phase 3: AI and Research Intelligence

**Objective:** Add AI-powered resource discovery and research capabilities.

Scope:

- OpenRouter integration.
- Provider abstraction.
- Secure API configuration.
- Managed API integration where approved.
- Optional BYOK support where approved.
- Resource extraction.
- Resource descriptions.
- Classification.
- Related suggestions.
- Verification assistance.
- Structured AI output.
- Evidence attribution.
- Notebook AI foundations.

Requirements:

- Validate every structured output.
- Preserve discovery type.
- Keep confidence separate from verification.
- Protect against prompt injection.
- Respect Local Only and No AI settings.
- Preserve source timestamps.

Expected deliverables:

- Working AI resource extraction.
- Provider configuration.
- Evidence-backed resource candidates.
- AI failure handling.
- Extraction evaluation report.

Exit criteria:

- Extraction accuracy measured.
- Prompt injection tests pass.
- API secrets protected.
- AI results remain traceable.
- Owner approves Phase 4.

# 8. Phase 4: Advanced Research Workspace

**Objective:** Turn the core application into a complete research workspace.

Scope:

## 8.1 Notebooks

- Multiple notebooks.
- Source association.
- Resource association.
- Notes.
- Summaries.
- Notebook AI.
- Evidence organization.

## 8.2 Knowledge Graph

- Resource relationships.
- Source relationships.
- Notebook relationships.
- Concept relationships.
- Search and filters.
- Progressive expansion.
- Contextual details.

## 8.3 Bookmarks

- Resource bookmarks.
- Source bookmarks.
- Notes.
- Bookmark management.

## 8.4 Research Analytics

Useful statistics may include:

- Total sources.
- Total resources.
- Verification distribution.
- Resource categories.
- Discovery trends.
- Notebook activity.
- Processing success rates.

Analytics must remain useful and avoid unnecessary tracking.

## 8.5 Search Improvements

- Global search.
- Command palette.
- Advanced filters.
- Search result grouping.
- Notebook-scoped search.

Expected deliverables:

- Notebook workspace.
- Graph interface.
- Bookmark system.
- Search improvements.
- Research analytics.

Exit criteria:

- Notebook relationships remain correct.
- AI context boundaries are respected.
- Graph performance is acceptable.
- Mobile behavior is evaluated.
- Owner approves Phase 5.

# 9. Phase 5: Security, Testing and Release

**Objective:** Prepare TechVault for reliable public or personal production use.

Scope:

- Security review.
- Dependency audits.
- URL/SSRF tests.
- File-processing security.
- Prompt injection tests.
- Credential handling.
- Database recovery.
- Backup and restore.
- Performance profiling.
- Installation testing.
- Error handling.
- Accessibility.
- Release packaging.
- Update integrity.
- Documentation.
- User onboarding.

Expected deliverables:

- Security review report.
- Regression test suite.
- Performance report.
- Release candidate.
- Installation documentation.
- Backup/restore documentation.
- User guide.
- Release checklist.

Exit criteria:

- No unresolved critical security issue.
- Critical workflows pass regression tests.
- Data backup and restore work.
- Resource budgets are measured.
- Release packages are verified.
- Owner approves release.

# 10. Android Development Track

Android is a planned expansion target.

Android feasibility must begin in Phase 1 rather than waiting until desktop completion.

The actual Android production track should follow the outcome of the Tauri proof of concept.

Potential Android work:

- Native permissions.
- Android storage.
- Audio processing.
- Video playback.
- Background task handling.
- Mobile navigation.
- Model download management.
- Performance optimization.
- Installation and update testing.

Do not commit to a final Android architecture without prototype evidence.

# 11. Future Expansion

The following are possible future capabilities:

- YouTube adapter.
- Instagram adapter.
- Additional source platforms.
- More AI providers.
- Advanced semantic search.
- Vector search.
- Cloud synchronization.
- Advanced connectors.
- Team collaboration.
- Additional export formats.
- Mobile-specific capabilities.
- Advanced research automation.

These must not delay the core initial release unless a dependency makes them necessary.

# 12. Phase Approval Gates

Every phase must follow this lifecycle:

1. Phase planning.
2. Requirements review.
3. Technical review.
4. Owner approval.
5. Implementation.
6. Testing.
7. Results review.
8. Documentation update.
9. Git milestone.
10. Handover to next phase.

A phase is not complete merely because the AI coding agent reports success.

Evidence and tests must support completion.

# 13. Git and Version Control

Use Git from the beginning.

Recommended practices:

- Small meaningful commits.
- Clear commit messages.
- No secrets in repository.
- `.gitignore` for build artifacts and temporary files.
- Review changes before merging.
- Keep stable milestones.
- Use branches for risky changes where appropriate.

Potential branch naming:

- `main`
- `phase/0-foundation`
- `phase/1-feasibility`
- `phase/2-core-app`
- `phase/3-ai-research`
- `phase/4-advanced-workspace`
- `phase/5-release`

Branching strategy may be simplified if the project remains small.

# 14. Documentation Maintenance

Documentation must evolve alongside implementation.

Important documents:

- MASTER_BRAIN.md
- ARCHITECTURE.md
- DATABASE_DESIGN.md
- SECURITY.md
- UI_DESIGN_SYSTEM.md
- API_POLICY.md
- DEVELOPMENT_ROADMAP.md
- TESTING_STRATEGY.md
- DECISION_LOG.md
- PHASE_HANDOFF.md
- CHANGELOG.md

When a design changes:

1. Explain why.
2. Identify affected requirements.
3. Identify migration implications.
4. Obtain approval where required.
5. Update relevant documents.
6. Record the decision.
7. Update the handoff.

# 15. AI Coding Agent Rules

AI coding agents must:

- Read AGENTS.md.
- Read the Master Brain.
- Read relevant technical documents.
- Inspect existing code before editing.
- Avoid unrelated modifications.
- Explain major changes.
- Run appropriate tests.
- Report failed tests honestly.
- Never claim unverified functionality.
- Never silently change approved requirements.
- Request approval for major architectural changes.
- Preserve existing user data.

AI agents must not implement future phases without authorization.

# 16. Resource and Performance Budgets

Performance budgets must be defined through actual measurement.

Track:

- Installer size.
- Installed size.
- Startup time.
- Idle RAM.
- Peak RAM.
- CPU usage.
- Database growth.
- Model storage.
- Temporary media storage.
- Search performance.
- Transcription speed.
- Graph performance.

Do not use preliminary estimates as verified results.

# 17. Risk Management

High-priority risks:

- Tauri 2 Android limitations.
- Video platform playback restrictions.
- Media accessibility.
- Whisper performance.
- Incorrect resource deduplication.
- API key exposure.
- Managed API cost and abuse.
- Prompt injection.
- Database migration failures.
- Graph performance.
- Large model storage requirements.

Each risk should have:

- Description.
- Impact.
- Likelihood.
- Mitigation.
- Validation method.
- Owner decision where necessary.

# 18. Current Development Status

At the initial roadmap baseline:

- Master Brain: populated by project owner.
- Architecture document: prepared.
- Database design: prepared.
- Security specification: prepared.
- UI design system: prepared.
- API policy: prepared.
- Development roadmap: prepared.
- Testing strategy: prepared draft (reviewed 2026-11-12).
- Decision log: prepared draft; decisions D-014..D-017 added 2026-11-12.
- Phase handoff: prepared draft; current record updated 2026-11-12.
- Changelog: prepared draft; maintained.
- Phase 0 execution plan, Phase 1 task packages, Phase 1 feasibility plan: prepared 2026-11-12.

Documentation completion does not mean technical validation is complete.

# 19. Definition of Project Completion

TechVault initial release is complete when:

- Core source management works.
- Resource extraction works within documented limitations.
- Resource identity and deduplication are reliable.
- Evidence is preserved.
- Local transcription works on supported configurations.
- AI integration is secure.
- Notebooks work.
- Search works.
- Backup and restore work.
- Critical security tests pass.
- Performance is acceptable on supported hardware.
- Release documentation is available.

Future platform expansion is not required for initial desktop release unless separately approved.

---

**End of DEVELOPMENT_ROADMAP.md**
