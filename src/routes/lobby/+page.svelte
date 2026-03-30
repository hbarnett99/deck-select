<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import LobbyCard from './lobby-card.svelte';
	import NewLobby from './new-lobby.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let newLobbyOpen = $state(false);
</script>

<div class="w-full max-w-2xl">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Lobbies</h1>
		<Button onclick={() => (newLobbyOpen = true)}>
			<Plus class="mr-2 h-4 w-4" />
			New Lobby
		</Button>
	</div>

	{#if data.lobbies.length === 0}
		<p class="text-muted-foreground py-12 text-center">
			No open lobbies — create one to get started.
		</p>
	{:else}
		<div class="space-y-2">
			{#each data.lobbies as lobby (lobby.id)}
				<LobbyCard {lobby} />
			{/each}
		</div>
	{/if}
</div>

<NewLobby data={data.form} pools={data.pools} bind:open={newLobbyOpen} />
