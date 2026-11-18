//! Thin Tauri command layer: validate args, perform the operation, map
//! failures into the typed IPC envelope (`PHASE_2_ARCHITECTURE.md` §2.2).
//! Later milestones add their own modules here as they earn existence.

pub mod app;
pub mod settings;
