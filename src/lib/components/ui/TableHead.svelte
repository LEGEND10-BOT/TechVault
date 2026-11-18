<!--
	TableHead primitive (D-023 set): a <th> whose content is optionally a
	sort button following the accessible sortable-column pattern — the
	button carries the column name, `aria-sort` lives on the <th> and stays
	synchronized ("ascending" | "descending" | "none"), and the sort
	indicator is text+icon (never color-only).
-->
<script lang="ts">
	import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-svelte";

	import { cn } from "#lib/utils/cn";

	export type SortDirection = "ascending" | "descending" | "none";

	interface Props {
		sortKey?: string;
		sortDirection?: SortDirection;
		onsort?: (sortKey: string, next: SortDirection) => void;
		class?: string;
		children: import("svelte").Snippet;
	}

	let {
		sortKey,
		sortDirection = "none",
		onsort,
		class: className,
		children
	}: Props = $props();

	const sortable = $derived(sortKey !== undefined && onsort !== undefined);

	function toggleSort(): void {
		if (sortKey === undefined) return;
		const next: SortDirection = sortDirection === "ascending" ? "descending" : "ascending";
		onsort?.(sortKey, next);
	}
</script>

<th
	scope="col"
	aria-sort={sortable ? sortDirection : undefined}
	class={cn(
		"border-b border-surface-border px-3 py-2 text-left text-xs font-medium text-text-muted",
		className
	)}
>
	{#if sortable}
		<button
			type="button"
			class="inline-flex items-center gap-1 rounded-card px-1 py-0.5 text-xs font-medium text-text hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
			onclick={toggleSort}
		>
			{@render children()}
			{#if sortDirection === "ascending"}
				<ArrowUp class="size-3.5" aria-hidden="true" />
			{:else if sortDirection === "descending"}
				<ArrowDown class="size-3.5" aria-hidden="true" />
			{:else}
				<ArrowUpDown class="size-3.5 text-text-muted" aria-hidden="true" />
			{/if}
		</button>
	{:else}
		{@render children()}
	{/if}
</th>
