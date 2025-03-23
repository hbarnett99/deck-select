<script lang="ts">
	import { Button } from '../../lib/components/ui/button';
	import { Card } from '../../lib/components/ui/card';
	import { Crown } from 'lucide-svelte';
	import * as Tooltip from '../../lib/components/ui/tooltip';
	import * as Avatar from '../../lib/components/ui/avatar';

	const players = $state([
		{ name: 'Eddie', isHost: false },
		{ name: 'Henry', isHost: true },
		{ name: 'Marty', isHost: false }
	]);

	const orderedPlayers = $derived(
		players.toSorted((p1, p2) => Number(p2.isHost) - Number(p1.isHost))
	);
</script>

<Button variant="outline" class="grid h-fit grid-cols-3 items-center gap-4 p-2">
	<div class="col-span-2">Lobby Card</div>
	<div class="col-span-1 grid grid-cols-1 gap-2">
		{#each orderedPlayers as player}
			<Card class="inline-flex items-center gap-2 p-4">
				<Avatar.Root class='mr-1'>
					<Avatar.Image src="" />
					<Avatar.Fallback></Avatar.Fallback>
				</Avatar.Root>
				{player.name}
				{#if player.isHost}
					<Crown class="fill-yellow-400 stroke-yellow-400" />

					<!-- <Tooltip.Provider delayDuration={0}>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Crown class="fill-yellow-400 stroke-yellow-400" />
							</Tooltip.Trigger>
							<Tooltip.Content side="right">
								<p>Host</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider> -->

				{/if}
			</Card>
		{/each}
	</div>
</Button>
