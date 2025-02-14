<script lang="ts">
	import { Trophy } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Button } from '$lib/components/ui/button';
	import { formatDistance } from 'date-fns';

	export let lobby: {
		id: string;
		name: string;
		createdAt: Date;
		playerCount: number;
		maxPlayers: number;
		isPractice: boolean;
	};
</script>

# src/lib/components/lobby/LobbyCard.svelte
<div class="rounded-lg border p-4 hover:bg-gray-50">
	<div class="mb-2 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="font-medium">{lobby.name}</span>
			{#if lobby.isPractice}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Trophy class="h-4 w-4 text-yellow-500" />
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Practice Mode</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}
		</div>
		<Button size="sm">Join</Button>
	</div>
	<div class="flex justify-between text-sm text-gray-500">
		<span>{lobby.playerCount}/{lobby.maxPlayers} Players</span>
		<span>Created {formatDistance(lobby.createdAt, new Date(), { addSuffix: true })}</span>
	</div>
</div>
