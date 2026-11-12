# TechVault API and AI Provider Policy

**Document:** API_POLICY.md  
**Project:** TechVault  
**Version:** 1.0  
**Status:** Approved Direction, Implementation Details Pending  
**Last Updated:** 2026-11-11

---

# 1. Purpose

This document defines how TechVault uses AI providers, external APIs, managed services and optional user-owned API credentials.

It establishes:

- Provider architecture.
- Default provider.
- API key security.
- Managed API access.
- BYOK support.
- Model selection.
- Capability detection.
- Cloud processing consent.
- Request handling.
- Cost and usage management.
- Failure handling.
- AI output validation.
- Provider extensibility.

# 2. Core Policy

TechVault should provide a simple default AI experience while supporting advanced provider customization.

Normal users should not need to configure multiple APIs for different features.

Advanced users may override providers or models for specific tasks.

OpenRouter is the approved default provider direction.

Other providers are optional.

# 3. Provider Architecture

Use a provider abstraction.

Application features must not directly depend on a single provider's API implementation.

Conceptual architecture:

Application Feature  
→ AI Task Service  
→ Provider Selection  
→ Provider Adapter  
→ External Provider or Local Model

The application should use shared request and response structures where possible.

Provider-specific capabilities must remain explicit.

# 4. Supported Provider Directions

Initial preferred provider:

- OpenRouter.

Potential optional providers:

- Gemini.
- GLM.
- Ollama.
- Other compatible providers.

A provider should only be listed as supported after its integration has been tested.

Do not advertise unsupported capabilities.

# 5. Default Provider

OpenRouter is the approved default provider.

The default configuration should be simple.

The user should be able to:

- Use the default provider.
- Select an available model.
- Inspect the active provider.
- Change provider settings.
- Choose a different provider where supported.

The application must not assume that every model available through OpenRouter is equally capable.

# 6. Provider Abstraction

Each provider adapter should expose:

- Provider identifier.
- Display name.
- Authentication method.
- Available models.
- Supported capabilities.
- Request formatting.
- Response parsing.
- Streaming support.
- Error mapping.
- Usage metadata where available.

Capabilities may include:

- Text generation.
- Vision.
- Structured JSON output.
- Streaming.
- Tool use.
- Embeddings.
- Large context windows.

A capability must be checked before a task depends on it.

# 7. AI Task Categories

TechVault may use AI for:

1. Resource extraction.
2. Resource classification.
3. Resource description.
4. Related resource suggestions.
5. Transcript summarization.
6. Notebook summarization.
7. Research Q&A.
8. Comparison.
9. Concept explanation.
10. Contradiction detection.
11. Research organization.
12. Structured metadata generation.

Each task should have a clearly defined input and output contract.

# 8. Model Selection

Normal mode:

- One default provider.
- One default model.
- Automatic task compatibility checks.

Advanced mode:

- Optional per-task model selection.
- Optional provider override.
- Optional local model selection.

Examples of task-specific configuration:

- Resource extraction model.
- Notebook chat model.
- Summarization model.
- Vision-capable model.
- Embedding model.

Per-task overrides must be optional.

Avoid forcing ordinary users to configure every task separately.

# 9. Managed API Access

The owner has approved the direction of TechVault supplying default API access provisionally.

This requires a managed backend gateway.

Important rules:

- Shared API keys must remain server-side.
- Client applications must never contain privileged shared credentials.
- The gateway must authenticate users or sessions.
- Usage must be controlled.
- Abuse protection must exist.
- Provider spending must be monitored.

The managed gateway is a separate service and must not be confused with the local Rust backend.

The initial implementation architecture and hosting arrangement require approval.

# 10. Managed API Usage Controls

Recommended controls:

- Per-user usage quotas.
- Rate limits.
- Maximum request sizes.
- Maximum output sizes.
- Model allowlists where appropriate.
- Daily and monthly spending controls.
- Abuse detection.
- Request timeout.
- Usage accounting.
- Emergency shutdown.
- Credential rotation.

The application should communicate usage limitations clearly.

Do not promise unlimited AI access unless a real funded policy supports it.

# 11. BYOK: Bring Your Own Key

Optional BYOK support should allow users to supply their own provider credentials.

Requirements:

- Secure storage.
- Validation.
- Provider-specific configuration.
- Credential replacement.
- Credential removal.
- No plaintext logging.
- No credential inclusion in exports.

Prefer OS secure credential storage.

The UI should clearly identify whether a task uses managed access or a user-owned key.

# 12. API Key Storage

Credentials must never be:

- Hard-coded in frontend code.
- Stored in public configuration.
- Embedded in application binaries.
- Committed to Git.
- Printed in logs.
- Included in error messages.
- Exported as ordinary settings.

For BYOK, use OS credential storage where supported.

For managed access, use server-side secrets management.

# 13. Cloud Processing and User Consent

Before content is transmitted to an external AI provider, the application must make the processing mode clear.

Possible modes:

## Local Only

- Use available local capabilities.
- Do not send source content to external AI providers.
- Explain when a feature cannot be completed locally.

## Cloud Processing

- External provider processing is allowed.
- Show relevant provider information.
- Transmit only required content.

## No AI

- Disable AI-based processing.
- Preserve available non-AI functionality.

Per-source Local Only preference is recommended.

Cloud processing must not happen silently when the user expects local-only operation.

# 14. Data Minimization

Only send the content required for the task.

Avoid sending:

- Unrelated notebook content.
- Entire transcripts when relevant excerpts are sufficient.
- API credentials.
- Local file paths unless necessary.
- Unrelated personal notes.
- Other notebooks without authorization.

Use relevant timestamps and evidence snippets to reduce unnecessary context.

# 15. AI Context Management

Notebook AI must use selected notebook context by default.

Context may include:

- Notebook sources.
- Associated resources.
- Relevant transcripts.
- Notes.
- Evidence.

Global research context must require explicit user selection or configuration.

The AI must not silently include unrelated notebooks.

# 16. RAG and Citations

Notebook AI should use retrieval-augmented generation where appropriate.

Answers should cite:

- Source.
- Video timestamp.
- Relevant transcript excerpt.
- Resource record.
- Notebook note.

The application should preserve source attribution.

If evidence is insufficient, AI should clearly communicate uncertainty.

Avoid presenting unsupported statements as verified facts.

# 17. Prompt Injection Policy

External transcripts, websites, descriptions and repository content are untrusted data.

They must not override system instructions or authorize privileged actions.

AI prompts should clearly separate:

- Application instructions.
- User requests.
- Retrieved source content.
- Tool outputs.

AI must not be allowed to:

- Reveal secrets.
- Execute arbitrary commands.
- Access unrestricted files.
- Upload unrelated data.
- Change permissions.
- Authorize connectors.

Sensitive actions require separate authorization.

# 18. Structured Output

Prefer structured output for extraction tasks.

Validate:

- Required fields.
- Data types.
- URL formats.
- Resource categories.
- Confidence ranges.
- Enum values.
- Maximum field lengths.
- Evidence references.

Malformed output should be rejected or handled through a controlled repair process.

Never insert raw model output directly into trusted database fields without validation.

# 19. Resource Extraction Output

A resource candidate should contain, where available:

- Name.
- Resource type.
- Short description.
- Detailed description.
- Official URL.
- Discovery type.
- Timestamp.
- Evidence.
- Confidence.
- Verification status.
- Related candidates.

The system must distinguish actual source mentions from related AI suggestions.

AI-generated resources must not automatically become verified resources.

# 20. Cost and Usage Management

The system should monitor:

- Provider.
- Model.
- Task type.
- Input tokens where available.
- Output tokens where available.
- Estimated cost where available.
- Request duration.
- Usage status.

Do not assume every provider exposes accurate token or billing information.

Usage records should avoid storing sensitive prompt contents unnecessarily.

Exact free quotas, paid limits and billing policy remain pending owner approval.

# 21. Provider Errors and Fallback

Possible errors:

- Authentication failure.
- Rate limit.
- Insufficient credits.
- Provider outage.
- Timeout.
- Invalid response.
- Unsupported capability.
- Context limit.
- Network failure.

The application should:

1. Identify the failure.
2. Explain it clearly.
3. Preserve completed work.
4. Allow retry where safe.
5. Offer a compatible alternative only when permitted.
6. Avoid silently changing providers if the user selected a specific provider.

Automatic fallback must respect local-only and provider-selection preferences.

# 22. Local AI

Ollama is a potential optional local provider.

Local model integration should consider:

- Hardware capability.
- RAM.
- CPU/GPU.
- Model size.
- Context length.
- Performance.
- Storage.

Do not automatically download large models.

Explain storage and performance requirements before installation.

# 23. Embeddings and Vector Search

Embeddings may be introduced later for semantic search and advanced notebook retrieval.

They are not mandatory for the first release.

Before adding a vector extension:

- Measure keyword search limitations.
- Benchmark dataset size.
- Test mobile compatibility.
- Review storage overhead.
- Review extension licensing.
- Confirm migration and backup behavior.

# 24. API Configuration UI

Settings should show:

- Active provider.
- Active model.
- Connection status.
- Credential source.
- Available capabilities.
- Usage information where available.

Advanced settings may expose per-task overrides.

Normal users should see a simple default configuration.

# 25. API Logging

Logs may record:

- Provider identifier.
- Model identifier.
- Task type.
- Duration.
- Status.
- Sanitized error code.
- Usage metadata.

Logs must not contain:

- API keys.
- Authentication headers.
- Session tokens.
- Unnecessary transcript content.
- Sensitive user notes.

# 26. API Testing

Required tests:

- Provider authentication.
- Invalid credentials.
- Rate limits.
- Timeout handling.
- Provider outage.
- Structured response validation.
- Streaming.
- Capability detection.
- Usage accounting.
- BYOK storage.
- Managed key isolation.
- Local-only enforcement.
- Prompt injection.
- Provider switching.
- Context limits.

# 27. Pending Decisions

The following require further owner approval or validation:

- Managed API gateway hosting.
- Authentication method.
- Free quota and billing policy.
- Exact supported model list.
- Model fallback rules.
- BYOK rollout.
- Per-task model overrides.
- Ollama support scope.
- Embedding provider.
- Data Egress Ledger.
- API usage retention period.

# 28. Definition of Done

API integration is ready when:

- Provider abstraction is implemented.
- Default OpenRouter integration works.
- Secrets remain protected.
- Managed access is isolated.
- BYOK is secure if enabled.
- Cloud consent is respected.
- Structured outputs are validated.
- Usage controls are tested.
- Provider failures are handled.
- Notebook citations are preserved.
- Local-only mode is enforceable.

---

**End of API_POLICY.md**
