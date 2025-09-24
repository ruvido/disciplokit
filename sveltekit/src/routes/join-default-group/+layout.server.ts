import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Only check if user is authenticated - no telegram or group checks here
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	console.log(`🔄 Join-default-group page: User ${locals.user.email} accessing group join`);

	return { user: locals.user };
};