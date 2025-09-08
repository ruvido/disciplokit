import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    // Admins should go to admin dashboard
    if (locals.user.role === 'admin') {
        throw redirect(303, '/admin/dashboard');
    }

    // Redirect to profile page as default
    throw redirect(303, '/dashboard/profile');
};