<!--
	Resources (G1 route skeleton): honest placeholder — the resource library
	(create, browse, verify) is built across the upcoming Phase 2 gates
	(G5+); no fake content.
-->
<script lang="ts">
	import { Boxes } from "lucide-svelte";

	import RoutePlaceholder from "#lib/components/placeholders/RoutePlaceholder.svelte";
</script>

<RoutePlaceholder
	icon={Boxes}
	title="Resources"
	message="The resource library — canonical names, categories, verification, aliases, evidence, attachments, and history — arrives with the upcoming resource-management gates (G5+)."
	phase="later-gate"
/>
