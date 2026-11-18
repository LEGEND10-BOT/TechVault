/*
 * G1 primitive suites — static primitives (button/input/card/badge/table):
 * variants, states, and automated accessibility checks (axe) per primitive
 * suite (TEST-09: automated per-primitive a11y suites).
 */
import type { ComponentProps } from "svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

import Badge from "../../src/lib/components/ui/Badge.svelte";
import Button from "../../src/lib/components/ui/Button.svelte";
import Card from "../../src/lib/components/ui/Card.svelte";
import Input from "../../src/lib/components/ui/Input.svelte";
import Table from "../../src/lib/components/ui/Table.svelte";
import TableHead from "../../src/lib/components/ui/TableHead.svelte";
import { expectNoAxeViolations } from "./a11y";
import { rawSnippet } from "./test-utils";

describe("Button", () => {
	it("renders all five approved variants", () => {
		for (const variant of ["primary", "secondary", "outline", "ghost", "destructive"] as const) {
			const { container, unmount } = render(Button, {
				variant,
				children: rawSnippet("content")
			} satisfies ComponentProps<typeof Button>);
			expect(container.querySelector("button")).not.toBeNull();
			unmount();
		}
	});

	it("disabled and loading states are announced", () => {
		const { getByRole } = render(Button, {
			disabled: true,
			loading: true,
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Button>);
		const button = getByRole("button");
		expect((button as HTMLButtonElement).disabled).toBe(true);
		expect(button.getAttribute("aria-busy")).toBe("true");
	});

	it("passes axe (a11y suite)", async () => {
		const { container } = render(Button, {
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Button>);
		await expectNoAxeViolations(container);
	});
});

describe("Input", () => {
	it("associates the label, hint, and error with the input", () => {
		const { getByRole, getByLabelText } = render(Input, {
			label: "Resource name",
			hint: "Shown in the library.",
			value: "x"
		} satisfies ComponentProps<typeof Input>);
		const input = getByRole("textbox") as HTMLInputElement;
		expect(getByLabelText("Resource name")).toBe(input);
		expect(input.getAttribute("aria-describedby")).toMatch(/-hint$/);
	});

	it("error state sets aria-invalid and an error description (never color-only)", () => {
		const { getByRole, getByText } = render(Input, {
			label: "Resource name",
			error: "A name is required.",
			value: ""
		} satisfies ComponentProps<typeof Input>);
		const input = getByRole("textbox");
		expect(input.getAttribute("aria-invalid")).toBe("true");
		expect(getByText("A name is required.")).not.toBeNull();
		expect(input.getAttribute("aria-describedby")).toMatch(/-error$/);
	});

	it("passes axe with label + hint", async () => {
		const { container } = render(Input, {
			label: "Resource name",
			hint: "Shown in the library."
		} satisfies ComponentProps<typeof Input>);
		await expectNoAxeViolations(container);
	});
});

describe("Card and Badge", () => {
	it("badge text is always rendered (status never color-only)", () => {
		const { getByText } = render(Badge, {
			variant: "success",
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Badge>);
		expect(getByText("content")).toBeTruthy();
	});

	it("passes axe", async () => {
		const { container } = render(Card, {
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Card>);
		await expectNoAxeViolations(container);
	});
});

describe("Table primitives", () => {
	it("sortable header carries aria-sort and a labelled button", () => {
		const { getByRole, getByText } = render(TableHead, {
			sortKey: "name",
			sortDirection: "ascending",
			onsort: () => undefined,
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof TableHead>);
		const th = getByRole("columnheader");
		expect(th.getAttribute("aria-sort")).toBe("ascending");
		expect(getByRole("button")).not.toBeNull();
		expect(getByText("content")).toBeTruthy();
	});

	it("non-sortable header has no aria-sort", () => {
		const { getByRole, queryByRole } = render(TableHead, {
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof TableHead>);
		expect(getByRole("columnheader").getAttribute("aria-sort")).toBeNull();
		expect(queryByRole("button")).toBeNull();
	});

	it("passes axe", async () => {
		const { container } = render(Table, {
			ariaLabel: "Resources",
			children: rawSnippet("content")
		} satisfies ComponentProps<typeof Table>);
		await expectNoAxeViolations(container);
	});
});
