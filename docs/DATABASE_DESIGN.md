# TechVault Database Design Specification

**Document:** DATABASE_DESIGN.md  
**Project:** TechVault  
**Version:** 1.0  
**Status:** Proposed Schema, Requires Validation  
**Database:** SQLite  
**Search:** SQLite FTS5  
**Last Updated:** 2026-11-11

---

# 1. Purpose

This document defines the proposed persistent data model for TechVault.

It covers:

- Database entities.
- Relationships.
- Resource identity.
- Source and mention separation.
- Evidence preservation.
- Deduplication.
- Merge history.
- Notebook organization.
- Search.
- Processing jobs.
- Data integrity.
- Migrations.
- Backup and recovery.

The schema is a design baseline. It must be reviewed and tested before being treated as a final production schema.

# 2. Database Principles

## 2.1 SQLite First

SQLite is the preferred initial database.

Reasons:

- Local-first architecture.
- Low operational complexity.
- Single-file database.
- Mature transaction support.
- Full-text search through FTS5.
- Suitable for structured relational data.

No external database server should be required for the initial desktop application.

## 2.2 Data Ownership

The local database is the authoritative source for user-owned research data.

The application must not require cloud synchronization to access previously stored local information.

## 2.3 Stable Identifiers

Every major entity must have a stable identifier.

Use UUIDs or another well-defined collision-resistant identifier strategy.

Identifiers must not depend on display names.

A resource name can change while its stable identity remains unchanged.

## 2.4 Data Separation

Separate:

- Sources.
- Resources.
- Mentions.
- Evidence.
- Aliases.
- Resource history.
- Merge events.

Do not combine all extracted information into one resource table.

# 3. Core Entity Model

Primary entities:

1. Source.
2. Resource.
3. Mention.
4. Evidence.
5. ResourceAlias.
6. ResourceIdentifier.
7. ResourceHistory.
8. ResourceMerge.
9. Notebook.
10. NotebookSource.
11. NotebookResource.
12. Note.
13. ProcessingJob.
14. Connector.
15. ApplicationSetting.
16. Bookmark.

# 4. Entity Relationships

Conceptual relationships:

- A Source can contain multiple Mentions.
- A Resource can have multiple Mentions.
- A Mention belongs to one Source.
- A Mention may refer to one canonical Resource.
- A Mention may have multiple Evidence records.
- A Resource can have multiple Aliases.
- A Resource can have multiple External Identifiers.
- A Resource can have multiple History entries.
- A Resource can have multiple related Resources.
- A Notebook can contain multiple Sources.
- A Notebook can contain multiple Resources.
- A Notebook can contain multiple Notes.
- A Source can have multiple Processing Jobs.

The database must enforce valid references through foreign keys.

# 5. Sources Table

Purpose:

Store metadata about submitted content.

Proposed fields:

| Field | Type | Purpose |
|---|---|---|
| id | TEXT PRIMARY KEY | Stable source ID |
| original_url | TEXT | User-submitted URL |
| normalized_url | TEXT | Normalized URL when safe |
| platform | TEXT | Source platform |
| title | TEXT | Source title |
| description | TEXT | Source description |
| creator_name | TEXT | Creator metadata if available |
| source_type | TEXT | Video, website, text, upload |
| status | TEXT | Processing lifecycle |
| playback_type | TEXT | Local, embed, external, unavailable |
| transcript_status | TEXT | Transcript availability |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update |
| processed_at | TEXT NULL | Completion timestamp |
| last_error | TEXT NULL | Sanitized error summary |

Rules:

- Original submitted URL must be preserved.
- Normalized URL must never replace the original URL.
- URLs must be validated before network access.
- Platform names must use controlled values where possible.
- Source records should survive processing failures.
- Duplicate source detection should not automatically delete records.

# 6. Resources Table

Purpose:

Store canonical resource identities.

Proposed fields:

| Field | Type | Purpose |
|---|---|---|
| id | TEXT PRIMARY KEY | Stable resource ID |
| canonical_name | TEXT | Preferred resource name |
| resource_type | TEXT | Category/type |
| short_description | TEXT | Brief description |
| detailed_description | TEXT NULL | Extended explanation |
| official_url | TEXT NULL | Official website |
| primary_domain | TEXT NULL | Canonical domain |
| verification_status | TEXT | Verification state |
| discovery_origin | TEXT | Original discovery classification |
| created_at | TEXT | Creation time |
| updated_at | TEXT | Last update |
| last_verified_at | TEXT NULL | Verification time |
| is_archived | INTEGER | Archive state |

Important:

A Resource is a canonical identity, not a single mention in a video.

A resource may appear in many sources with different names or descriptions.

Canonical naming must be editable without destroying historical names.

# 7. Mentions Table

Purpose:

Represent each occurrence of a resource in a source.

Proposed fields:

| Field | Type | Purpose |
|---|---|---|
| id | TEXT PRIMARY KEY | Mention ID |
| source_id | TEXT | Related source |
| resource_id | TEXT NULL | Canonical resource |
| extracted_name | TEXT | Name found in source |
| discovery_type | TEXT | Explicit, AI-discovered, related, manual |
| confidence_score | REAL NULL | Model confidence |
| timestamp_seconds | REAL NULL | Video timestamp |
| context_text | TEXT NULL | Relevant source context |
| extraction_method | TEXT | Extraction method |
| review_status | TEXT | Review lifecycle |
| created_at | TEXT | Creation time |

Important rules:

- One resource may have many mentions.
- Multiple mentions may refer to one resource.
- Mention evidence must remain available after a resource merge.
- Confidence is not verification.
- AI-related suggestions must never be presented as explicitly mentioned resources.

A mention should not be deleted merely because its canonical resource changes.

# 8. Evidence Table

Purpose:

Preserve compact, useful evidence supporting a resource discovery.

Proposed fields:

| Field | Type | Purpose |
|---|---|---|
| id | TEXT PRIMARY KEY | Evidence ID |
| mention_id | TEXT | Associated mention |
| evidence_type | TEXT | Transcript, caption, metadata, URL, manual |
| evidence_text | TEXT | Short relevant snippet |
| timestamp_seconds | REAL NULL | Source timestamp |
| evidence_url | TEXT NULL | Supporting URL |
| provenance | TEXT | Where evidence originated |
| created_at | TEXT | Creation timestamp |

Evidence should be compact.

Avoid storing complete duplicated transcripts inside every evidence record.

If transcript text is retained, evidence may refer to the relevant transcript segment through stable identifiers or timestamps.

Evidence provenance must remain visible.

# 9. Transcript Storage

Transcripts are stored separately from source metadata.

Proposed logical fields:

- id.
- source_id.
- language.
- transcription_engine.
- model_name.
- transcript_text.
- transcript_format_version.
- created_at.
- updated_at.
- retention_state.

Timestamped segments may use a separate table:

TranscriptSegment:

- id.
- transcript_id.
- start_seconds.
- end_seconds.
- text.
- segment_index.

Retention rules:

- Save transcripts by default.
- Allow the user to delete transcripts.
- Deleting a transcript must not automatically delete resource metadata or evidence records that the user wants to retain.
- When transcript deletion would remove the original evidence content, the application must preserve or clearly mark the evidence as unavailable.
- Do not retain original video files by default.

Transcript size limits and cleanup behavior require validation.

# 10. Resource Aliases

Purpose:

Store alternate and historical resource names.

Proposed fields:

- id.
- resource_id.
- alias_name.
- alias_type.
- source_mention_id.
- valid_from.
- valid_until.
- created_at.

Alias types may include:

- Alternate Name.
- Previous Name.
- Abbreviation.
- Former Brand.
- Misspelling.
- Community Name.

Do not treat every similar name as an alias.

An alias must have a defensible relationship with its canonical resource.

# 11. Resource Identifiers

Purpose:

Store strong identifiers for matching and deduplication.

Proposed fields:

- id.
- resource_id.
- identifier_type.
- identifier_value.
- issuer_or_platform.
- is_primary.
- verified_at.
- created_at.

Examples:

- Official URL.
- GitHub repository ID.
- Package registry identifier.
- Official domain.
- Vendor product identifier.

Unique constraints should be applied only where the identifier type and issuer make global uniqueness meaningful.

Do not assume all URLs are unique resource identities.

# 12. Resource History

Purpose:

Preserve meaningful changes.

Proposed fields:

- id.
- resource_id.
- field_name.
- previous_value.
- new_value.
- change_type.
- changed_at.
- change_source.
- explanation.

Examples:

- Canonical name changed.
- Official domain changed.
- Ownership changed.
- Project discontinued.
- Repository archived.
- Product functionality changed.

History should be append-oriented.

Avoid silently overwriting important identity changes.

# 13. Resource Merge History

Purpose:

Preserve all resource identity merge decisions.

Proposed fields:

- id.
- primary_resource_id.
- merged_resource_id.
- merge_reason.
- merge_method.
- reviewed_by_user.
- merge_timestamp.
- undo_timestamp.
- merge_status.
- snapshot_reference.

Rules:

1. Never automatically merge uncertain candidates.
2. Show a merge preview.
3. Preserve mentions and evidence.
4. Preserve aliases and identifiers.
5. Keep previous IDs in merge history.
6. Support an undo operation.
7. Prevent circular or contradictory identity relationships.
8. Record the reason and method of each merge.

A merge should be performed transactionally.

If a merge fails, the database must remain in its previous valid state.

The exact canonical-resource and redirect strategy requires schema prototyping before final approval.

# 14. Resource Relationships

A separate relationship table may be used.

Proposed fields:

- id.
- source_resource_id.
- target_resource_id.
- relationship_type.
- confidence.
- provenance.
- created_at.

Relationship examples:

- Uses.
- Integrates With.
- Alternative To.
- Depends On.
- Developed By.
- Related Concept.
- Replaced By.

Relationship confidence must not be confused with verification.

Avoid creating duplicate inverse relationships unless the relationship model explicitly requires them.

# 15. Notebooks

Notebook table:

- id.
- title.
- description.
- created_at.
- updated_at.
- archived_at.

NotebookSource:

- notebook_id.
- source_id.
- added_at.

NotebookResource:

- notebook_id.
- resource_id.
- added_at.
- notes.

NotebookNote:

- id.
- notebook_id.
- title.
- content.
- created_at.
- updated_at.

A source or resource may belong to multiple notebooks.

Deleting a notebook must not automatically delete the underlying sources or resources.

Notebook AI scope must be based on explicit notebook membership and user-selected context.

# 16. Bookmarks

Purpose:

Allow resources and sources to be bookmarked.

Proposed fields:

- id.
- target_type.
- target_id.
- created_at.
- optional_note.

Target types must be validated.

If the application later introduces a dedicated bookmark relationship table, migrations must preserve existing bookmark data.

# 17. Processing Jobs

Purpose:

Track background processing operations.

Proposed fields:

- id.
- source_id.
- job_type.
- status.
- progress.
- stage.
- started_at.
- completed_at.
- error_code.
- error_summary.
- retry_count.
- created_at.
- updated_at.

Supported statuses:

- Submitted.
- Pending.
- Processing.
- Completed.
- Partial Success.
- Authentication Required.
- Unsupported.
- Failed.
- Cancelled.

Do not store secrets or raw sensitive authentication data in error fields.

Job retries must be idempotent where practical.

# 18. Connectors

Connector configuration may include:

- id.
- connector_type.
- display_name.
- enabled.
- permission_summary.
- connection_status.
- created_at.
- updated_at.

Credentials must not be stored as plaintext in ordinary database fields.

Use OS credential storage or a suitable secure secret-management mechanism.

Connectors should remain disconnected until the user explicitly authorizes them.

# 19. Application Settings

Settings should be separated into categories.

Examples:

- Theme.
- Language.
- Default provider.
- Default model.
- Transcription model.
- Retention preferences.
- Processing concurrency.
- Playback preferences.
- Local/cloud processing preference.

Sensitive credentials must not be stored in ordinary settings records.

Use typed validation for settings values.

# 20. Search Architecture

Initial search:

SQLite FTS5.

Potential indexed fields:

- Resource canonical name.
- Resource descriptions.
- Resource aliases.
- Source titles.
- Transcript content.
- Notes.

Use relational filters for:

- Resource type.
- Verification status.
- Discovery type.
- Date.
- Source platform.
- Notebook.

FTS indexes must remain synchronized with underlying data.

Database migrations must account for FTS triggers and rebuild procedures.

Vector search is deferred until a clear requirement exists.

# 21. Constraints and Indexing

Recommended index candidates:

- Sources.platform.
- Sources.status.
- Sources.created_at.
- Resources.resource_type.
- Resources.verification_status.
- Mentions.source_id.
- Mentions.resource_id.
- Mentions.timestamp_seconds.
- Evidence.mention_id.
- ResourceAlias.resource_id.
- ResourceIdentifier.resource_id.
- ProcessingJobs.status.
- ProcessingJobs.source_id.
- NotebookSource.notebook_id.
- NotebookResource.notebook_id.

Final indexes must be based on actual query patterns.

Avoid excessive indexes that slow writes and increase storage unnecessarily.

Foreign key enforcement must be enabled and tested.

# 22. SQLite Configuration

Candidate configuration:

- Foreign keys enabled.
- WAL mode after concurrency testing.
- Appropriate busy timeout.
- Transactional migrations.
- Integrity checks.
- Controlled checkpoint behavior.
- Prepared statements.

WAL should be validated against backup and filesystem behavior.

Do not assume that a database file can safely be copied while active without a proper SQLite backup procedure.

# 23. Database Migrations

All schema changes must use versioned migrations.

Requirements:

- Sequential migration versions.
- Reproducible migration scripts.
- Backup before risky migrations.
- Migration failure rollback.
- Schema version tracking.
- Tests for fresh database creation.
- Tests for upgrades from previous versions.
- Tests for partially failed migrations.

Never silently discard user data during migration.

Destructive migrations require explicit review and a recovery strategy.

# 24. Backup and Restore

Initial release should prioritize local export and import rather than cloud sync.

Backup should include:

- SQLite data.
- Required metadata.
- User-selected retained files.
- Version information.
- Integrity information.

Backup must not unexpectedly include:

- Temporary media.
- Unneeded caches.
- Downloadable model files unless selected.

Restore must validate:

- Backup format.
- Version compatibility.
- Database integrity.
- Required file references.

A restore operation must not silently overwrite the active database.

# 25. Deletion and Retention

Deletion behavior must be explicit.

Examples:

- Deleting a source must not silently delete shared canonical resources.
- Deleting a transcript must not delete unrelated resource records.
- Deleting a notebook must not delete its shared sources.
- Removing a mention must not destroy evidence belonging to other mentions.
- Deleting a resource must account for aliases, relationships, history and mentions.

Where data is shared, use explicit confirmation and safe archival or unlinking behavior.

# 26. Data Integrity Testing

Required tests:

1. Source creation.
2. Resource creation.
3. Multiple mentions for one resource.
4. Evidence preservation.
5. Alias handling.
6. Identifier uniqueness.
7. Merge preview.
8. Merge transaction.
9. Merge rollback.
10. Merge undo.
11. Notebook membership.
12. Transcript deletion.
13. Job retry.
14. Database migration.
15. Backup and restore.
16. FTS consistency.
17. Database corruption recovery.

# 27. Schema Decisions Requiring Approval or Validation

Pending:

- UUID representation.
- Final table and column names.
- Canonical resource redirect strategy.
- Exact merge undo implementation.
- Transcript segmentation format.
- Evidence retention after transcript deletion.
- Database encryption.
- SQLite WAL configuration.
- sqlite-vec requirement.
- Exact JSON column usage.
- Resource relationship constraints.
- Backup format and versioning.

These choices must be tested before final production schema approval.

# 28. Definition of Done

The database design is ready for implementation when:

- Entity relationships are reviewed.
- Resource identity is clearly separated from mentions.
- Merge and undo behavior is proven with tests.
- Evidence preservation rules are implemented.
- Foreign key behavior is verified.
- Migrations are reproducible.
- Search indexing is tested.
- Backup and restore work.
- Deletion behavior is documented.
- No important user data is silently lost.

---

**End of DATABASE_DESIGN.md**
