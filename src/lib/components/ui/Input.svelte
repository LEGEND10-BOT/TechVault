<!--
	Input primitive (D-023 set): label association, error state with
	aria-invalid + aria-describedby, visible focus indicator. A real
	<input> element; never color-only error signaling (the message text
	accompanies the border color).
-->
<script lang="ts">
	import { cn } from "#lib/utils/cn";

	interface Props {
		value?: string;
		type?: "text" | "password" | "email" | "search" | "url";
		label?: string;
		id?: string;
		name?: string;
		placeholder?: string;
		error?: string;
		hint?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
	}

	let {
		value = $bindable(""),
		type = "text",
		label,
		id,
		name,
		placeholder,
		error,
		hint,
		disabled = false,
		required = false,
		class: className
	}: Props = $props();

	// Auto-generated id when the caller does not supply one ($props.id()
	// must be a top-level declaration).
	const fallbackId = $props.id();
	const inputId = $derived(id ?? fallbackId);
	const describedBy = $derived(
		error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
	);
</script>

{#if label}
	<label class="mb-1.5 block text-sm font-medium text-text" for={inputId}>
		{label}
		{#if required}<span class="text-error" aria-hidden="true">*</span>{/if}
	</label>
{/if}

<input
	id={inputId}
	{type}
	{name}
	{placeholder}
	{disabled}
	{required}
	{value}
	aria-invalid={error ? "true" : undefined}
	aria-describedby={describedBy}
	class={cn(
		"w-full rounded-card border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted",
		"focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
		"transition-colors",
		"disabled:cursor-not-allowed disabled:opacity-50",
		error ? "border-error" : "border-surface-border",
		className
	)}
/>

{#if error}
	<p id="{inputId}-error" class="mt-1.5 text-xs text-error">{error}</p>
{:else if hint}
	<p id="{inputId}-hint" class="mt-1.5 text-xs text-text-muted">{hint}</p>
{/if}
