<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import MobileMenu from "$lib/components/mobile-menu.svelte";
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state<string | null>(null);

	function testTelegramLink() {
		// Test function placeholder
		alert('Test function called');
	}

	// Open invite link when form succeeds
	$effect(() => {
		if (form?.success && form?.invite_link) {
			window.open(form.invite_link, '_blank');
		}
	});

	// Menu items based on user role
	const menuItems = data.user?.role === 'admin' 
		? [
			{ href: '/dashboard/profile', label: 'Profile' },
			{ href: '/dashboard/groups', label: 'Groups' },
			{ href: '/admin/dashboard', label: 'Members' }
		]
		: [
			{ href: '/dashboard/profile', label: 'Profile' },
			{ href: '/dashboard/groups', label: 'Groups' }
		];
</script>

<svelte:head>
	<title>Gruppi - Disciplo</title>
	{#if !data.user?.telegram_id}
		<script async src="https://telegram.org/js/telegram-widget.js?22"></script>
	{/if}
</svelte:head>

<div class="min-h-screen bg-background">
	<MobileMenu 
		menuItems={menuItems}
		currentPath={$page.url.pathname}
		userEmail={data.user?.email}
	/>
	
	<div class="container mx-auto p-4 max-w-4xl space-y-6">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-3xl font-bold">Gruppi Disponibili</h1>
		</div>

	{#if form?.error}
		<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
			<p class="text-sm text-red-600">{form.error}</p>
		</div>
	{/if}

	{#if form?.success}
		<div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
			<p class="text-sm text-green-600">{form.message}</p>
		</div>
	{/if}

	<!-- Telegram Login Widget - Solo se non ha telegram_id -->
	{#if !data.user?.telegram_id}
		<div class="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
			<div class="flex items-start space-x-4">
				<div class="flex-shrink-0">
					<svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zM5.568 12.001l8.54 3.664c.455.195 1.003-.313.81-.768L11.924 5.832c-.137-.324-.588-.324-.725 0L8.205 14.897c-.193.455.355.963.81.768l8.54-3.664z"/>
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-medium text-blue-900 mb-2">Collega il tuo account Telegram</h3>
					<p class="text-sm text-blue-700 mb-4">
						Per entrare nei gruppi Telegram, devi prima collegare il tuo account. 
						Clicca il bottone qui sotto per autenticarti con Telegram.
					</p>
					<div id="telegram-login-widget">
						<!-- Widget will be loaded here by Telegram script -->
					</div>
					
					<!-- TEMPORARY: Manual test button -->
					<div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
						<p class="text-sm text-yellow-700 mb-2">⚠️ Test locale - Simula collegamento Telegram:</p>
						<button on:click={testTelegramLink} class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
							🔧 Test Collegamento (Fake)
						</button>
					</div>
					
					<script type="text/javascript">
						// Force widget loading after script loads
						if (typeof window !== 'undefined') {
							window.onTelegramAuth = function(user) {
								console.log('🔥 Telegram auth received:', user);
								
								// Invia i dati al server
								fetch('/api/telegram-callback', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
										'X-Requested-With': 'XMLHttpRequest'
									},
									body: JSON.stringify({
										id: user.id,
										first_name: user.first_name,
										username: user.username || null,
										auth_date: user.auth_date,
										hash: user.hash
									})
								})
								.then(response => response.json())
								.then(data => {
									if (data.success) {
										console.log('✅ Telegram ID aggiornato con successo');
										window.location.reload();
									} else {
										console.error('❌ Errore:', data.error);
										alert('Errore nel collegamento: ' + (data.error || 'Errore sconosciuto'));
									}
								})
								.catch(error => {
									console.error('❌ Errore chiamata API:', error);
									alert('Errore di connessione. Riprova.');
								});
							};
							
							// Create widget manually
							setTimeout(() => {
								const widgetContainer = document.getElementById('telegram-login-widget');
								if (widgetContainer && !widgetContainer.hasChildNodes()) {
									const script = document.createElement('script');
									script.src = 'https://telegram.org/js/telegram-widget.js?22';
									script.setAttribute('data-telegram-login', 'disciplo_bot');
									script.setAttribute('data-size', 'large');
									script.setAttribute('data-onauth', 'onTelegramAuth(user)');
									script.setAttribute('data-request-access', 'write');
									script.async = true;
									widgetContainer.appendChild(script);
								}
							}, 1000);
							
							// Test function for local development
							window.testTelegramLink = function() {
								console.log('🔧 Testing Telegram link with fake data');
								
								const fakeUser = {
									id: 8218568250, // Your real Telegram ID from logs
									first_name: 'james',
									username: 'testuser',
									auth_date: Math.floor(Date.now() / 1000),
									hash: 'fake_hash_for_testing'
								};
								
								window.onTelegramAuth(fakeUser);
							};
						}
					</script>
				</div>
			</div>
		</div>
	{/if}

	<div class="bg-white shadow-sm rounded-lg border">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 border-b">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Nome Gruppo
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Descrizione
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Tipo
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Azione
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.groups as group}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="font-medium text-gray-900">{group.name}</div>
								{#if group.isModerator}
									<div class="text-xs text-blue-600">Moderatore</div>
								{/if}
							</td>
							<td class="px-6 py-4">
								<div class="text-sm text-gray-600">{group.data.description || '-'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if group.data.type === 'default'}
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										Default
									</span>
								{:else}
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
										Local
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if group.isMember}
									{#if group.isModerator}
										<span class="text-sm text-blue-600 font-medium">Moderatore</span>
									{:else}
										<div class="flex gap-2">
											<span class="text-sm text-green-600">Iscritto</span>
											<form 
												method="POST" 
												action="?/leave"
												use:enhance={() => {
													loading = group.id;
													return async ({ update }) => {
														loading = null;
														await update();
													};
												}}
											>
												<input type="hidden" name="groupId" value={group.id} />
												<Button 
													type="submit" 
													variant="outline" 
													size="sm"
													disabled={loading === group.id}
												>
													{loading === group.id ? 'Uscendo...' : 'Esci'}
												</Button>
											</form>
										</div>
									{/if}
								{:else}
									<form 
										method="POST" 
										action="?/join"
										use:enhance={() => {
											loading = group.id;
											return async ({ update }) => {
												loading = null;
												await update();
											};
										}}
									>
										<input type="hidden" name="groupId" value={group.id} />
										<Button 
											type="submit" 
											size="sm"
											disabled={loading === group.id}
										>
											{loading === group.id ? 'Creando link...' : 'Iscriviti'}
										</Button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}

					{#if data.groups.length === 0}
						<tr>
							<td colspan="4" class="px-6 py-8 text-center text-gray-500">
								Nessun gruppo disponibile
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

		<div class="mt-6 text-sm text-gray-600">
			<p>Totale gruppi: {data.groups.length}</p>
			<p>Gruppi di cui fai parte: {data.groups.filter(g => g.isMember).length}</p>
		</div>
	</div>
</div>

