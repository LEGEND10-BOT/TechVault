/*
 * Sidebar navigation registry (G1): the 8 approved destinations (D-011 /
 * UI_DESIGN_SYSTEM.md §6.2). Settings is rendered in its own sidebar
 * section (the design's "settings access" zone) — 8 links in total.
 * Placeholder phases are metadata for the honest route empty states —
 * never fake content.
 */
import {
	Bookmark,
	Boxes,
	ChartLine,
	Globe,
	LayoutDashboard,
	NotebookPen,
	Settings,
	Waypoints
} from "lucide-svelte";

export type PlaceholderKind = "coming-with-data" | "later-gate" | "phase-4";

export interface NavItem {
	id: string;
	label: string;
	href: string;
	icon: typeof Bookmark;
	/** Honest placeholder classification used by the route empty state. */
	phase: PlaceholderKind;
}

export const NAV_ITEMS: NavItem[] = [
	{ id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard, phase: "coming-with-data" },
	{ id: "sources", label: "Sources", href: "/sources", icon: Globe, phase: "later-gate" },
	{ id: "resources", label: "Resources", href: "/resources", icon: Boxes, phase: "later-gate" },
	{ id: "notebooks", label: "Notebooks", href: "/notebooks", icon: NotebookPen, phase: "phase-4" },
	{ id: "graph", label: "Knowledge Graph", href: "/graph", icon: Waypoints, phase: "phase-4" },
	{ id: "bookmarks", label: "Bookmarks", href: "/bookmarks", icon: Bookmark, phase: "phase-4" },
	{ id: "analytics", label: "Research Analytics", href: "/analytics", icon: ChartLine, phase: "phase-4" }
];

export interface SettingsNavItem {
	id: string;
	label: string;
	href: string;
	icon: typeof Bookmark;
}

export const SETTINGS_ITEM: SettingsNavItem = {
	id: "settings",
	label: "Settings",
	href: "/settings",
	icon: Settings
};
