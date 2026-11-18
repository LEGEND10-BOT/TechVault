<!--
	Bookmarks (G1 route skeleton): explicit later-phase placeholder —
	bookmarks are Phase 4 scope; nothing is implemented (no fake content).
-->
<script lang="ts">
	import { Bookmark } from "lucide-svelte";

	import RoutePlaceholder from "#lib/components/placeholders/RoutePlaceholder.svelte";
</script>

<RoutePlaceholder
	icon={Bookmark}
	title="Bookmarks"
	message="Bookmarks are planned for a later phase. This placeholder is intentional; nothing is implemented here yet."
	phase="phase-4"
/>
