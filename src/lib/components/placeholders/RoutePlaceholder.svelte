<!--
	Route placeholder (G1 honest empty states): explicit "later phase" /
	"coming with data" placeholders — never fake content
	(PHASE_2_M1_UI_SPECIFICATION.md §1).
-->
<script lang="ts">
	import type { Bookmark } from "lucide-svelte";

	import { Badge, Card } from "#lib/components/ui";
	import type { PlaceholderKind } from "#lib/components/shell/nav";

	/** The lucide icon component type (the D-023 icon set). */
	type IconComponent = typeof Bookmark;

	const PHASE_LABELS: Record<PlaceholderKind, string> = {
		"coming-with-data": "Coming with data",
		"later-gate": "Later development gate",
		"phase-4": "Later phase"
	};

	interface Props {
		icon: IconComponent;
		title: string;
		message: string;
		phase: PlaceholderKind;
	}

	let { icon: Icon, title, message, phase }: Props = $props();
</script>

<div class="mx-auto flex max-w-xl flex-col items-center gap-4 pt-16 text-center">
	<Card class="flex w-full flex-col items-center gap-4 px-8 py-10">
		<span class="flex size-12 items-center justify-center rounded-full bg-muted" aria-hidden="true">
			<Icon class="size-6 text-text-muted" />
		</span>
		<div class="flex flex-col gap-2">
			<h1 class="text-lg font-semibold tracking-tight text-text">{title}</h1>
			<p class="text-sm text-text-muted">{message}</p>
		</div>
		<Badge variant="neutral">{PHASE_LABELS[phase]}</Badge>
	</Card>
</div>
