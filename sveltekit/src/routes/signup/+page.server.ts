import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import crypto from 'crypto';

async function validateToken(token: string, locals: any) {
    try {
        if (!token) return null;

        // Hash token for lookup (same method as bot uses)
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find token in database
        const record = await locals.pb.collection('telegram_invite_tokens').getFirstListItem(
            `token_hash = "${tokenHash}" && status = "pending" && expires_at > @now`
        );

        return record;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

export const load: PageServerLoad = async ({ url, locals }) => {
    // Get URL parameters
    const type = url.searchParams.get('type') || 'simple';
    const token = url.searchParams.get('token');

    const pocketbaseUrl = process.env.POCKETBASE_URL;
    if (!pocketbaseUrl) {
        throw new Error('POCKETBASE_URL environment variable not set');
    }

    try {
        // Handle direct signup (no token required)
        if (type === 'direct') {
            console.log('Processing direct signup...');

            // Load signup-direct config
            const response = await fetch(`${pocketbaseUrl}/api/signup?type=direct`);
            if (!response.ok) {
                throw new Error('Failed to load direct signup config');
            }

            const signupConfig = await response.json();

            if (!signupConfig.steps?.length) {
                throw new Error('Invalid direct signup configuration - no steps found');
            }

            console.log(`Direct signup loaded successfully with ${signupConfig.steps.length} steps`);

            return {
                signupConfig,
                prefillData: null,
                tokenData: null
            };
        }

        // Handle normal simple signup
        const response = await fetch(`${pocketbaseUrl}/api/signup?type=simple`);

        if (response.ok) {
            const signupConfig = await response.json();
            if (signupConfig.enabled && signupConfig.steps?.length) {
                const stepConfig = signupConfig.steps[0];
                return {
                    signupConfig,
                    stepConfig,
                    prefillData: null,
                    tokenData: null
                };
            }
        }
    } catch (error) {
        console.error('Failed to load signup config:', error);
    }

    // Fallback to login if config not available
    throw redirect(303, '/login');
};

async function markTokenUsed(token: string, locals: any, memberId: string) {
    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find and update token status
        const tokenRecord = await locals.pb.collection('telegram_invite_tokens').getFirstListItem(
            `token_hash = "${tokenHash}"`
        );

        await locals.pb.collection('telegram_invite_tokens').update(tokenRecord.id, {
            status: 'used',
            used_at: new Date().toISOString()
        });

        console.log(`✅ Token marked as used: ${tokenHash.substring(0, 16)}...`);
    } catch (error) {
        console.error('Error marking token as used:', error);
    }
}

export const actions: Actions = {
    default: async ({ request, locals, url }) => {
        const formData = await request.formData();

        // Get URL parameters to determine flow type
        const type = url.searchParams.get('type') || 'simple';
        const token = url.searchParams.get('token');

        const pocketbaseUrl = process.env.POCKETBASE_URL;
        if (!pocketbaseUrl) {
            throw new Error('POCKETBASE_URL environment variable not set');
        }

        // Load appropriate config
        const configResponse = await fetch(`${pocketbaseUrl}/api/signup?type=${type}`);
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
                const selected = formData.getAll(field.name) as string[];
                stepData[field.name] = selected;

                if (field.required && selected.length === 0) {
                    errors[field.name] = `${field.label} è richiesto`;
                }
            } else {
                stepData[field.name] = value?.toString() || '';

                if (field.required && !value) {
                    errors[field.name] = `${field.label} è richiesto`;
                }

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

        try {
            let result;

            // DIRECT SIGNUP: Create member immediately
            if (type === 'direct') {
                console.log('Processing direct signup - creating member...');

                // Collect all form data (from multi-step client submission)
                const allFormData: Record<string, any> = {};
                
                // Get all form fields
                for (const [key, value] of formData.entries()) {
                    if (key !== 'action') { // Skip action field
                        allFormData[key] = value;
                    }
                }
                
                // Handle checkboxes (multiple values with same key)
                const checkboxFields = ['hobbies', 'professional_skills'];
                checkboxFields.forEach(field => {
                    const values = formData.getAll(field);
                    if (values.length > 0) {
                        allFormData[field] = values;
                    }
                });

                // Add passwordConfirm for PocketBase validation
                if (allFormData.password) {
                    allFormData.passwordConfirm = allFormData.password;
                }

                // Separate base member fields from extra data
                const baseMemberFields = {
                    email: allFormData.email,
                    password: allFormData.password,
                    passwordConfirm: allFormData.passwordConfirm,
                    name: allFormData.name,
                    telegram: null,
                    role: 'member',
                    admin: false,
                    banned: false
                };

                // Put all extra signup data in the data field (except files and base fields)
                const extraData = { ...allFormData };
                // Remove base member fields (these go directly in member record)
                delete extraData.email;
                delete extraData.password;
                delete extraData.passwordConfirm;
                delete extraData.name;
                delete extraData.telegram;
                delete extraData.role;
                delete extraData.admin;
                delete extraData.banned;
                delete extraData.profile_picture; // Files must be separate

                // Prepare final member data
                const memberData = {
                    ...baseMemberFields,
                    data: extraData
                };

                // Add file fields directly (not in data JSON)
                if (allFormData.profile_picture) {
                    memberData.avatar = allFormData.profile_picture; // Map to avatar field
                }

                console.log('Creating member with data:', memberData);
                result = await locals.pb.collection('members').create(memberData);

                console.log(`✅ Member created successfully: ${result.id}`);

                // Auto-login the new user (PocketBase official pattern)
                await locals.pb.collection('members').authWithPassword(
                    allFormData.email as string,
                    allFormData.password as string
                );

                console.log(`✅ User auto-logged in successfully: ${result.email}`);

            } else {
                // SIMPLE SIGNUP: Create signup request
                console.log('Processing simple signup - creating signup request...');

                const recordData = {
                    ...stepData,
                    status: 'pending'
                };

                console.log('Creating signup_request with data:', recordData);
                result = await locals.pb.collection('signup_requests').create(recordData);
                console.log(`✅ Signup request created successfully: ${result.id}`);
            }

        } catch (error: any) {
            console.error('Signup error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            // Enhanced error handling for both collections
            let errorMessage = 'Errore durante la registrazione';
            const errorString = JSON.stringify(error, null, 2).toLowerCase();

            if (errorString.includes('unique') ||
                errorString.includes('duplicate') ||
                errorString.includes('email') && (errorString.includes('constraint') || errorString.includes('already exists'))) {

                if (type === 'direct') {
                    errorMessage = 'Questa email è già registrata. Accedi al tuo account esistente.';
                } else {
                    errorMessage = 'Questa email è già stata utilizzata per una richiesta di iscrizione. Controlla la tua casella email o contatta il supporto.';
                }
            } else if (error.data?.message) {
                errorMessage = error.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            return fail(400, {
                error: errorMessage,
                formData: Object.fromEntries(formData)
            });
        }

        // Redirect based on signup type
        const redirectUrl = signupConfig.completion?.redirect ||
                          (type === 'direct' ? '/dashboard' : '/signup-success');

        console.log(`Redirecting to: ${redirectUrl}`);
        throw redirect(303, redirectUrl);
    }
};