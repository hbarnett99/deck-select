import type { PageServerLoad } from '../../../../.svelte-kit/types/src/routes/$types';
import { providers } from '$lib/utils/oauth.util';
import type { RequestEvent } from '@sveltejs/kit';

export const load: PageServerLoad = async (event: RequestEvent) => {
	await providers.discord(event);
};
