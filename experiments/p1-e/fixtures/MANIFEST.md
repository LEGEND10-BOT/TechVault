# P1-E fixture manifest (media files are gitignored — reproduce via sources below)

| File | Size | Container/Codec | Source | License | sha256 |
|---|---|---|---|---|---|
| flower.mp4 | 1,128,375 B | ISO Media MP4 v2 (H.264+AAC per canPlayType probe) | https://mdn.github.io/shared-assets/videos/flower.mp4 | CC0 (MDN shared-assets) | computed at download time; verify with `certutil -hashfile flower.mp4 SHA256` when re-fetching |
| flower.webm | 554,058 B | WebM (VP8+Vorbis family) | https://mdn.github.io/shared-assets/videos/flower.webm | CC0 (MDN shared-assets) | verify as above |
| broken.mp4 | 60 B | synthetic text bytes (controlled decode-failure fixture) | authored for this dataset | project-authored | n/a |

Governance: public CC0 material per TESTING_STRATEGY §4.2; media not retained in Git (AGENTS.md §7 "avoid storing unnecessary media"); re-fetch from the URLs above to reproduce.
