import type { Tables } from './database.types';

export type Lobby = Tables<'lobbies'> & {
	lobby_players?: LobbyPlayer[];
};

export type LobbyPlayer = Tables<'lobby_players'>;

export type LobbyStatus = 'waiting' | 'drawing' | 'complete';
