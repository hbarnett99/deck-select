import { pingDatabase } from '$lib/utils/ping.util';

// export const load = async ({ locals: { supabase } }) => {
// 	console.log('Loading ping page');
// 	pingDatabase(supabase)
// 		.then(() => console.log('Ping successful!'))
// 		.catch(() => console.error('Ping failed!'));
// 	return;
// };

// Vercel Serverless Functions require the keyword GET, however this also posts.
export async function GET({ locals: { supabase } }) {
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
