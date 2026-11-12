# TechVault API Configuration Architecture

**Document status:** Active — Phase 1 closure deliverable (owner directive 82417, 2026-11-13; recommendation R-023)
**Version:** 1.0
**Scope:** configuration **structure and placeholders only**. No application code, no live calls, no credentials. Actual provider integration is a later implementation stage (Phase 3 per `DEVELOPMENT_ROADMAP.md` §7).

---

## 1. Purpose

Establish the extensible provider-configuration architecture now so that real keys and providers can be configured later without restructuring. Every value in the shipped placeholder files is a placeholder; no file in this repository ever contains a real credential (`SECURITY.md` §6.4, `API_POLICY.md` §12.1).

## 2. Provider registry (modular adapters)

| Provider ID | Display name | Kind | Base URL (default) | Capability notes |
|---|---|---|---|---|
| `openrouter` | OpenRouter | cloud aggregator (**default**, D-003) | `https://openrouter.ai/api/v1` | text, vision, JSON, tool-calling, streaming; model-dependent embeddings |
| `gemini` | Google Gemini | cloud (optional, D-004) | `https://generativelanguage.googleapis.com/v1beta` | text, vision, JSON, streaming |
| `zai_glm` | Z.ai / GLM | cloud (optional, D-004) | provider-documented endpoint (placeholder) | text, JSON, streaming |
| `ollama` | Ollama (local) | **local** (D-004, API_POLICY §22) | `http://127.0.0.1:11434` | text, embeddings; runs on user hardware; no cloud egress |
| `openai_compatible` | Custom (OpenAI-compatible) | cloud/self-hosted (optional) | user-supplied URL | capability subset declared by the user |
| *(future)* | — | modular adapter slot | — | new providers are new adapters implementing the same schema; no core changes |

Adapters are selected by `provider` ID; each adapter owns its request/response mapping behind the provider abstraction (R-003/D-003 direction). Provider-specific behavior never leaks outside its adapter (`TESTING_STRATEGY.md` §3.3).

## 3. Configuration record schema

Each provider instance is one configuration record (see `config/api/providers.schema.json` for the JSON Schema and `config/api/providers.placeholder.json` for filled placeholders):

| Field | Meaning | Validation |
|---|---|---|
| `provider` | provider identification (registry ID) | must match a registered adapter |
| `display_name` | UI label | non-empty string |
| `enabled` | enable/disable status | boolean; **all placeholders are `false`** |
| `base_url` | API endpoint | URL with `https:` (or `http://127.0.0.1*` for local providers only) |
| `api_key_ref` | **reference** to a credential in OS secure storage — never the key itself | non-empty opaque reference string, e.g. `OS_KEYCHAIN_REFERENCE` |
| `default_model` | default model ID | non-empty; placeholders use `YOUR_MODEL_ID` |
| `task_models` | optional task-specific overrides (`resource_extraction`, `research`, `summarization`, `tts`, …) | optional map; absent ⇒ `default_model` |
| `capabilities` | declared capability flags: `text_generation`, `vision`, `tool_calling`, `json_output`, `embedding`, `streaming` | booleans; must reflect what the provider/adapter actually supports |
| `connection_status` | last known connectivity state | enum: `unconfigured` \| `unverified` \| `ok` \| `error` (placeholders: `unconfigured`) |
| `validation_status` | configuration validation state | enum: `unvalidated` \| `valid` \| `invalid` (with `validation_errors[]`) |
| `notes` | free-form user notes | optional |

**Connection status lifecycle:** `unconfigured` (no key ref) → `unverified` (config valid, never contacted) → `ok`/`error` (after an explicit user-triggered test). No automatic connection probes: a status check only runs on explicit user action, never in the background (no background services — AGENTS.md §11).

**Configuration validation** (offline, no network): schema conformance, URL scheme rules, capability/adapter consistency (e.g. a local Ollama record must not claim cloud-only capabilities), model-ID presence. Validation status is computed locally and displayed as a clear "unconfigured/placeholder" state when no key exists — the UI must never imply a configured, working provider when `api_key_ref` is a placeholder.

## 4. Capability model

Text generation and speech (TTS) are **separate model capabilities routed through the same provider integration where supported** — one credential per provider, capability-specific models (`API_POLICY.md` §12.2, decision D-019). Embeddings remain out of the initial release (R-011); the flag exists in the schema for later phases.

## 5. Security requirements (binding)

1. Never hardcode API keys in source, config, frontend bundles, or binaries (`API_POLICY.md` §12).
2. `api_key_ref` holds an **OS credential storage reference** only (BYOK, R-009); the key material never leaves the OS keychain except into the adapter's in-memory request path.
3. Any future TechVault-managed shared key lives **server-side** behind the managed gateway (D-005, SECURITY §6.1) — never in the desktop application.
4. Credentials are never logged, never exported, never included in error messages or diagnostics.
5. Placeholder state must be explicit: an unconfigured provider shows "not configured", never a silent fallback to another provider (API_POLICY §21).
6. No configuration action may trigger a paid API call. Free-tier models are still third-party API usage — live testing requires explicit owner authorization per execution (D-019).
7. Do not assume any provider subscription (including desktop token allowances) includes API quota; quota verification is part of the later live-configuration stage.

## 6. Files in this closure

| File | Content |
|---|---|
| `docs/API_CONFIGURATION.md` | this specification |
| `config/api/providers.schema.json` | JSON Schema for provider configuration records (validation-ready, offline) |
| `config/api/providers.placeholder.json` | one placeholder record per registry provider — every credential field is a placeholder, every `enabled` is `false` |

These are specifications and structural placeholders, not application code; `src/` and `src-tauri/` remain reserved for Phase 2+. The configuration UI requirements continue to live in `API_POLICY.md` §24.

---

**End of API_CONFIGURATION.md**
