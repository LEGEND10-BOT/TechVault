<!--
	Button primitive (D-023 set). Variants per UI_DESIGN_SYSTEM.md §7.1:
	primary / secondary / outline / ghost / destructive.
	Hover, focus-visible, disabled, and loading states are required.
	Accessible by construction: renders a real <button>, visible focus
	indicator, aria-busy while loading; the caller supplies the label.
-->
<script lang="ts">
	import { LoaderCircle } from "lucide-svelte";

	import { cn } from "#lib/utils/cn";

	type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";

	interface Props {
		variant?: Variant;
		type?: "button" | "submit" | "reset";
		disabled?: boolean;
		loading?: boolean;
		/** Accessible name when the visible label is insufficient (e.g. icon-only). */
		ariaLabel?: string;
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children: import("svelte").Snippet;
	}

	let {
		variant = "primary",
		type = "button",
		disabled = false,
		loading = false,
		ariaLabel,
		class: className,
		onclick,
		children
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		primary: "bg-accent text-white hover:bg-accent-hover focus-visible:outline-accent",
		secondary: "bg-muted text-text hover:bg-accent/10 focus-visible:outline-accent",
		outline:
			"border border-surface-border bg-transparent text-text hover:border-accent/50 focus-visible:outline-accent",
		ghost: "bg-transparent text-text hover:bg-muted focus-visible:outline-accent",
		destructive: "bg-error text-white hover:opacity-90 focus-visible:outline-error"
	};
</script>

<button
	{type}
	class={cn(
		"inline-flex items-center justify-center gap-2 rounded-card px-4 py-2 text-sm font-medium",
		"focus-visible:outline-2 focus-visible:outline-offset-2",
		"transition-colors",
		"disabled:cursor-not-allowed disabled:opacity-50",
		variantClasses[variant],
		className
	)}
	{onclick}
	{disabled}
	aria-busy={loading}
	aria-label={ariaLabel}
>
	{#if loading}
		<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
	{/if}
	{@render children()}
</button>
