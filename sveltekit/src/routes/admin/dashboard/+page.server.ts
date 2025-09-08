import { redirect, error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Check if user is logged in
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    // Check if user is admin
    if (locals.user.role !== 'admin') {
        throw error(403, {
            message: 'Access Denied',
            hint: 'You do not have permission to access this page.'
        });
    }

    // Get all members for admin view
    try {
        const members = await locals.pb.collection('members').getList(1, 50);

        return {
            user: locals.user,
            members: members.items
        };
    } catch (err) {
        console.error('Error fetching members:', err);
        return {
            user: locals.user,
            members: []
        };
    }
};

export const actions: Actions = {
    updateRole: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== 'admin') {
            return fail(403, { error: 'Not authorized' });
        }

        const formData = await request.formData();
        const userId = formData.get('userId') as string;
        const newRole = formData.get('role') as string;

        if (!userId || !newRole || !['member', 'moderator', 'admin'].includes(newRole)) {
            return fail(400, { error: 'Invalid data' });
        }

        try {
            await locals.pb.collection('members').update(userId, { role: newRole });
            return { success: true, message: 'Role updated successfully' };
        } catch (err: any) {
            console.error('Error updating role:', err);
            return fail(500, { error: 'Failed to update role' });
        }
    },

    deleteUser: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== 'admin') {
            return fail(403, { error: 'Not authorized' });
        }

        const formData = await request.formData();
        const userId = formData.get('userId') as string;

        if (!userId) {
            return fail(400, { error: 'User ID required' });
        }

        // Prevent admin from deleting themselves
        if (userId === locals.user.id) {
            return fail(400, { error: 'Cannot delete your own account' });
        }

        try {
            await locals.pb.collection('members').delete(userId);
            return { success: true, message: 'User deleted successfully' };
        } catch (err: any) {
            console.error('Error deleting user:', err);
            return fail(500, { error: 'Failed to delete user' });
        }
    }
};