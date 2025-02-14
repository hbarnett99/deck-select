<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { createEventDispatcher } from 'svelte';
	import PlayerCard from './player-card.svelte';

	const dispatch = createEventDispatcher();

	export let lobby: {
		id: string;
		name: string;
		players: Array<{
			id: string;
			name: string;
			isReady: boolean;
			isAdmin: boolean;
		}>;
		isPractice: boolean;
		createdAt: Date;
	};
	export let currentUserId: string;
	export let isAdmin: boolean;

	$: currentUser = lobby.players.find((p) => p.id === currentUserId);
	$: readyCount = lobby.players.filter((p) => p.isReady).length;
	$: allReady = readyCount === lobby.players.length;
</script>

# src/lib/components/lobby/ActiveLobby.svelte
<div class="flex-1 rounded-lg bg-white p-4 shadow">
	<!-- Lobby Header -->
	<div class="mb-4 flex items-center justify-between border-b p-2">
		<div class="flex items-center space-x-4">
			<span class="text-sm text-gray-500">Settings</span>
			{#if lobby.isPractice}
				<span class="text-sm text-gray-500">Practice Mode</span>
			{/if}
		</div>
		{#if isAdmin}
			<button class="rounded-full p-2 hover:bg-gray-100" on:click={() => dispatch('openSettings')}>
				<Settings class="h-5 w-5 text-gray-500" />
			</button>
		{/if}
	</div>

	<!-- Player List -->
	<div class="mb-6 space-y-4">
		{#each lobby.players as player}
			<PlayerCard
				{player}
				currentUser={player.id === currentUserId}
				onMakeAdmin={isAdmin && player.id !== currentUserId
					? () => dispatch('makeAdmin', { playerId: player.id })
					: undefined}
			/>
		{/each}
	</div>

	<!-- Bottom Controls -->
	<div class="flex items-center justify-between border-t pt-4">
		<div class="flex items-center gap-4">
			<Button variant="destructive" onclick={() => dispatch('leaveLobby')}>Leave Lobby</Button>
			<span class="text-sm text-gray-500">
				{readyCount} of {lobby.players.length} Players Ready
			</span>
		</div>

		<div class="flex items-center gap-2">
			<Button
				variant={currentUser?.isReady ? 'outline' : 'ghost'}
				onclick={() => dispatch('toggleReady')}
			>
				{currentUser?.isReady ? 'Unready' : 'Ready'}
			</Button>

			{#if isAdmin}
				<Button disabled={!allReady} onclick={() => dispatch('startGame')}>Start Game</Button>
			{/if}
		</div>
	</div>
</div>
