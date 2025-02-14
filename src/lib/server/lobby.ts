import type { SupabaseClient } from '@supabase/supabase-js';

export async function createLobby(
	supabase: SupabaseClient,
	{ name, isPractice = false, maxPlayers = 4 }
) {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) throw new Error('Not authenticated');

	const { data: lobby, error: lobbyError } = await supabase
		.from('lobbies')
		.insert({
			name,
			created_by: user.id,
			is_practice: isPractice,
			max_players: maxPlayers
		})
		.select()
		.single();

	if (lobbyError) throw lobbyError;

	// Make creator the admin
	const { error: playerError } = await supabase.from('lobby_players').insert({
		lobby_id: lobby.id,
		user_id: user.id,
		is_admin: true
	});

	if (playerError) throw playerError;

	return lobby;
}

export async function joinLobby(supabase: SupabaseClient, lobbyId: string) {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) throw new Error('Not authenticated');

	// Check if lobby is full
	const { data: lobby } = await supabase
		.from('lobbies')
		.select('*, lobby_players(*)')
		.eq('id', lobbyId)
		.single();

	if (!lobby) throw new Error('Lobby not found');
	if (lobby.lobby_players.length >= lobby.max_players) {
		throw new Error('Lobby is full');
	}

	// Join lobby
	const { error } = await supabase.from('lobby_players').insert({
		lobby_id: lobbyId,
		user_id: user.id
	});

	if (error) throw error;
}

export async function leaveLobby(supabase: SupabaseClient, lobbyId: string) {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) throw new Error('Not authenticated');

	const { error } = await supabase
		.from('lobby_players')
		.delete()
		.eq('lobby_id', lobbyId)
		.eq('user_id', user.id);

	if (error) throw error;

	// Check if lobby is empty and delete if so
	const { data: remainingPlayers } = await supabase
		.from('lobby_players')
		.select('id')
		.eq('lobby_id', lobbyId);

	if (!remainingPlayers?.length) {
		await supabase.from('lobbies').delete().eq('id', lobbyId);
	} else {
		// If leaving player was admin, make the earliest joined player the new admin
		const { data: player } = await supabase
			.from('lobby_players')
			.select('is_admin')
			.eq('lobby_id', lobbyId)
			.eq('user_id', user.id)
			.single();

		if (player?.is_admin) {
			const { data: newAdmin } = await supabase
				.from('lobby_players')
				.select('user_id')
				.eq('lobby_id', lobbyId)
				.order('joined_at', { ascending: true })
				.limit(1)
				.single();

			if (newAdmin) {
				await supabase
					.from('lobby_players')
					.update({ is_admin: true })
					.eq('lobby_id', lobbyId)
					.eq('user_id', newAdmin.user_id);
			}
		}
	}
}

export async function toggleReady(supabase: SupabaseClient, lobbyId: string) {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) throw new Error('Not authenticated');

	// Toggle ready status
	const { data: currentStatus } = await supabase
		.from('lobby_players')
		.select('is_ready')
		.eq('lobby_id', lobbyId)
		.eq('user_id', user.id)
		.single();

	const { error } = await supabase
		.from('lobby_players')
		.update({ is_ready: !currentStatus?.is_ready })
		.eq('lobby_id', lobbyId)
		.eq('user_id', user.id);

	if (error) throw error;
}

export async function startGame(supabase: SupabaseClient, lobbyId: string) {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) throw new Error('Not authenticated');

	// Verify user is admin
	const { data: player } = await supabase
		.from('lobby_players')
		.select('is_admin')
		.eq('lobby_id', lobbyId)
		.eq('user_id', user.id)
		.single();

	if (!player?.is_admin) throw new Error('Only admin can start the game');

	// Check if all players are ready
	const { data: players } = await supabase
		.from('lobby_players')
		.select('is_ready')
		.eq('lobby_id', lobbyId);

	if (!players?.every((p) => p.is_ready)) {
		throw new Error('All players must be ready to start');
	}

	// Start the game
	const { error } = await supabase.from('lobbies').update({ game_started: true }).eq('id', lobbyId);

	if (error) throw error;
}

export async function makeAdmin(supabase: SupabaseClient, lobbyId: string, newAdminId: string) {
	const { error } = await supabase.rpc('make_player_admin', {
		lobby_id: lobbyId,
		target_user_id: newAdminId
	});

	if (error) throw error;
}

// Subscription helper
export function subscribeToLobby(
	supabase: SupabaseClient,
	lobbyId: string,
	callback: (payload: any) => void
) {
	return supabase
		.channel(`lobby:${lobbyId}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'lobby_players',
				filter: `lobby_id=eq.${lobbyId}`
			},
			callback
		)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'lobbies',
				filter: `id=eq.${lobbyId}`
			},
			callback
		)
		.subscribe();
}
