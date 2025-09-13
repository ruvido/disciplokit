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
											{loading === group.id ? 'Iscrivendosi...' : 'Iscriviti'}
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