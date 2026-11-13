# P1 Backup/Security Integrity Check — read-only (2026-11-13)

**Scope:** `D:\TechVault` repository + the two external artifact locations. **Nothing modified, deleted, committed, or accessed externally.** Secret values never printed — filename/line-number only.

## 1. Secrets in tracked files or on disk — **PASS**

- `git ls-files | grep -iE "\.env$|\.env\.|\.key$|\.pem$|\.pfx$|\.p12$|secret|credential"` → **0 tracked secret-like files**.
- Content scan (multi-pattern: `sk-or-v1-`/`sk-proj-`/`sk-…20+`, `hf_`/`ghp_` tokens, private-key blocks, `Authorization: Bearer <literal>`, `api[_-]?key|password|token = "<16+ chars>"`) across the whole tree (excluding `.git/`, `node_modules/`, `.svelte-kit/`, `build/`, lockfiles) → **0 hits** (file:line list empty).
- Disk search for `.env*`, `*.key`, `*.pem`, `secrets.*` anywhere in the tree → **0 files**.
- Known safe placeholders confirmed non-secret: `config/api/providers.placeholder.json` uses `OS_KEYCHAIN_REFERENCE` / `YOUR_MODEL_ID` literals only (D-019 §6 convention).

## 2. `.gitignore` coverage — **PASS**

Confirmed present (fixed-string match; an earlier regex-based probe reported false "MISSING" lines due to `ugrep` interpreting `*.key` as a regex — re-verified with `-F`): `.env`, `.env.*`, `*.key`, `*.pem`, `secrets.*` (secrets), `models/`, `*.gguf`, `*.bin` (models), `node_modules/`, `src-tauri/target/`, `**/src-tauri/target/`, `tmp/`, `*.sqlite`/`*.db`/`backups/` (build outputs, caches, user data). Experiment-level `.gitignore` additionally excludes `experiments/p1-c/results/logs/` and temp WAV fixtures.

## 3. External artifact locations — **PASS**

- `D:\Models\whisper` (4 model files: tiny/base/small/medium) — **outside** `D:\TechVault` ✓
- `D:\Builds\whisper.cpp-p1c` (cloned source + build) — **outside** `D:\TechVault` ✓
- Path check confirms neither is inside the repository tree; models/builds are excluded from Git by the ignore rules above as a second layer.

## Summary

| Check | Verdict |
|---|---|
| 1. Secrets tracked/present in project files | **PASS** — none found (0 tracked files, 0 content hits, 0 secret-named files on disk) |
| 2. `.gitignore` protection of secrets/models/builds/caches | **PASS** — all required patterns present |
| 3. Models & Whisper build outside the repo | **PASS** — `D:\Models\whisper`, `D:\Builds\whisper.cpp-p1c` confirmed outside |

**Overall: PASS.** One standing caution (not a finding): `experiments/p1-c/results/logs/` contains run evidence that is gitignored by the experiment-level `.gitignore`; if the owner later wants those logs versioned as final evidence, review them individually before un-ignoring (they contain no secrets today, per the scan above).

---

**End of P1-BACKUP-SECURITY-CHECK.md**
