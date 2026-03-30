// src/routes/lobby/[id]/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';

function serviceClient() {
	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});
}

async function discordMeta(userId: string): Promise<{ username: string; avatar_url: string | null }> {
	const { data, error: err } = await serviceClient().auth.admin.getUserById(userId);
	if (err || !data.user) return { username: 'Unknown', avatar_url: null };
	const meta = data.user.user_metadata ?? {};
	return {
		username: (meta.global_name ?? meta.full_name ?? 'Unknown') as string,
		avatar_url: (meta.avatar_url ?? null) as string | null
	};
}

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	if (!user) redirect(303, '/auth');

	const { id } = params;

	// Fetch lobby
	const { data: lobby, error: lobbyError } = await supabase
		.from('lobbies')
		.select('id, name, practice_mode, status, admin_id, pools(name)')
		.eq('id', id)
		.single();

	if (lobbyError || !lobby) throw error(404, 'Lobby not found');

	// Auto-join: only join waiting lobbies (not mid-draw or complete)
	if (lobby.status === 'waiting') {
		await supabase.from('lobby_players').upsert(
			{ lobby_id: id, user_id: user.id, is_ready: false },
			{ onConflict: 'lobby_id,user_id', ignoreDuplicates: true }
		);
	}

	// Fetch all players after potential insert
	const { data: playerRows } = await supabase
		.from('lobby_players')
		.select('id, user_id, is_ready, commander_id, joined_at')
		.eq('lobby_id', id)
		.order('joined_at', { ascending: true });

	// Resolve Discord metadata in parallel
	const players = await Promise.all(
		(playerRows ?? []).map(async (p) => {
			const meta = await discordMeta(p.user_id);
			return { ...p, ...meta };
		})
	);

	return {
		lobby,
		players,
		isAdmin: lobby.admin_id === user.id,
		currentUserId: user.id
	};
};

export const actions: Actions = {
	ready: async ({ params, locals: { supabase, user } }) => {
		if (!user) return fail(401);
		const { id } = params;

		// Fetch current is_ready
		const { data: row } = await supabase
			.from('lobby_players')
			.select('is_ready')
			.eq('lobby_id', id)
			.eq('user_id', user.id)
			.single();

		if (!row) return fail(404);

		const { error: updateError } = await supabase
			.from('lobby_players')
			.update({ is_ready: !row.is_ready })
			.eq('lobby_id', id)
			.eq('user_id', user.id);

		if (updateError) {
			console.error('ready toggle error:', updateError.message);
			return fail(500);
		}

		return { success: true };
	},

	leave: async ({ params, locals: { supabase, user } }) => {
		if (!user) return fail(401);
		const { id } = params;

		// Check if user is the admin — admin cannot leave
		const { data: lobbyRow } = await supabase
			.from('lobbies')
			.select('admin_id')
			.eq('id', id)
			.single();

		if (lobbyRow?.admin_id === user.id) {
			return fail(400, { message: 'Admin cannot leave. Close the lobby instead.' });
		}

		// Delete current user from lobby
		const { error: deleteError } = await supabase
			.from('lobby_players')
			.delete()
			.eq('lobby_id', id)
			.eq('user_id', user.id);

		if (deleteError) {
			console.error('leave error:', deleteError.message);
			return fail(500);
		}

		// Reset remaining players' ready status (requires service role to bypass RLS)
		await serviceClient()
			.from('lobby_players')
			.update({ is_ready: false })
			.eq('lobby_id', id)
			.neq('user_id', user.id);

		redirect(303, '/lobby');
	}
};
