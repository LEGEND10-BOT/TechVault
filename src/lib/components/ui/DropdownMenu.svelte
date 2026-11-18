<!--
	DropdownMenu primitive (D-023 set): WAI-ARIA APG menu-button pattern.
	Keyboard behavior (APG): Enter/Space/ArrowDown opens and focuses the
	first item; ArrowUp opens and focuses the last; ArrowUp/Down move focus
	among items; Home/End jump; Escape closes and returns focus to the
	trigger; Tab closes. ARIA: trigger carries aria-haspopup/aria-expanded;
	menu carries role="menu"; items role="menuitem" with roving tabindex.
	Click-outside closes.
-->
<script lang="ts">
	import { cn } from "#lib/utils/cn";

	import type { MenuItem } from "./types";

	interface Props {
		label: string;
		items: MenuItem[];
		class?: string;
		onselect: (id: string) => void;
		children?: import("svelte").Snippet;
	}

	let { label, items, class: className, onselect, children }: Props = $props();

	let open = $state(false);
	let triggerEl: HTMLButtonElement | null = $state(null);
	let menuEl: HTMLUListElement | null = $state(null);
	let focusedIndex = $state(-1);

	function openMenu(fromEnd: boolean): void {
		if (items.length === 0) return;
		focusedIndex = fromEnd ? items.length - 1 : firstEnabledIndex();
		open = true;
	}

	// Focus lands on the requested item after the menu has rendered
	// ($effect runs post-DOM-update, unlike a microtask queued during the
	// click handler).
	$effect(() => {
		if (!open || focusedIndex < 0 || !menuEl) return;
		const buttons = enabledButtons();
		buttons[focusedIndex]?.focus();
	});

	function firstEnabledIndex(): number {
		const idx = items.findIndex((item) => !item.disabled);
		return idx === -1 ? 0 : idx;
	}

	function moveFocus(delta: number): void {
		const buttons = enabledButtons();
		if (buttons.length === 0) return;
		const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
		const next = (current + delta + buttons.length) % buttons.length;
		buttons[next]?.focus();
	}

	function enabledButtons(): HTMLButtonElement[] {
		return Array.from(menuEl?.querySelectorAll<HTMLButtonElement>("li > button:not(:disabled)") ?? []);
	}

	function closeMenu(returnFocus: boolean): void {
		open = false;
		focusedIndex = -1;
		if (returnFocus) triggerEl?.focus();
	}

	function onTriggerKeydown(event: KeyboardEvent): void {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			openMenu(false);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			openMenu(true);
		} else if (event.key === "Escape" && open) {
			// Escape with focus still on the trigger (mouse-opened menu) also
			// closes — the trigger keeps focus, which is the APG end state.
			event.preventDefault();
			closeMenu(false);
		}
	}

	function onMenuKeydown(event: KeyboardEvent): void {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveFocus(1);
				break;
			case "ArrowUp":
				event.preventDefault();
				moveFocus(-1);
				break;
			case "Home":
				event.preventDefault();
				enabledButtons()[0]?.focus();
				break;
			case "End":
				event.preventDefault();
				enabledButtons().at(-1)?.focus();
				break;
			case "Escape":
				event.preventDefault();
				closeMenu(true);
				break;
			case "Tab":
				closeMenu(false);
				break;
		}
	}

	function onWindowPointerdown(event: PointerEvent): void {
		if (!open) return;
		const target = event.target as Node;
		if (!menuEl?.contains(target) && !triggerEl?.contains(target)) {
			closeMenu(false);
		}
	}
</script>

<svelte:window onpointerdown={onWindowPointerdown} />

<div class={cn("relative inline-block", className)}>
	<button
		bind:this={triggerEl}
		type="button"
		class="inline-flex items-center justify-center gap-2 rounded-card px-3 py-1.5 text-sm font-medium text-text hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label={label}
		onclick={() => (open ? closeMenu(true) : openMenu(false))}
		onkeydown={onTriggerKeydown}
	>
		{#if children}
			{@render children()}
		{:else}
			{label}
		{/if}
	</button>

	{#if open}
		<ul
			bind:this={menuEl}
			role="menu"
			aria-label={label}
			class="absolute right-0 z-20 mt-1 min-w-40 rounded-card border border-surface-border bg-surface p-1 shadow-lg"
			onkeydown={onMenuKeydown}
		>
			{#each items as item (item.id)}
				<li role="none">
					<button
						type="button"
						role="menuitem"
						tabindex={-1}
						disabled={item.disabled}
						class={cn(
							"w-full rounded-card px-3 py-1.5 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
							item.danger ? "text-error hover:bg-error/10 focus-visible:bg-error/10" : "text-text",
							item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
						)}
						onclick={() => {
							if (item.disabled) return;
							closeMenu(true);
							onselect(item.id);
						}}
					>
						{item.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
