import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, locals }) => {
        console.log('🚀 SIGNUP ACTION CALLED!');
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return fail(400, { 
                error: 'Email e password sono richiesti',
                email 
            });
        }

        try {
            // Create new user following PocketBase docs
            const newUser = await locals.pb.collection('members').create({
                email,
                password,
                passwordConfirm: password,
                emailVisibility: true,
                name: email.split('@')[0] // Default name
            });

            // Auto-login after creation
            await locals.pb.collection('members').authWithPassword(email, password);

        } catch (error: any) {
            console.error('Full signup error:', error);
            console.error('Error status:', error.status);
            console.error('Error data:', error.data);
            
            return fail(400, { 
                error: 'Errore: ' + JSON.stringify(error.data || error.message || 'Errore sconosciuto'),
                email 
            });
        }

        throw redirect(303, '/dashboard');
    }
};