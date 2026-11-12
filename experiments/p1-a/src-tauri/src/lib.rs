// TechVault P1-A PoC (F1-01a) — throwaway validation shell, no product features.
// Commands: sysinfo (IPC + Rust->JS event), ping (latency harness),
// save_test_results (evidence sink, fixed app-local path only).

use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{Emitter, Manager};

#[derive(Serialize, Clone)]
struct SysInfo {
    os: String,
    arch: String,
    family: String,
    app_version: String,
    timestamp_ms: u128,
}

// F1-01a step 2: returns platform info and emits an event so the frontend
// can validate the Rust -> JS direction as well.
#[tauri::command]
fn sysinfo(app: tauri::AppHandle) -> SysInfo {
    let info = SysInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        family: std::env::consts::FAMILY.to_string(),
        app_version: app.package_info().version.to_string(),
        timestamp_ms: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis(),
    };
    let _ = app.emit("sysinfo-event", &info);
    info
}

// F1-01a step 2: minimal fixed payload for the IPC round-trip latency test.
#[tauri::command]
fn ping() -> &'static str {
    "pong"
}

// Evidence sink for the automated frontend test suite. Writes ONLY to
// <app-local-data-dir>/test-results.json — a fixed, app-owned path. PoC only;
// production code must go through the approved storage design instead.
#[tauri::command]
fn save_test_results(app: tauri::AppHandle, payload: String) -> Result<String, String> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("resolve app data dir failed: {e}"))?;
    std::fs::create_dir_all(&dir).map_err(|e| format!("create dir failed: {e}"))?;
    let path = dir.join("test-results.json");
    std::fs::write(&path, payload).map_err(|e| format!("write failed: {e}"))?;
    Ok(path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![sysinfo, ping, save_test_results])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
