//! Typed error taxonomy shared by every Tauri command
//! (`PHASE_2_ARCHITECTURE.md` §2.4).
//!
//! - Categories are a stable, closed set; they are part of the wire contract
//!   and are mirrored by `src/lib/types/ipc.ts` (`ErrorCategory`).
//! - Error codes are stable strings of the form `<category>.<snake_case>`.
//! - `message` carries a sanitized human-readable explanation only:
//!   internals, secrets, and raw external content never cross the boundary
//!   (SECURITY §20). `details` is optional structured data; it is omitted
//!   from the envelope when absent.

use serde::{Deserialize, Serialize};

/// Closed set of error categories on the IPC wire contract.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCategory {
    Validation,
    Network,
    AuthenticationRequired,
    PlatformRestriction,
    MediaDecode,
    Transcription,
    /// Provider errors — unused in Phase 2 (no provider adapters exist).
    Provider,
    Database,
    Storage,
    Verification,
    Internal,
}

impl ErrorCategory {
    /// Stable wire string for this category.
    pub fn as_str(self) -> &'static str {
        match self {
            ErrorCategory::Validation => "validation",
            ErrorCategory::Network => "network",
            ErrorCategory::AuthenticationRequired => "authentication_required",
            ErrorCategory::PlatformRestriction => "platform_restriction",
            ErrorCategory::MediaDecode => "media_decode",
            ErrorCategory::Transcription => "transcription",
            ErrorCategory::Provider => "provider",
            ErrorCategory::Database => "database",
            ErrorCategory::Storage => "storage",
            ErrorCategory::Verification => "verification",
            ErrorCategory::Internal => "internal",
        }
    }
}

/// A typed application error. Serialized as part of the IPC envelope.
/// `Deserialize` exists so envelope fixtures round-trip through the
/// contract tests (the command layer itself only constructs errors).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AppError {
    /// Stable machine-readable code: `<category>.<snake_case>`.
    pub code: String,
    /// Closed error category.
    pub category: ErrorCategory,
    /// Sanitized human-readable message (never includes secrets or raw user content).
    pub message: String,
    /// Optional structured context; omitted from serialization when `None`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
}

impl AppError {
    /// Create a typed error with a sanitized message.
    pub fn new(
        category: ErrorCategory,
        code: impl Into<String>,
        message: impl Into<String>,
    ) -> Self {
        Self {
            code: code.into(),
            category,
            message: message.into(),
            details: None,
        }
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "[{}] {}: {}",
            self.category.as_str(),
            self.code,
            self.message
        )
    }
}

impl std::error::Error for AppError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn categories_serialize_to_the_stable_wire_strings() {
        assert_eq!(
            serde_json::to_value(ErrorCategory::Validation).unwrap(),
            serde_json::json!("validation")
        );
        assert_eq!(
            serde_json::to_value(ErrorCategory::AuthenticationRequired).unwrap(),
            serde_json::json!("authentication_required")
        );
        assert_eq!(
            serde_json::to_value(ErrorCategory::MediaDecode).unwrap(),
            serde_json::json!("media_decode")
        );
    }

    #[test]
    fn error_serializes_without_details_when_absent() {
        let err = AppError::new(
            ErrorCategory::Validation,
            "validation.message_too_long",
            "Message exceeds the maximum allowed length of 1000 characters.",
        );
        let value = serde_json::to_value(&err).unwrap();
        assert_eq!(
            value,
            serde_json::json!({
                "code": "validation.message_too_long",
                "category": "validation",
                "message": "Message exceeds the maximum allowed length of 1000 characters."
            })
        );
        assert!(value.get("details").is_none());
    }

    #[test]
    fn error_serializes_details_when_present() {
        let err = AppError {
            code: "internal.unexpected".to_string(),
            category: ErrorCategory::Internal,
            message: "boom".to_string(),
            details: Some(serde_json::json!({ "op": "ping" })),
        };
        let value = serde_json::to_value(&err).unwrap();
        assert_eq!(
            value.get("details"),
            Some(&serde_json::json!({ "op": "ping" }))
        );
    }

    #[test]
    fn display_is_category_code_message() {
        let err = AppError::new(ErrorCategory::Storage, "storage.unwritable", "cannot write");
        assert_eq!(
            err.to_string(),
            "[storage] storage.unwritable: cannot write"
        );
    }
}
