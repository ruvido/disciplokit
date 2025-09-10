import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/auth-guards';
import { handlePocketBaseError, validateRequired, successResponse, ERROR_MESSAGES } from '$lib/server/error-handler';

export const load: PageServerLoad = async (event) => {
    const user = requireAdmin(event);

    // Get all members for admin view
    try {
        const members = await event.locals.pb.collection('members').getList(1, 50);

        return {
            user: user,
            members: members.items
        };
    } catch (err) {
        console.error('Error fetching members:', err);
        return {
            user: user,
            members: []
        };
    }
};

export const actions: Actions = {
    updateRole: async (event) => {
        requireAdmin(event);
        
        const { request, locals } = event;

        const formData = await request.formData();
        const data = {
            userId: formData.get('userId'),
            role: formData.get('role')
        };

        // Validate required fields
        const validation = validateRequired(data, ['userId', 'role']);
        if ('error' in validation) return validation;

        const { userId, role } = data as { userId: string; role: string };

        // Validate role value
        if (!['member', 'moderator', 'admin'].includes(role)) {
            return handlePocketBaseError({ status: 400 });
        }

        try {
            await locals.pb.collection('members').update(userId, { role });
            return successResponse('Role updated successfully');
        } catch (err: any) {
            return handlePocketBaseError(err);
        }
    },

    deleteUser: async (event) => {
        const user = requireAdmin(event);
        
        const { request, locals } = event;

        const formData = await request.formData();
        const data = { userId: formData.get('userId') };

        // Validate required fields
        const validation = validateRequired(data, ['userId']);
        if ('error' in validation) return validation;

        const { userId } = data as { userId: string };

        // Prevent admin from deleting themselves
        if (userId === user.id) {
            return handlePocketBaseError({ status: 400 });
        }

        try {
            await locals.pb.collection('members').delete(userId);
            return successResponse('User deleted successfully');
        } catch (err: any) {
            return handlePocketBaseError(err);
        }
    }
};