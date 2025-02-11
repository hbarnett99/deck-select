import type { Provider, SupabaseClient } from '@supabase/supabase-js';
import type { RequestEvent } from '@sveltejs/kit';

type SupabaseLocals = { locals: { supabase: SupabaseClient } };

const handleAuthError = (error: Error | null) => {
	if (error) {
		console.error(error);
		return {
			type: 'redirect' as const,
			location: '/auth/error'
		};
	}
	return null;
};

export const signInWithOAuth = async (provider: Provider, { locals: { supabase } }: SupabaseLocals) => {
	console.log(`Signing in with ${provider}...`);
	const { error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: 'http://localhost:5173/auth/callback'
		}
	});
	console.log(`Sign in with ${provider} complete.`);

	const errorResponse = handleAuthError(error);
	if (errorResponse) return errorResponse;

	return {
		type: 'redirect' as const,
		location: '/private'
	};
};

// Create a map of provider functions
export const providers = {
	discord: (event: RequestEvent) => signInWithOAuth('discord', event),
	google: (event: RequestEvent) => signInWithOAuth('google', event),
	github: (event: RequestEvent) => signInWithOAuth('github', event),
	apple: (event: RequestEvent) => signInWithOAuth('apple', event),
	twitch: (event: RequestEvent) => signInWithOAuth('twitch', event),
	spotify: (event: RequestEvent) => signInWithOAuth('spotify', event)
} as const;