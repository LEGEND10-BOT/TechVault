<!--
	Sources (G1 route skeleton): honest placeholder — source records are
	created by data import (a later Phase 2 development gate); no fake
	content.
-->
<script lang="ts">
	import { Globe } from "lucide-svelte";

	import RoutePlaceholder from "#lib/components/placeholders/RoutePlaceholder.svelte";
</script>

<RoutePlaceholder
	icon={Globe}
	title="Sources"
	message="Source management — URLs, platform, processing status, transcripts — becomes available when data import arrives in a later Phase 2 development gate."
	phase="later-gate"
/>
