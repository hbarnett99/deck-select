import type { SupabaseClient } from "@supabase/supabase-js";
import { da } from "date-fns/locale";

export async function pingDatabase(supabase: SupabaseClient) {
    const pingDateTime = new Date().toISOString();

    try {
        console.log('Pinging Supabase at:', pingDateTime);

        // Simple query to ping the database - replace 'your_table_name' with an actual table
        // const { data, error } = await supabase
        // 	.from('ping')
        // 	.select('*', { count: 'exact' }) // Use '*' to select all rows
        // 	.limit(1); // Limit to 1 row

        // Simple query to ping the database - replace 'your_table_name' with an actual table
        const { data, error } = await supabase
            .from('ping')
            .update({ last_pinged_at: pingDateTime })
            .match({ id: 1 });

        console.log('Ping response:', data);

        if (error) {
            console.error('Error pinging database:', error);
            return data;
        } else {
            console.log('Successfully pinged DB');
            console.log('Ping successful! Database is active.');
            console.log('Timestamp:', pingDateTime);
            return error;
        }

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}
