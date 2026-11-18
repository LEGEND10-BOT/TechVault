/*
 * Global error-boundary test (G1 deliverable; PHASE-3 regression item):
 * a routed child that throws during rendering is caught by the layout's
 * <svelte:boundary>, which renders the design-system recovery UI
 * (what happened + next action + retry) instead of a crashed tree.
 */
import { createRawSnippet } from "svelte";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import Layout from "../../src/routes/+layout.svelte";

describe("global error boundary", () => {
	it("catches a rendering child error and shows the recovery UI (never a blank tree)", async () => {
		// The boundary logs the error honestly; keep the expected error out
		// of the test output noise.
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
		try {
			const throwingChild = createRawSnippet(() => ({
				render: () => {
					throw new Error("boundary-test explosion");
				}
			}));

			render(Layout, { children: throwingChild });

			// The fallback replaced the shell content.
			expect(screen.getByText(/something went wrong/i)).not.toBeNull();
			expect(screen.getByText(/your library data is unaffected/i)).not.toBeNull();
			expect(screen.getByRole("button", { name: /try again/i })).not.toBeNull();
		} finally {
			errorSpy.mockRestore();
		}
	});
});
