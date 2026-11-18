/** Types mirroring the Rust command payloads in `src-tauri/src/commands/app.rs`. */

export interface PingRequest {
	message?: string;
}

export interface PingResponse {
	message: string;
	echoed?: string;
	server_time_unix_ms: number;
}

export interface AppInfo {
	app_name: string;
	version: string;
	tauri_version: string;
	os: string;
	arch: string;
	build_profile: string;
	/** Application data directory (absent when it could not be resolved). */
	data_dir?: string;
}
