<script>
	import { Button } from '../ui/button';
	import { Card } from '../ui/card';
	import { Crown } from 'lucide-svelte';
	import * as Tooltip from '../ui/tooltip';

	const players = [
		{ name: 'Henry', isHost: true },
		{ name: 'Eddie', isHost: false },
		{ name: 'Marty', isHost: false }
	];
</script>

<Button variant="outline" class="grid h-fit grid-cols-3 items-center gap-4 p-2">
	<div class="col-span-2">Lobby Card</div>
	<div class="col-span-1 grid grid-cols-1 gap-2">
		{#each players as player}
			<Card class="inline-flex items-center justify-center gap-2 p-4">
				{player.name}
				{#if player.isHost}
					<Tooltip.Provider delayDuration={0}>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Crown class="stroke-yellow-400 fill-yellow-400" />
							</Tooltip.Trigger>
							<Tooltip.Content side="right">
								<p>Host</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				{/if}
			</Card>
		{/each}
	</div>
</Button>
