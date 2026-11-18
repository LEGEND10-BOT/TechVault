/*
 * Vitest setup for the G1 component/a11y suites (jsdom gaps):
 * - native <dialog> methods (showModal/show/close) are not implemented in
 *   jsdom — minimal emulations preserving the `open` reflection and the
 *   `close` event, so the Dialog/Sheet suites can exercise the wiring;
 *   the real focus-trap behavior is platform-native and is covered by the
 *   manual keyboard walkthrough (TEST-09) on the actual WebView2 runtime;
 * - window.matchMedia (used by the theme store's system-preference
 *   resolution) is stubbed to a deterministic non-dark value.
 */

if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
	HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
		this.setAttribute("open", "");
	};
	HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
		this.setAttribute("open", "");
	};
	HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
		this.removeAttribute("open");
		this.dispatchEvent(new Event("close"));
	};
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
	window.matchMedia = ((query: string) => {
		const mql = {
			matches: false,
			media: query,
			onchange: null,
			addListener: () => undefined,
			removeListener: () => undefined,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			dispatchEvent: () => false
		};
		return mql as MediaQueryList;
	}) as typeof window.matchMedia;
}
