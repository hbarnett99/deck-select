import { pingDatabase } from '$lib/utils/ping.util';

// export const load = async ({ locals: { supabase } }) => {
// 	console.log('Loading ping page');
// 	pingDatabase(supabase)
// 		.then(() => console.log('Ping successful!'))
// 		.catch(() => console.error('Ping failed!'));
// 	return;
// };

export async function POST({ locals: { supabase } }) {
	console.log('Loading ping page');
	let response = 'No response';
	pingDatabase(supabase)
		.then(() => {
			console.log('Ping successful!');
			response = 'Ping successful!';
		})
		.catch(() => {
			console.error('Ping failed!');
			response = 'Ping failed!';
		});
	return new Response(response);
}
