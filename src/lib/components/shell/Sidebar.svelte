<!--
	Sidebar (G1, owner correction pass — layout per the owner's reference
	screenshot): compact branding block (wordmark + "Local-first research"
	subtitle; OD-1 neutral placeholder — no invented shield/T artwork), the
	primary "Add Source URL" action rendered HONESTLY DISABLED (source
	intake belongs to a later gate — same treatment as the disabled topbar
	search), and the single 8-item navigation list (Settings included, per
	the reference hierarchy). Active navigation is visually distinct without
	excessive color (muted fill + accent icon + aria-current="page").
-->
<script lang="ts">
	import { page } from "$app/state";
	import { Plus } from "lucide-svelte";

	import { NAV_ITEMS, SETTINGS_ITEM } from "./nav";
	import { Tooltip } from "#lib/components/ui";

	const ALL_ITEMS = [...NAV_ITEMS, SETTINGS_ITEM];
	const SettingsIcon = SETTINGS_ITEM.icon;

	const isActive = (href: string): boolean =>
		href === "/" ? page.url.pathname === "/" : page.url.pathname.startsWith(href);
</script>

<aside class="flex h-full w-[220px] shrink-0 flex-col border-r border-surface-border bg-sidebar">
	<div class="flex flex-col gap-3 border-b border-surface-border px-4 pt-4 pb-4">
		<!-- OD-1 neutral placeholder: plain wordmark slot, no invented artwork. -->
		<div class="flex items-center gap-1">
			<span class="text-base font-semibold tracking-tight text-text">TechVault</span>
		</div>
		<p class="text-xs text-text-muted">Local-first research</p>
		<Tooltip text="Source intake arrives at a later development gate (G4+) — not available yet.">
			<button
				type="button"
				disabled
				class="pointer-events-none flex w-full items-center justify-center gap-2 rounded-card bg-accent px-3 py-2 text-sm font-medium text-white opacity-50 disabled:cursor-not-allowed"
				aria-label="Add Source URL (available in a later gate)"
				aria-disabled="true"
			>
				<Plus class="size-4" aria-hidden="true" />
				Add Source URL
			</button>
		</Tooltip>
	</div>

	<nav aria-label="Main navigation" class="flex min-h-0 flex-1 flex-col px-2 py-3">
		<ul class="flex flex-col gap-0.5">
			{#each ALL_ITEMS as item (item.id)}
				{@const Icon = item.icon}
				<li>
					<a
						href={item.href}
						aria-current={isActive(item.href) ? "page" : undefined}
						class="relative flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
							{isActive(item.href)
							? 'bg-muted text-text'
							: 'text-text-muted hover:bg-muted hover:text-text'}"
					>
						<Icon class="size-4 shrink-0 {isActive(item.href) ? 'text-accent' : ''}" aria-hidden="true" />
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
