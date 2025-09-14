import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    try {
        // Fetch all groups
        const groups = await locals.pb.collection('groups').getFullList({
            sort: '-created'
        });

        // Check membership for current user
        const groupsWithMembership = groups.map(group => ({
            id: group.id,
            name: group.name,
            data: group.data || {},
            members: group.members || [],
            moderator: group.moderator,
            created: group.created,
            isMember: group.members && group.members.includes(locals.user.id),
            isModerator: group.moderator === locals.user.id
        }));

        return {
            groups: groupsWithMembership,
            user: locals.user
        };
    } catch (error) {
        console.error('Error loading groups:', error);
        return {
            groups: [],
            user: locals.user
        };
    }
};

export const actions: Actions = {
    join: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Not authenticated' });
        }

        const formData = await request.formData();
        const groupId = formData.get('groupId') as string;

        if (!groupId) {
            return fail(400, { error: 'Group ID required' });
        }

        try {
            // Call PocketBase hook API (server-side)
            const hookUrl = `${locals.pb.baseURL}/api/custom/create-invite-link`;
            
            const response = await fetch(hookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    groupId: groupId,
                    userId: locals.user.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                return fail(response.status, { error: errorData.error || 'Failed to create invite link' });
            }

            const result = await response.json();
            
            if (!result.success || !result.invite_link) {
                return fail(500, { error: 'Invalid hook response' });
            }

            return { 
                success: true, 
                message: 'Invite link created successfully',
                invite_link: result.invite_link
            };

        } catch (error) {
            console.error('Error creating invite link:', error);
            return fail(500, { error: 'Failed to create invite link' });
        }
    },

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
            // Get current group
            const group = await locals.pb.collection('groups').getOne(groupId);
            const currentMembers = group.members || [];

            // Check if user is moderator (cannot leave)
            if (group.moderator === locals.user.id) {
                return fail(400, { error: 'Moderators cannot leave groups' });
            }

            // Remove user from members array
            const updatedMembers = currentMembers.filter(memberId => memberId !== locals.user.id);

            await locals.pb.collection('groups').update(groupId, {
                members: updatedMembers
            });

            return { success: true, message: 'Successfully left group' };

        } catch (error) {
            console.error('Error leaving group:', error);
            return fail(500, { error: 'Failed to leave group' });
        }
    }
};