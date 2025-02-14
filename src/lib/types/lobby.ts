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

export interface LobbySettings {
	practiceModeEnabled: boolean;
	maxPlayers: number;
	// Add more settings as needed
}

export interface CreateLobbyParams {
	name: string;
	isPractice?: boolean;
	maxPlayers?: number;
}

// Database types
export interface DBLobby {
	id: string;
	name: string;
	created_at: string;
	created_by: string;
	is_practice: boolean;
	max_players: number;
	game_started: boolean;
	settings: LobbySettings;
	updated_at: string;
}

export interface DBLobbyPlayer {
	id: string;
	lobby_id: string;
	user_id: string;
	is_admin: boolean;
	is_ready: boolean;
	joined_at: string;
}

// Event types
export interface LobbyEvent {
	type: 'player_joined' | 'player_left' | 'player_ready' | 'game_started' | 'admin_changed';
	lobbyId: string;
	playerId: string;
	timestamp: Date;
}
