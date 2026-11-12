# TechVault Security Specification

**Document:** SECURITY.md  
**Project:** TechVault  
**Version:** 1.0  
**Status:** Security Baseline, Requires Threat-Model Review  
**Last Updated:** 2026-11-11

---

# 1. Purpose

This document establishes the security and privacy requirements for TechVault.

It defines:

- Security principles.
- Threat model.
- Data protection.
- API key handling.
- URL validation.
- Network security.
- Local file security.
- AI security.
- Connector permissions.
- Database protection.
- Logging.
- Dependency security.
- Application updates.
- Incident response.
- Security testing.

Security must be considered throughout development rather than added only before release.

# 2. Security Principles

## 2.1 Privacy by Default

TechVault should minimize unnecessary data collection and external transmission.

Local processing should be preferred when practical.

Cloud processing must be disclosed clearly.

## 2.2 Least Privilege

Each module should receive only the permissions required for its function.

The frontend must not receive direct access to privileged operating-system operations.

Connectors should request only the permissions they actually need.

## 2.3 Explicit User Authorization

The application must not silently:

- Redirect users to external playback.
- Connect external accounts.
- Upload local media.
- Enable cloud processing.
- Share research content with unrelated services.
- Enable optional telemetry.

## 2.4 Defense in Depth

Use multiple protective controls.

Examples:

- Input validation.
- Permission boundaries.
- Secure credential storage.
- Network restrictions.
- Database integrity checks.
- Dependency review.
- Logging controls.
- Security testing.

No single control should be treated as complete protection.

# 3. Threat Model

TechVault handles untrusted sources and may communicate with external services.

Potential attackers and threats include:

- Malicious websites.
- Malformed video and audio files.
- Malicious documents.
- Compromised external repositories.
- Malicious links.
- Prompt injection in transcripts and webpages.
- Compromised AI provider integrations.
- Credential theft.
- Local malware.
- Unauthorized access to application data.
- Malicious or compromised dependencies.
- Abuse of managed API access.
- Unauthorized network requests.

The application should protect against realistic attacks within its intended local-first operating model.

# 4. Security Assets

Important assets include:

- API keys.
- Provider credentials.
- Connector tokens.
- Local database.
- Transcripts.
- Resource metadata.
- User notes.
- Notebook contents.
- Temporary media.
- Exported backups.
- Application configuration.
- Update signing keys.
- Managed API gateway credentials.

Each asset should have an appropriate protection strategy.

# 5. Data Classification

Recommended categories:

## Public

Information intentionally public or already publicly accessible.

Examples:

- Public tool names.
- Public repository URLs.
- Public website metadata.

## User Research Data

Information created or collected by the user.

Examples:

- Notes.
- Transcripts.
- Notebooks.
- Bookmarks.
- Research relationships.
- Personal resource annotations.

## Sensitive Credentials

Examples:

- API keys.
- OAuth tokens.
- Session credentials.
- Connector secrets.

## Operational Data

Examples:

- Application logs.
- Job status.
- Diagnostic information.
- Performance measurements.

Operational data must not expose sensitive user content unnecessarily.

# 6. API Key and Credential Security

## 6.1 Managed API Access

TechVault may provide default API access through a managed service.

Requirements:

- Shared provider credentials remain on the server.
- Never embed shared API keys in frontend JavaScript.
- Never hard-code shared keys into Rust source or compiled application binaries.
- Never include privileged keys in application logs.
- Never expose shared credentials through normal client responses.

The client should authenticate to a managed gateway using a suitable user/session mechanism.

## 6.2 Managed Gateway Controls

The managed gateway should support:

- Authentication.
- Authorization.
- Rate limits.
- Per-user quotas.
- Spend limits.
- Usage accounting.
- Request size limits.
- Model allowlists where appropriate.
- Abuse detection.
- Audit records without sensitive content.
- Credential rotation.
- Emergency revocation.

The exact authentication and billing architecture requires a separate design and security review.

## 6.3 Bring Your Own Key

For optional BYOK:

- Prefer OS credential storage.
- Do not store keys as plaintext in ordinary SQLite settings.
- Do not expose keys to frontend components.
- Do not print keys in debugging output.
- Do not include credentials in exported project data.
- Provide a way to replace or remove a stored credential.

## 6.4 Credential Incident Handling (added 2026-11-13, decision D-019)

An OpenRouter API key was accidentally exposed in a project conversation and is treated as compromised. Standing rules from this incident:

- A credential exposed in any conversation, log, screenshot, or repository artifact is **compromised** and must be revoked by its owner and replaced. Revocation happens in the provider dashboard by the owner — never by an agent.
- Agents must never request, receive, store, test, commit, log, print, or reuse credentials delivered through chat. Replacement credentials are configured by the owner directly (environment variable or secure OS storage), never sent in conversation.
- Documentation and examples use the placeholder environment variable name `OPENROUTER_API_KEY` and never contain a real key.
- Live provider calls require explicit owner authorization per execution (spend-bearing actions are individually gated; see decision D-019 and `API_POLICY.md` §12).

## 6.4 Credential Rotation

The system must support revocation and replacement of credentials.

Compromised credentials should be invalidated at the provider or gateway.

# 7. Network Security

All external communication should use HTTPS where supported.

Requirements:

- Validate destination URLs.
- Validate redirects.
- Apply timeouts.
- Limit response sizes.
- Handle TLS failures safely.
- Avoid leaking secrets through query parameters.
- Avoid unnecessary external requests.
- Restrict requests to approved provider endpoints where practical.

Certificate validation must not be disabled to work around connection problems.

# 8. SSRF Protection

Server-Side Request Forgery is a significant risk because users can submit arbitrary URLs.

TechVault must not blindly fetch user-supplied URLs.

Controls should include:

1. Parse URLs using a maintained URL library.
2. Restrict allowed schemes, normally HTTP and HTTPS.
3. Reject dangerous or unsupported URL formats.
4. Resolve hostnames safely.
5. Reject loopback addresses.
6. Reject private and link-local IP ranges unless a specifically authorized local operation requires them.
7. Reject cloud metadata service addresses.
8. Revalidate every redirect destination.
9. Prevent DNS rebinding where practical.
10. Restrict ports when appropriate.
11. Apply connection and response timeouts.
12. Enforce download size limits.
13. Avoid following untrusted redirects without validation.

The validation must apply to every request, not only the initial URL.

Localhost access should never be enabled as a generic URL-fetching exception.

# 9. URL and Resource Verification

A valid URL does not prove that a resource is genuine.

TechVault should distinguish:

- URL syntactically valid.
- Website reachable.
- Domain associated with resource.
- Official source verified.
- Resource identity verified.

Avoid relying exclusively on HTTP HEAD requests.

Some websites:

- Do not support HEAD.
- Block automated requests.
- Redirect differently.
- Return misleading status codes.
- Require authentication.

Verification must use multiple signals when necessary.

Network failures must not automatically mark a resource as fake.

# 10. File and Media Security

User-uploaded media and downloaded content must be treated as untrusted.

Requirements:

- Validate file types.
- Check file size.
- Limit processing duration.
- Use safe temporary directories.
- Generate internal filenames.
- Prevent path traversal.
- Do not trust file extensions.
- Avoid unsafe shell command construction.
- Validate arguments passed to external processes.
- Apply resource limits where feasible.
- Clean up temporary files.
- Preserve successful partial results.

Media parsers and decoders may contain vulnerabilities.

Use maintained dependencies and keep them updated.

# 11. Command Execution Security

If Whisper.cpp, FFmpeg or other tools are invoked:

- Use controlled executable paths.
- Pass arguments as structured process arguments.
- Never concatenate untrusted user input into shell commands.
- Avoid shell interpretation where possible.
- Validate file paths.
- Apply timeouts.
- Capture and sanitize error output.
- Restrict unnecessary process permissions.
- Handle cancellation safely.

Do not allow AI-generated commands to execute automatically.

# 12. Temporary File Security

Temporary files should:

- Use application-controlled directories.
- Have unpredictable or safely generated filenames.
- Avoid collisions.
- Be created with restrictive permissions where supported.
- Be removed after successful or failed processing.
- Not overwrite unrelated user files.
- Not be accessible through public web paths.

Cleanup must account for application crashes and interrupted jobs.

A startup cleanup routine may remove known stale temporary files after validating ownership and age.

# 13. AI Security and Prompt Injection

Transcripts, webpages, descriptions, repository files and other extracted text are untrusted input.

They may contain instructions designed to manipulate AI behavior.

Examples:

- Ignore previous instructions.
- Reveal credentials.
- Execute a command.
- Upload local files.
- Change system configuration.
- Treat a webpage as an authorized tool instruction.

Security rules:

1. Treat external content as data, never as trusted instructions.
2. Keep system and developer instructions separate from source content.
3. Clearly label untrusted source text.
4. Do not grant AI unrestricted filesystem access.
5. Do not grant AI unrestricted network access.
6. Do not allow AI to execute arbitrary commands.
7. Require explicit user approval for sensitive actions.
8. Validate structured model output.
9. Do not trust model-generated URLs without validation.
10. Keep tool permissions narrow.
11. Limit AI context to the selected notebook or task unless global context is authorized.
12. Do not reveal secrets in model prompts.

AI-generated results must be presented with evidence and uncertainty.

# 14. AI Provider Security

External AI providers may receive data sent for processing.

Before cloud processing, the user should be informed about:

- Which content will be transmitted.
- Which provider will receive it.
- Whether local processing is available.
- Whether the task requires cloud processing.
- What information is retained by TechVault.

Provider requests must:

- Use secure transport.
- Avoid unnecessary personal data.
- Exclude credentials and unrelated local content.
- Have request size limits.
- Handle provider errors safely.
- Validate returned structured data.

Provider responses must be considered untrusted.

# 15. Local-Only and Cloud Processing Controls

TechVault should support a clear processing preference:

- Local Only.
- Cloud Processing.
- No AI.

A per-source Local Only option should be available.

The UI should clearly communicate when a cloud operation is about to send content externally.

A future Data Egress Ledger should record:

- Operation type.
- Provider.
- Data category transmitted.
- Timestamp.
- User authorization context.

It should avoid storing unnecessary full content or secrets.

The exact implementation is subject to product approval.

# 16. Tauri Security

Tauri permissions and capabilities must follow least privilege.

Requirements:

- Restrict frontend capabilities.
- Avoid broad filesystem permissions.
- Avoid unnecessary shell permissions.
- Use explicit command exposure.
- Validate command arguments.
- Avoid unsafe dynamic content rendering.
- Restrict external navigation.
- Use a restrictive Content Security Policy where compatible.
- Review plugin permissions.
- Keep the Tauri runtime updated.

The frontend must not be granted access to arbitrary local filesystem locations unless a specific feature requires it.

# 17. Frontend Security

Requirements:

- Avoid unsafe HTML injection.
- Sanitize untrusted content before rendering where necessary.
- Avoid rendering arbitrary AI output as executable HTML.
- Use safe URL handling.
- Prevent accidental credential exposure.
- Validate user input.
- Avoid unnecessary third-party scripts.
- Review UI dependencies.
- Keep sensitive state out of URLs and logs.

# 18. Database Security

SQLite data is stored locally and should be protected through operating-system access controls.

Requirements:

- Restrictive database file permissions where supported.
- Safe temporary database files.
- Secure backup handling.
- Integrity checks.
- Transactional migrations.
- No secrets in ordinary database fields.
- Safe export behavior.
- Clear deletion behavior.

Database encryption is a separate decision.

Potential options should be evaluated based on:

- Platform compatibility.
- Maintenance.
- Key management.
- Performance.
- Backup and recovery.
- Licensing.
- Failure behavior.

Do not implement encryption without a clear key-management design.

# 19. Connector Security

Connectors must remain disconnected until explicitly authorized.

Requirements:

- Clear permission descriptions.
- Least-privilege scopes.
- Secure token storage.
- Revocation support.
- Connection status.
- Error reporting.
- Explicit disconnect functionality.
- No unexpected background access.

A chat-specific setting must not silently override global connector permissions.

# 20. Logging and Diagnostics

Logs must be useful without exposing sensitive data.

Never log:

- API keys.
- OAuth tokens.
- Passwords.
- Session cookies.
- Full authentication headers.
- Unnecessary personal information.

Avoid storing complete transcripts in operational logs.

Sanitize provider errors and process output.

Telemetry must be disabled by default.

Optional diagnostic sharing must require explicit user consent.

# 21. Dependency and Supply Chain Security

Requirements:

- Use maintained dependencies.
- Review new packages before adoption.
- Pin or lock dependency versions appropriately.
- Audit Rust dependencies.
- Audit frontend dependencies.
- Review transitive dependencies.
- Check known vulnerabilities.
- Review package provenance where available.
- Avoid unnecessary dependencies.
- Record important licensing obligations.

High-risk dependencies must receive additional review.

# 22. Build and Release Security

Release process should include:

- Reproducible build configuration where practical.
- Signed application packages where supported.
- Update integrity verification.
- Secure release channels.
- Dependency checks.
- Build artifact verification.
- Version information.
- Release notes.

Updater signing keys must not be included in the distributed application.

The exact signing and updater strategy requires platform-specific validation.

# 23. Backup and Export Security

Backups may contain private research data.

Requirements:

- Explain backup contents.
- Avoid including credentials.
- Avoid unnecessary temporary media.
- Validate import files.
- Prevent path traversal during extraction.
- Prevent accidental overwrites.
- Provide integrity validation.
- Recommend secure storage for exported files.

# 24. Access and Local Device Security

TechVault is initially a local desktop application.

It should rely on operating-system user permissions and avoid creating unnecessary network listeners.

Do not expose local APIs or ports unless a specific approved feature requires them.

If a local service is introduced, require explicit design and security review.

# 25. Security Testing Requirements

Required testing areas:

## Input and URL Testing

- Invalid URLs.
- Dangerous URL schemes.
- Redirect chains.
- Private IP addresses.
- Localhost targets.
- DNS rebinding scenarios.
- Oversized responses.
- Unsupported ports.

## File Testing

- Invalid extensions.
- Malformed media.
- Oversized files.
- Path traversal.
- Filename collisions.
- Interrupted processing.
- Temporary file cleanup.

## AI Testing

- Prompt injection in transcripts.
- Malicious webpage instructions.
- Malformed structured output.
- Fake official URLs.
- Hallucinated resource identities.
- Attempts to reveal credentials.
- Unauthorized tool-use requests.

## Credential Testing

- No API keys in frontend bundles.
- No keys in logs.
- No keys in exported databases.
- Secure credential storage.
- Credential replacement and revocation.

## Database Testing

- Invalid foreign keys.
- Failed migrations.
- Interrupted transactions.
- Merge rollback.
- Backup restore.
- Corrupt database recovery.

## Application Testing

- Tauri permission boundaries.
- External navigation restrictions.
- Connector authorization.
- Release package integrity.
- Dependency vulnerability checks.

# 26. Incident Response

If a security incident is identified:

1. Identify the affected component.
2. Determine the affected data and credentials.
3. Stop or disable the vulnerable functionality.
4. Revoke compromised credentials where necessary.
5. Preserve relevant diagnostic information without exposing secrets.
6. Assess whether user notification is required.
7. Fix the vulnerability.
8. Add regression tests.
9. Review whether other components share the same weakness.
10. Document the incident and corrective actions.

# 27. Security Acceptance Criteria

A release must not be considered security-ready until:

- Secrets are protected.
- User-supplied URLs are validated.
- Redirect handling is safe.
- Temporary files are controlled.
- Untrusted media is handled safely.
- AI prompt injection risks are addressed.
- External data transmission is transparent.
- Connector permissions are explicit.
- Logs do not expose secrets.
- Database recovery is tested.
- Dependencies are reviewed.
- Tauri permissions are minimized.
- Release integrity is validated.

# 28. Known Security Limitations

TechVault cannot guarantee complete protection against:

- Malware already present on the operating system.
- A compromised operating-system account.
- Vulnerabilities in third-party providers.
- Newly discovered dependency vulnerabilities.
- Malicious content that bypasses detection.
- Compromised external services.
- Physical access to an unlocked device.
- Advanced attacks against the host operating system.

Security is a continuous engineering process, not a permanent guarantee.

# 29. Pending Security Decisions

The following require further review:

- Database encryption.
- Exact managed API gateway authentication.
- Local-only enforcement design.
- Data Egress Ledger implementation.
- Tauri CSP and capability configuration.
- OS credential storage implementation per platform.
- Signed updater design.
- Backup encryption.
- Connector token revocation architecture.
- Media sandboxing strategy.
- Security incident reporting policy.

# 30. Definition of Done

Security design is ready for implementation when:

- Threat model is reviewed.
- Sensitive data is classified.
- Network boundaries are defined.
- URL validation requirements are established.
- File-processing boundaries are established.
- AI security rules are implemented.
- Credential storage is designed.
- Tauri permissions are reviewed.
- Logging rules are implemented.
- Security tests are defined.
- Critical findings are resolved or formally accepted by the owner.

---

**End of SECURITY.md**
