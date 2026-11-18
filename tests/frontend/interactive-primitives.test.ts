/*
 * G1 primitive suites — interactive primitives (dialog/sheet/dropdown/
 * tabs/toast/tooltip): ARIA wiring, keyboard behavior per the WAI-ARIA
 * APG patterns where jsdom can express it, and automated accessibility
 * checks (TEST-09). The native <dialog> focus trap and focus return are
 * platform behaviors, verified on the real WebView2 runtime by the
 * manual keyboard walkthrough (jsdom emulates only the open/close event
 * wiring — see tests/frontend/setup.ts).
 */
import type { ComponentProps } from "svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Dialog from "../../src/lib/components/ui/Dialog.svelte";
import DropdownMenu from "../../src/lib/components/ui/DropdownMenu.svelte";
import Sheet from "../../src/lib/components/ui/Sheet.svelte";
import Tabs from "../../src/lib/components/ui/Tabs.svelte";
import Toast from "../../src/lib/components/ui/Toast.svelte";
import Tooltip from "../../src/lib/components/ui/Tooltip.svelte";
import { clearToasts, pushToast } from "../../src/lib/stores/toasts.svelte";
import { expectNoAxeViolations } from "./a11y";
import { rawSnippet } from "./test-utils";

describe("Dialog", () => {
	it("opens as a modal with an accessible name and a close control", async () => {
		const { container } = render(Dialog, {
			open: true,
			title: "Delete resource?",
			description: "This action states its consequences.",
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Dialog>);

		const dialog = screen.getByRole("dialog");
		expect(dialog.getAttribute("aria-labelledby")).not.toBeNull();
		expect(screen.getByText("Delete resource?")).not.toBeNull();
		expect(screen.getByRole("button", { name: /close dialog/i })).not.toBeNull();
		await expectNoAxeViolations(container);
	});

	it("a closed dialog renders nothing", () => {
		const { container } = render(Dialog, {
			open: false,
			title: "Hidden",
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Dialog>);
		// A closed <dialog> is inert; it must not be exposed as a dialog role.
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(container.querySelector("dialog")?.hasAttribute("open")).toBe(false);
	});

	it("the native close event syncs the bound open state", async () => {
		const { container } = render(Dialog, {
			open: true,
			title: "T",
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Dialog>);
		const dialog = container.querySelector("dialog") as HTMLDialogElement;
		dialog.close(); // polyfill dispatches the `close` event
		await waitFor(() => {
			expect(dialog.hasAttribute("open")).toBe(false);
		});
	});
});

describe("Sheet", () => {
	it("opens as a modal panel with title + close control and passes axe", async () => {
		const { container } = render(Sheet, {
			open: true,
			title: "Resource details",
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Sheet>);
		expect(screen.getByRole("dialog", { name: /resource details/i })).not.toBeNull();
		expect(screen.getByRole("button", { name: /close panel/i })).not.toBeNull();
		await expectNoAxeViolations(container);
	});
});

describe("DropdownMenu", () => {
	const items = [
		{ id: "edit", label: "Edit" },
		{ id: "archive", label: "Archive" },
		{ id: "delete", label: "Delete", danger: true }
	];

	it("trigger carries aria-haspopup and aria-expanded; menu appears with menuitem roles", async () => {
		const { container, getByRole } = render(DropdownMenu, {
			label: "Row actions",
			items,
			onselect: () => undefined
		} satisfies ComponentProps<typeof DropdownMenu>);

		const trigger = getByRole("button", { name: /row actions/i });
		expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");

		await userEvent.click(trigger);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByRole("menu", { name: /row actions/i })).not.toBeNull();
		expect(screen.getAllByRole("menuitem")).toHaveLength(3);
		await expectNoAxeViolations(container);
	});

	it("Escape closes the menu and returns focus to the trigger (APG)", async () => {
		const { getByRole } = render(DropdownMenu, {
			label: "Row actions",
			items,
			onselect: () => undefined
		} satisfies ComponentProps<typeof DropdownMenu>);

		const trigger = getByRole("button", { name: /row actions/i });
		await userEvent.click(trigger);
		expect(screen.getByRole("menu")).not.toBeNull();

		await userEvent.keyboard("{Escape}");
		await waitFor(() => {
			expect(screen.queryByRole("menu")).toBeNull();
		});
		expect(document.activeElement).toBe(trigger);
	});

	it("ArrowDown from the trigger opens the menu on the first item (APG)", async () => {
		const { getByRole } = render(DropdownMenu, {
			label: "Row actions",
			items,
			onselect: () => undefined
		} satisfies ComponentProps<typeof DropdownMenu>);

		const trigger = getByRole("button", { name: /row actions/i });
		trigger.focus();
		await userEvent.keyboard("{ArrowDown}");
		await waitFor(() => {
			expect(screen.getByRole("menu")).not.toBeNull();
		});
		// Roving focus: an item is focused inside the open menu.
		const focused = document.activeElement;
		expect(focused?.getAttribute("role")).toBe("menuitem");
	});
});

describe("Tabs", () => {
	const tabs = [
		{ id: "a", label: "Appearance" },
		{ id: "b", label: "Providers" }
	];

	function renderTabs() {
		return render(Tabs, {
			tabs,
			value: "a",
			onchange: () => undefined,
			panel: rawSnippet("Panel content")
		} satisfies ComponentProps<typeof Tabs>);
	}

	it("tablist/tab/tabpanel roles with synchronized aria-selected and aria-controls", async () => {
		const { container, getByRole } = renderTabs();
		expect(getByRole("tablist", { name: /sections/i })).not.toBeNull();
		const selected = getByRole("tab", { name: /^Appearance$/ });
		expect(selected.getAttribute("aria-selected")).toBe("true");
		expect(selected.getAttribute("tabindex")).toBe("0");
		const unselected = getByRole("tab", { name: /^Providers$/ });
		expect(unselected.getAttribute("aria-selected")).toBe("false");
		expect(unselected.getAttribute("tabindex")).toBe("-1");
		expect(selected.getAttribute("aria-controls")).toBe(
			getByRole("tabpanel").getAttribute("id")
		);
		await expectNoAxeViolations(container);
	});

	it("ArrowRight moves focus to the next tab and reports the selection (APG)", async () => {
		const onchange = vi.fn();
		const { getByRole } = render(Tabs, {
			tabs,
			value: "a",
			onchange,
			panel: rawSnippet("Panel content")
		} satisfies ComponentProps<typeof Tabs>);

		await userEvent.keyboard("{Tab}");
		expect(document.activeElement?.getAttribute("role")).toBe("tab");
		await userEvent.keyboard("{ArrowRight}");
		// Selection change is reported to the caller (parent state drives aria).
		expect(onchange).toHaveBeenCalledWith("b");
		await waitFor(() => {
			expect(document.activeElement?.id).toBe("tv-tab-b");
		});
	});

	it("the active panel is labelled by its tab", async () => {
		const { getByRole } = renderTabs();
		const panel = getByRole("tabpanel");
		expect(panel.getAttribute("aria-labelledby")).toBe(
			getByRole("tab", { name: /^Appearance$/ }).getAttribute("id")
		);
	});
});

describe("Toast", () => {
	it("success/info toasts are polite status; errors are asserted alerts (never color-only)", async () => {
		clearToasts();
		pushToast("Library exported.", "success");
		pushToast("Import failed: unsupported type.", "error");

		render(Toast);
		// Text always accompanies the variant styling (never color-only status).
		expect(screen.getByText("Library exported.")).not.toBeNull();
		expect(screen.getByText("Import failed: unsupported type.")).not.toBeNull();
		expect(screen.getByRole("alert")).not.toBeNull();
		expect(screen.getAllByRole("button", { name: /dismiss notification/i })).toHaveLength(2);
		clearToasts();
	});

	it("dismiss removes a toast", async () => {
		clearToasts();
		const id = pushToast("Temporary notice.", "info");
		render(Toast);
		expect(screen.getByText("Temporary notice.")).not.toBeNull();
		await userEvent.click(screen.getByRole("button", { name: /dismiss notification/i }));
		await waitFor(() => {
			expect(screen.queryByText("Temporary notice.")).toBeNull();
		});
		clearToasts();
	});
});

describe("Tooltip", () => {
	it("appears on keyboard focus with role=tooltip + aria-describedby", async () => {
		const { container, getByText } = render(Tooltip, {
			text: "This action arrives in a later gate.",
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Tooltip>);

		const trigger = container.querySelector("[aria-describedby]") as HTMLElement;
		expect(trigger.getAttribute("aria-describedby")).not.toBeNull();

		// focusin must bubble for the delegated handler (synthetic events do
		// not bubble unless told to).
		trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		await waitFor(() => {
			const tooltip = document.getElementById(trigger.getAttribute("aria-describedby") ?? "");
			expect(tooltip?.getAttribute("role")).toBe("tooltip");
		});
		expect(getByText("This action arrives in a later gate.")).not.toBeNull();
		await expectNoAxeViolations(container);
	});
});
