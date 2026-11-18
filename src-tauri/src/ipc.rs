//! Typed IPC envelope (`PHASE_2_ARCHITECTURE.md` §2.4).
//!
//! Every command returns an envelope serialized as exactly one of:
//!   `{ "ok": true,  "data": ... }`
//!   `{ "ok": false, "error": { "code", "category", "message", "details"? } }`
//!
//! The wire shape is mirrored by `src/lib/types/ipc.ts` and pinned by the
//! canonical fixtures in `tests/fixtures/` — asserted in both directions by
//! the contract tests (Rust tests below + `tests/frontend/ipc-contract.test.ts`).

use serde::{Deserialize, Deserializer, Serialize, Serializer};

use crate::domain::errors::AppError;

/// Envelope returned by every Tauri command in the application.
#[derive(Debug, Clone, PartialEq)]
pub enum IpcEnvelope<T> {
    /// Successful outcome carrying the command result.
    Success {
        /// The command result payload.
        data: T,
    },
    /// Failed outcome carrying a typed application error.
    Failure {
        /// The typed application error.
        error: AppError,
    },
}

impl<T> IpcEnvelope<T> {
    /// Wrap a successful result.
    pub fn success(data: T) -> Self {
        Self::Success { data }
    }

    /// Wrap a typed failure.
    pub fn failure(error: AppError) -> Self {
        Self::Failure { error }
    }
}

impl<T: Serialize> Serialize for IpcEnvelope<T> {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeMap;
        match self {
            IpcEnvelope::Success { data } => {
                let mut map = serializer.serialize_map(Some(2))?;
                map.serialize_entry("ok", &true)?;
                map.serialize_entry("data", data)?;
                map.end()
            }
            IpcEnvelope::Failure { error } => {
                let mut map = serializer.serialize_map(Some(2))?;
                map.serialize_entry("ok", &false)?;
                map.serialize_entry("error", error)?;
                map.end()
            }
        }
    }
}

impl<'de, T: Deserialize<'de>> Deserialize<'de> for IpcEnvelope<T> {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        #[derive(Deserialize)]
        // Explicit bound: serde would otherwise infer a `T: Default` bound for
        // the defaulted `Option<T>` field, which is unnecessary.
        #[serde(bound(deserialize = "T: Deserialize<'de>"))]
        struct Raw<T> {
            ok: bool,
            #[serde(default)]
            data: Option<T>,
            error: Option<AppError>,
        }

        let raw = Raw::<T>::deserialize(deserializer)?;
        match (raw.ok, raw.data, raw.error) {
            (true, Some(data), _) => Ok(IpcEnvelope::Success { data }),
            (false, _, Some(error)) => Ok(IpcEnvelope::Failure { error }),
            (true, None, _) => Err(serde::de::Error::missing_field("data")),
            (false, _, None) => Err(serde::de::Error::missing_field("error")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::commands::app::{PingRequest, PingResponse};
    use crate::domain::errors::ErrorCategory;

    fn fixture(name: &str) -> serde_json::Value {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../tests/fixtures")
            .join(name);
        let text = std::fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("fixture {name} must exist: {e}"));
        serde_json::from_str(&text).unwrap_or_else(|e| panic!("fixture {name} must parse: {e}"))
    }

    fn sample_success() -> IpcEnvelope<PingResponse> {
        IpcEnvelope::Success {
            data: PingResponse {
                message: "pong".to_string(),
                echoed: Some("hello".to_string()),
                server_time_unix_ms: 1_763_078_400_000,
            },
        }
    }

    fn sample_failure() -> IpcEnvelope<PingResponse> {
        IpcEnvelope::Failure {
            error: AppError::new(
                ErrorCategory::Validation,
                "validation.message_too_long",
                "Message exceeds the maximum allowed length of 1000 characters.",
            ),
        }
    }

    #[test]
    fn success_serializes_to_the_canonical_fixture() {
        let wire = serde_json::to_value(sample_success()).unwrap();
        assert_eq!(wire, fixture("ipc-envelope-success.json"));
    }

    #[test]
    fn failure_serializes_to_the_canonical_fixture() {
        let wire = serde_json::to_value(sample_failure()).unwrap();
        assert_eq!(wire, fixture("ipc-envelope-error.json"));
    }

    #[test]
    fn success_fixture_deserializes_back_to_the_sample() {
        let parsed: IpcEnvelope<PingResponse> =
            serde_json::from_value(fixture("ipc-envelope-success.json")).unwrap();
        assert_eq!(parsed, sample_success());
    }

    #[test]
    fn failure_fixture_deserializes_back_to_the_sample() {
        let parsed: IpcEnvelope<PingResponse> =
            serde_json::from_value(fixture("ipc-envelope-error.json")).unwrap();
        assert_eq!(parsed, sample_failure());
    }

    #[test]
    fn malformed_envelopes_are_rejected_on_deserialization() {
        let cases = vec![
            serde_json::json!({ "ok": true }),
            serde_json::json!({ "ok": false }),
            serde_json::json!({ "ok": "yes", "data": {} }),
            serde_json::json!({}),
        ];
        for case in cases {
            let parsed = serde_json::from_value::<IpcEnvelope<PingRequest>>(case.clone());
            assert!(parsed.is_err(), "envelope {case} must be rejected");
        }
    }
}
