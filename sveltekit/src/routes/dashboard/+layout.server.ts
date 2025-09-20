import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Check if user is authenticated
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Skip onboarding checks for onboarding pages themselves
	const isOnboardingPage = url.pathname.includes('/connect-telegram') || url.pathname.includes('/join-default-group');

	// Admin bypass - admins don't need telegram or group membership
	if (locals.user.admin) {
		console.log(`✅ Admin user ${locals.user.email} bypassing onboarding checks`);
		return { user: locals.user };
	}

	// Skip checks if user is on onboarding pages
	if (isOnboardingPage) {
		console.log(`🔄 User ${locals.user.email} on onboarding page, skipping checks`);
		return { user: locals.user };
	}

	// Step 1: Check telegram connection
	if (!locals.user.telegram?.id) {
		console.log(`🔄 User ${locals.user.email} missing telegram connection, redirecting to onboarding`);
		throw redirect(303, '/dashboard/connect-telegram');
	}

	// Step 2: Check default group membership
	try {
		const response = await fetch(`${locals.pb.baseURL}/api/check-default-group`, {
			headers: {
				'Authorization': locals.pb.authStore.token
			}
		});

		if (!response.ok) {
			console.error(`❌ Error checking default group: ${response.status}`);
			throw redirect(303, '/dashboard/join-default-group');
		}

		const data = await response.json();

		if (!data.inDefaultGroup) {
			console.log(`🔄 User ${locals.user.email} not in default group (${data.reason}), redirecting to auto-join`);
			throw redirect(303, '/dashboard/join-default-group');
		}

		console.log(`✅ User ${locals.user.email} has full dashboard access`);

		// Get user's groups for layout context
		const groupsResponse = await fetch(`${locals.pb.baseURL}/api/my-groups`, {
			headers: {
				'Authorization': locals.pb.authStore.token
			}
		});

		let userGroups = [];
		if (groupsResponse.ok) {
			const groupsData = await groupsResponse.json();
			userGroups = groupsData.groups || [];
		}

		return {
			user: locals.user,
			userGroups,
			defaultGroupInfo: {
				name: data.groupName,
				isModerator: data.isModerator
			}
		};

	} catch (error) {
		// If it's a redirect error, re-throw it
		if (error.status === 303) {
			throw error;
		}

		console.error(`❌ Error checking group membership for ${locals.user.email}:`, error);

		// Fallback: redirect to join default group
		throw redirect(303, '/dashboard/join-default-group');
	}
};