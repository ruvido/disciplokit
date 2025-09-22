// @ts-nocheck
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ url, locals }: Parameters<PageServerLoad>[0]) => {
    // Load simple signup config
    try {
        const pocketbaseUrl = process.env.POCKETBASE_URL;
        if (!pocketbaseUrl) {
            throw new Error('POCKETBASE_URL environment variable not set');
        }
        const response = await fetch(`${pocketbaseUrl}/api/signup?type=simple`);

        if (response.ok) {
            const signupConfig = await response.json();
            if (signupConfig.enabled && signupConfig.steps?.length) {
                // Get the single step fields for simple form
                const stepConfig = signupConfig.steps[0];
                return {
                    signupConfig,
                    stepConfig
                };
            }
        }
    } catch (error) {
        console.error('Failed to load simple signup config:', error);
    }

    // Fallback to login if config not available
    throw redirect(303, '/login');
};

export const actions = {
    default: async ({ request, locals }: import('./$types').RequestEvent) => {
        const formData = await request.formData();

        // Load config to get field validation
        const pocketbaseUrl = process.env.POCKETBASE_URL;
        if (!pocketbaseUrl) {
            throw new Error('POCKETBASE_URL environment variable not set');
        }
        const configResponse = await fetch(`${pocketbaseUrl}/api/signup?type=simple`);
        if (!configResponse.ok) {
            return fail(500, { error: 'Configuration error' });
        }
        const signupConfig = await configResponse.json();
        const stepConfig = signupConfig.steps[0];

        // Validate and collect form data
        const stepData: Record<string, any> = {};
        const errors: Record<string, string> = {};

        for (const field of stepConfig.fields) {
            const value = formData.get(field.name);

            if (field.type === 'checkbox') {
                // Collect all selected checkboxes
                const selected = formData.getAll(field.name) as string[];
                stepData[field.name] = selected;

                // Validate required checkboxes
                if (field.required && selected.length === 0) {
                    errors[field.name] = `${field.label} è richiesto`;
                }
            } else {
                stepData[field.name] = value?.toString() || '';

                // Validate required fields
                if (field.required && !value) {
                    errors[field.name] = `${field.label} è richiesto`;
                }

                // Validate textarea max length
                if (field.type === 'textarea' && field.maxLength && value && value.toString().length > field.maxLength) {
                    errors[field.name] = `${field.label} non può superare ${field.maxLength} caratteri`;
                }
            }
        }

        // Return validation errors
        if (Object.keys(errors).length > 0) {
            return fail(400, {
                errors,
                formData: Object.fromEntries(formData)
            });
        }

        // Save to signup_requests collection
        try {
            const recordData = {
                ...stepData,
                status: 'pending'
            };
            console.log('Creating signup_request with data:', recordData);
            const result = await locals.pb.collection('signup_requests').create(recordData);
            console.log('Record created successfully:', result.id);

        } catch (error: any) {
            console.error('Signup request creation error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return fail(400, {
                error: error.data?.message || error.message || 'Errore durante l\'invio della richiesta',
                formData: Object.fromEntries(formData)
            });
        }

        // Redirect to success page (outside try/catch)
        const redirectUrl = signupConfig.completion?.redirect || '/signup-success';
        throw redirect(303, redirectUrl);
    }
};;null as any as Actions;