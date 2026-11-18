/*
 * Shared prop types for the interactive primitives (kept out of the
 * .svelte files so they can be imported as plain TypeScript modules).
 */

export interface MenuItem {
	id: string;
	label: string;
	danger?: boolean;
	disabled?: boolean;
}

export interface TabItem {
	id: string;
	label: string;
}
