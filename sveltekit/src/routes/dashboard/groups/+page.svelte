<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
	import MobileMenu from "$lib/components/mobile-menu.svelte";
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state<string | null>(null);

	// Menu items based on user admin status
	const menuItems = data.user?.admin
		? [
			{ href: '/dashboard/groups', label: 'Groups' },
			{ href: '/dashboard/profile', label: 'Profile' },
			{ href: '/admin/dashboard', label: 'Members' }
		]
		: [
			{ href: '/dashboard/groups', label: 'Groups' },
			{ href: '/dashboard/profile', label: 'Profile' }
		];

	// Helper function to format date
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Groups - Disciplo</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<MobileMenu
		menuItems={menuItems}
		currentPath={$page.url.pathname}
		userEmail={data.user?.email}
	/>

	<div class="container mx-auto p-4 max-w-4xl space-y-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">Groups</h1>
			<div class="flex space-x-2">
				{#if data.user?.telegram?.id}
					<form
						method="POST"
						action="?/sync"
						use:enhance={() => {
							loading = 'sync';
							return async ({ update }) => {
								loading = null;
								await update();
							};
						}}
					>
						<Button
							type="submit"
							variant="outline"
							size="sm"
							disabled={loading === 'sync'}
						>
							{loading === 'sync' ? 'Syncing...' : '↻ Sync Groups'}
						</Button>
					</form>
				{/if}
				{#if data.user?.admin}
					<Button href="/admin/groups/create">+ Create Group</Button>
				{/if}
			</div>
		</div>

		<!-- Success/Error Messages -->
		{#if form?.error}
			<div class="bg-red-50 border border-red-200 rounded-md p-4">
				<p class="text-sm text-red-600">{form.error}</p>
			</div>
		{/if}

		{#if form?.success}
			<div class="bg-green-50 border border-green-200 rounded-md p-4">
				<p class="text-sm text-green-600">{form.message}</p>
			</div>
		{/if}

		<!-- User's Groups -->
		{#if data.userGroups && data.userGroups.length > 0}
			<Card>
				<CardHeader>
					<CardTitle>Your Groups</CardTitle>
					<CardDescription>Groups you're currently a member of</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each data.userGroups as group}
							<div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
								<div class="flex-1">
									<div class="flex items-center space-x-2">
										<h3 class="font-medium">{group.name}</h3>
										{#if group.isModerator}
											<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
												Moderator
											</span>
										{/if}
									</div>
									<p class="text-sm text-gray-600">{group.data?.description || 'No description available'}</p>
									<p class="text-xs text-gray-500">
										Joined {formatDate(group.joinedAt)}
									</p>
								</div>
								<div class="flex items-center space-x-2">
									{#if !group.isModerator}
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
												{loading === group.id ? 'Leaving...' : 'Leave'}
											</Button>
										</form>
									{:else}
										<Button
											variant="outline"
											size="sm"
											disabled
										>
											Moderator
										</Button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Empty States -->
		{#if !data.userGroups || data.userGroups.length === 0}
			<Card>
				<CardContent class="text-center py-12">
					<div class="space-y-4">
						<div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
							<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
							</svg>
						</div>
						<div>
							<h3 class="text-lg font-medium text-gray-900 mb-2">No groups available</h3>
							<p class="text-gray-500">There are no groups to join at the moment.</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Stats -->
		<div class="text-sm text-gray-600 text-center space-y-1">
			<p>Your groups: {data.userGroups?.length || 0}</p>
			{#if data.user?.telegram?.name}
				<p>Connected to Telegram as: <strong>{data.user.telegram.name}</strong></p>
			{/if}
		</div>
	</div>
</div>