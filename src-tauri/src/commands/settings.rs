//! Settings IPC family (G1: Appearance; sections extend incrementally at
//! later gates per `PHASE_2_M1_UI_SPECIFICATION.md` §4 / architecture §2.3).
//!
//! `settings_set` accepts an untyped JSON payload and validates it into the
//! typed structure itself, so malformed input maps onto the typed
//! `validation.*` envelope instead of a transport-level Tauri error.
//! Logging rule (SEC-15): command names and outcomes only — payloads may
//! carry preferences but are never logged.

use serde_json::Value;
use tauri::State;

use crate::config::SettingsStore;
use crate::domain::errors::{AppError, ErrorCategory};
use crate::domain::settings::AppSettings;
use crate::ipc::IpcEnvelope;

/// Validate + parse an untyped settings payload (pure, for unit testing).
pub fn parse_settings_payload(payload: &Value) -> Result<AppSettings, AppError> {
    serde_json::from_value::<AppSettings>(payload.clone()).map_err(|_| {
        AppError::new(
            ErrorCategory::Validation,
            "validation.settings_invalid",
            "The settings payload is not a valid settings document (unknown or mis-typed fields).",
        )
    })
}

/// Core of `settings_get` (separated from `State` so it is unit-testable).
pub fn settings_get_impl(store: &SettingsStore) -> IpcEnvelope<AppSettings> {
    match store.load() {
        Ok(settings) => IpcEnvelope::success(settings),
        Err(err) => {
            log::warn!("command: settings_get failed (code={})", err.code);
            IpcEnvelope::failure(err)
        }
    }
}

/// Core of `settings_set` (separated from `State` so it is unit-testable).
pub fn settings_set_impl(store: &SettingsStore, payload: &Value) -> IpcEnvelope<AppSettings> {
    let settings = match parse_settings_payload(payload) {
        Ok(settings) => settings,
        Err(err) => {
            log::warn!("command: settings_set rejected (code={})", err.code);
            return IpcEnvelope::failure(err);
        }
    };
    match store.save(&settings) {
        Ok(()) => IpcEnvelope::success(settings),
        Err(err) => {
            log::warn!("command: settings_set failed (code={})", err.code);
            IpcEnvelope::failure(err)
        }
    }
}

/// Read the typed settings snapshot.
#[tauri::command]
pub fn settings_get(store: State<SettingsStore>) -> IpcEnvelope<AppSettings> {
    log::info!("command: settings_get");
    settings_get_impl(&store)
}

/// Validate + atomically persist the settings snapshot.
#[tauri::command]
pub fn settings_set(store: State<SettingsStore>, settings: Value) -> IpcEnvelope<AppSettings> {
    log::info!("command: settings_set (validating)");
    settings_set_impl(&store, &settings)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::settings::ThemePreference;
    use std::fs;
    use std::path::PathBuf;
    use std::sync::atomic::{AtomicU32, Ordering};

    static DIR_COUNTER: AtomicU32 = AtomicU32::new(0);

    fn scratch_store(tag: &str) -> (SettingsStore, PathBuf) {
        let n = DIR_COUNTER.fetch_add(1, Ordering::SeqCst);
        let dir = std::env::temp_dir().join(format!(
            "techvault-settings-cmd-test-{}-{}-{}",
            std::process::id(),
            tag,
            n
        ));
        let _ = fs::remove_dir_all(&dir);
        (SettingsStore::new(dir.clone()), dir)
    }

    #[test]
    fn parse_accepts_a_valid_settings_payload() {
        let payload = serde_json::json!({ "appearance": { "theme": "dark" } });
        let parsed = parse_settings_payload(&payload).unwrap();
        assert_eq!(parsed.appearance.theme, ThemePreference::Dark);
    }

    #[test]
    fn parse_rejects_invalid_payloads_with_typed_validation_error() {
        let cases = vec![
            serde_json::json!({ "appearance": { "theme": "midnight" } }),
            serde_json::json!({ "appearance": "dark" }),
            serde_json::json!("dark"),
            serde_json::json!(null),
        ];
        for case in cases {
            let err = parse_settings_payload(&case).expect_err("invalid payload must fail");
            assert_eq!(err.category, ErrorCategory::Validation);
            assert_eq!(err.code, "validation.settings_invalid");
        }
    }

    #[test]
    fn settings_get_returns_defaults_when_no_file_exists() {
        let (store, dir) = scratch_store("get-defaults");
        let envelope = settings_get_impl(&store);
        let IpcEnvelope::Success { data } = envelope else {
            panic!("settings_get must succeed with defaults");
        };
        assert_eq!(data, AppSettings::default());
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn settings_set_persists_and_returns_the_snapshot() {
        let (store, dir) = scratch_store("set-roundtrip");
        let payload = serde_json::json!({ "appearance": { "theme": "light" } });
        let envelope = settings_set_impl(&store, &payload);
        let IpcEnvelope::Success { data } = envelope else {
            panic!("settings_set must succeed for a valid payload");
        };
        assert_eq!(data.appearance.theme, ThemePreference::Light);
        // Persisted — a fresh load sees the saved value.
        assert_eq!(store.load().unwrap(), data);
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn settings_set_rejects_invalid_payload_without_writing() {
        let (store, dir) = scratch_store("set-invalid");
        let envelope = settings_set_impl(
            &store,
            &serde_json::json!({ "appearance": { "theme": 42 } }),
        );
        let IpcEnvelope::Failure { error } = envelope else {
            panic!("settings_set must reject an invalid payload");
        };
        assert_eq!(error.category, ErrorCategory::Validation);
        assert!(!store.settings_path().exists(), "nothing may be written");
        let _ = fs::remove_dir_all(&dir);
    }
}
