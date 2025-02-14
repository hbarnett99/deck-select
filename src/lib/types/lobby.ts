export interface Profile {
	id: string;
	username: string | null;
}

export interface LobbyPlayer {
	id: string;
	lobby_id: string;
	user_id: string;
	is_admin: boolean;
	is_ready: boolean;
	joined_at: string;
	profiles?: Profile;
}

export interface Lobby {
	id: string;
	name: string;
	created_at: string;
	created_by: string;
	is_practice: boolean;
	max_players: number;
	game_started: boolean;
	settings: Record<string, unknown>;
	updated_at: string;
	lobby_players?: LobbyPlayer[];
}

export interface LobbyStore {
	activelobby: Lobby | null;
	availableLobbies: Lobby[];
	refreshLobbies: () => Promise<void>;
}
