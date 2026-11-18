<!--
	Tooltip primitive (D-023 set): hover/focus-triggered hint, hidden by
	Escape (APG tooltip pattern). ARIA: the trigger is described by the
	tooltip via aria-describedby; the tooltip itself carries role="tooltip".
	Keyboard-accessible: appears on keyboard focus, not only on hover.
	(The trigger wrapper is a passive <span> — svelte a11y interaction
	warnings are acknowledged: the wrapper carries no semantic role itself
	by design; the interactive descendant provides semantics, and the
	tooltip relationship is expressed through aria-describedby.)
-->
<script lang="ts">
	import { cn } from "#lib/utils/cn";

	interface Props {
		text: string;
		class?: string;
		children: import("svelte").Snippet;
	}

	let { text, class: className, children }: Props = $props();

	let visible = $state(false);
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;

	const tooltipId = $props.id();

	function show(immediate: boolean): void {
		if (hoverTimer !== null) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		if (immediate) {
			visible = true;
			return;
		}
		hoverTimer = setTimeout(() => {
			visible = true;
			hoverTimer = null;
		}, 300);
	}

	function hide(): void {
		if (hoverTimer !== null) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		visible = false;
	}

	// Escape hides any visible tooltip (window-level: the trigger span is a
	// passive wrapper and must not become a keyboard focus stop of its own).
	function onWindowKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape" && visible) {
			hide();
		}
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<span class={cn("relative inline-flex", className)}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		aria-describedby={tooltipId}
		onmouseenter={() => show(false)}
		onmouseleave={hide}
		onfocusin={() => show(true)}
		onfocusout={hide}
	>
		{@render children()}
	</span>

	{#if visible}
		<span
			id={tooltipId}
			role="tooltip"
			class="absolute left-1/2 top-full z-30 mt-1.5 w-max max-w-56 -translate-x-1/2 rounded-card border border-surface-border bg-surface px-2 py-1 text-xs text-text shadow-lg"
		>
			{text}
		</span>
	{/if}
</span>
