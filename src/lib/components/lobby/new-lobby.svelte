<script>
	import { Button } from '../ui/button';
	import * as Dialog from '../ui/dialog';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';
	import { Switch } from '../ui/switch';

	export const lobbyDialogState = $state({
		createDialogOpen: false
	});
	export const lobbyDialogActions = $state({
		openNewLobbyDialog: () => {
			lobbyDialogState.createDialogOpen = true;
		},
		openCloseLobbyDialog: () => {
			lobbyDialogState.createDialogOpen = false;
		},
		handleCreateLobby: async () => {}
	});

	const lobbyForm = $state({
		newLobbyName: '',
		isPracticeMode: false
	});
</script>

<Dialog.Root bind:open={lobbyDialogState.createDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create New Lobby</Dialog.Title>
			<Dialog.Description>
				Create a new lobby for players to join. Set a name and choose if it's a practice mode lobby.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={lobbyDialogActions.handleCreateLobby} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Lobby Name</Label>
				<Input
					id="name"
					bind:value={lobbyForm.newLobbyName}
					placeholder="Enter lobby name"
					required
				/>
			</div>

			<div class="flex items-center justify-between">
				<Label for="practice-mode">Practice Mode</Label>
				<Switch id="practice-mode" bind:checked={lobbyForm.isPracticeMode} />
			</div>

			<Dialog.Footer>
				<Button variant="outline" onclick={() => (lobbyDialogState.createDialogOpen = false)}
					>Cancel</Button
				>
				<Button type="submit">Create Lobby</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
