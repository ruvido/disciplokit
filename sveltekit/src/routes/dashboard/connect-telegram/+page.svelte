<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isConnecting = $state(false);
	let error = $state('');

	async function onTelegramAuth(user: any) {
		isConnecting = true;
		error = '';

		try {
			console.log('🔥 Telegram auth received:', user);

			const response = await fetch('/api/telegram-callback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(user)
			});

			const result = await response.json();

			if (result.success) {
				console.log('✅ Telegram connection successful, redirecting...');
				// Success - redirect handled by layout guard
				window.location.href = '/dashboard';
			} else {
				error = result.error || 'Connection failed';
				console.error('❌ Telegram connection failed:', result.error);
			}
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('❌ Network error during telegram auth:', err);
		} finally {
			isConnecting = false;
		}
	}

	// Expose globally for Telegram widget
	if (typeof window !== 'undefined') {
		window.onTelegramAuth = onTelegramAuth;
	}
</script>

<svelte:head>
	<title>Connect Telegram - Disciplo</title>
	<script async src="https://telegram.org/js/telegram-widget.js?22"></script>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
	<div class="max-w-md w-full space-y-6">

		<!-- Progress Indicator -->
		<div class="text-center">
			<div class="text-sm text-gray-500 mb-2">Step 1 of 2</div>
			<div class="w-full bg-gray-200 rounded-full h-2">
				<div class="bg-blue-600 h-2 rounded-full w-1/2 transition-all duration-300"></div>
			</div>
		</div>

		<!-- Main Card -->
		<Card class="shadow-xl">
			<CardHeader class="text-center space-y-4">
				<div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
					<svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zM5.568 12.001l8.54 3.664c.455.195 1.003-.313.81-.768L11.924 5.832c-.137-.324-.588-.324-.725 0L8.205 14.897c-.193.455.355.963.81.768l8.54-3.664z"/>
					</svg>
				</div>
				<CardTitle class="text-2xl">Connect Your Telegram</CardTitle>
				<CardDescription>
					To access Disciplo groups, you need to connect your Telegram account.
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-6">
				{#if error}
					<div class="bg-red-50 border border-red-200 rounded-md p-4">
						<p class="text-sm text-red-600">{error}</p>
					</div>
				{/if}

				<!-- User Info -->
				<div class="text-center text-sm text-gray-600">
					<p>Connecting account: <strong>{data.user?.email}</strong></p>
				</div>

				<!-- Telegram Login Widget -->
				<div class="text-center">
					{#if isConnecting}
						<div class="flex items-center justify-center space-x-2 py-4">
							<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
							<span class="text-sm text-gray-600">Connecting to Telegram...</span>
						</div>
					{:else}
						<div id="telegram-login-widget" class="flex justify-center">
							<!-- Widget will be loaded here by Telegram script -->
						</div>

						<script>
							setTimeout(() => {
								const container = document.getElementById('telegram-login-widget');
								if (container && !container.hasChildNodes()) {
									const script = document.createElement('script');
									script.src = 'https://telegram.org/js/telegram-widget.js?22';
									script.setAttribute('data-telegram-login', 'disciplo_bot');
									script.setAttribute('data-size', 'large');
									script.setAttribute('data-onauth', 'onTelegramAuth(user)');
									script.setAttribute('data-request-access', 'write');
									script.async = true;
									container.appendChild(script);
								}
							}, 100);
						</script>
					{/if}
				</div>

				<!-- Help Text -->
				<div class="text-center text-sm text-gray-500 space-y-2">
					<p><strong>How it works:</strong></p>
					<ol class="text-left space-y-1 ml-4">
						<li>1. Click the Telegram button above</li>
						<li>2. Authenticate with your Telegram account</li>
						<li>3. You'll be automatically redirected</li>
					</ol>
					<p class="mt-4">Your account will be securely linked to access groups.</p>
				</div>
			</CardContent>
		</Card>

		<!-- Skip Option -->
		<div class="text-center">
			<Button variant="ghost" size="sm" href="/signout">
				Not now, sign out
			</Button>
		</div>
	</div>
</div>

<style>
	/* Ensure telegram widget is centered */
	:global(#telegram-login-widget iframe) {
		margin: 0 auto;
	}
</style>