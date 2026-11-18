<!--
	Settings (G1 — fully real per PHASE_2_M1_UI_SPECIFICATION.md §4; layout
	per the owner's reference screenshot: vertical internal navigation with
	an active state, content cards on the right):
	- Appearance (G1): theme (segmented Light/Dark/System control) and
	  display zoom (keyboard shortcuts + manual controls, bounded,
	  persisted) — owner correction directives B/C.
	- Providers (G1, SEC-16): R-023 placeholder state rendered clearly as
	  "not configured — disabled". No provider configuration, no keys, no
	  activation surface in Phase 2 (D-019/D-021 posture).
	- About/diagnostics (G1 part): versions + application data/log location.
	  The sanitized diagnostics export belongs to G12 and is listed as a
	  later-gate item (honest, not a stub pretending to work).

	Sections that arrive at later gates (Storage G3, Sources & limits G4,
	Search G8, Backup & restore G10/G11) are not rendered yet — the
	vertical navigation grows when each section becomes real.
-->
<script lang="ts">
	import { Check, ChevronRight, Info, Palette, Plug } from "lucide-svelte";
	import { onMount } from "svelte";

	import { fetchAppInfo } from "#lib/services/app";
	import { Badge, Button, Card } from "#lib/components/ui";
	import { pushToast } from "#lib/stores/toasts.svelte";
	import { settingsStore } from "#lib/stores/settings.svelte";
	import { theme } from "#lib/stores/theme.svelte";
	import { zoom } from "#lib/stores/zoom.svelte";
	import type { AppInfo } from "#lib/types/app";
	import type { ThemePreference } from "#lib/types/settings";
	import { MAX_ZOOM, MIN_ZOOM } from "#lib/types/settings";

	interface SectionDef {
		id: string;
		label: string;
		icon: typeof Info;
	}

	const SECTIONS: SectionDef[] = [
		{ id: "appearance", label: "Appearance", icon: Palette },
		{ id: "providers", label: "Providers", icon: Plug },
		{ id: "about", label: "About", icon: Info }
	];

	const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
		{ value: "system", label: "System" }
	];

	let activeSection = $state("appearance");
	let appInfo: AppInfo | null = $state(null);
	let infoError: string | null = $state(null);
	let savingTheme = $state(false);
	let savingZoom = $state(false);

	onMount(() => {
		void loadAppInfo();
	});

	async function loadAppInfo(): Promise<void> {
		const envelope = await fetchAppInfo();
		if (envelope.ok) {
			appInfo = envelope.data;
			infoError = null;
		} else {
			appInfo = null;
			infoError = envelope.error.message;
		}
	}

	async function onThemeChange(event: Event): Promise<void> {
		const value = (event.target as HTMLInputElement).value as ThemePreference;
		savingTheme = true;
		const persisted = await theme.setPreference(value);
		savingTheme = false;
		if (!persisted) {
			pushToast(
				"The theme preference could not be saved — it will apply now but may not persist after a restart.",
				"error"
			);
		}
	}

	async function onZoomChange(action: "in" | "out" | "reset"): Promise<void> {
		savingZoom = true;
		if (action === "in") await zoom.zoomIn();
		else if (action === "out") await zoom.zoomOut();
		else await zoom.reset();
		savingZoom = false;
		if (zoom.lastApplyFailed) {
			pushToast("The zoom level could not be applied to the application window.", "error");
		}
	}

	const zoomPercent = $derived(Math.round(zoom.zoom * 100));
</script>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
	<div class="flex flex-col gap-1">
		<h1 class="text-lg font-semibold tracking-tight text-text">Settings</h1>
		<p class="text-sm text-text-muted">App-wide preferences, stored locally on this machine.</p>
	</div>

	<div class="grid grid-cols-[13rem_1fr] gap-6">
		<!-- Vertical internal navigation (owner reference layout) -->
		<nav aria-label="Settings sections" class="flex flex-col gap-1">
			{#each SECTIONS as section (section.id)}
				{@const Icon = section.icon}
				<button
					type="button"
					class="flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
						{activeSection === section.id
						? 'bg-accent/10 text-accent'
						: 'text-text-muted hover:bg-muted hover:text-text'}"
					aria-current={activeSection === section.id ? "true" : undefined}
					onclick={() => (activeSection = section.id)}
				>
					<Icon class="size-4 shrink-0" aria-hidden="true" />
					<span class="flex-1 text-left">{section.label}</span>
					<ChevronRight
						class="size-3.5 {activeSection === section.id ? 'text-accent' : 'text-text-muted'}"
						aria-hidden="true"
					/>
				</button>
			{/each}
		</nav>

		<!-- Content column -->
		<div class="flex flex-col gap-5">
			{#if activeSection === "appearance"}
				<Card class="p-5">
					<h2 class="text-sm font-medium text-text">Theme</h2>
					<p class="mt-1 text-xs text-text-muted">
						Choose how TechVault looks. Dark is the primary direction; your choice
						persists across restarts (first run follows the system scheme).
					</p>
					<fieldset class="mt-4">
						<legend class="sr-only">Theme preference</legend>
						<div class="inline-flex overflow-hidden rounded-card border border-surface-border">
							{#each THEME_OPTIONS as option (option.value)}
								<label
									class="relative flex cursor-pointer items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-accent
										{theme.preference === option.value
										? 'bg-accent text-white'
										: 'text-text-muted hover:bg-muted hover:text-text'}"
								>
									<input
										type="radio"
										name="theme-preference"
										value={option.value}
										checked={theme.preference === option.value}
										onchange={onThemeChange}
										class="sr-only"
									/>
									{#if theme.preference === option.value}
										<Check class="size-3.5" aria-hidden="true" />
									{/if}
									{option.label}
								</label>
							{/each}
						</div>
					</fieldset>
					<p class="mt-3 text-xs text-text-muted" role="status">
						Current theme: {theme.resolved}
						{#if savingTheme}(saving…){/if}
					</p>
				</Card>

				<Card class="p-5">
					<h2 class="text-sm font-medium text-text">Display zoom</h2>
					<p class="mt-1 text-xs text-text-muted">
						Use Ctrl + Plus / Ctrl + Minus / Ctrl + 0 anywhere, or the controls below.
						Zoom is bounded between {Math.round(MIN_ZOOM * 100)}% and {Math.round(MAX_ZOOM * 100)}%
						and persists across restarts.
					</p>
					<div class="mt-4 flex items-center gap-2">
						<Button
							variant="outline"
							onclick={() => void onZoomChange("out")}
							disabled={zoom.zoom <= MIN_ZOOM}
							ariaLabel="Zoom out"
						>
							Zoom out
						</Button>
						<span
							class="min-w-16 text-center font-mono text-sm text-text"
							role="status"
							aria-label="Current zoom level"
						>
							{zoomPercent}%
						</span>
						<Button
							variant="outline"
							onclick={() => void onZoomChange("in")}
							disabled={zoom.zoom >= MAX_ZOOM}
							ariaLabel="Zoom in"
						>
							Zoom in
						</Button>
						<Button
							variant="ghost"
							onclick={() => void onZoomChange("reset")}
							disabled={zoom.zoom === 1}
							ariaLabel="Reset zoom to 100 percent"
						>
							Reset
						</Button>
						{#if savingZoom}<span class="text-xs text-text-muted">saving…</span>{/if}
					</div>
				</Card>
			{:else if activeSection === "providers"}
				<Card class="p-5">
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-sm font-medium text-text">AI providers</h2>
						<Badge variant="neutral">Not configured — disabled</Badge>
					</div>
					<p class="mt-2 text-sm text-text-muted">
						No AI provider connections exist in Phase 2. Providers are disabled at the
						application level: there is nothing to configure here yet, and no API keys are
						stored or accepted by the application.
					</p>
					<p class="mt-2 text-xs text-text-muted">
						Provider activation is a future decision with its own security design; when it
						ships, its configuration appears here.
					</p>
				</Card>
			{:else if activeSection === "about"}
				<Card class="p-5">
					<h2 class="text-sm font-medium text-text">About TechVault</h2>
					{#if infoError}
						<p class="mt-3 text-sm text-error" role="alert">{infoError}</p>
						<div class="mt-3">
							<Button variant="outline" onclick={() => void loadAppInfo()}>Retry</Button>
						</div>
					{:else if appInfo}
						<dl class="mt-3 grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1 font-mono text-xs text-text-muted">
							<dt>app_name</dt>
							<dd class="text-text">{appInfo.app_name}</dd>
							<dt>version</dt>
							<dd class="text-text">{appInfo.version}</dd>
							<dt>tauri_version</dt>
							<dd class="text-text">{appInfo.tauri_version}</dd>
							<dt>os / arch</dt>
							<dd class="text-text">{appInfo.os} / {appInfo.arch}</dd>
							<dt>build_profile</dt>
							<dd class="text-text">{appInfo.build_profile}</dd>
							<dt>data directory</dt>
							<dd class="text-text">{appInfo.data_dir ?? "(unavailable)"}</dd>
						</dl>
						{#if appInfo.data_dir}
							<p class="mt-3 text-xs text-text-muted">
								Log file: <span class="font-mono">{appInfo.data_dir}\logs\techvault.log</span>
							</p>
						{/if}
					{:else}
						<p class="mt-3 text-sm text-text-muted" role="status">Loading application information…</p>
					{/if}
					<p class="mt-4 text-xs text-text-muted">
						A sanitized diagnostics export arrives with the closure gate (G12).
					</p>
				</Card>
			{/if}
		</div>
	</div>
</div>
