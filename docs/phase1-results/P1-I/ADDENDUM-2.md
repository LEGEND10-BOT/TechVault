# P1-I Addendum 2 — Architecture-Preservation Review (directive 82417 §8)

**Date:** 2026-11-13 · **Reviewer:** Implementation/verification agent (read-only review)
**Method:** each required property was checked against the actual governing documents (grep-verified quotations), not from memory.

| # | Required property | Verified in | Finding |
|---|---|---|---|
| 1 | Local-first data handling | D-001/D-006 (approved); ARCHITECTURE §53 "Cloud services only when required by a user-authorized feature" | **Preserved** — no cloud sync in the initial release; Phase 1 PoCs performed zero network egress except the localhost harness servers |
| 2 | User consent before external playback or redirection | SECURITY §378 "Require explicit user approval for sensitive actions"; F1-02 A5 scheme-allowlist test (measured) | **Preserved** — opener integration is Phase 2 wiring with the allowlist logic already negatively tested |
| 3 | Secure credential handling | SECURITY §6.1–6.4; API_POLICY §12/§12.1; D-019 | **Preserved** — incident protocol recorded; placeholder-only config validated offline (5/5) |
| 4 | Prompt-injection protection for external content | SECURITY §13; API_POLICY §17; F1-06 C12 tripwire + harness detector (mock-proven) | **Preserved** — live-model behavior pending the deferred P1-G run |
| 5 | Safe URL and file handling | SECURITY §8–9 (SSRF/redirect/path rules); P1-A fs-scope negative tests (measured) | **Preserved** — URL-fetching paths are Phase 2 connectors (not yet exercised; requirements in place) |
| 6 | Resource deduplication using reliable identifiers | DATABASE_DESIGN §13–14; P1-F URL-identity duplicate-candidate + merge/undo invariants (9/9 measured) | **Preserved and validated** |
| 7 | Separate Mention and Resource entities | DATABASE_DESIGN §4/§13; Phase 0 audit; P1-F schema | **Preserved** |
| 8 | Evidence provenance | DATABASE_DESIGN evidence model; P1-F evidence-preservation invariant (merge keeps evidence traceable) | **Preserved and validated** |
| 9 | Verified / Partially Verified / Unverified / Broken statuses | ARCHITECTURE §430–432 ("Partially Verified", "Broken/Unavailable"); MASTER_BRAIN §195–197; UI_DESIGN_SYSTEM §400 | **Preserved** — full status enum present in the governing docs; P1-F proves merges never upgrade verification status |
| 10 | AI-discovered vs explicitly mentioned classification | D-008; API_POLICY §19 discovery_type enum; P1-G schema + D-008 violation detector (mock-proven) | **Preserved** |
| 11 | Notebook-scoped research | ARCHITECTURE (3 refs); DATABASE_DESIGN (9 refs) — Phase 4 scope | **Preserved** (design-level; not exercised in Phase 1 by design) |
| 12 | Evidence-backed AI answers | MASTER_BRAIN principle 5 "Evidence-backed AI results"; ARCHITECTURE evidence model | **Preserved** (design-level; Phase 3 scope) |
| 13 | Export/import capability | D-007 (approved); ARCHITECTURE §638 export files; roadmap Phase 2 backup/export foundation | **Preserved** |
| 14 | Modular connectors with explicit authorization | ARCHITECTURE §7.1/§7.2 source-adapter interface (capability info per adapter, D-015 tier model); SECURITY user-authorization rules | **Preserved** — connector implementations are Phase 2+; the adapter contract is specified |
| 15 | No cloud sync in initial release | D-006 | **Preserved** — re-verified: nothing in the Phase 1 work introduced sync |
| 16 | No unnecessary database complexity | DATABASE_DESIGN unchanged this phase; P1-F prototyped the documented schema only (no schema drift) | **Preserved** |

**Verdict:** no architectural preservation violations found. The Phase 1 deliverables (config structure, Whisper Core plan) were checked against the same properties: the API configuration keeps credentials out of all artifacts (placeholder-validated), and the Whisper plan adds no background services, no auto-downloads, and no permanent media storage.

**Carry-forward flags (unchanged):** restrictive CSP for the production shell; SSRF/URL defenses land with the first real connector; live prompt-injection behavior pending P1-G run.

---

**End of P1-I ADDENDUM-2**
