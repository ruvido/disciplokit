// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth-guards';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
    const user = requireAuth(event);

    // Admins should go to admin dashboard
    if (user.admin) {
        throw redirect(303, '/admin/dashboard');
    }

    // Redirect to profile page as default
    throw redirect(303, '/dashboard/groups');
};