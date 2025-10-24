import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    try {
        // Get user's groups via API
        const myGroupsResponse = await fetch(`${locals.pb.baseURL}/api/my-groups`, {
            headers: { 'Authorization': locals.pb.authStore.token }
        });

        const myGroupsData = await myGroupsResponse.json();
        const userGroups = myGroupsData.success ? myGroupsData.groups || [] : [];

        return {
            user: locals.user,
            userGroups
        };
    } catch (error) {
        console.error('Error loading groups:', error);
        return {
            user: locals.user,
            userGroups: []
        };
    }
};

export const actions: Actions = {
    leave: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Not authenticated' });
        }

        const formData = await request.formData();
        const groupId = formData.get('groupId') as string;

        if (!groupId) {
            return fail(400, { error: 'Group ID required' });
        }

        try {
            const response = await fetch(`${locals.pb.baseURL}/api/leave-group`, {
                method: 'POST',
                headers: {
                    'Authorization': locals.pb.authStore.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ groupId })
            });

            const result = await response.json();

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return fail(400, { error: result.error });
            }
        } catch (error) {
            return fail(500, { error: 'Network error. Please try again.' });
        }
    },

    sync: async ({ locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Not authenticated' });
        }

        if (!locals.user.telegram?.id) {
            return fail(400, { error: 'Telegram not connected' });
        }

        try {
            const botUrl = `http://localhost:${process.env.BOT_PORT}`;

            const response = await fetch(`${botUrl}/sync-user-groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: locals.user.id,
                    telegram_id: locals.user.telegram.id
                })
            });

            const result = await response.json();

            if (result.success) {
                const count = result.groups_added?.length || 0;
                return {
                    success: true,
                    message: count > 0
                        ? `Successfully synced ${count} group${count !== 1 ? 's' : ''}`
                        : 'All groups are up to date'
                };
            } else {
                return fail(500, { error: 'Sync failed' });
            }
        } catch (error) {
            console.error('Sync error:', error);
            return fail(500, { error: 'Network error during sync' });
        }
    }
};