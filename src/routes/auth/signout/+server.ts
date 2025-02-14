// src/routes/signout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase } }) => {
	const { error } = await supabase.auth.signOut();

	if (error) {
		return new Response(JSON.stringify({ error: 'Failed to sign out' }), {
			status: 500
		});
	}

	throw redirect(303, '/auth');
};
