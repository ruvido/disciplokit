// @ts-nocheck
import type { LayoutServerLoad } from './$types';

export const load = async ({ locals }: Parameters<LayoutServerLoad>[0]) => {
    return {
        user: locals.user ? {
            email: locals.user.email,
            role: locals.user.role,
            id: locals.user.id,
            verified: locals.user.verified
        } : null
    };
};