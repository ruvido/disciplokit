import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireGuest } from '$lib/server/auth-guards';
import { validateRequired, ERROR_MESSAGES } from '$lib/server/error-handler';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
    requireGuest(event);
    return {};
};

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData();
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Validate required fields
        const validation = validateRequired(data, ['email', 'password']);
        if ('error' in validation) return validation;

        const { email, password } = data as { email: string; password: string };

        try {
            await locals.pb.collection('members').authWithPassword(email, password);
        } catch (err: any) {
            console.error('Login error:', err);
            return fail(400, {
                error: ERROR_MESSAGES.INVALID_CREDENTIALS,
                email
            });
        }

        // Redirect based on user role
        const user = locals.pb.authStore.model;
        if (user?.role === 'admin') {
            throw redirect(303, '/admin/dashboard');
        }
        
        throw redirect(303, '/dashboard');
    }
};