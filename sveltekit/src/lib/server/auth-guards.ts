import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Ensure user is authenticated
 */
export function requireAuth(event: RequestEvent, redirectTo = '/login') {
    if (!event.locals.user) {
        throw redirect(303, redirectTo);
    }
    return event.locals.user;
}

/**
 * Ensure user is admin (using admin boolean field)
 */
export function requireAdmin(event: RequestEvent) {
    const user = requireAuth(event);

    if (!user.admin) {
        throw error(403, 'Access Denied - Admin rights required');
    }

    return user;
}

/**
 * Ensure user is admin or moderator
 */
export function requireStaff(event: RequestEvent) {
    const user = requireAuth(event);

    if (!user.admin) {
        throw error(403, 'Access Denied - Staff rights required');
    }

    return user;
}

/**
 * Get user if authenticated, null otherwise (no redirect)
 */
export function getUser(event: RequestEvent) {
    return event.locals.user || null;
}

/**
 * Redirect authenticated users away from auth pages
 */
export function requireGuest(event: RequestEvent, redirectTo = '/dashboard/groups') {
    if (event.locals.user) {
        // Redirect admins to their specific dashboard
        if (event.locals.user.admin) {
            throw redirect(303, '/admin/dashboard');
        }
        throw redirect(303, redirectTo);
    }
}