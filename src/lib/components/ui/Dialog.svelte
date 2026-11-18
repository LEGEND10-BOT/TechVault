<!--
	Dialog primitive (D-023 set): modal confirmation/interaction surface
	(UI_DESIGN_SYSTEM.md §7.5). Built on the native <dialog> element so the
	accessibility behaviors are the platform's own, not reimplementations:
	- showModal() moves focus into the opened surface and traps keyboard
	  focus inside the top layer; background interaction is disabled.
	- Escape fires `cancel` and closes; the `close` event syncs the bound
	  `open` state and focus returns to the invoking control (native).
	- Destructive dialogs state their consequences — the caller supplies
	  consequence text (UI-06).
-->
<script lang="ts">
	import { X } from "lucide-svelte";

	import { cn } from "#lib/utils/cn";

	type Variant = "default" | "destructive";

	interface Props {
		open: boolean;
		title: string;
		description?: string;
		variant?: Variant;
		onclose?: () => void;
		class?: string;
		children: import("svelte").Snippet;
	}

	let { open = $bindable(false), title, description, variant = "default", onclose, class: className, children }: Props = $props();

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
		"m-auto w-[min(28rem,calc(100vw-2rem))] rounded-card border border-surface-border bg-surface p-0 text-text",
		"backdrop:bg-black/50",
		className
	)}
	aria-labelledby={titleId}
	onclose={() => {
		open = false;
		onclose?.();
	}}
>
	<div class="flex items-start justify-between gap-4 border-b border-surface-border px-5 py-4">
		<div>
			<h2 id={titleId} class="text-sm font-semibold text-text" class:text-error={variant === "destructive"}>
				{title}
			</h2>
			{#if description}
				<p class="mt-1 text-xs text-text-muted">{description}</p>
			{/if}
		</div>
		<button
			type="button"
			class="rounded-card p-1 text-text-muted hover:bg-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
			aria-label="Close dialog"
			onclick={() => el?.close()}
		>
			<X class="size-4" aria-hidden="true" />
		</button>
	</div>
	<div class="px-5 py-4">
		{@render children()}
	</div>
</dialog>
