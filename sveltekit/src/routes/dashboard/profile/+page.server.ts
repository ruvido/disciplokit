import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    // Get user's full record (works for both admins and members)
    try {
        const user = await locals.pb.collection('members').getOne(locals.user.id);
        
        return {
            user: user
        };
    } catch (err) {
        console.error('Error fetching user data:', err);
        return {
            user: locals.user
        };
    }
};