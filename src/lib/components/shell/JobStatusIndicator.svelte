<!--
	Job-status indicator (G1): inert until the G2 job runner exists.
	Per PHASE_2_M1_UI_SPECIFICATION.md §7: idle → hidden; active → count +
	current stage; any failure → attention state. G1 has no jobs, so the
	component renders nothing (no fake activity).
-->
<script lang="ts">
	import { AlertTriangle, LoaderCircle } from "lucide-svelte";

	import { jobsStore } from "#lib/stores/jobs.svelte";
	import { Badge } from "#lib/components/ui";

	let jobs = $derived(jobsStore.current);
	let failed = $derived(false); // G2: derived from job failure states
</script>

{#if jobs.length > 0 || failed}
	<button
		type="button"
		class="rounded-card p-2 text-text-muted transition-colors hover:bg-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
		aria-label="{failed ? 'Jobs with failures — ' : 'Active jobs — '}{jobs.length} running"
	>
		{#if failed}
			<AlertTriangle class="size-4 text-warning" aria-hidden="true" />
		{:else}
			<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
		{/if}
		<Badge variant={failed ? "warning" : "neutral"}>{jobs.length}</Badge>
	</button>
{/if}
