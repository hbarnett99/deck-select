import { pingDatabase } from '$lib/utils/ping.util';

export const load = async ({ locals: { supabase } }) => {
	console.log('Loading ping page');
	pingDatabase(supabase)
		.then(() => console.log('Ping successful!'))
		.catch(() => console.error('Ping failed!'));
	return;
};
