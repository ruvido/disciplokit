import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    // Always return basic signup data - no redirects!
    // Progressive enhancement: try to load config, but don't fail
    let signupConfig = null;

    try {
        const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';
        const response = await fetch(`${pocketbaseUrl}/api/signup/config`);

        if (response.ok) {
            const result = await response.json();
            if (result.enabled && result.steps?.length) {
                signupConfig = result;
            }
        }
    } catch (error) {
        console.log('Signup config not available, using basic form');
    }

    return {
        signupConfig
    };
};