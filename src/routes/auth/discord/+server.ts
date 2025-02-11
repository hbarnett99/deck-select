import { redirect } from "@sveltejs/kit";

const signInWithDiscord = async ({locals: { supabase }}) => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: 'http://localhost:5173/auth/callback'
        }
    });
    if (error) {
        console.error(error);
        redirect(303, '/auth/error');
    } else {
        redirect(303, '/private');
    }
}