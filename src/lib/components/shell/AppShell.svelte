<!--
	AppShell (G1, owner correction pass): 220 px sidebar + 56 px sticky topbar
	+ flexible main workspace (UI_DESIGN_SYSTEM.md §6.1; UI-01). The
	contextual right panel is reserved — populated by the detail view at G9;
	it occupies no layout in G1.

	Skip link (owner correction D): hidden during ordinary interaction,
	fixed and CENTERED at the top when keyboard-focused (never overlapping
	the sidebar branding), and explicitly moves focus into the main
	workspace on activation.
-->
<script lang="ts">
	import Sidebar from "./Sidebar.svelte";
	import Topbar from "./Topbar.svelte";

	let { children } = $props();

	/** Activate the skip link: navigate focus into the main workspace. */
	function onSkipActivate(event: MouseEvent): void {
		const main = document.getElementById("main-workspace");
		if (main) {
			event.preventDefault();
			main.focus();
			main.scrollIntoView({ block: "start" });
		}
	}
</script>

<div class="flex h-screen w-full overflow-hidden">
	<a
		href="#main-workspace"
		class="sr-only rounded-card bg-accent px-4 py-2 text-sm font-medium text-white focus:fixed focus:left-1/2 focus:top-2 focus:z-50 focus:-translate-x-1/2 focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-accent"
		onclick={onSkipActivate}
	>
		Skip to main content
	</a>
	<Sidebar />
	<div class="flex min-w-0 flex-1 flex-col">
		<Topbar />
		<div class="flex min-h-0 flex-1">
			<main
				id="main-workspace"
				tabindex="-1"
				class="min-w-0 flex-1 overflow-y-auto px-8 py-6 focus-visible:outline-none"
			>
				{@render children()}
			</main>
		</div>
	</div>
</div>
