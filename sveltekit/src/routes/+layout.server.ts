import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user ? {
            email: locals.user.email,
            role: locals.user.role,
            id: locals.user.id,
            verified: locals.user.verified
        } : null
    };
};