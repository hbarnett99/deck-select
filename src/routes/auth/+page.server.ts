// +page.server.ts
import type { Actions } from './$types';
import { providers } from '$lib/utils/oauth.util';
import { redirect } from '@sveltejs/kit';

interface AuthFormData {
	email: string;
	password: string;
}

const getFormData = async (request: Request): Promise<AuthFormData> => {
	const formData = await request.formData();
	return {
		email: formData.get('email') as string,
		password: formData.get('password') as string
	};
};

const handleCredentials = async (
	action: (data: AuthFormData) => Promise<{ error: Error | null }>,
	request: Request
) => {
	const data = await getFormData(request);
	const { error } = await action(data);

	if (error) {
		console.error(error);
		throw redirect(303, '/auth/error');
	}

	throw redirect(303, '/private');
};

export const actions: Actions = {
	signup: async (event) => {
		const {
			request,
			locals: { supabase }
		} = event;
		return handleCredentials((data) => supabase.auth.signUp(data), request);
	},

	login: async (event) => {
		const {
			request,
			locals: { supabase }
		} = event;
		return handleCredentials((data) => supabase.auth.signInWithPassword(data), request);
	},

	oauthDiscord: async (event) => providers.discord(event),
	oauthGoogle: async (event) => providers.google(event),

	checkAuth: async (event) => {
		const { locals } = event;
		const user = (await locals.supabase.auth.getSession()).data.session;

		console.log('User session:', user);
	}
};
