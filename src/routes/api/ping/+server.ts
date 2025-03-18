// src/routes/api/ping/+server.ts
import { pingDatabase } from '$lib/utils/ping.util';
import { json } from '@sveltejs/kit';

export async function POST({ locals: { supabase } }) {
    console.log('Starting ping operation');
    
    try {
        const result = await pingDatabase(supabase);
        
        console.log('Ping successful with result:', result);
        
        return json({
            success: true,
            message: 'Ping successful!',
            data: result
        });
    } catch (error) {
        console.error('Ping failed:', error);
        
        return json({
            success: false,
            message: 'Ping failed',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
