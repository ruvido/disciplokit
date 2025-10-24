import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Check if user is authenticated
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	console.log(`🔍 Dashboard access check for user ${locals.user.email} on path ${url.pathname}`);

	// Check telegram connection (required for ALL users including admins)
	if (!locals.user.telegram?.id) {
		console.log(`🔄 User ${locals.user.email} missing telegram connection, redirecting to onboarding`);
		throw redirect(303, '/connect-telegram');
	}

	console.log(`✅ User ${locals.user.email} has full dashboard access`);

	// Get user's groups for layout context
	try {
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
			userGroups
		};
	} catch (error) {
		console.error(`❌ Error loading user groups for ${locals.user.email}:`, error);

		// Return basic user data even if groups fail to load
		return {
			user: locals.user,
			userGroups: []
		};
	}
};