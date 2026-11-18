/*
 * Toast store (UI state only — architecture §2.2). Non-blocking
 * success/failure notices (UI_DESIGN_SYSTEM.md; UI spec §5). Errors also
 * surface in the relevant screen state — toasts are not the only carrier.
 * Bounded: each toast auto-dismisses after 6 s; the queue is capped.
 */
import type { Snippet } from "svelte";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
	id: number;
	variant: ToastVariant;
	message: string;
}

const AUTO_DISMISS_MS = 6_000;
const MAX_VISIBLE = 5;

let nextId = 0;
let toasts = $state<Toast[]>([]);
const timers = new Map<number, ReturnType<typeof setTimeout>>();

/** Reactive list of currently visible toasts. */
export const toastList = {
	get current(): Toast[] {
		return toasts;
	}
};

/** Show a toast. Returns its id (usable with {@link dismissToast}). */
export function pushToast(
	message: string,
	variant: ToastVariant = "info",
	icon?: Snippet
): number {
	const id = ++nextId;
	toasts = [...toasts.slice(-(MAX_VISIBLE - 1)), { id, variant, message }];
	// `icon` is accepted for future per-variant icons; the container renders
	// variant icons by variant value (never color-only status).
	void icon;
	const timer = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
	timers.set(id, timer);
	return id;
}

/** Remove a toast and clear its timer. */
export function dismissToast(id: number): void {
	const timer = timers.get(id);
	if (timer !== undefined) {
		clearTimeout(timer);
		timers.delete(id);
	}
	toasts = toasts.filter((toast) => toast.id !== id);
}

/** Clear every toast (used by tests and error-boundary resets). */
export function clearToasts(): void {
	for (const timer of timers.values()) clearTimeout(timer);
	timers.clear();
	toasts = [];
}
