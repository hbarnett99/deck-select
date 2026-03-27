// src/routes/commandzone/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: stats, error } = await supabase
		.from('commander_stats')
		.select('*')
		.order('times_claimed', { ascending: false });

	if (error) console.error('commander_stats load error:', error.message);

	return { stats: stats ?? [] };
};
