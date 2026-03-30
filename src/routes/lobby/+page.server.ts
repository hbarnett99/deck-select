import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { CreateLobbySchema } from '$lib/schemas/lobby';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [lobbiesResult, poolsResult, form] = await Promise.all([
		supabase
			.from('lobbies')
			.select('id, name, practice_mode, status, pools(name), lobby_players(id)')
			.eq('status', 'waiting')
			.order('created_at', { ascending: false }),
		supabase
			.from('pools')
			.select('id, name')
			.order('name', { ascending: true }),
		superValidate(zod4(CreateLobbySchema))
	]);

	if (lobbiesResult.error) console.error('lobbies load error:', lobbiesResult.error.message);
	if (poolsResult.error) console.error('pools load error:', poolsResult.error.message);

	return {
		lobbies: lobbiesResult.data ?? [],
		pools: poolsResult.data ?? [],
		form
	};
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase, user } }) => {
		const form = await superValidate(request, zod4(CreateLobbySchema));
		if (!form.valid) return fail(400, { form });
		if (!user) return fail(401, { form });

		const { data: lobby, error: lobbyError } = await supabase
			.from('lobbies')
			.insert({
				name: form.data.name,
				pool_id: form.data.pool_id,
				practice_mode: form.data.practice_mode,
				admin_id: user.id,
				status: 'waiting'
			})
			.select('id')
			.single();

		if (lobbyError) {
			console.error('create lobby error:', lobbyError.message);
			return fail(500, { form });
		}

		const { error: playerError } = await supabase.from('lobby_players').insert({
			lobby_id: lobby.id,
			user_id: user.id,
			is_ready: false
		});

		if (playerError) {
			console.error('insert creator into lobby_players error:', playerError.message);
			await supabase.from('lobbies').delete().eq('id', lobby.id);
			return fail(500, { form });
		}

		redirect(303, `/lobby/${lobby.id}`);
	}
};
