// @ts-nocheck
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
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

        // Get all available groups
        const allGroups = await locals.pb.collection('groups').getFullList({
            sort: '-created'
        });

        // Filter out groups user is already in
        const userGroupIds = userGroups.map(g => g.id);
        const availableGroups = allGroups.filter(g => !userGroupIds.includes(g.id));

        return {
            user: locals.user,
            userGroups,
            availableGroups: availableGroups.map(group => ({
                id: group.id,
                name: group.name,
                data: group.data || {},
                created: group.created
            }))
        };
    } catch (error) {
        console.error('Error loading groups:', error);
        return {
            user: locals.user,
            userGroups: [],
            availableGroups: []
        };
    }
};

export const actions = {
    join: async ({ request, locals }: import('./$types').RequestEvent) => {
        if (!locals.user) {
            return fail(401, { error: 'Not authenticated' });
        }

        const formData = await request.formData();
        const groupId = formData.get('groupId') as string;

        if (!groupId) {
            return fail(400, { error: 'Group ID required' });
        }

        try {
            const response = await fetch(`${locals.pb.baseURL}/api/join-group`, {
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

    leave: async ({ request, locals }: import('./$types').RequestEvent) => {
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
    }
};;null as any as Actions;