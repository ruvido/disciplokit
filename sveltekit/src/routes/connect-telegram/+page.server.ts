import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// If already has telegram, redirect to dashboard
	if (locals.user.telegram?.id) {
		throw redirect(303, '/dashboard');
	}

	return {
		user: locals.user
	};
};