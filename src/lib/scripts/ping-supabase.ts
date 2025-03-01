import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";

// scripts/ping-supabase.js
const { createClient } = require('@supabase/supabase-js');

async function pingDatabase() {
	try {
		// Initialize Supabase client with environment variables
		const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

		console.log('Pinging Supabase at:', new Date().toISOString());

		// Simple query to ping the database - replace 'your_table_name' with an actual table
		const { data, error } = await supabase
			.from('your_table_name')
			.select('count(*)', { count: 'exact' })
			.limit(1);

		if (error) {
			console.error('Error pinging database:', error.message);
			process.exit(1);
		}

		console.log('Ping successful! Database is active.');
		console.log('Timestamp:', new Date().toISOString());
	} catch (err) {
		console.error('Unexpected error:', err);
		process.exit(1);
	}
}

pingDatabase();
