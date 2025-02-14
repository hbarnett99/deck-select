<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { lobbyStore } from '$lib/stores/lobby';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import {
		createLobby,
		joinLobby,
		leaveLobby,
		toggleReady,
		startGame,
		makeAdmin
	} from '$lib/server/lobby';
	import { toast } from 'svelte-sonner';
	import ActiveLobby from './active-lobby.svelte';
	import LobbyCard from './lobby-card.svelte';

	export let data;
	const supabase = data.supabase;

	let newLobbyName = '';
	let isPracticeMode = false;
	let createDialogOpen = false;

	onMount(() => {
		lobbyStore.init(supabase);
		lobbyStore.refreshLobbies();
	});

	async function handleCreateLobby() {
		try {
			const lobby = await createLobby(supabase, {
				name: newLobbyName,
				isPractice: isPracticeMode
			});
			createDialogOpen = false;
			toast.success('Lobby created successfully');
			await joinLobby(supabase, lobby.id);
		} catch (error) {
			toast.error('Failed to create lobby');
			console.error(error);
		}
	}

	async function handleJoinLobby(lobbyId: string) {
		try {
			await joinLobby(supabase, lobbyId);
			toast.success('Joined lobby successfully');
		} catch (error) {
			toast.error('Failed to join lobby');
			console.error(error);
		}
	}

	async function handleLeaveLobby() {
		try {
			const activeLobbyId = $lobbyStore.activelobby?.id;
			if (!activeLobbyId) return;

			await leaveLobby(supabase, activeLobbyId);
			lobbyStore.setActiveLobby(null);
			toast.success('Left lobby successfully');
		} catch (error) {
			toast.error('Failed to leave lobby');
			console.error(error);
		}
	}

	async function handleToggleReady() {
		try {
			const activeLobbyId = $lobbyStore.activelobby?.id;
			if (!activeLobbyId) return;

			await toggleReady(supabase, activeLobbyId);
		} catch (error) {
			toast.error('Failed to toggle ready status');
			console.error(error);
		}
	}

	async function handleStartGame() {
		try {
			const activeLobbyId = $lobbyStore.activelobby?.id;
			if (!activeLobbyId) return;

			await startGame(supabase, activeLobbyId);
			// Navigate to game page
			goto(`/game/${activeLobbyId}`);
		} catch (error) {
			toast.error('Failed to start game');
			console.error(error);
		}
	}

	async function handleMakeAdmin(event: CustomEvent<{ playerId: string }>) {
		try {
			const activeLobbyId = $lobbyStore.activelobby?.id;
			if (!activeLobbyId) return;

			await makeAdmin(supabase, activeLobbyId, event.detail.playerId);
			toast.success('Admin rights transferred');
		} catch (error) {
			toast.error('Failed to transfer admin rights');
			console.error(error);
		}
	}
</script>

# src/routes/lobby/+page.svelte
<div class="flex min-h-screen gap-4 bg-gray-100 p-6">
	{#if $lobbyStore.activelobby}
		<ActiveLobby
			lobby={$lobbyStore.activelobby}
			currentUserId={$page.data.session?.user.id}
			isAdmin={$lobbyStore.activelobby.players.find((p) => p.id === $page.data.session?.user.id)
				?.isAdmin || false}
			on:leaveLobby={handleLeaveLobby}
			on:toggleReady={handleToggleReady}
			on:startGame={handleStartGame}
			on:makeAdmin={handleMakeAdmin}
		/>
	{/if}

	<div class="w-96 rounded-lg bg-white p-4 shadow">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-lg font-semibold">
				{$lobbyStore.availableLobbies.length} Active Lobbies
			</h2>
			<Button onclick={() => (createDialogOpen = true)}>New Lobby +</Button>
		</div>

		<div class="space-y-3">
			{#each $lobbyStore.availableLobbies as lobby}
				<LobbyCard {lobby} on:join={() => handleJoinLobby(lobby.id)} />
			{/each}
		</div>
	</div>
</div>

<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create New Lobby</Dialog.Title>
			<Dialog.Description>
				Create a new lobby for players to join. Set a name and choose if it's a practice mode lobby.
			</Dialog.Description>
		</Dialog.Header>

		<form on:submit|preventDefault={handleCreateLobby} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Lobby Name</Label>
				<Input id="name" bind:value={newLobbyName} placeholder="Enter lobby name" required />
			</div>

			<div class="flex items-center justify-between">
				<Label for="practice-mode">Practice Mode</Label>
				<Switch id="practice-mode" bind:checked={isPracticeMode} />
			</div>

			<Dialog.Footer>
				<Button variant="outline" onclick={() => (createDialogOpen = false)}>Cancel</Button>
				<Button type="submit">Create Lobby</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
