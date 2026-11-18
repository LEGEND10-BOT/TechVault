<!--
	Topbar global search (G1): the input is present but honestly disabled —
	the search engine and UI arrive at the search gate (G8, per
	PHASE_2_M1_UI_SPECIFICATION.md §4). Never a fake control that pretends
	to work; a tooltip explains the state for pointer and keyboard users.
-->
<script lang="ts">
	import { Search } from "lucide-svelte";

	import { Tooltip } from "#lib/components/ui";
</script>

<Tooltip text="Global search arrives with the search gate (G8) — not available yet.">
	<div class="relative w-64">
		<Search
			class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
			aria-hidden="true"
		/>
		<input
			type="search"
			disabled
			aria-label="Global search (available in a later gate)"
			placeholder="Search — arrives in a later gate"
			class="w-full rounded-card border border-surface-border bg-bg py-1.5 pl-9 pr-3 text-sm text-text placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
		/>
	</div>
</Tooltip>
