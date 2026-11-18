//! Typed settings persistence (G1).
//!
//! Scope rules:
//! - Settings carry UI preferences only — no secrets, no credentials
//!   (config/ module contract, `PHASE_2_M1_ARCHITECTURE.md` §2.1).
//! - Writes are atomic: the payload is written to a temporary file, synced,
//!   and renamed over the target so a crash can never leave a half-written
//!   settings file.
//! - A missing file means defaults; an unreadable/unparseable file falls
//!   back to defaults rather than failing the app (a preference file must
//!   never block startup) — the condition is logged without file contents.
//! - Error messages are sanitized: they never include full paths or file
//!   contents (SEC-15).

use std::fs;
use std::io::Write;
use std::path::PathBuf;

use crate::domain::errors::{AppError, ErrorCategory};
use crate::domain::settings::AppSettings;

/// File name of the settings document inside the app-data directory.
pub const SETTINGS_FILE_NAME: &str = "settings.json";

/// Temporary file name used for atomic settings replacement.
const SETTINGS_TMP_NAME: &str = "settings.json.tmp";

/// Owns the settings file inside a configured app-data directory.
pub struct SettingsStore {
    dir: PathBuf,
}

impl SettingsStore {
    /// Create a store rooted at `dir` (the Tauri app-data directory).
    pub fn new(dir: PathBuf) -> Self {
        Self { dir }
    }

    /// Full path of the settings document.
    pub fn settings_path(&self) -> PathBuf {
        self.dir.join(SETTINGS_FILE_NAME)
    }

    /// Load the settings snapshot. A missing or unreadable file yields
    /// defaults (logged, never fatal). A parse failure is treated the same
    /// way so a corrupted file can never crash the app.
    pub fn load(&self) -> Result<AppSettings, AppError> {
        let path = self.settings_path();
        if !path.exists() {
            return Ok(AppSettings::default());
        }
        let text = match fs::read_to_string(&path) {
            Ok(text) => text,
            Err(err) => {
                log::warn!(
                    "settings file could not be read (kind={}); using defaults",
                    io_error_kind(&err)
                );
                return Ok(AppSettings::default());
            }
        };
        match serde_json::from_str::<AppSettings>(&text) {
            Ok(mut settings) => {
                // Defensive: clamp persisted zoom into the approved bounds so
                // a hand-edited file can never produce an unusable interface.
                settings.appearance.normalize();
                Ok(settings)
            }
            Err(_) => {
                // No file content or parse details in the log (SEC-15).
                log::warn!(
                    "settings file did not parse as a valid settings document; using defaults"
                );
                Ok(AppSettings::default())
            }
        }
    }

    /// Atomically persist the settings snapshot (write → sync → rename).
    pub fn save(&self, settings: &AppSettings) -> Result<(), AppError> {
        let mut settings = *settings;
        settings.appearance.normalize();
        fs::create_dir_all(&self.dir).map_err(|err| write_failed("create directory", &err))?;
        let json = serde_json::to_string_pretty(&settings).map_err(|_err| {
            log::warn!("settings write failed during serialize; using sanitized error");
            AppError::new(
                ErrorCategory::Internal,
                "internal.settings_serialize_failed",
                "The settings document could not be serialized.",
            )
        })?;

        let tmp_path = self.dir.join(SETTINGS_TMP_NAME);
        {
            let mut file =
                fs::File::create(&tmp_path).map_err(|err| write_failed("write", &err))?;
            file.write_all(json.as_bytes())
                .map_err(|err| write_failed("write", &err))?;
            file.sync_all().map_err(|err| write_failed("sync", &err))?;
        }
        fs::rename(&tmp_path, self.settings_path())
            .map_err(|err| write_failed("replace settings file", &err))?;
        Ok(())
    }
}

fn write_failed(op: &str, err: &std::io::Error) -> AppError {
    // Sanitized: operation kind + OS error kind only — no paths, no contents.
    log::warn!(
        "settings write failed during {op} (kind={})",
        io_error_kind(err)
    );
    AppError::new(
        ErrorCategory::Storage,
        "storage.settings_write_failed",
        "The settings file could not be written. Check that the application data directory is writable.",
    )
}

fn io_error_kind(err: &std::io::Error) -> &'static str {
    match err.kind() {
        std::io::ErrorKind::NotFound => "not_found",
        std::io::ErrorKind::PermissionDenied => "permission_denied",
        std::io::ErrorKind::InvalidData => "invalid_data",
        _ => "other",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::settings::{AppearanceSettings, ThemePreference};
    use std::sync::atomic::{AtomicU32, Ordering};

    static DIR_COUNTER: AtomicU32 = AtomicU32::new(0);

    /// Unique scratch directory per test (no external test dependency needed).
    fn scratch_dir(tag: &str) -> PathBuf {
        let n = DIR_COUNTER.fetch_add(1, Ordering::SeqCst);
        let dir = std::env::temp_dir().join(format!(
            "techvault-settings-test-{}-{}-{}",
            std::process::id(),
            tag,
            n
        ));
        let _ = fs::remove_dir_all(&dir);
        dir
    }

    #[test]
    fn load_without_a_file_returns_defaults() {
        let store = SettingsStore::new(scratch_dir("missing"));
        let settings = store.load().unwrap();
        assert_eq!(settings, AppSettings::default());
    }

    #[test]
    fn save_then_load_round_trips() {
        let dir = scratch_dir("roundtrip");
        let store = SettingsStore::new(dir.clone());
        let settings = AppSettings {
            appearance: AppearanceSettings {
                theme: ThemePreference::Dark,
                zoom: 1.0,
            },
        };
        store.save(&settings).unwrap();
        assert!(store.settings_path().exists());
        assert!(!dir.join(SETTINGS_TMP_NAME).exists(), "no temp leftover");
        assert_eq!(store.load().unwrap(), settings);
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn save_replaces_an_existing_file_atomically() {
        let dir = scratch_dir("replace");
        let store = SettingsStore::new(dir.clone());
        store
            .save(&AppSettings {
                appearance: AppearanceSettings {
                    theme: ThemePreference::Dark,
                    zoom: 1.0,
                },
            })
            .unwrap();
        store
            .save(&AppSettings {
                appearance: AppearanceSettings {
                    theme: ThemePreference::Light,
                    zoom: 1.0,
                },
            })
            .unwrap();
        assert_eq!(
            store.load().unwrap().appearance.theme,
            ThemePreference::Light
        );
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn corrupted_settings_file_falls_back_to_defaults() {
        let dir = scratch_dir("corrupt");
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join(SETTINGS_FILE_NAME), "{ not json !!!").unwrap();
        let store = SettingsStore::new(dir.clone());
        assert_eq!(store.load().unwrap(), AppSettings::default());
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn save_creates_missing_directories() {
        let dir = scratch_dir("nested").join("a").join("b");
        let store = SettingsStore::new(dir.clone());
        store
            .save(&AppSettings {
                appearance: AppearanceSettings {
                    theme: ThemePreference::System,
                    zoom: 1.0,
                },
            })
            .unwrap();
        assert!(store.settings_path().exists());
        // Clean the unique scratch root (dir = <scratch>\a\b; parent.parent
        // is the unique scratch directory created above).
        let scratch_root = dir.parent().and_then(|p| p.parent());
        if let Some(root) = scratch_root {
            let _ = fs::remove_dir_all(root);
        }
    }

    #[test]
    fn out_of_range_zoom_is_clamped_on_load_and_save() {
        use crate::domain::settings::{AppearanceSettings, MAX_ZOOM, ThemePreference};

        let dir = scratch_dir("zoom-clamp");
        let store = SettingsStore::new(dir.clone());
        // Save with an out-of-range zoom: the persisted file must be clamped.
        store
            .save(&AppSettings {
                appearance: AppearanceSettings {
                    theme: ThemePreference::Dark,
                    zoom: 42.0,
                },
            })
            .unwrap();
        let raw = fs::read_to_string(dir.join(SETTINGS_FILE_NAME)).unwrap();
        assert!(
            raw.contains("2.0"),
            "saved zoom must be clamped to MAX_ZOOM"
        );
        // Loading a hand-edited out-of-range file clamps in memory too.
        fs::write(
            dir.join(SETTINGS_FILE_NAME),
            "{ \"appearance\": { \"theme\": \"dark\", \"zoom\": 0.05 } }",
        )
        .unwrap();
        let loaded = store.load().unwrap();
        assert_eq!(loaded.appearance.zoom, 0.5);
        assert!(loaded.appearance.zoom >= crate::domain::settings::MIN_ZOOM);
        assert!(loaded.appearance.zoom <= MAX_ZOOM);
        let _ = fs::remove_dir_all(&dir);
    }
}
