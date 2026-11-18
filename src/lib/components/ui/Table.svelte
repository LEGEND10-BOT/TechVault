<!--
	Table primitive (D-023 set): semantic table container with horizontal
	scroll handling (UI_DESIGN_SYSTEM.md §7.4). Sorting/filtering/row-action
	behavior attaches to this structure when data exists (the resource
	library, G9); rows and body sections are plain semantic elements. The
	focusable sortable header lives in TableHead.svelte.
-->
<script lang="ts">
	import { cn } from "#lib/utils/cn";

	interface Props {
		class?: string;
		ariaLabel?: string;
		children: import("svelte").Snippet;
	}

	let { class: className, ariaLabel, children }: Props = $props();
</script>

<div class="overflow-x-auto">
	<table class={cn("w-full border-collapse text-sm", className)} aria-label={ariaLabel}>
		{@render children()}
	</table>
</div>
