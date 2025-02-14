<script lang="ts">
	import { Crown } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';

	export let player: {
		id: string;
		name: string;
		isReady: boolean;
		isAdmin: boolean;
	};
	export let currentUser: boolean = false;
	export let onMakeAdmin: (() => boolean) | undefined;
</script>

# src/lib/components/lobby/PlayerCard.svelte
<div class="rounded-lg border p-4 {cn('bg-gray-50', currentUser)}">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<!-- Ready Status Indicator -->
			<div class="h-2 w-2 rounded-full {player.isReady ? 'bg-green-500' : 'bg-red-500'}" />

			{#if player.isAdmin}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Crown class="h-5 w-5 text-yellow-500" />
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Lobby Admin</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}

			<span class="font-medium">{player.name}</span>
			{#if currentUser}
				<span class="text-sm text-gray-500">(You)</span>
			{/if}
		</div>

		{#if onMakeAdmin}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button
						variant="ghost"
						size="icon"
						onclick={onMakeAdmin}
						class="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
					>
						<Crown />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Make Admin</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</div>
</div>
