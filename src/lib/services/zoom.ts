/*
 * Zoom service — the only place that talks to the WebView zoom API
 * (`core:webview:allow-set-webview-zoom`, the single capability grant added
 * for the owner-directed G1 zoom feature). Normalized to a plain success
 * flag so callers can surface failures without transport details.
 */
import { getCurrentWebview } from "@tauri-apps/api/webview";

/** Apply a zoom scale factor to the application WebView. */
export async function applyZoom(scale: number): Promise<boolean> {
	try {
		await getCurrentWebview().setZoom(scale);
		return true;
	} catch {
		return false;
	}
}
