import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // If user is logged in, redirect based on admin status
    if (locals.user) {
        if (locals.user.admin) {
            throw redirect(303, '/admin/dashboard');
        }
        throw redirect(303, '/dashboard/groups');
    }
    
    // Otherwise, redirect to login
    throw redirect(303, '/login');
};