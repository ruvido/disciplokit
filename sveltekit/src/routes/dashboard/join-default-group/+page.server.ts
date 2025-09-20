import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Admin bypass - admins don't need group membership
	if (locals.user.admin) {
		throw redirect(303, '/dashboard/groups');
	}

	// Check if telegram is connected (required for this step)
	if (!locals.user.telegram?.id) {
		throw redirect(303, '/dashboard/connect-telegram');
	}

	// Check if already in default group
	try {
		const response = await fetch(`${locals.pb.baseURL}/api/check-default-group`, {
			headers: {
				'Authorization': locals.pb.authStore.token
			}
		});

		if (response.ok) {
			const data = await response.json();
			if (data.inDefaultGroup) {
				// Already in default group, redirect to dashboard
				throw redirect(303, '/dashboard/groups');
			}
		}
	} catch (error) {
		// If check fails, proceed with join attempt
		console.log('Default group check failed, proceeding with join page');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	default: async ({ locals }) => {
		if (!locals.user) {
			return {
				success: false,
				error: 'Not authenticated'
			};
		}

		try {
			console.log(`🔄 Attempting auto-join to default group for user: ${locals.user.email}`);

			const response = await fetch(`${locals.pb.baseURL}/api/auto-join-default`, {
				method: 'POST',
				headers: {
					'Authorization': locals.pb.authStore.token,
					'Content-Type': 'application/json'
				}
			});

			const result = await response.json();

			if (result.success) {
				console.log(`✅ Auto-join successful for ${locals.user.email}: ${result.message}`);

				// Success - redirect to dashboard
				throw redirect(303, '/dashboard/groups');
			} else {
				console.error(`❌ Auto-join failed for ${locals.user.email}: ${result.error}`);

				return {
					success: false,
					error: result.error || 'Failed to join default group'
				};
			}
		} catch (error) {
			// If it's a redirect error, re-throw it
			if (error.status === 303) {
				throw error;
			}

			console.error(`❌ Network error during auto-join for ${locals.user.email}:`, error);

			return {
				success: false,
				error: 'Network error. Please try again.'
			};
		}
	}
};