//! TechVault desktop core (Phase 2, M1 G1: application shell foundation).
//!
//! M0 scope: entry + Tauri builder, typed IPC envelope, minimal command
//! surface, secret-free rotating file logging.
//! G1 adds the typed settings family (`settings_get`/`settings_set`,
//! Appearance category) with atomic file persistence (`PHASE_2_M1_UI_SPECIFICATION.md`
//! §4, architecture §2.3). No database, no jobs, no ingestion — those arrive
//! in later gates as modules earn existence.

// Tests exercise error paths and fixtures; unwraps in test code are fine.
#![cfg_attr(test, allow(clippy::unwrap_used, clippy::expect_used))]

mod commands;
mod config;
mod domain;
mod infrastructure;
mod ipc;

use commands::app::{app_info, ping};
use commands::settings::{settings_get, settings_set};
use config::SettingsStore;
use infrastructure::logging;
use tauri::Manager;

/// Build and run the Tauri application (shared desktop/mobile entrypoint).
#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[allow(clippy::expect_used)] // startup is unrecoverable; the process must abort loudly
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            ping,
            app_info,
            settings_get,
            settings_set
        ])
        .setup(|app| {
            // Logging must never prevent startup: on failure the app keeps
            // running without a file sink and reports the condition to stderr.
            if let Err(err) = logging::init(app.handle()) {
                eprintln!("TechVault: file logging unavailable: {err}");
            }
            // Typed settings persistence (G1): rooted at the app-data
            // directory, next to the M0 log directory. If the directory is
            // unavailable the app still starts — settings operations will
            // surface typed storage errors instead.
            let data_dir = app.path().app_data_dir().ok();
            if let Some(dir) = data_dir.clone() {
                app.manage(SettingsStore::new(dir));
            } else {
                log::warn!("app data directory unavailable; settings persistence disabled");
            }
            log::info!(
                "startup: TechVault {} (tauri {} / {} profile)",
                env!("CARGO_PKG_VERSION"),
                tauri::VERSION,
                if cfg!(debug_assertions) {
                    "debug"
                } else {
                    "release"
                }
            );
            Ok(())
        })
        .run(tauri::generate_context!())
        // Standard Tauri entrypoint: there is no meaningful recovery if the
        // runtime cannot start; the process must abort loudly.
        .expect("error while running TechVault");
}
