import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

/**
 * Returns true if the given user ID exists in the whitelisted_users table.
 * Accepts the caller's supabase client — RLS on whitelisted_users allows
 * any authenticated user to perform this select.
 */
export async function isWhitelisted(
	supabase: SupabaseClient<Database>,
	userId: string
): Promise<boolean> {
	const { data, error } = await supabase
		.from('whitelisted_users')
		.select('user_id')
		.eq('user_id', userId)
		.maybeSingle();

	if (error) {
		console.error('Whitelist check failed:', error.message);
		return false;
	}

	return data !== null;
}
