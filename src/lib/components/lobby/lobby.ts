export const lobbyDialogState = $state({
	createDialogOpen: false
});
export const lobbyDialogActions = {
	openCreateDialog: () => {
		lobbyDialogState.createDialogOpen = true;
	},
	closeCreateDialog: () => {
		lobbyDialogState.createDialogOpen = false;
	},
	handleCreateLobby: async (newLobby: any) => {}
};
