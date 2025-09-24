import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guards';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	// Check if user is authenticated and admin
	const user = requireAdmin(event);

	console.log(`🔍 Admin access check for user ${user.email} on path ${event.url.pathname}`);

	// Check telegram connection (required for ALL users including admins)
	if (!user.telegram?.id) {
		console.log(`🔄 Admin ${user.email} missing telegram connection, redirecting to connect-telegram`);
		throw redirect(303, '/connect-telegram');
	}

	console.log(`✅ Admin ${user.email} has full access`);

	return { user };
};