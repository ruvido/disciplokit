import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth-guards';
import { getEnhancedClient } from '$lib/server/pocketbase-client';

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event);
    const client = getEnhancedClient(event);

    // Get user's full record with profile context
    try {
        const fullUser = await client.getOne('members', user.id, {
            context: 'profile',
            timeoutMs: 3000,
            fields: '*' // Explicitly request all fields including JSON fields
        });


        return {
            user: fullUser
        };
    } catch (err) {
        console.error('Error fetching user data:', err);
        return {
            user: user,
            loadError: 'Impossibile caricare i dati del profilo.'
        };
    }
};