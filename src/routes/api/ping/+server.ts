// src/routes/api/ping/+server.ts
import { pingDatabase } from '$lib/utils/ping.util';

export async function GET({ locals: { supabase } }) {
  console.log('Loading ping page');
  
  try {
    // Await the promise completion before sending a response
    await pingDatabase(supabase);
    console.log('Ping successful!');
    return new Response('Ping successful!', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Ping failed!', error);
    return new Response('Ping failed: ' + (error instanceof Error ? error.message : String(error)), {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
