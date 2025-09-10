import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth-guards';

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event);

    // Get user's full record (works for both admins and members)
    try {
        const fullUser = await event.locals.pb.collection('members').getOne(user.id);
        
        return {
            user: fullUser
        };
    } catch (err) {
        console.error('Error fetching user data:', err);
        return {
            user: user
        };
    }
};