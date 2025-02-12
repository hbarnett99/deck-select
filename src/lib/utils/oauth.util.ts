// oauth.util.ts
import type { Provider, SupabaseClient } from '@supabase/supabase-js';
import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

type SupabaseLocals = { locals: { supabase: SupabaseClient } };

export const signInWithOAuth = async (provider: Provider, { locals: { supabase } }: SupabaseLocals) => {
	// console.log(`Initiating OAuth flow for ${provider}...`);

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: 'http://localhost:5173/auth/callback',
			scopes: provider === 'discord' ? 'identify email' : undefined
		}
	});

	// console.log('OAuth response:', {
	// 	data: data || 'No data returned',
	// 	error: error || 'No error returned',
	// 	provider,
	// 	url: data?.url || 'No URL returned'
	// });

	if (error) {
		console.error('OAuth error:', error);
		throw redirect(303, '/auth/error');
	}

	if (!data?.url) {
		console.error('No redirect URL received from Supabase');
		throw redirect(303, '/auth/error');
	}

	console.log(`Successfully initiated OAuth flow with ${provider}`);

	throw redirect(303, data.url);
};

// Create a map of provider functions
export const providers = {
	discord: (event: RequestEvent) => signInWithOAuth('discord', event),
	google: (event: RequestEvent) => signInWithOAuth('google', event),
} as const;