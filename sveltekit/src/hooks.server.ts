import type { Handle } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
    // Load auth store from cookie
    pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    // Refresh auth if valid
    try {
        if (pb.authStore.isValid) {
            await pb.collection('members').authRefresh();
        }
    } catch {
        pb.authStore.clear();
    }

    // Pass auth info to the app
    event.locals.pb = pb;
    event.locals.user = pb.authStore.model;

    const response = await resolve(event);

    // Set auth cookie
    response.headers.set('set-cookie', pb.authStore.exportToCookie({
        httpOnly: true,
        secure: event.url.protocol === 'https:',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    }));

    return response;
};