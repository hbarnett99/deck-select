import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';
import type { Session, User } from '@supabase/supabase-js';

// Define the return type for safeGetSession
interface SafeSession {
	session: Session | null;
	user: User | null;
}

// Supabase handler
const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, {
							...options,
							path: '/',
							// Add secure options for production
							secure: process.env.NODE_ENV === 'production',
							sameSite: 'lax'
						});
					});
				}
			}
		}
	);

	/**
	 * Enhanced session validation that checks both session and user JWT
	 */
	event.locals.safeGetSession = async (): Promise<SafeSession> => {
		const {
			data: { session },
			error: sessionError
		} = await event.locals.supabase.auth.getSession();

		if (sessionError || !session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error: userError
		} = await event.locals.supabase.auth.getUser();

		if (userError) {
			console.error('JWT validation failed:', userError);
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

// Auth guard handler
const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const isValidRoute =
		(event.url.pathname.startsWith('/auth') 
    && !event.url.pathname.endsWith('/signout')) 
    || event.url.pathname.startsWith('/api/ping');
	const isAuthenticated = !!session;

	// Protected routes handling
	if (!isValidRoute && !isAuthenticated) {
		throw redirect(303, '/auth');
	}

	// Prevent authenticated users from accessing auth routes
	if (isAuthenticated && isValidRoute) {
		throw redirect(303, '/');
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);

// Type declarations for app-wide use
