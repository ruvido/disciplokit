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
 * Ensure user has specific role
 */
export function requireRole(event: RequestEvent, allowedRoles: string[], redirectTo = '/login') {
    const user = requireAuth(event, redirectTo);
    
    if (!allowedRoles.includes(user.role)) {
        throw error(403, 'Access Denied');
    }
    
    return user;
}

/**
 * Ensure user is admin
 */
export function requireAdmin(event: RequestEvent) {
    return requireRole(event, ['admin']);
}

/**
 * Ensure user is admin or moderator
 */
export function requireStaff(event: RequestEvent) {
    return requireRole(event, ['admin', 'moderator']);
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
export function requireGuest(event: RequestEvent, redirectTo = '/dashboard/profile') {
    if (event.locals.user) {
        // Redirect admins to their specific dashboard
        if (event.locals.user.role === 'admin') {
            throw redirect(303, '/admin/dashboard');
        }
        throw redirect(303, redirectTo);
    }
}