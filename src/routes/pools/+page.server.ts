// src/routes/pools/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { CreatePoolSchema } from '$lib/schemas/pool';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [poolsResult, form] = await Promise.all([
		supabase
			.from('pools')
			.select('id, name, created_at, pool_commanders(commander_id)')
			.order('created_at', { ascending: false }),
		superValidate(zod(CreatePoolSchema))
	]);

	if (poolsResult.error) console.error('pools load error:', poolsResult.error.message);

	return {
		pools: poolsResult.data ?? [],
		form
	};
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase, user } }) => {
		const form = await superValidate(request, zod(CreatePoolSchema));
		if (!form.valid) return fail(400, { form });
		if (!user) return fail(401, { form });

		const { data: pool, error } = await supabase
			.from('pools')
			.insert({ name: form.data.name, created_by: user.id })
			.select('id')
			.single();

		if (error) {
			console.error('create pool error:', error.message);
			return fail(500, { form });
		}

		redirect(303, `/pools/${pool.id}`);
	}
};
