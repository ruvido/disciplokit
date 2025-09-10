import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth-guards';

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event);

    // Admins should go to admin dashboard
    if (user.role === 'admin') {
        throw redirect(303, '/admin/dashboard');
    }

    // Redirect to profile page as default
    throw redirect(303, '/dashboard/profile');
};