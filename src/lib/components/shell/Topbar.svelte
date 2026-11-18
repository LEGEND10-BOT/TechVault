<!--
	Topbar (G1, owner correction pass — layout per the owner's reference
	screenshot): current section title on the left; global search (honest
	disabled state — the search surface arrives at the search gate, G8) and
	the theme toggle on the right. Sticky 56 px bar per the design system.
-->
<script lang="ts">
	import { page } from "$app/state";

	import TopbarSearch from "./TopbarSearch.svelte";
	import ThemeToggle from "./ThemeToggle.svelte";
	import JobStatusIndicator from "./JobStatusIndicator.svelte";
	import { NAV_ITEMS, SETTINGS_ITEM } from "./nav";

	const title = $derived.by(() => {
		const path = page.url.pathname;
		const match = [...NAV_ITEMS, SETTINGS_ITEM].find((item) =>
			item.href === "/" ? path === "/" : path.startsWith(item.href)
		);
		return match?.label ?? "Dashboard";
	});
</script>

<header class="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-surface-border bg-sidebar px-5">
	<!-- Not a heading: each route's content owns the page <h1>; this is a
	     wayfinding label per the reference layout. -->
	<p class="text-sm font-semibold tracking-tight text-text">{title}</p>
	<div class="ml-auto flex items-center gap-1">
		<TopbarSearch />
		<JobStatusIndicator />
		<ThemeToggle />
	</div>
</header>
