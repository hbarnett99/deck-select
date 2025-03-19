// src/lib/utils/ping.util.ts
import type { SupabaseClient } from '@supabase/supabase-js';

export async function pingDatabase(supabase: SupabaseClient) {
	const pingDateTime = new Date().toISOString();

	try {
		console.log('Pinging Supabase at:', pingDateTime);

		// Update the ping record
		const { data, error } = await supabase
			.from('ping')
			.update({ last_pinged_at: pingDateTime })
			.eq('id', 1)
			.select()
			.single();

		if (error) {
			throw error;
		}

	} catch (err) {
		throw err; // Re-throw the error to be caught by the caller
	}
}
