<script lang="ts">
	import LobbyCard from '$lib/components/lobby/lobby-card.svelte';
	import NewLobby from '$lib/components/lobby/new-lobby.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Plus, Scroll, Settings } from 'lucide-svelte';

	const currentLobby = $state(null);
	const isHost = $derived(currentLobby?.isHost);

	$inspect({ currentLobby, isHost });

	const lobbies = [1, 1, 1, 1, 1];

	let isDialogOpen = $state(false);

	const handleOpen = () => {
		isDialogOpen = true;
	};

	const handleCreateLobby = (data) => {
		// Handle lobby creation logic here
		console.log('Creating lobby:', data);
		isDialogOpen = false;
	};

	const handleClose = () => {
		isDialogOpen = false;
	};

	let dialog: NewLobby;
</script>

<Card class="grid h-[calc(100vh-108px)] w-full grid-cols-[1fr_auto_1fr] gap-4 p-4">
	<div>
		<Card class="flex flex-1 items-center justify-between gap-4 p-2 pl-4">
			<p>a</p>
			<p>c</p>
			<p>b</p>
			<Tooltip.Provider delayDuration={0} disabled={!isHost}>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button onclick={handleOpen} variant="secondary" size="icon" disabled={!isHost}>
							<Settings />
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom">
						<p>Lobby Settings</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</Card>
		{#if !currentLobby}
			<div class="flex h-full items-center justify-center p-2 space-x-4">
				<p class="italic text-gray-500">You are not in a lobby.</p>
				<Button onclick={() => dialog.lobbyDialogActions.openCreateDialog()}>
					<Plus />
					New Lobby
				</Button>
			</div>
		{:else}
			<LobbyCard />
		{/if}
	</div>
	<Separator orientation="vertical" />
	<div class="grid flex-1 gap-4">
		<div class="grid grid-cols-1 gap-2">
			<div class="flex items-center gap-4">
				<Input placeholder="Search" />
				<p class="whitespace-nowrap italic text-gray-500"># of {lobbies.length} active lobbies</p>
			</div>
			<div class="flex h-[calc(100vh-184px)] flex-col gap-4">
				<ScrollArea class="h-full w-full">
					<div class="grid gap-2">
						{#each lobbies as lobby}
							<LobbyCard />
						{/each}
					</div>
				</ScrollArea>
			</div>
		</div>
	</div>
</Card>

<NewLobby bind:this={dialog} />
