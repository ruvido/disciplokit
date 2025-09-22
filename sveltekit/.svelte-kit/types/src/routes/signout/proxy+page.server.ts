// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = async () => {
    throw redirect(303, '/');
};

export const actions = {
    default: async ({ locals }: import('./$types').RequestEvent) => {
        locals.pb.authStore.clear();
        locals.user = null;
        throw redirect(303, '/login');
    }
};;null as any as PageServerLoad;;null as any as Actions;