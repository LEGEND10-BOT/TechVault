<!--
	Badge primitive (D-023 set): tinted badges for verification / processing
	status / resource categories / discovery type (UI_DESIGN_SYSTEM.md §7.3).
	Status is never communicated through color alone — badges carry their
	label text (and may carry an icon via the icon snippet).
-->
<script lang="ts">
	import { cn } from "#lib/utils/cn";

	type Variant = "neutral" | "accent" | "success" | "warning" | "error" | "info";

	interface Props {
		variant?: Variant;
		class?: string;
		children: import("svelte").Snippet;
	}

	let { variant = "neutral", class: className, children }: Props = $props();

	const variantClasses: Record<Variant, string> = {
		neutral: "border-surface-border text-text-muted",
		accent: "border-accent/40 text-accent",
		success: "border-success/40 text-success",
		warning: "border-warning/40 text-warning",
		error: "border-error/40 text-error",
		info: "border-info/40 text-info"
	};
</script>

<span
	class={cn(
		"inline-flex items-center gap-1 rounded-card border px-2 py-0.5 text-xs font-medium",
		variantClasses[variant],
		className
	)}
>
	{@render children()}
</span>
