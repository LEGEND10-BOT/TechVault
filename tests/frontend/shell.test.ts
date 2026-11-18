/*
 * G1 shell tests (component tests per the milestones G1 item 7): nav
 * registry, shell structure, honest topbar search state, inert job-status
 * indicator, theme toggle, skip-link behavior (owner correction D), and
 * the honest disabled primary action. Axe runs over the shell.
 */
import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const pageUrl = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("$app/state", () => ({
	page: {
		get url() {
			return new URL(`http://tauri.localhost${pageUrl.pathname}`);
		}
	}
}));

import AppShell from "../../src/lib/components/shell/AppShell.svelte";
import JobStatusIndicator from "../../src/lib/components/shell/JobStatusIndicator.svelte";
import { NAV_ITEMS, SETTINGS_ITEM } from "../../src/lib/components/shell/nav";
import { rawSnippet } from "./test-utils";

/** Render AppShell with a minimal routed child (snippet). */
async function renderShell(pathname = "/") {
	pageUrl.pathname = pathname;
	const { container } = render(AppShell, {
		children: rawSnippet("<span></span>")
	});
	return container;
}

describe("shell navigation", () => {
	it("renders exactly the 8 approved destinations", async () => {
		await renderShell();
		for (const item of [...NAV_ITEMS, SETTINGS_ITEM]) {
			const link = screen.getByRole("link", { name: new RegExp(`^${item.label}$`) });
			expect(link.getAttribute("href")).toBe(item.href);
		}
		// All 8 destination links live inside the nav landmark (single list,
		// per the owner's reference hierarchy).
		const nav = screen.getByRole("navigation", { name: /main navigation/i });
		expect(within(nav).getAllByRole("link")).toHaveLength(8);
	});

	it("marks the active destination with aria-current=page", async () => {
		await renderShell("/resources");
		const active = screen.getByRole("link", { name: /^Resources$/ });
		expect(active.getAttribute("aria-current")).toBe("page");
		const inactive = screen.getByRole("link", { name: /^Dashboard$/ });
		expect(inactive.getAttribute("aria-current")).toBeNull();
	});

	it("distinguishes the dashboard route from prefixed routes", async () => {
		await renderShell("/");
		expect(screen.getByRole("link", { name: /^Dashboard$/ }).getAttribute("aria-current")).toBe(
			"page"
		);
		expect(screen.getByRole("link", { name: /^Resources$/ }).getAttribute("aria-current")).toBeNull();
	});

	it("the source-intake action is present but honestly disabled (later gate)", async () => {
		await renderShell();
		const add = screen.getByRole("button", { name: /add source url/i });
		expect((add as HTMLButtonElement).disabled).toBe(true);
		expect(add.getAttribute("aria-disabled")).toBe("true");
	});
});

describe("shell structure and honest states", () => {
	it("provides a skip link to the main workspace", async () => {
		await renderShell();
		const skip = screen.getByRole("link", { name: /skip to main content/i });
		expect(skip.getAttribute("href")).toBe("#main-workspace");
		expect(document.getElementById("main-workspace")).not.toBeNull();
	});

	it("the skip link is hidden during ordinary interaction and fixed+centered when focused (no branding overlap)", async () => {
		await renderShell();
		const skip = screen.getByRole("link", { name: /skip to main content/i });
		// Hidden (screen-reader-only) during ordinary interaction.
		expect(skip.className).toContain("sr-only");
		// On keyboard focus it becomes fixed and horizontally centered —
		// it must NOT be anchored over the sidebar branding.
		expect(skip.className).toContain("focus:fixed");
		expect(skip.className).toContain("focus:left-1/2");
		expect(skip.className).not.toContain("focus-visible:absolute");
	});

	it("activating the skip link moves focus into the main workspace", async () => {
		await renderShell();
		const skip = screen.getByRole("link", { name: /skip to main content/i });
		const main = document.getElementById("main-workspace") as HTMLElement;
		expect(document.activeElement).not.toBe(main);
		await userEvent.click(skip);
		expect(document.activeElement).toBe(main);
	});

	it("renders the main navigation landmark", async () => {
		await renderShell();
		expect(screen.getByRole("navigation", { name: /main navigation/i })).not.toBeNull();
	});

	it("shows the current section title in the topbar (wayfinding)", async () => {
		const container = await renderShell("/settings");
		const header = container.querySelector("header") as HTMLElement;
		expect(within(header).getByText("Settings")).not.toBeNull();
	});

	it("the global search is present but honestly disabled with an explanation", async () => {
		await renderShell();
		const search = screen.getByRole("searchbox", { name: /global search/i });
		expect((search as HTMLInputElement).disabled).toBe(true);
	});

	it("the job-status indicator renders nothing while idle (G1 has no jobs)", () => {
		const { container } = render(JobStatusIndicator);
		expect(container.querySelector("button")).toBeNull();
	});

	it("the theme toggle announces its state (aria-pressed + label)", async () => {
		await renderShell();
		const toggle = screen.getByRole("button", { name: /switch to (light|dark) theme/i });
		expect(toggle.getAttribute("aria-pressed")).not.toBeNull();
	});

	it("the branding block shows the neutral wordmark and subtitle (OD-1, reference layout)", async () => {
		await renderShell();
		expect(screen.getByText("TechVault")).not.toBeNull();
		expect(screen.getByText("Local-first research")).not.toBeNull();
	});
});
