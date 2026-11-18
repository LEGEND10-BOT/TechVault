<!--
	Card primitive (D-023 set): subtle border, minimal shadow, consistent
	padding (UI_DESIGN_SYSTEM.md §7.2). The caller composes the content;
	cards are for meaningful groups of information, not wrappers for
	everything.
-->
<script lang="ts">
	import { cn } from "#lib/utils/cn";

	interface Props {
		class?: string;
		children: import("svelte").Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div class={cn("rounded-card border border-surface-border bg-surface", className)}>
	{@render children()}
</div>
