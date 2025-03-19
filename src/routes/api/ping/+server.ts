// src/routes/api/ping/+server.ts
import { CRON_SECRET } from '$env/static/private';
import { pingDatabase } from '$lib/utils/ping.util';
import { json } from '@sveltejs/kit';

export async function GET({ locals: { supabase }, request }) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    console.log('Starting ping operation');

    try {
        const result = await pingDatabase(supabase);

        console.log('Successfully pinged DB, response:', result);

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
