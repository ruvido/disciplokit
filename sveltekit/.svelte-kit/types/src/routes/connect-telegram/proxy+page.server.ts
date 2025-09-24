// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
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