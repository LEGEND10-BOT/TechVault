<!--
	Root layout (G1): theme initialization, AppShell, global toast host,
	and the global error boundary (G1 deliverable). The boundary renders the
	design-system error state — what happened + next action + retry —
	instead of a crashed tree (UI spec §5; module L).
-->
<script lang="ts">
	import "../app.css";

	import { onMount } from "svelte";

	import AppShell from "#lib/components/shell/AppShell.svelte";
	import { Button, Toast } from "#lib/components/ui";
	import { theme } from "#lib/stores/theme.svelte";
	import { zoom } from "#lib/stores/zoom.svelte";

	let { children } = $props();

	// Load the persisted appearance (theme preference + zoom — the settings
	// snapshot loads once through the centralized store) and apply it; a
	// failed read never blocks the shell.
	onMount(() => {
		void theme.init().then(() => zoom.init());
	});

	// The boundary hit is a genuine application error: it is logged honestly
	// (the DP-04 console criterion distinguishes application errors from the
	// documented runtime CSP-enforcement event) and shown via the fallback.
	function onBoundaryError(...args: unknown[]): void {
		console.error("Unhandled application error caught by the error boundary:", ...args);
	}
</script>

<svelte:head>
	<title>TechVault</title>
</svelte:head>

<svelte:boundary onerror={onBoundaryError}>
	<AppShell>
		{@render children()}
	</AppShell>
	<Toast />

	{#snippet failed(error, reset)}
		<div class="flex min-h-screen items-center justify-center p-8">
			<div class="w-full max-w-md rounded-card border border-surface-border bg-surface p-6">
				<h1 class="text-lg font-semibold tracking-tight text-text">
					Something went wrong while rendering this view
				</h1>
				<p class="mt-2 text-sm text-text-muted">
					An unexpected application error occurred. Your library data is unaffected.
					You can retry rendering this view.
				</p>
				<p class="mt-2 font-mono text-xs text-text-muted">
					{error instanceof Error ? error.message : "Unknown error"}
				</p>
				<div class="mt-4 flex gap-2">
					<Button onclick={() => reset()}>Try again</Button>
				</div>
			</div>
		</div>
	{/snippet}
</svelte:boundary>
