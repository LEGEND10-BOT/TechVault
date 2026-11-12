# TechVault Testing Strategy

**Document status:** Prepared Draft  
**Version:** 1.0  
**Project:** TechVault  
**Purpose:** Define how TechVault functionality, reliability, security, performance, and platform compatibility will be tested.

---

## 1. Testing Objectives

Testing must establish that TechVault:

1. Correctly identifies useful resources from supported sources.
2. Does not silently lose source material, evidence, transcripts, or partial results.
3. Avoids incorrect resource merges and preserves resource identity.
4. Works reliably without unnecessarily consuming system resources.
5. Handles unsupported platforms and failed operations honestly.
6. Protects local data, credentials, and user privacy.
7. Provides a consistent experience across supported desktop platforms.
8. Has a realistic Android compatibility path.
9. Can recover from interrupted jobs, application crashes, and database failures.
10. Remains maintainable as new connectors and resource types are introduced.

Testing is part of development, not a final activity performed immediately before release.

## 2. Testing Principles

- Every important feature must have acceptance criteria.
- Critical domain logic should be tested independently of the UI.
- Tests must use repeatable fixtures wherever possible.
- Network-dependent tests must not be the only way to verify core functionality.
- Failed operations must be tested, not just successful ones.
- Partial success must be treated as a valid outcome where appropriate.
- Security and privacy tests must run throughout development.
- Performance claims must be based on measurements.
- Tests must not require real user credentials or expose production secrets.
- A passing test does not automatically prove a feature is secure or production-ready.

## 3. Testing Layers

### 3.1 Unit tests

Test small, isolated pieces of functionality.

Examples:

- URL normalization and validation.
- Resource identifier comparison.
- Canonical resource matching.
- Confidence calculations.
- Resource category classification.
- Mention and evidence creation.
- Alias handling.
- Job state transitions.
- Retry and cancellation logic.
- Settings validation.
- Data serialization and deserialization.
- Permission checks.
- Temporary-file cleanup decisions.

Domain logic should be testable without launching the desktop UI.

### 3.2 Integration tests

Verify that multiple components work together.

Examples:

- Rust backend and SQLite.
- SQLite migrations and existing data.
- FTS5 indexing and search.
- Source ingestion and job processing.
- Transcript storage and evidence linking.
- Resource extraction and mention creation.
- Resource merge and history preservation.
- Notebook creation and source association.
- AI provider abstraction and response parsing.
- Whisper.cpp process integration.
- Temporary media cleanup.
- Backup and restore.

### 3.3 Contract tests

Verify that internal modules and external integrations follow their expected interfaces.

Examples:

- AI providers return valid normalized responses.
- Connector adapters return consistent source metadata.
- Extraction output follows the defined resource schema.
- Player adapters expose supported playback capabilities.
- Transcription adapters return expected transcript structures.
- Database repositories preserve domain invariants.

Provider-specific differences must not leak throughout the application.

### 3.4 End-to-end tests

Test complete user workflows through the application interface.

Important workflows:

1. Add a supported video URL.
2. Inspect source metadata.
3. Start processing.
4. Generate or obtain a transcript.
5. Extract resources.
6. Review evidence.
7. Open a resource.
8. Bookmark a resource.
9. Add a source to a notebook.
10. Search across resources and sources.
11. Cancel a running job.
12. Resume or recover after interruption.
13. Export and restore research data.
14. Delete a source or transcript according to the selected deletion policy.

### 3.5 Platform tests

Test supported targets separately.

| Platform | Testing focus |
|---|---|
| Windows | Installation, updates, file permissions, playback, Whisper |
| Linux | Packaging, permissions, filesystem behavior, dependencies |
| macOS | Signing, permissions, installation, playback |
| Android | UI compatibility, storage, networking, audio decoding, lifecycle, performance |

Desktop success does not prove Android compatibility.

## 4. Golden Dataset for Resource Extraction

A controlled dataset is required to measure extraction quality.

The dataset should contain representative test cases such as:

- Videos with clearly spoken resource names.
- Videos displaying URLs or repository names on screen.
- Resources mentioned in descriptions or captions.
- Multiple resources mentioned in one sentence.
- Similar-sounding tool names.
- Obsolete or renamed products.
- Incorrectly pronounced names.
- Resources mentioned without enough identifying information.
- Videos containing unrelated technical terminology.
- Videos with no useful resources.
- Videos with misleading or fictional resources.
- Multiple videos discussing the same resource.

Each test case should have manually reviewed expected results.

### 4.1 Evaluation metrics

Measure:

- **Precision:** How many extracted resources are genuinely relevant?
- **Recall:** How many expected resources were successfully identified?
- **False positive rate:** How many irrelevant resources were added?
- **Miss rate:** How many useful resources were missed?
- **Identity accuracy:** How often was the correct canonical resource selected?
- **Merge accuracy:** How often were duplicates merged correctly?
- **Evidence accuracy:** Does the evidence actually support the resource mention?
- **Verification accuracy:** Is the verification status justified by available evidence?

Do not optimize only for the number of extracted resources. A smaller, accurate result is often more useful than a large noisy list.

### 4.2 Dataset governance

- Use public, licensed, synthetic, or user-authorized test material.
- Avoid storing private videos or personal data in test fixtures without authorization.
- Keep expected results separate from the extraction implementation.
- Record dataset version and changes.
- Include difficult cases, not only easy demonstrations.
- Add regression cases whenever a meaningful extraction error is discovered.

## 5. Resource Identity and Deduplication Tests

Resource identity is a critical area because incorrect merges can damage the research library.

Test these cases:

1. Same official URL and same resource.
2. Same repository identifier with different display names.
3. Same name but different products.
4. Similar names belonging to unrelated tools.
5. Resource renamed by its owner.
6. Resource moved to a new official domain.
7. Repository fork versus original repository.
8. Old and new versions of a resource.
9. Unverified AI suggestion versus verified resource.
10. Two resources with insufficient identity evidence.

### Required invariants

- A mention remains traceable to its original source.
- A merge does not destroy source evidence.
- Every merge is recorded in history.
- An incorrect merge can be reversed where technically supported.
- Aliases and previous names remain accessible.
- Uncertain matches are not automatically treated as confirmed duplicates.
- A resource's verification status is not upgraded merely because another mention has high confidence.
- Merge operations must be transactional.

### Merge regression tests

For every merge test, verify:

- Canonical resource identity.
- Preserved mentions.
- Preserved evidence.
- Preserved source associations.
- Preserved aliases.
- Correct relationship updates.
- Merge history.
- Undo behavior.
- Database integrity after the operation.

## 6. Video and Source Processing Tests

Test the complete source lifecycle:

- Valid supported URL.
- Invalid URL.
- Unsupported platform.
- Private or inaccessible source.
- Expired link.
- Redirect chain.
- Authentication-required source.
- Missing captions.
- Malformed metadata.
- Very short media.
- Long media.
- Network interruption.
- Rate limiting.
- Cancelled processing.
- Repeated submission of the same source.
- Application shutdown during processing.

Expected outcomes must be explicit.

The application should distinguish:

- Submitted
- Pending
- Processing
- Completed
- Partial Success
- Authentication Required
- Unsupported
- Failed
- Cancelled

A source that cannot be processed must not be presented as successfully processed.

## 7. Transcription Tests

Test Whisper.cpp integration using controlled audio fixtures.

Include:

- Clear speech.
- Background noise.
- Multiple speakers.
- Technical vocabulary.
- Mixed-language speech.
- Long pauses.
- Low-volume speech.
- Unsupported or corrupted audio.
- Different supported audio formats.
- Different model sizes.

Test Tiny, Base, Small, Medium, and any larger models only where supported by the implementation and hardware.

Measure:

- Transcription accuracy.
- Processing time.
- Peak memory usage.
- CPU usage.
- Model download size.
- Temporary storage use.
- Cancellation behavior.
- Recovery after interruption.

Partial transcripts must be preserved when safe and technically possible.

Android transcription requires separate tests for model loading, audio decoding, memory pressure, application lifecycle, and background execution restrictions.

## 8. AI and Provider Tests

Test:

- Valid provider response.
- Invalid API key.
- Expired credentials.
- Rate limits.
- Provider downtime.
- Timeout.
- Malformed JSON.
- Incomplete response.
- Unexpected response format.
- Context-window limits.
- Cost or quota exhaustion.
- User cancellation.
- Provider switching.
- Fallback behavior.
- Untrusted instructions embedded in source content.

AI output must be validated before it changes persistent data.

The application must not treat AI-generated statements as verified facts without appropriate evidence.

## 9. Notebook and Research AI Tests

Verify:

- Notebook creation and deletion.
- Multiple sources in one notebook.
- Resource association.
- Notes and summaries.
- Search within a notebook.
- Notebook-scoped AI responses.
- Citation accuracy.
- Source and timestamp references.
- Insufficient-evidence responses.
- Contradiction identification.
- Isolation between different notebooks.
- Explicit opt-in for broader research scope.

A notebook-scoped question must not silently retrieve unrelated private research from other notebooks.

## 10. Database and Data Integrity Tests

Test:

- Fresh database initialization.
- Migration from every supported prior schema.
- Interrupted migration.
- Invalid or corrupted records.
- Transaction rollback.
- Foreign-key constraints.
- FTS5 indexing and rebuilding.
- Duplicate submission handling.
- Concurrent reads and writes.
- Backup creation.
- Backup restoration.
- Export and import.
- Deletion and cleanup.
- Large research libraries.

After destructive or complex operations, run integrity checks and verify that relationships remain valid.

WAL, JSON1, sqlite-vec, encryption, and other optional database features must be tested on the actual target builds before adoption.

## 11. Security Tests

Security testing must cover:

- SSRF and unsafe URL handling.
- Redirect validation.
- Local network and private IP access restrictions.
- Malicious filenames and path traversal.
- Malformed media.
- Command injection.
- Temporary-file permissions.
- Secret leakage in logs.
- API key storage.
- Frontend/backend permission boundaries.
- Prompt injection.
- Connector authorization.
- Unexpected data transmission.
- Backup confidentiality.
- Dependency vulnerabilities.
- Update and package integrity.

Use synthetic credentials and isolated test environments.

A security test pass is not a guarantee of complete security.

## 12. Performance and Resource Testing

TechVault must remain usable on modest hardware.

The known reference CPU is Intel Core i5-6300U. RAM capacity and storage configuration still need confirmation.

Measure:

- Cold startup time.
- Warm startup time.
- Idle CPU.
- Idle RAM.
- Peak RAM.
- CPU during transcription.
- CPU during extraction.
- Database query latency.
- Search latency.
- Graph rendering performance.
- UI responsiveness.
- Disk growth.
- Model download and storage footprint.
- Performance with multiple queued jobs.

### Performance rules

- Avoid unnecessary background processing.
- Use bounded job concurrency.
- Make long-running jobs cancellable.
- Avoid loading entire transcripts or libraries into memory unnecessarily.
- Paginate or virtualize large lists.
- Load graph details progressively.
- Download optional models only when needed.
- Provide resource limits and user controls.

Numeric performance budgets must be established after Phase 0 baselines and prototype measurements. Do not treat preliminary installer or memory estimates as measured guarantees.

## 13. UI, Accessibility, and Usability Tests

Verify:

- Dark and light themes.
- Responsive desktop and mobile layouts.
- Keyboard navigation.
- Focus visibility.
- Screen-reader labels where applicable.
- Readable status indicators.
- Clear error messages.
- Loading and empty states.
- Search and command palette behavior.
- Video player layout.
- Resource inspector.
- Evidence viewer.
- Dialog and confirmation behavior.
- Reduced-motion preferences.

Status must not be communicated by color alone.

## 14. Automation and CI

The CI pipeline should progressively include:

1. Formatting checks.
2. Static analysis and linting.
3. Type checking.
4. Unit tests.
5. Integration tests.
6. Database migration tests.
7. Security and dependency checks.
8. Build checks for supported desktop targets.
9. Android build and compatibility checks when available.
10. Golden dataset regression tests.

Tests requiring real external services should use mocks or controlled test accounts where practical.

Do not put production API keys in CI logs, source code, or public repository settings.

## 15. Release Acceptance Criteria

A release candidate must satisfy:

- No unresolved critical data-loss defect.
- No known critical security vulnerability.
- Database migrations tested.
- Backup and restore tested.
- Core source-to-resource workflow tested.
- Resource merge invariants tested.
- Partial-result handling tested.
- Unsupported-source behavior tested.
- AI provider failures handled safely.
- No secrets exposed in application artifacts.
- Performance measured on the reference hardware.
- Supported platform builds verified.
- Known limitations documented.
- Release checklist completed.

## 16. Test Reporting

Every significant test run should record:

- Date and build identifier.
- Commit or release candidate.
- Platform and hardware.
- Test suite and dataset version.
- Pass/fail counts.
- Known failures.
- Performance measurements.
- Security findings.
- Reproduction instructions.
- Responsible owner.
- Resolution status.

## 17. Pending Decisions

The following require later approval or measurement:

- Exact performance budgets.
- Minimum supported hardware and RAM.
- Golden dataset size and licensing.
- Required precision and recall thresholds.
- Confidence thresholds for AI-discovered resources.
- Maximum source duration and size.
- Maximum concurrent processing jobs.
- Android device test matrix.
- Release-blocking vulnerability severity policy.
- Whether automated UI tests will use a dedicated framework.

## 18. Definition of Done

A feature is not complete merely because it works once.

It is complete when:

1. Its acceptance criteria are met.
2. Relevant tests exist and pass.
3. Failure cases are handled.
4. Security and privacy implications are reviewed.
5. Performance impact is measured where relevant.
6. Documentation is updated.
7. Known limitations are recorded.
8. The change is traceable to a project decision or approved requirement.

---

**Document maintenance:** Update this document when test architecture, supported platforms, acceptance criteria, or release policy changes. Record significant changes in `DECISION_LOG.md` and `CHANGELOG.md`.
