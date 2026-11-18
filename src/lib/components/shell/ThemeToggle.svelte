<!--
	Theme toggle (G1): switches between the persisted dark/light preference.
	aria-pressed reflects the applied state; the icon accompanies the label
	(state is never color/icon-only).
-->
<script lang="ts">
	import { Moon, Sun } from "lucide-svelte";

	import { theme } from "#lib/stores/theme.svelte";

	const label = $derived(
		theme.resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"
	);
</script>

<button
	type="button"
	class="rounded-card p-2 text-text-muted transition-colors hover:bg-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
	aria-label={label}
	aria-pressed={theme.resolved === "light"}
	onclick={() => void theme.setPreference(theme.resolved === "dark" ? "light" : "dark")}
>
	{#if theme.resolved === "dark"}
		<Moon class="size-4" aria-hidden="true" />
	{:else}
		<Sun class="size-4" aria-hidden="true" />
	{/if}
</button>
