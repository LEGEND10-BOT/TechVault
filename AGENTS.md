# TechVault AI Agent and Developer Instructions

**Project:** TechVault  
**Document status:** Prepared Draft  
**Version:** 1.0

This document defines mandatory working rules for AI coding agents, automated development tools, and human contributors working on TechVault.

These instructions apply to the entire repository unless a more specific, approved instruction file applies to a particular directory.

---

## 1. First Rule: Understand Before Changing

Before making any changes:

1. Inspect the actual repository structure.
2. Read `README.md`.
3. Read `docs/MASTER_BRAIN.md`.
4. Read `docs/DECISION_LOG.md`.
5. Read the relevant technical documents.
6. Inspect existing code and dependencies.
7. Check Git status and current branch.
8. Identify the authorized development phase.
9. Confirm the task's scope.
10. Identify unresolved dependencies or approvals.

Do not start implementation based only on a short user message when important project context exists in the repository.

## 2. Source of Truth and Document Priority

Use the following order when interpreting project requirements:

1. Explicit, latest project-owner instructions.
2. Owner-approved decisions in `docs/DECISION_LOG.md`.
3. `docs/MASTER_BRAIN.md` for product requirements.
4. Approved architecture and technical specifications.
5. Approved phase scope and handoff.
6. Existing implementation, where it does not conflict with approved requirements.
7. Proposed recommendations and technical assumptions.

If two authoritative documents conflict:

- Do not silently choose one.
- Identify the conflicting statements.
- Explain their consequences.
- Recommend a resolution.
- Request owner approval when necessary.
- Update affected documents after the decision.

## 3. Approved Decisions Must Be Respected

The agent must not silently change:

- Desktop-first development direction.
- Android feasibility evaluation in parallel.
- Transcript retention by default with user deletion.
- OpenRouter as the default AI provider direction.
- Optional alternative AI providers.
- Provisional managed API access direction.
- Local-first initial release.
- Export/import before cloud sync.
- Related AI suggestions enabled by default.
- Approved UI design system.
- Supplied shield and T logo.
- General/Master Control versus dedicated phase implementation workflow.

Always check `DECISION_LOG.md` for the latest decision status.

A proposed technology or feature is not approved merely because it appears in a technical document.

## 4. Scope Control

Work only on the requested and authorized task.

Before adding a feature:

1. Check whether it is already required.
2. Check whether it belongs to the current phase.
3. Identify dependencies.
4. Estimate its impact.
5. Explain any scope expansion.
6. Obtain approval when necessary.

Do not:

- Add unnecessary features.
- Introduce large dependencies without justification.
- Rewrite working modules without a clear reason.
- Remove requirements to simplify implementation.
- Implement future-phase functionality prematurely.
- Make unrelated refactors during a focused task.

Prefer the smallest complete solution that satisfies the approved requirements.

## 5. Architecture Rules

The architecture must remain modular and maintainable.

Important principles:

- Keep domain logic independent of UI frameworks.
- Keep provider-specific AI code behind an abstraction.
- Keep platform-specific functionality behind suitable interfaces.
- Keep database access organized and controlled.
- Avoid unnecessary coupling between modules.
- Use clear interfaces and explicit data contracts.
- Make long-running jobs cancellable where practical.
- Preserve partial results when safe and appropriate.
- Avoid unnecessary background tasks.
- Avoid unnecessary runtime dependencies.

The proposed stack is a starting direction, not proof of compatibility.

Do not introduce a new framework or replace the proposed stack without explaining the reason and obtaining the necessary approval.

## 6. Technology Direction

The current proposed stack is:

| Area | Direction |
|---|---|
| Desktop | Tauri 2 |
| Backend/core | Rust |
| Frontend | Svelte 5 |
| Build | Vite |
| Type system | Strict TypeScript |
| Styling | Tailwind CSS 4 |
| UI components | Shadcn-style and Radix |
| Database | SQLite |
| Search | FTS5 |
| Transcription | Whisper.cpp |
| AI provider | OpenRouter by default |
| Graph | Sigma.js and Graphology, subject to benchmark |

Before adding or upgrading dependencies:

- Check compatibility.
- Check licensing.
- Check maintenance activity.
- Consider binary and storage size.
- Consider CPU and RAM consumption.
- Consider Android compatibility.
- Document why the dependency is needed.

Do not assume a package is suitable merely because it is popular.

## 7. Database and Data Integrity Rules

Database changes require particular care.

The agent must:

- Follow `DATABASE_DESIGN.md`.
- Use explicit schema migrations.
- Avoid destructive migrations without an approved recovery plan.
- Preserve existing user data.
- Use transactions for multi-step critical operations.
- Maintain referential integrity.
- Test migration and rollback behavior where supported.
- Preserve resource mentions and evidence.
- Handle duplicate submissions safely.
- Avoid storing unnecessary media.

### Resource identity

The conceptual distinction between a canonical Resource and its individual Mentions is important.

Do not:

- Merge resources based only on similar names.
- Treat AI confidence as identity proof.
- Delete original evidence during a merge.
- Discard aliases or meaningful history.
- Automatically merge uncertain matches.

Any change to identity or merge logic must include tests for incorrect merges and recovery.

## 8. AI and External API Rules

AI-generated content is not automatically trustworthy.

The agent must:

- Validate structured AI output.
- Handle invalid and incomplete responses.
- Handle timeouts, rate limits, and provider failures.
- Keep provider-specific code isolated.
- Preserve source references and evidence.
- Distinguish suggestions from explicitly mentioned resources.
- Avoid claiming verification without evidence.
- Defend against prompt injection in transcripts and webpages.
- Avoid sending unnecessary data to external providers.

### API credential security

Never:

- Embed a managed API key in the desktop binary.
- Place secret keys in frontend JavaScript.
- Commit API keys to Git.
- Print secrets in logs.
- Store user credentials in plaintext without an approved security design.

Managed API access must use a protected server-side service.

User-owned credentials must use an appropriate secure storage mechanism.

## 9. Source, URL, and Media Security

Treat all external content as untrusted.

Validate:

- URL schemes.
- Redirect destinations.
- Hostnames and resolved IP addresses.
- Private and local network destinations.
- File paths.
- Uploaded file types.
- File sizes.
- Media metadata.
- External process arguments.

Protect against:

- SSRF.
- Path traversal.
- Command injection.
- Malformed media.
- Unsafe redirects.
- Unexpected external data transmission.
- Temporary-file leakage.

Do not bypass DRM, authentication boundaries, or private content restrictions.

Never promise that every video URL can be processed.

## 10. UI and Design Rules

Follow `UI_DESIGN_SYSTEM.md`.

The agent must preserve:

- Approved dark-primary direction.
- Light theme support.
- Violet accent palette.
- Typography direction.
- Compact research-workspace layout.
- Desktop and mobile responsiveness.
- Approved shield and T logo.
- Consistent status indicators.
- Accessible interaction patterns.

Do not redesign the logo without approval.

Do not introduce a different visual identity without approval.

The uploaded TSX reference is a visual reference. It does not automatically authorize changing the selected frontend framework.

## 11. Performance Rules

TechVault must remain lightweight.

Avoid:

- Unnecessary background services.
- Excessive polling.
- Unbounded concurrent jobs.
- Loading entire large datasets into memory.
- Unnecessary model downloads.
- Unnecessary duplicate media storage.
- Heavy UI rendering.
- Unnecessary dependencies.

Use measurements to justify performance claims.

The known reference CPU is Intel Core i5-6300U. RAM capacity still needs confirmation.

Measure startup, memory, CPU, disk usage, search, transcription, and graph performance where relevant.

## 12. Testing Requirements

Read `TESTING_STRATEGY.md`.

For every meaningful change:

1. Add or update relevant tests.
2. Run the appropriate test suite.
3. Report actual results.
4. Explain failed or skipped tests.
5. Identify untested areas.
6. Record important performance changes.
7. Update documentation when behavior changes.

Never:

- Claim tests passed without executing them.
- Hide failures.
- Remove tests simply to make a build pass.
- Replace meaningful tests with superficial assertions.
- Use production secrets in test fixtures.

## 13. Git and Repository Safety

Before changing files:

- Inspect Git status.
- Identify user modifications.
- Avoid overwriting unrelated changes.
- Work within the authorized scope.
- Keep changes understandable and reviewable.

Do not:

- Force-push without explicit approval.
- Delete branches without authorization.
- Reset or clean the repository destructively.
- Overwrite user-created files without review.
- Commit secrets.
- Claim a commit or push succeeded unless verified.

Prefer small, meaningful commits.

## 14. Documentation Maintenance

Update documentation when a change affects:

- Architecture.
- Database schema.
- Security.
- UI behavior.
- API behavior.
- Platform support.
- Performance expectations.
- Testing.
- Phase scope.
- Approved decisions.

Use:

- `DECISION_LOG.md` for decisions.
- `CHANGELOG.md` for meaningful completed changes.
- `PHASE_HANDOFF.md` for phase status and handoffs.
- Relevant technical documents for specifications.

Do not claim documentation was updated unless the actual file was modified.

## 15. AI Agent Communication Rules

Before implementation, briefly state:

- What you understood.
- What files or modules are involved.
- What you intend to change.
- What is outside scope.
- Any risks or missing approvals.

For significant work, report:

- Files created.
- Files modified.
- Dependencies changed.
- Tests executed.
- Test results.
- Known limitations.
- Pending work.
- Documentation updated.
- Git state, if relevant.

Explain technical decisions in clear language.

Do not bury important failures or risks in a long summary.

## 16. Handling Uncertainty

If something is unknown:

1. Say it is unknown.
2. Identify what evidence is missing.
3. Suggest a practical validation method.
4. Do not invent a result.
5. Do not turn an assumption into a requirement.

For major technical uncertainty, build a small proof of concept before committing to a large implementation.

## 17. Phase Discipline

Follow `DEVELOPMENT_ROADMAP.md` and `PHASE_HANDOFF.md`.

Do not jump ahead to future phases without approval.

At the beginning of a phase:

- Read the incoming handoff.
- Verify actual repository state.
- Confirm approved scope.
- Identify blockers.
- Establish acceptance criteria.

At the end of a phase:

- Run relevant tests.
- Record actual results.
- Update documentation.
- Update decision records if required.
- Prepare the next handoff.
- Obtain owner approval where required.

## 18. Definition of Done

A task is complete only when:

- The requested functionality is implemented.
- Approved requirements are preserved.
- Relevant tests pass or failures are documented.
- Security implications are considered.
- Data integrity is preserved.
- Performance impact is considered.
- Documentation is updated where necessary.
- Known limitations are reported.
- The actual repository state is clear.

A successful compilation alone does not mean the task is complete.

## 19. Critical Rule: Never Invent Progress

The agent must never claim that:

- A feature exists when it has not been implemented.
- A platform is supported without testing.
- A technical risk is resolved without evidence.
- A decision is approved without owner authorization.
- A file was saved when it was not.
- A test passed when it was not executed.
- A security issue is fixed without verification.

**TechVault development must be evidence-driven, scope-controlled, and transparent.**

---

## Final Instruction

Build TechVault as a reliable, lightweight, modular research application.

Prioritize correctness, maintainability, privacy, and data integrity over unnecessary complexity or rushed feature additions.

When a decision is uncertain, stop, explain the uncertainty, and ask for the appropriate approval instead of silently guessing.