import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
    const { groupId } = params;
    
    // Check if user is authenticated
    if (!locals.user) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    try {
        // Call PocketBase hook directly through the authenticated PocketBase instance
        const pocketbaseUrl = locals.pb.baseURL;
        const endpoint = `/api/invite-link/${groupId}`;
        
        console.log(`🔗 Proxying invite link request to: ${pocketbaseUrl}${endpoint}`);
        
        // Get the current auth token from PocketBase
        const authToken = locals.pb.authStore.token;
        
        const response = await fetch(`${pocketbaseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error(`❌ PocketBase hook error:`, errorData);
            return json(
                { error: errorData.error || 'Failed to create invite link' }, 
                { status: response.status }
            );
        }
        
        const result = await response.json();
        console.log(`✅ Invite link created successfully`);
        
        return json(result);
        
    } catch (err) {
        console.error('❌ API endpoint error:', err);
        return json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
};