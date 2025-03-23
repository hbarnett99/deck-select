<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import* as Dialog from '$lib/components/ui/dialog';
	import { Plus } from 'lucide-svelte';

	export const lobbySettingsDialogState = $state({
		createDialogOpen: false
	});
	export const lobbySettingsDialogActions = {
		openCreateDialog: () => {
			lobbySettingsDialogState.createDialogOpen = true;
		},
		closeCreateDialog: () => {
			lobbySettingsDialogState.createDialogOpen = false;
		},
		handleChangeSettings: async (newSettings: any) => {}
	};

	const settignsForm = $state({});
</script>

<Dialog.Root bind:open={lobbySettingsDialogState.createDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Lobby Settings</Dialog.Title>
			<!-- <Dialog.Description>
				Create a new lobby for players to join. Set a name and choose if it's a practice mode lobby.
			</Dialog.Description> -->
		</Dialog.Header>

		<form onsubmit={lobbySettingsDialogActions.handleChangeSettings} class="space-y-4">
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => (lobbySettingsDialogState.createDialogOpen = false)}
				>
					Cancel
				</Button>
				<Button type="submit">Create Lobby</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
