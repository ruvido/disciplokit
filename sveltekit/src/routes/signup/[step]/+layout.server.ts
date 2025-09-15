import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
    // Load signup configuration using our API endpoint
    try {
        const pocketbaseUrl = url.origin.replace(':5173', ':8090');
        const response = await fetch(`${pocketbaseUrl}/api/signup/config`);
        
        if (!response.ok) {
            console.error('Failed to fetch signup config:', response.status);
            throw redirect(303, '/login');
        }
        
        const result = await response.json();
        
        if (!result.enabled || !result.steps?.length) {
            console.error('Signup not enabled or no steps configured');
            throw redirect(303, '/login');
        }
        
        return {
            signupConfig: result
        };
        
    } catch (error) {
        console.error('Failed to load signup configuration:', error);
        throw redirect(303, '/login');
    }
};