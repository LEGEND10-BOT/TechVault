//! Rotating, size-capped, secret-free file logging (SEC-15 /
//! `PHASE_2_ARCHITECTURE.md` §2.5).
//!
//! Rules, enforced by construction and by review:
//! - File sink lives under `<app-data>/logs/techvault.log`.
//! - Size-capped with rotation: when the active file exceeds
//!   [`MAX_LOG_BYTES`], it is rotated to `.1` (and `.1` → `.2`), keeping at
//!   most [`KEEP_ROTATIONS`] rotated files.
//! - Secret-free: M0 logs only startup and command name/outcome lines. User
//!   content (transcript text, notes, fetched page text), API keys, tokens,
//!   and unnecessary sensitive paths must never be passed to the logger.
//!   There is no telemetry.
//! - Logging failures never propagate: a failing sink degrades to no output
//!   rather than disrupting the application.

use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

use log::{LevelFilter, Log, Metadata, Record};
use tauri::Manager;

/// Maximum size of the active log file before rotation (1 MiB).
pub const MAX_LOG_BYTES: u64 = 1024 * 1024;
/// Number of rotated files retained (`techvault.log.1`, `.2`, ...).
pub const KEEP_ROTATIONS: usize = 2;

/// Install the rotating file logger under the application data directory.
///
/// Returns the resolved log directory on success. Never fails the caller's
/// startup: the error is informational and the app continues without a sink.
pub fn init(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app data dir unavailable: {e}"))?
        .join("logs");
    std::fs::create_dir_all(&dir).map_err(|e| format!("cannot create log dir: {e}"))?;

    let logger = RotatingFileLogger::new(dir.join("techvault.log"));
    log::set_boxed_logger(Box::new(logger)).map_err(|e| format!("logger install failed: {e}"))?;
    log::set_max_level(LevelFilter::Info);
    Ok(dir)
}

struct RotatingFileLogger {
    state: Mutex<SinkState>,
}

struct SinkState {
    path: PathBuf,
    file: Option<File>,
    written: u64,
}

impl RotatingFileLogger {
    fn new(path: PathBuf) -> Self {
        Self {
            state: Mutex::new(SinkState {
                path,
                file: None,
                written: 0,
            }),
        }
    }

    fn open(state: &mut SinkState) {
        if let Ok(file) = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&state.path)
        {
            state.written = file.metadata().map(|m| m.len()).unwrap_or(0);
            state.file = Some(file);
        }
    }

    fn rotate_if_needed(state: &mut SinkState, incoming: u64) {
        if state.written.saturating_add(incoming) <= MAX_LOG_BYTES && state.file.is_some() {
            return;
        }
        state.file = None;
        // Shift existing rotations: .{n-1} -> .{n}, ..., current -> .1
        for i in (1..KEEP_ROTATIONS).rev() {
            let from = rotated_path(&state.path, i);
            let to = rotated_path(&state.path, i + 1);
            if from.exists() {
                let _ = std::fs::rename(&from, &to);
            }
        }
        if state.path.exists() {
            let _ = std::fs::rename(&state.path, rotated_path(&state.path, 1));
        }
        Self::open(state);
    }
}

fn rotated_path(base: &std::path::Path, n: usize) -> PathBuf {
    let mut name = base
        .file_name()
        .map(|s| s.to_os_string())
        .unwrap_or_default();
    name.push(format!(".{n}"));
    base.with_file_name(name)
}

impl Log for RotatingFileLogger {
    fn enabled(&self, metadata: &Metadata<'_>) -> bool {
        metadata.level() <= log::max_level()
    }

    fn log(&self, record: &Record<'_>) {
        if !self.enabled(record.metadata()) {
            return;
        }
        let line = format!(
            "{} [{}] {}: {}\n",
            format_timestamp(unix_time_ms()),
            record.level(),
            record.target(),
            record.args()
        );
        let Ok(mut state) = self.state.lock() else {
            return;
        };
        if state.file.is_none() {
            Self::open(&mut state);
        }
        Self::rotate_if_needed(&mut state, line.len() as u64);
        if let Some(file) = state.file.as_mut() {
            let _ = file.write_all(line.as_bytes());
            let _ = file.flush();
            state.written += line.len() as u64;
        }
    }

    fn flush(&self) {
        if let Ok(mut state) = self.state.lock()
            && let Some(file) = state.file.as_mut()
        {
            let _ = file.flush();
        }
    }
}

fn unix_time_ms() -> u64 {
    match std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) {
        Ok(d) => d.as_millis() as u64,
        Err(e) => e.duration().as_millis() as u64,
    }
}

/// Format Unix epoch milliseconds as a UTC RFC 3339 timestamp
/// (e.g. `2026-11-14T00:00:00.000Z`). Dependency-free civil-date conversion
/// (Howard Hinnant's `civil_from_days` algorithm).
fn format_timestamp(unix_ms: u64) -> String {
    let secs = (unix_ms / 1000) as i64;
    let millis = (unix_ms % 1000) as u32;
    let days = secs.div_euclid(86_400);
    let secs_of_day = secs.rem_euclid(86_400);

    // Civil-from-days (valid for the full `i64` range of practical dates).
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097); // [0, 146096]
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365; // [0, 399]
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100); // [0, 365]
    let mp = (5 * doy + 2) / 153; // [0, 11]
    let d = doy - (153 * mp + 2) / 5 + 1; // [1, 31]
    let m = if mp < 10 { mp + 3 } else { mp - 9 }; // [1, 12]
    let y = if m <= 2 { y + 1 } else { y };

    let (hh, mm, ss) = (
        secs_of_day / 3600,
        (secs_of_day % 3600) / 60,
        secs_of_day % 60,
    );
    format!("{y:04}-{m:02}-{d:02}T{hh:02}:{mm:02}:{ss:02}.{millis:03}Z")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn timestamp_formats_known_epochs() {
        assert_eq!(format_timestamp(0), "1970-01-01T00:00:00.000Z");
        // 2026-11-14T00:00:00Z
        assert_eq!(
            format_timestamp(1_794_614_400_000),
            "2026-11-14T00:00:00.000Z"
        );
        // Leap day: 2024-02-29T12:34:56.789Z
        assert_eq!(
            format_timestamp(1_709_210_096_789),
            "2024-02-29T12:34:56.789Z"
        );
    }

    #[test]
    fn rotated_paths_are_numbered() {
        let base = PathBuf::from("/tmp/logs/techvault.log");
        assert_eq!(
            rotated_path(&base, 1),
            PathBuf::from("/tmp/logs/techvault.log.1")
        );
        assert_eq!(
            rotated_path(&base, 2),
            PathBuf::from("/tmp/logs/techvault.log.2")
        );
    }

    #[test]
    fn logger_writes_and_rotates_under_the_size_cap() {
        let dir = std::env::temp_dir().join(format!("techvault-log-test-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let path = dir.join("techvault.log");
        let logger = RotatingFileLogger::new(path.clone());
        // The sink honours the global level filter; the test binary starts at
        // `Off`, so raise it for this test.
        log::set_max_level(log::LevelFilter::Info);
        // Write enough lines to force at least one rotation of the 1 MiB cap.
        let big = "x".repeat(64 * 1024);
        for _ in 0..20 {
            log::Log::log(
                &logger,
                &Record::builder()
                    .args(format_args!("{big}"))
                    .level(log::Level::Info)
                    .target("test")
                    .build(),
            );
        }
        let active = std::fs::metadata(&path).unwrap().len();
        assert!(
            active <= MAX_LOG_BYTES,
            "active file must stay under the cap"
        );
        assert!(
            path.with_file_name("techvault.log.1").exists(),
            "rotation must have produced .1"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }
}
