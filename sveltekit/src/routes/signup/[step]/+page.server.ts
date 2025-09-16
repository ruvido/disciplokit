import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
    const { signupConfig } = await parent();
    const currentStepId = params.step;
    
    // Find current step configuration
    const stepConfig = signupConfig.steps.find((s: any) => s.id === currentStepId);
    
    if (!stepConfig) {
        console.error(`Step '${currentStepId}' not found in configuration`);
        throw redirect(303, '/login');
    }
    
    // Get current user data if logged in
    let currentUserData = null;
    if (locals.pb.authStore.model) {
        try {
            const user = await locals.pb.collection('members').getOne(locals.pb.authStore.model.id);
            currentUserData = user.data || {};
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }
    
    // Calculate step position for navigation
    const currentStepIndex = signupConfig.steps.findIndex((s: any) => s.id === currentStepId);
    const totalSteps = signupConfig.steps.length;
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === totalSteps - 1;
    const previousStep = !isFirstStep ? signupConfig.steps[currentStepIndex - 1]?.id : null;
    const nextStep = !isLastStep ? signupConfig.steps[currentStepIndex + 1]?.id : null;
    
    return {
        stepConfig,
        currentUserData,
        navigation: {
            currentIndex: currentStepIndex,
            totalSteps,
            isFirstStep,
            isLastStep,
            previousStep,
            nextStep,
            progress: ((currentStepIndex + 1) / totalSteps) * 100
        }
    };
};

export const actions: Actions = {
    next: async ({ request, params, locals, url }) => {
        // Load signup config
        const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';
        const configResponse = await fetch(`${pocketbaseUrl}/api/signup/config`);
        if (!configResponse.ok) {
            return fail(500, { error: 'Errore di configurazione' });
        }
        const signupConfig = await configResponse.json();
        
        const currentStepId = params.step;
        const formData = await request.formData();
        
        // Find current step configuration
        const stepConfig = signupConfig.steps.find((s: any) => s.id === currentStepId);
        if (!stepConfig) {
            return fail(400, { error: 'Step configuration not found' });
        }
        
        // Validate and collect form data
        const stepData: Record<string, any> = {};
        const fileData: Record<string, File> = {};
        const errors: Record<string, string> = {};
        
        for (const field of stepConfig.fields) {
            const value = formData.get(field.name);
            
            // Handle different field types
            if (field.type === 'checkbox') {
                // Collect all selected checkboxes
                const selected = formData.getAll(field.name) as string[];
                stepData[field.name] = selected;
                
                // Validate required checkboxes
                if (field.required && selected.length === 0) {
                    errors[field.name] = `${field.label} è richiesto`;
                }
            } else if (field.type === 'file') {
                // Handle file uploads separately
                const file = value as File;
                if (field.required && (!file || file.size === 0)) {
                    errors[field.name] = `${field.label} è richiesto`;
                } else if (file && file.size > 0) {
                    fileData[field.name] = file;
                }
            } else {
                stepData[field.name] = value?.toString() || '';
                
                // Validate required fields
                if (field.required && !value) {
                    errors[field.name] = `${field.label} è richiesto`;
                }
                
                // Validate number fields
                if (field.type === 'number' && value) {
                    const numValue = Number(value);
                    if (isNaN(numValue)) {
                        errors[field.name] = `${field.label} deve essere un numero`;
                    } else if (field.min && numValue < field.min) {
                        errors[field.name] = `${field.label} deve essere almeno ${field.min}`;
                    } else if (field.max && numValue > field.max) {
                        errors[field.name] = `${field.label} non può essere maggiore di ${field.max}`;
                    }
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
        
        // Check if user is authenticated
        if (!locals.pb.authStore.model) {
            // First step - create new user account
            if (currentStepId === signupConfig.steps[0].id) {
                try {
                    // Create user with email/password - these should be in stepData
                    const email = formData.get('email') as string;
                    const password = formData.get('password') as string;
                    
                    if (!email || !password) {
                        return fail(400, { 
                            error: 'Email e password sono richiesti per la registrazione',
                            formData: Object.fromEntries(formData)
                        });
                    }
                    
                    const newUser = await locals.pb.collection('members').create({
                        email,
                        password,
                        passwordConfirm: password,
                        emailVisibility: true,
                        name: stepData.name || email.split('@')[0], // Use form name or email prefix
                        data: stepData
                    });
                    
                    // Auto-login after creation
                    await locals.pb.collection('members').authWithPassword(email, password);
                    
                } catch (error: any) {
                    console.error('User creation error:', error);
                    return fail(400, { 
                        error: error.data?.message || 'Errore durante la registrazione',
                        formData: Object.fromEntries(formData)
                    });
                }
            } else {
                return fail(401, { error: 'Devi essere autenticato per continuare' });
            }
        } else {
            // Update existing user data
            try {
                const userId = locals.pb.authStore.model.id;
                const currentUser = await locals.pb.collection('members').getOne(userId);
                const existingData = currentUser.data || {};
                
                // Prepare update data
                const updateData: Record<string, any> = {
                    data: { ...existingData, ...stepData }
                };
                
                // Handle name field specially - it goes to the name column, not data
                if (stepData.name) {
                    updateData.name = stepData.name;
                    // Remove name from data object since it's stored separately
                    delete updateData.data.name;
                }
                
                // Handle file uploads - map to correct fields
                if (Object.keys(fileData).length > 0) {
                    // Map profile_picture to avatar field
                    if (fileData.profile_picture) {
                        updateData.avatar = fileData.profile_picture;
                    }
                    // Add other file mappings if needed
                    Object.entries(fileData).forEach(([key, file]) => {
                        if (key !== 'profile_picture') {
                            updateData[key] = file;
                        }
                    });
                }
                
                await locals.pb.collection('members').update(userId, updateData);
                
            } catch (error: any) {
                console.error('User update error:', error);
                return fail(400, { 
                    error: 'Errore durante il salvataggio dei dati: ' + (error.data?.message || error.message),
                    formData: Object.fromEntries(formData)
                });
            }
        }
        
        // Navigate to next step or complete signup
        const currentStepIndex = signupConfig.steps.findIndex((s: any) => s.id === currentStepId);
        const isLastStep = currentStepIndex === signupConfig.steps.length - 1;
        
        if (isLastStep) {
            // Mark signup as completed
            try {
                const userId = locals.pb.authStore.model.id;
                const currentUser = await locals.pb.collection('members').getOne(userId);
                const existingData = currentUser.data || {};
                
                await locals.pb.collection('members').update(userId, {
                    data: { ...existingData, signup_completed: true }
                });
                
            } catch (error: any) {
                console.error('Signup completion error:', error);
                return fail(400, { error: 'Errore durante il completamento della registrazione' });
            }
            
            // Redirect to completion page or dashboard (outside try/catch)
            const redirectUrl = signupConfig.completion?.redirect || '/dashboard';
            throw redirect(303, redirectUrl);
        } else {
            // Go to next step
            const nextStep = signupConfig.steps[currentStepIndex + 1]?.id;
            throw redirect(303, `/signup/${nextStep}`);
        }
    },
    
    previous: async ({ params, url }) => {
        // Load signup config
        const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';
        const configResponse = await fetch(`${pocketbaseUrl}/api/signup/config`);
        if (!configResponse.ok) {
            throw redirect(303, '/login');
        }
        const signupConfig = await configResponse.json();
        
        const currentStepId = params.step;
        
        const currentStepIndex = signupConfig.steps.findIndex((s: any) => s.id === currentStepId);
        
        if (currentStepIndex > 0) {
            const previousStep = signupConfig.steps[currentStepIndex - 1]?.id;
            throw redirect(303, `/signup/${previousStep}`);
        } else {
            throw redirect(303, '/login');
        }
    }
};