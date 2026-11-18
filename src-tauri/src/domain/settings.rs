//! Typed application settings (domain layer).
//!
//! G1 carries the Appearance category (`PHASE_2_M1_UI_SPECIFICATION.md` §4);
//! later gates extend the same typed structure incrementally (G3/G4/G8/G10–G11
//! per the UI specification's section-gate mapping). Settings carry UI
//! preferences only — no secrets, no credentials, no user content (SEC-15/16
//! posture; the provider configuration that arrives later renders
//! placeholder-only state until a separate security design exists).
//!
//! Unknown fields are tolerated (forward compatibility as categories are
//! added by later gates); enum values are strict so a corrupted or
//! hand-edited file can never inject an invalid theme.

use serde::{Deserialize, Serialize};

/// Zoom bounds (owner G1 correction directive: zoom with sensible minimum
/// and maximum). Stored as a scale factor applied through the WebView
/// `setZoom` API and persisted in the Appearance category.
pub const MIN_ZOOM: f64 = 0.5;
pub const MAX_ZOOM: f64 = 2.0;
pub const DEFAULT_ZOOM: f64 = 1.0;

/// Clamp a zoom value into the approved bounds, rounded to two decimals.
/// NaN clamps to the minimum (a NaN scale factor would poison the file and
/// the WebView — it can only arrive from a hand-edited settings file).
pub fn clamp_zoom(value: f64) -> f64 {
    let clamped = if value.is_nan() {
        MIN_ZOOM
    } else {
        value.clamp(MIN_ZOOM, MAX_ZOOM)
    };
    (clamped * 100.0).round() / 100.0
}

/// User-selectable theme preference.
///
/// `System` resolves through `prefers-color-scheme` (the G1 first-run rule:
/// "dark-primary default + `prefers-color-scheme` respected on first run" —
/// `PHASE_2_M1_UI_SPECIFICATION.md` §1); `Dark`/`Light` are explicit choices.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ThemePreference {
    /// Follow the operating-system color scheme.
    #[default]
    System,
    /// Force the dark theme (the approved primary direction, D-011).
    Dark,
    /// Force the light theme.
    Light,
}

/// Appearance category settings.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct AppearanceSettings {
    /// Theme preference persisted across restarts.
    pub theme: ThemePreference,
    /// UI zoom scale factor, clamped to `[MIN_ZOOM, MAX_ZOOM]` on load and
    /// before save (owner G1 directive: zoom persistence with bounds).
    /// Out-of-range values in the file are clamped, never rejected, so a
    /// hand-edited file can never produce an unusable interface.
    pub zoom: f64,
}

impl Default for AppearanceSettings {
    fn default() -> Self {
        Self {
            theme: ThemePreference::default(),
            zoom: DEFAULT_ZOOM,
        }
    }
}

impl AppearanceSettings {
    /// Enforce the zoom bounds in place (called on load and before save).
    pub fn normalize(&mut self) {
        self.zoom = clamp_zoom(self.zoom);
    }
}

/// Root typed settings snapshot persisted to the settings file.
///
/// G1 shape: `appearance` only. Later gates add categories to this
/// structure (each with its own default), which keeps the file
/// forward-compatible with older payloads.
#[derive(Debug, Clone, Copy, Default, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct AppSettings {
    /// Appearance category (G1).
    pub appearance: AppearanceSettings,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_settings_are_system_theme() {
        let settings = AppSettings::default();
        assert_eq!(settings.appearance.theme, ThemePreference::System);
    }

    #[test]
    fn settings_round_trip_through_json() {
        let settings = AppSettings {
            appearance: AppearanceSettings {
                theme: ThemePreference::Light,
                zoom: 1.25,
            },
        };
        let value = serde_json::to_value(settings).unwrap();
        assert_eq!(
            value,
            serde_json::json!({ "appearance": { "theme": "light", "zoom": 1.25 } })
        );
        let parsed: AppSettings = serde_json::from_value(value).unwrap();
        assert_eq!(parsed, settings);
    }

    #[test]
    fn theme_values_serialize_to_stable_wire_strings() {
        assert_eq!(
            serde_json::to_value(ThemePreference::System).unwrap(),
            serde_json::json!("system")
        );
        assert_eq!(
            serde_json::to_value(ThemePreference::Dark).unwrap(),
            serde_json::json!("dark")
        );
        assert_eq!(
            serde_json::to_value(ThemePreference::Light).unwrap(),
            serde_json::json!("light")
        );
    }

    #[test]
    fn missing_zoom_defaults_to_100_percent() {
        // A settings file written before the zoom feature (M0/G1 early) must
        // still load: the zoom field defaults, never a parse failure.
        let parsed: AppSettings =
            serde_json::from_value(serde_json::json!({ "appearance": { "theme": "dark" } }))
                .unwrap();
        assert_eq!(parsed.appearance.zoom, DEFAULT_ZOOM);
    }

    #[test]
    fn zoom_clamps_into_approved_bounds() {
        assert_eq!(clamp_zoom(0.1), MIN_ZOOM);
        assert_eq!(clamp_zoom(5.0), MAX_ZOOM);
        assert_eq!(clamp_zoom(1.0), 1.0);
        assert_eq!(clamp_zoom(1.3333), 1.33);
        assert_eq!(clamp_zoom(f64::NAN), MIN_ZOOM); // NaN clamps to the minimum, never poisons the file
    }

    #[test]
    fn normalize_enforces_bounds_in_place() {
        let mut appearance = AppearanceSettings {
            theme: ThemePreference::Dark,
            zoom: 9.0,
        };
        appearance.normalize();
        assert_eq!(appearance.zoom, MAX_ZOOM);
    }

    #[test]
    fn unknown_fields_are_tolerated_for_forward_compatibility() {
        let parsed: AppSettings = serde_json::from_value(serde_json::json!({
            "appearance": { "theme": "dark" },
            "future_category": { "later": true }
        }))
        .unwrap();
        assert_eq!(parsed.appearance.theme, ThemePreference::Dark);
    }

    #[test]
    fn invalid_theme_is_rejected() {
        let parsed = serde_json::from_value::<AppSettings>(serde_json::json!({
            "appearance": { "theme": "midnight" }
        }));
        assert!(parsed.is_err(), "invalid theme value must be rejected");
    }

    #[test]
    fn missing_appearance_defaults_to_system() {
        let parsed: AppSettings = serde_json::from_value(serde_json::json!({})).unwrap();
        assert_eq!(parsed.appearance.theme, ThemePreference::System);
    }
}
