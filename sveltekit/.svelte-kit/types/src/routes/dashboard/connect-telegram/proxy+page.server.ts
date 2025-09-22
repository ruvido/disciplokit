// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Admin bypass - admins don't need telegram connection step
	if (locals.user.admin) {
		throw redirect(303, '/dashboard/groups');
	}

	// If already has telegram, redirect to next step or dashboard
	if (locals.user.telegram?.id) {
		throw redirect(303, '/dashboard/groups');
	}

	return {
		user: locals.user
	};
};