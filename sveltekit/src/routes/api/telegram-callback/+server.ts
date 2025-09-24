import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
	const timestamp = new Date().toISOString();
	const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
	const userAgent = request.headers.get('user-agent') || 'unknown';

	console.log(`🚀 [${timestamp}] Telegram callback START - IP: ${clientIP}, UA: ${userAgent}`);

	try {
		const authData = await request.json();
		console.log('🔥 Telegram callback received:', {
			id: authData.id,
			first_name: authData.first_name,
			username: authData.username,
			auth_date: authData.auth_date,
			hash_present: !!authData.hash
		});

		// Get current user from cookie
		const authCookie = cookies.get('pb_auth');
		if (!authCookie) {
			console.error('❌ No PocketBase auth cookie');
			return json({ success: false, error: 'Not authenticated' }, { status: 401 });
		}

		// Parse auth cookie to get user ID
		const authInfo = JSON.parse(authCookie);
		if (!authInfo.record) {
			console.error('❌ No user record in auth cookie');
			return json({ success: false, error: 'User not found' }, { status: 401 });
		}

		const userId = authInfo.record.id;
		console.log(`👤 Found authenticated user: ${userId} (${authInfo.record.email || 'no email'})`);

		// Call PocketBase custom endpoint - server-side processing
		const pocketbaseUrl = process.env.POCKETBASE_URL;
		if (!pocketbaseUrl) {
			console.error('❌ POCKETBASE_URL is required in .env file');
			process.exit(1);
		}
		console.log(`📡 Calling PocketBase: ${pocketbaseUrl}/api/custom/link-telegram`);

		try {
			const response = await fetch(`${pocketbaseUrl}/api/custom/link-telegram`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_id: userId,
					telegram_data: {
						id: authData.id,
						first_name: authData.first_name,
						username: authData.username || null,
						auth_date: authData.auth_date,
						hash: authData.hash
					}
				})
			});

			const result = await response.json();
			console.log(`📨 PocketBase response: ${response.status} ${response.statusText}`, result);

			if (!response.ok) {
				console.error('❌ PocketBase API error:', result);
				return json({ success: false, error: result.message || 'Failed to link Telegram account' }, { status: response.status });
			}

			console.log(`✅ SUCCESS: Updated user ${userId} with Telegram ID: ${authData.id}`);
			
			// Trigger auto-sync groups via bot API
			console.log('🔄 Triggering group auto-sync...');
			const botUrl = `http://${process.env.BOT_HOST || 'localhost'}:${process.env.BOT_PORT || 3030}`;
			
			try {
				const syncResponse = await fetch(`${botUrl}/sync-user-groups`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user_id: userId,
						telegram_id: authData.id
					})
				});
				
				const syncResult = await syncResponse.json();
				console.log(`🔄 Group sync result:`, syncResult);
				
				if (syncResult.success) {
					console.log(`✅ User auto-synced to ${syncResult.groups_added.length} groups`);
				}
				
			} catch (syncError) {
				console.error('⚠️  Group sync failed (non-critical):', syncError.message);
				// Continue anyway - sync failure shouldn't break linking
			}

			return json({
				success: true,
				message: 'Telegram account linked successfully',
				telegram: { id: authData.id }
			});

		} catch (fetchError: any) {
			console.error('❌ Network error calling PocketBase:', fetchError);
			return json({ success: false, error: 'Failed to connect to PocketBase' }, { status: 500 });
		}

	} catch (err: any) {
		console.error('❌ Error in Telegram callback:', err);
		return json({
			success: false,
			error: err.message || 'Internal server error'
		}, { status: 500 });
	}
};