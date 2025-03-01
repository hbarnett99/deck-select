// scripts/ping-supabase.js
import { createClient } from '@supabase/supabase-js';

// This script is designed to run in GitHub Actions, not as part of the SvelteKit app
// It uses process.env because it runs in Node.js directly, not in the SvelteKit context
async function pingDatabase() {
	try {
		// Initialize Supabase client with environment variables
		// For GitHub Actions, we use process.env directly
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error('Missing Supabase URL or Key in environment variables');
	}

	const supabase = createClient(supabaseUrl, supabaseKey);

		console.log('Pinging Supabase at:', new Date().toISOString());

		// Simple query to ping the database - replace 'your_table_name' with an actual table
		const { data, error } = await supabase
			.from('ping')
			.select('*', { count: 'exact' }) // Use '*' to select all rows
			.limit(1); // Limit to 1 row

		if (error) {
			console.error('Error pinging database:', error);
		} else {
			console.log('Successfully pinged DB'); 
		}

		console.log('Ping successful! Database is active.');
		console.log('Timestamp:', new Date().toISOString());
	} catch (err) {
		console.error('Unexpected error:', err);
		process.exit(1);
	}
}

pingDatabase();
