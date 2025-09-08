import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // If user is already logged in, redirect based on role
    if (locals.user) {
        if (locals.user.role === 'admin') {
            throw redirect(303, '/admin/dashboard');
        }
        throw redirect(303, '/dashboard');
    }
    
    return {};
};

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return fail(400, {
                error: 'Email and password are required',
                email
            });
        }

        try {
            await locals.pb.collection('members').authWithPassword(email, password);
        } catch (err: any) {
            console.error('Login error:', err);
            return fail(400, {
                error: 'Invalid email or password',
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