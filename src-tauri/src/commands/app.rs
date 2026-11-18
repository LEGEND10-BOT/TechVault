//! M0 smoke-check commands: a typed request/response round-trip (`ping`) and
//! the application identity report (`app_info`).
//!
//! Logging rule (SEC-15): command invocations are logged by name and outcome
//! only — argument values, which may carry user content, are never logged.

use serde::{Deserialize, Serialize};

use crate::domain::errors::{AppError, ErrorCategory};
use crate::ipc::IpcEnvelope;

/// Maximum accepted length (in characters) of a `ping` message.
pub const PING_MAX_MESSAGE_LEN: usize = 1000;

/// Request payload for the `ping` round-trip check.
#[derive(Debug, Clone, Default, Deserialize, PartialEq)]
pub struct PingRequest {
    /// Optional text echoed back by the command. Bounded by
    /// [`PING_MAX_MESSAGE_LEN`]; longer input yields a typed validation error.
    #[serde(default)]
    pub message: Option<String>,
}

/// Response payload for the `ping` round-trip check.
/// `Deserialize` supports the envelope contract round-trip tests.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PingResponse {
    /// Always `"pong"`.
    pub message: String,
    /// Echoed input message, when one was supplied.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub echoed: Option<String>,
    /// Server-side receive time (Unix epoch milliseconds).
    pub server_time_unix_ms: u64,
}

/// Application identity reported by the `app_info` command.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct AppInfo {
    /// Product name.
    pub app_name: &'static str,
    /// Application version (Cargo package version).
    pub version: &'static str,
    /// Tauri runtime version.
    pub tauri_version: &'static str,
    /// Operating system family (compile target).
    pub os: &'static str,
    /// CPU architecture (compile target).
    pub arch: &'static str,
    /// Build profile: `"debug"` or `"release"`.
    pub build_profile: &'static str,
    /// Application data directory (displayed in the About/diagnostics
    /// section for locating settings and logs; `None` when the directory
    /// could not be resolved). This is the user's own local path — it is
    /// the user's data root, not a secret.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data_dir: Option<String>,
}

/// Validate a `ping` request. Kept pure for direct unit testing.
pub fn validate_ping(req: &PingRequest) -> Result<(), AppError> {
    if let Some(message) = &req.message
        && message.chars().count() > PING_MAX_MESSAGE_LEN
    {
        return Err(AppError::new(
            ErrorCategory::Validation,
            "validation.message_too_long",
            format!(
                "Message exceeds the maximum allowed length of {PING_MAX_MESSAGE_LEN} characters."
            ),
        ));
    }
    Ok(())
}

/// Typed request/response round-trip over the IPC envelope.
#[tauri::command]
pub fn ping(req: PingRequest) -> IpcEnvelope<PingResponse> {
    log::info!("command: ping (validating)");
    match validate_ping(&req) {
        Ok(()) => IpcEnvelope::success(PingResponse {
            message: "pong".to_string(),
            echoed: req.message,
            server_time_unix_ms: unix_time_ms(),
        }),
        Err(err) => {
            log::warn!("command: ping rejected (code={})", err.code);
            IpcEnvelope::failure(err)
        }
    }
}

/// Build the application identity (pure, for unit testing).
pub fn build_app_info(data_dir: Option<String>) -> AppInfo {
    AppInfo {
        app_name: "TechVault",
        version: env!("CARGO_PKG_VERSION"),
        tauri_version: tauri::VERSION,
        os: std::env::consts::OS,
        arch: std::env::consts::ARCH,
        build_profile: if cfg!(debug_assertions) {
            "debug"
        } else {
            "release"
        },
        data_dir,
    }
}

/// Static application identity for the About/diagnostics section.
#[tauri::command]
pub fn app_info(handle: tauri::AppHandle) -> IpcEnvelope<AppInfo> {
    log::info!("command: app_info");
    let data_dir = tauri::Manager::path(&handle)
        .app_data_dir()
        .ok()
        .map(|dir| dir.to_string_lossy().to_string());
    IpcEnvelope::success(build_app_info(data_dir))
}

/// Current Unix epoch time in milliseconds.
fn unix_time_ms() -> u64 {
    match std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) {
        Ok(d) => d.as_millis() as u64,
        Err(e) => e.duration().as_millis() as u64,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validate_ping_accepts_none_and_within_bounds() {
        assert!(validate_ping(&PingRequest::default()).is_ok());
        assert!(
            validate_ping(&PingRequest {
                message: Some("hello".to_string())
            })
            .is_ok()
        );
        assert!(
            validate_ping(&PingRequest {
                message: Some("x".repeat(PING_MAX_MESSAGE_LEN))
            })
            .is_ok()
        );
    }

    #[test]
    fn validate_ping_rejects_overlong_message_with_typed_error() {
        let err = validate_ping(&PingRequest {
            message: Some("x".repeat(PING_MAX_MESSAGE_LEN + 1)),
        })
        .expect_err("overlong message must be rejected");
        assert_eq!(err.category, ErrorCategory::Validation);
        assert_eq!(err.code, "validation.message_too_long");
        assert!(err.details.is_none());
    }

    #[test]
    fn ping_success_envelope_has_expected_shape() {
        let envelope = ping(PingRequest {
            message: Some("hello".to_string()),
        });
        let IpcEnvelope::Success { data } = envelope else {
            panic!("ping must succeed for a valid request");
        };
        assert_eq!(data.message, "pong");
        assert_eq!(data.echoed.as_deref(), Some("hello"));
        assert!(data.server_time_unix_ms > 0);
    }

    #[test]
    fn ping_failure_envelope_carries_typed_validation_error() {
        let envelope = ping(PingRequest {
            message: Some("x".repeat(PING_MAX_MESSAGE_LEN + 1)),
        });
        let IpcEnvelope::Failure { error } = envelope else {
            panic!("ping must fail for an overlong message");
        };
        assert_eq!(error.category, ErrorCategory::Validation);
    }

    #[test]
    fn app_info_reports_the_application_identity() {
        let info = build_app_info(Some("C:\\app\\data".to_string()));
        assert_eq!(info.app_name, "TechVault");
        assert_eq!(info.version, env!("CARGO_PKG_VERSION"));
        assert!(!info.tauri_version.is_empty());
        assert!(!info.os.is_empty());
        assert!(!info.arch.is_empty());
        assert!(info.build_profile == "debug" || info.build_profile == "release");
        assert_eq!(info.data_dir.as_deref(), Some("C:\\app\\data"));
        // A missing data directory serializes the field away (About section
        // renders the absence honestly instead of a fake path).
        let no_dir = build_app_info(None);
        let value = serde_json::to_value(&no_dir).unwrap();
        assert!(value.get("data_dir").is_none());
    }
}
