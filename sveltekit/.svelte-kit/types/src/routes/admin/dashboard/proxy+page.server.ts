// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/auth-guards';
import { handlePocketBaseError, validateRequired, successResponse } from '$lib/server/error-handler';
import { getEnhancedClient } from '$lib/server/pocketbase-client';
import { sanitizeFormData, isValidRole } from '$lib/server/input-sanitizer';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
    const user = requireAdmin(event);
    const client = getEnhancedClient(event);

    // Get all members for admin view with fast timeout
    try {
        const members = await client.getList('members', 1, 50, { 
            context: 'dashboard',
            timeoutMs: 3000 
        });
        return {
            user: user,
            members: members.items
        };
    } catch (err) {
        console.error('Error fetching members:', err);
        return {
            user: user,
            members: [],
            loadError: 'Impossibile caricare la lista dei membri.'
        };
    }
};

export const actions = {
    updateRole: async (event: import('./$types').RequestEvent) => {
        requireAdmin(event);
        const client = getEnhancedClient(event);
        const { request } = event;

        const formData = await request.formData();
        const rawData = {
            userId: formData.get('userId'),
            role: formData.get('role')
        };

        // Validate required fields
        const validation = validateRequired(rawData, ['userId', 'role']);
        if ('error' in validation) return validation;

        // Sanitize input data
        const sanitized = sanitizeFormData(rawData);
        const { userId, role } = sanitized;

        // Validate role value
        if (!isValidRole(role)) {
            return handlePocketBaseError({ status: 400 }, 'updateRole');
        }

        try {
            await client.update('members', userId, { role }, { 
                context: 'update',
                timeoutMs: 5000 
            });
            return successResponse('Ruolo aggiornato con successo');
        } catch (err: any) {
            return handlePocketBaseError(err, 'updateRole');
        }
    },

    deleteUser: async (event: import('./$types').RequestEvent) => {
        const user = requireAdmin(event);
        const client = getEnhancedClient(event);
        const { request } = event;

        const formData = await request.formData();
        const rawData = { userId: formData.get('userId') };

        // Validate required fields
        const validation = validateRequired(rawData, ['userId']);
        if ('error' in validation) return validation;

        // Sanitize input data
        const sanitized = sanitizeFormData(rawData);
        const { userId } = sanitized;

        // Prevent admin from deleting themselves
        if (userId === user.id) {
            return handlePocketBaseError({ status: 400 }, 'deleteUser - self delete attempt');
        }

        try {
            await client.delete('members', userId, { 
                context: 'delete',
                timeoutMs: 5000 
            });
            return successResponse('Utente eliminato con successo');
        } catch (err: any) {
            return handlePocketBaseError(err, 'deleteUser');
        }
    }
};;null as any as Actions;