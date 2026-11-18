<!--
	Tabs primitive (D-023 set): WAI-ARIA APG tabs pattern.
	Keyboard behavior (APG): ArrowLeft/ArrowRight (and Up/Down as the APG's
	horizontal-list option) move focus and selection together (roving
	tabindex); Home/End jump. ARIA: tablist / tab / tabpanel roles;
	aria-selected and aria-controls stay synchronized with the selection;
	the active panel is labelled by its tab.

	The caller supplies the active panel's content through the `panel`
	snippet, which receives the active tab item:
		<Tabs {tabs} bind:value {panel}>
			{#snippet panel(active)} … {/snippet}
		</Tabs>
-->
<script lang="ts">
	import { cn } from "#lib/utils/cn";

	import type { TabItem } from "./types";

	interface Props {
		tabs: TabItem[];
		/** The selected tab id (bindable; callers without binding pass it with `onchange`). */
		value: string;
		onchange: (id: string) => void;
		panel?: import("svelte").Snippet<[TabItem]>;
		class?: string;
	}

	let { tabs, value = $bindable(""), onchange, panel, class: className }: Props = $props();

	function focusTab(index: number): void {
		const clamped = (index + tabs.length) % tabs.length;
		const tab = tabs[clamped];
		if (!tab) return;
		onchange(tab.id);
		const tabId = tab.id;
		queueMicrotask(() => {
			document.getElementById(`tv-tab-${tabId}`)?.focus();
		});
	}

	function onTabKeydown(event: KeyboardEvent, tab: TabItem): void {
		const currentIndex = tabs.findIndex((t) => t.id === value);
		switch (event.key) {
			case "ArrowRight":
			case "ArrowDown":
				event.preventDefault();
				focusTab(currentIndex + 1);
				break;
			case "ArrowLeft":
			case "ArrowUp":
				event.preventDefault();
				focusTab(currentIndex - 1);
				break;
			case "Home":
				event.preventDefault();
				focusTab(0);
				break;
			case "End":
				event.preventDefault();
				focusTab(tabs.length - 1);
				break;
			default:
				void tab;
		}
	}
</script>

<div class={cn("flex flex-col", className)}>
	<div role="tablist" aria-label="Sections" class="flex flex-wrap gap-1 border-b border-surface-border pb-1">
		{#each tabs as tab (tab.id)}
			<button
				id="tv-tab-{tab.id}"
				type="button"
				role="tab"
				aria-selected={tab.id === value}
				aria-controls="tv-tabpanel-{tab.id}"
				tabindex={tab.id === value ? 0 : -1}
				class={cn(
					"rounded-card px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
					tab.id === value
						? "bg-muted text-text"
						: "text-text-muted hover:bg-muted hover:text-text"
				)}
				onclick={() => onchange(tab.id)}
				onkeydown={(event) => onTabKeydown(event, tab)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	{#each tabs as tab (tab.id)}
		{#if tab.id === value}
			<div
				id="tv-tabpanel-{tab.id}"
				role="tabpanel"
				aria-labelledby="tv-tab-{tab.id}"
				tabindex={-1}
				class="mt-4"
			>
				{#if panel}
					{@render panel(tab)}
				{/if}
			</div>
		{/if}
	{/each}
</div>
