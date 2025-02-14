import { writable } from 'svelte/store';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface Player {
	id: string;
	name: string;
	isReady: boolean;
	isAdmin: boolean;
}

export interface Lobby {
	id: string;
	name: string;
	createdAt: Date;
	isPractice: boolean;
	maxPlayers: number;
	gameStarted: boolean;
	players: Player[];
}

function createLobbyStore() {
	const { subscribe, set, update } = writable<{
		activelobby: Lobby | null;
		availableLobbies: Lobby[];
	}>({
		activelobby: null,
		availableLobbies: []
	});

	let supabaseClient: SupabaseClient;

	return {
		subscribe,
		init: (supabase: SupabaseClient) => {
			supabaseClient = supabase;
			// Subscribe to lobby updates
			supabase
				.channel('lobbies')
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'lobbies'
					},
					() => {
						// Refresh lobbies list
						refreshLobbies();
					}
				)
				.subscribe();
		},
		setActiveLobby: (lobby: Lobby | null) => {
			update((state) => ({ ...state, activelobby: lobby }));
		},
		refreshLobbies: async () => {
			if (!supabaseClient) return;

			const { data: lobbies } = await supabaseClient
				.from('lobbies')
				.select(
					`
          id,
          name,
          created_at,
          is_practice,
          max_players,
          game_started,
          lobby_players (
            user_id,
            is_ready,
            is_admin,
            profiles:user_id (
              username
            )
          )
        `
				)
				.eq('game_started', false);

			if (lobbies) {
				const formattedLobbies = lobbies.map((lobby) => ({
					id: lobby.id,
					name: lobby.name,
					createdAt: new Date(lobby.created_at),
					isPractice: lobby.is_practice,
					maxPlayers: lobby.max_players,
					gameStarted: lobby.game_started,
					players: lobby.lobby_players.map((player) => ({
						id: player.user_id,
						name: player.profiles.username,
						isReady: player.is_ready,
						isAdmin: player.is_admin
					}))
				}));

				update((state) => ({
					...state,
					availableLobbies: formattedLobbies
				}));
			}
		}
	};
}

export const lobbyStore = createLobbyStore();
