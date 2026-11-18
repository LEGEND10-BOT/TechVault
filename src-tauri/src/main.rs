//! Desktop binary entrypoint for TechVault.

// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Desktop entrypoint; all setup lives in the library crate
/// (`techvault_lib::run`) so the core stays mobile-compatible by design.
fn main() {
    techvault_lib::run()
}
