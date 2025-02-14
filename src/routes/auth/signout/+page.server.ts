import { redirect, type RequestHandler } from '@sveltejs/kit';

export const load: RequestHandler = async ({ locals: { supabase } }) => {
	const { error } = await supabase.auth.signOut();

	if (error) {
		console.error('Error signing out:', error);
		return new Response(JSON.stringify({ error: 'Failed to sign out' }), {
			status: 500
		});
	}

	throw redirect(303, '/auth');
};
