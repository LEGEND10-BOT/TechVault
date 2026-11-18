<!--
	Dashboard (G1 route skeleton): honest "coming with data" placeholder —
	the dashboard fills in from real library data; no fake content
	(PHASE_2_M1_UI_SPECIFICATION.md §1).
-->
<script lang="ts">
	import { LayoutDashboard } from "lucide-svelte";

	import RoutePlaceholder from "#lib/components/placeholders/RoutePlaceholder.svelte";
</script>

<RoutePlaceholder
	icon={LayoutDashboard}
	title="Dashboard"
	message="The dashboard shows source and resource counts, processing jobs, recent discoveries, and recent activity — it fills in as your library grows."
	phase="coming-with-data"
/>
