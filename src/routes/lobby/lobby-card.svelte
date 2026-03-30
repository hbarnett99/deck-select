<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let {
		lobby
	}: {
		lobby: {
			id: string;
			name: string;
			practice_mode: boolean;
			status: string;
			pools: { name: string } | null;
			lobby_players: { id: string }[];
		};
	} = $props();

	const playerCount = $derived(lobby.lobby_players?.length ?? 0);
</script>

<a href="/lobby/{lobby.id}" class="block">
	<Card.Root class="hover:bg-muted/50 cursor-pointer transition-colors">
		<Card.Content class="flex items-center justify-between p-4">
			<div class="flex flex-col gap-1">
				<span class="font-medium">{lobby.name}</span>
				<span class="text-muted-foreground text-sm">{lobby.pools?.name ?? '—'}</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground text-sm">{playerCount} players</span>
				{#if lobby.practice_mode}
					<Badge variant="secondary">Practice</Badge>
				{/if}
				<Badge>{lobby.status}</Badge>
			</div>
		</Card.Content>
	</Card.Root>
</a>
