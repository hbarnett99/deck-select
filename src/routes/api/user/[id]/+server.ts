import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	const serviceClient = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
		auth: { persistSession: false }
	});

	const { data, error: rpcError } = await serviceClient.auth.admin.getUserById(id);

	if (rpcError || !data.user) {
		throw error(404, 'User not found');
	}

	const meta = data.user.user_metadata ?? {};
	return json({
		username: (meta.global_name ?? meta.full_name ?? 'Unknown') as string,
		avatar_url: (meta.avatar_url ?? null) as string | null
	});
};
