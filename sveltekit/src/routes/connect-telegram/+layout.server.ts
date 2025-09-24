import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Only check if user is authenticated - no telegram checks here
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	console.log(`🔄 Connect-telegram page: User ${locals.user.email} accessing telegram connection`);

	return { user: locals.user };
};