<!--
	Toast container (D-023 set): renders the toast store's queue as a
	non-blocking notice stack. Screen-reader semantics: the container is an
	aria-live="polite" region; individual error toasts additionally carry
	role="alert" (assertive) so failures are announced immediately. Status
	is never color-only: each toast carries its variant icon and text, and
	every toast is dismissible by keyboard.
-->
<script lang="ts">
	import { CircleCheck, CircleX, Info, X } from "lucide-svelte";

	import { dismissToast, toastList, type ToastVariant } from "#lib/stores/toasts.svelte";
	import { cn } from "#lib/utils/cn";

	const icons: Record<ToastVariant, typeof CircleCheck> = {
		success: CircleCheck,
		error: CircleX,
		info: Info
	};

	const variantClasses: Record<ToastVariant, string> = {
		success: "border-success/40",
		error: "border-error/40",
		info: "border-info/40"
	};
</script>

{#if toastList.current.length > 0}
	<div
		class="fixed bottom-4 right-4 z-40 flex max-w-sm flex-col gap-2"
		aria-live="polite"
		aria-label="Notifications"
	>
		{#each toastList.current as toast (toast.id)}
			{@const Icon = icons[toast.variant]}
			<div
				class={cn(
					"flex items-start gap-2 rounded-card border bg-surface px-3 py-2 text-sm text-text shadow-lg",
					variantClasses[toast.variant]
				)}
				role={toast.variant === "error" ? "alert" : "status"}
			>
				<Icon class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<p class="min-w-0 flex-1 break-words">{toast.message}</p>
				<button
					type="button"
					class="rounded-card p-0.5 text-text-muted hover:bg-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
					aria-label="Dismiss notification"
					onclick={() => dismissToast(toast.id)}
				>
					<X class="size-3.5" aria-hidden="true" />
				</button>
			</div>
		{/each}
	</div>
{/if}
