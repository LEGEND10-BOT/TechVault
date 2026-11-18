/*
 * Test utilities for the G1 suites: raw-snippet construction for snippet
 * props (a plain function is not a valid snippet — it renders nothing).
 * Generic over the snippet's argument tuple so parameterized snippets
 * (e.g. Tabs' panel) type-check against the component's prop types.
 */
import { createRawSnippet } from "svelte";

import type { Snippet } from "svelte";

/** Build a snippet that renders the given raw HTML when rendered. */
export function rawSnippet<const A extends unknown[]>(html: string): Snippet<A> {
	return createRawSnippet<A>(() => ({ render: () => html }));
}
