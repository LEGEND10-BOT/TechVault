# Golden Dataset v0 — Provenance and Governance

**Dataset:** techvault-extraction-golden
**Version:** 0.1.0 (2026-11-13)
**Governance:** per `docs/TESTING_STRATEGY.md` §4.2 — version recorded, expected results kept separate from extraction code, changes logged here, difficult cases included.

## Provenance

- **All case inputs (transcript text, description blocks) are synthetic**, authored specifically for TechVault testing by the implementing agent during the 2026-11-13 Phase 1 sprint. No third-party video, transcript, or article text was copied. No owner media corpus was used (none authorized — see `docs/PHASE_1_STATUS_MATRIX.md` Gate 0).
- Real products named in the fixtures (Git, Docker, Grafana, etc.) are referenced factually as test data; fixture text does not copy any real person's speech or writing.
- URLs in expected results are the well-known official sites of the named real products; `example.org` / `injected.example` URLs are reserved-documentation domains used for fictional resources.
- License position: synthetic, project-authored test data — no external license obligations. Suitable for commit and regression reuse (R-013).

## Case coverage (acceptance criterion A1)

14 cases covering **all 12 categories** of `docs/TESTING_STRATEGY.md` §4 plus the two additional F1-06 §5 case types:

| Case | Category | TS §4 ref |
|---|---|---|
| C01 | clearly spoken names | 4.1 |
| C02 | URLs on screen / description | 4.2 (+4.3) |
| C03 | multiple resources in one sentence | 4.4 |
| C04 | similar-sounding names | 4.5 |
| C05 | obsolete / renamed products | 4.6 |
| C06 | incorrectly pronounced names | 4.7 |
| C07 | under-specified mentions | 4.8 |
| C08 | unrelated technical terminology | 4.9 |
| C09 | zero-resource source | 4.10 |
| C10 | misleading / fictional resources | 4.11 |
| C11 | same resource across two sources | 4.12 |
| C12 | prompt-injection tripwire | F1-06 §5 |
| C13 | multiple-resource density | F1-06 §5 |
| C14 | description-only mention | 4.3 |

## Change log (dataset governance)

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-13 | Initial dataset: 14 cases + expected results; all synthetic provenance |

## Known limitations

- No real transcripts yet: realism vs. actual Whisper output (disfluencies, ASR misspellings) is untested until owner-authorized media or F1-03a transcripts become available (F1-06 §3 optional synergy; P1-C currently held by owner).
- Expected results are agent-authored; owner review sign-off is pending (tracked in `docs/phase1-results/F1-06/RESULTS.md`).
- C14's camera-hardware judgment ("Sony ZV-E10" = not a library resource) is a documented category judgment the owner may revisit.
