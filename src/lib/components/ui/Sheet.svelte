<!--
	Sheet primitive (D-023 set): side surface for contextual details
	(UI_DESIGN_SYSTEM.md §7.5). Same native-<dialog> accessibility behaviors
	as Dialog (focus into surface, trap, Escape, focus return, background
	locked) — presented as a right-side panel.
-->
<script lang="ts">
	import { X } from "lucide-svelte";

	import { cn } from "#lib/utils/cn";

	interface Props {
		open: boolean;
		title: string;
		onclose?: () => void;
		class?: string;
		children: import("svelte").Snippet;
	}

	let { open = $bindable(false), title, onclose, class: className, children }: Props = $props();

	let el: HTMLDialogElement | null = $state(null);
	const titleId = $props.id();

	$effect(() => {
		if (!el) return;
		if (open && !el.open) {
			el.showModal();
		} else if (!open && el.open) {
			el.close();
		}
	});
</script>

<dialog
	bind:this={el}
	class={cn(
		"my-0 ml-auto mr-0 h-full max-h-none w-[min(26rem,calc(100vw-2rem))] rounded-none border-l border-surface-border bg-surface p-0 text-text",
		"backdrop:bg-black/50",
		className
	)}
	aria-labelledby={titleId}
	onclose={() => {
		open = false;
		onclose?.();
	}}
>
	<div class="flex items-center justify-between gap-4 border-b border-surface-border px-5 py-4">
		<h2 id={titleId} class="text-sm font-semibold text-text">{title}</h2>
		<button
			type="button"
			class="rounded-card p-1 text-text-muted hover:bg-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
			aria-label="Close panel"
			onclick={() => el?.close()}
		>
			<X class="size-4" aria-hidden="true" />
		</button>
	</div>
	<div class="px-5 py-4">
		{@render children()}
	</div>
</dialog>
