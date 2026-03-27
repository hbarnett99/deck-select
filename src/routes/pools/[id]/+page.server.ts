// src/routes/pools/[id]/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { AddCommanderSchema, RemoveCommanderSchema } from '$lib/schemas/pool';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const [poolResult, commandersResult, form] = await Promise.all([
		supabase.from('pools').select('id, name, created_at').eq('id', params.id).single(),
		supabase
			.from('pool_commanders')
			.select('commander_id, commanders(id, name)')
			.eq('pool_id', params.id)
			.order('added_at', { ascending: false }),
		superValidate(zod4(AddCommanderSchema))
	]);

	if (poolResult.error) error(404, 'Pool not found');

	return {
		pool: poolResult.data,
		commanders: commandersResult.data ?? [],
		form
	};
};

export const actions: Actions = {
	add: async ({ request, params, locals: { supabase, user } }) => {
		const form = await superValidate(request, zod4(AddCommanderSchema));
		if (!form.valid) return fail(400, { form });
		if (!user) return fail(401, { form });

		const userId = user.id;
		const poolId = params.id;
		const commanderName = form.data.commanderName;

		// Attempt insert; on unique violation the commander already exists
		const { data: inserted, error: insertError } = await supabase
			.from('commanders')
			.insert({ name: commanderName, created_by: userId })
			.select('id')
			.single();

		let commanderId: string;

		if (insertError) {
			if (insertError.code === '23505') {
				// Commander exists — look it up by name
				const { data: existing, error: selectError } = await supabase
					.from('commanders')
					.select('id')
					.eq('name', commanderName)
					.single();
				if (selectError || !existing) return fail(500, { form });
				commanderId = existing.id;
			} else {
				console.error('commander insert error:', insertError.message);
				return fail(500, { form });
			}
		} else {
			commanderId = inserted.id;
		}

		// Add commander to this pool
		const { error: junctionError } = await supabase
			.from('pool_commanders')
			.insert({ pool_id: poolId, commander_id: commanderId, added_by: userId });

		if (junctionError) {
			if (junctionError.code === '23505') {
				return fail(400, { form, message: 'Commander is already in this pool' });
			}
			console.error('pool_commanders insert error:', junctionError.message);
			return fail(500, { form });
		}

		return { form };
	},

	remove: async ({ request, params, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(RemoveCommanderSchema));
		if (!form.valid) return fail(400);

		const { error: deleteError } = await supabase
			.from('pool_commanders')
			.delete()
			.eq('pool_id', params.id)
			.eq('commander_id', form.data.commanderId);

		if (deleteError) {
			console.error('pool_commanders delete error:', deleteError.message);
			return fail(500);
		}

		return {};
	}
};
