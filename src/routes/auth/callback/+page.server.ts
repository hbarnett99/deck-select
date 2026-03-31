import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error('exchangeCodeForSession error:', error.message);
			throw redirect(303, `/auth/error?message=${encodeURIComponent(error.message)}`);
		}
	}

	throw redirect(303, '/');
};
