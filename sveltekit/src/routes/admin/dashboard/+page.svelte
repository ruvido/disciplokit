<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { enhance } from '$app/forms';
	import MobileMenu from "$lib/components/mobile-menu.svelte";
	import LoadingSpinner from "$lib/components/loading-spinner.svelte";
	import ErrorBoundary from "$lib/components/error-boundary.svelte";
	import { page } from '$app/stores';
	
	interface Props {
		data: PageData;
		form?: ActionData;
	}
	
	let { data, form }: Props = $props();
	
	let deletingUserId = $state<string | null>(null);
	let updatingRoleUserId = $state<string | null>(null);
	let isLoading = $state(false);
	
	const adminMenuItems = [
		{ href: '/dashboard/groups', label: 'Groups' },
		{ href: '/dashboard/profile', label: 'Profile' },
		{ href: '/admin/dashboard', label: 'Members' }
	];
</script>

<div class="min-h-screen bg-background">
	<MobileMenu 
		menuItems={adminMenuItems}
		currentPath={$page.url.pathname}
		userEmail={data.user?.email}
	/>
	
	<div class="container mx-auto p-4 max-w-4xl">
	
	<ErrorBoundary error={form?.error as string | null}>
		{#if isLoading}
			<LoadingSpinner message="Loading dashboard..." />
		{:else}
			<div class="grid gap-6 mb-8 md:grid-cols-2">
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-base">User Statistics</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Total Users</span>
					<span class="text-2xl font-bold">{data.members?.length || 0}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Admins</span>
					<span class="text-lg font-semibold text-red-600">
						{data.members?.filter(m => m.admin === true).length || 0}
					</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Moderators</span>
					<span class="text-lg font-semibold text-blue-600">
						{data.members?.filter(m => m.role === 'moderator').length || 0}
					</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Members</span>
					<span class="text-lg font-semibold">
						{data.members?.filter(m => m.role === 'member').length || 0}
					</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Verified Users</span>
					<span class="text-lg font-semibold text-green-600">
						{data.members?.filter(m => m.verified).length || 0}
					</span>
				</div>
			</Card.Content>
		</Card.Root>
		
		<Card.Root>
			<Card.Header class="pb-3 flex flex-row items-center justify-between space-y-0">
				<Card.Title class="text-base">Member Growth</Card.Title>
				{@const growthData = (() => {
					const now = new Date();
					const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
					const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
					
					const last30Days = (data.members || []).filter(member => {
						const created = new Date(member.created);
						return created >= thirtyDaysAgo && created <= now;
					}).length;
					
					const previous30Days = (data.members || []).filter(member => {
						const created = new Date(member.created);
						return created >= sixtyDaysAgo && created < thirtyDaysAgo;
					}).length;
					
					const percentChange = previous30Days === 0 
						? (last30Days > 0 ? 100 : 0)
						: ((last30Days - previous30Days) / previous30Days * 100);
					
					return {
						current: last30Days,
						previous: previous30Days,
						change: percentChange
					};
				})()}
				<div class="flex items-center gap-2">
					<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
						{growthData.change >= 0 
							? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' 
							: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'}">
						{growthData.change >= 0 ? '+' : ''}{growthData.change.toFixed(0)}%
					</span>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold mb-2">{data.members?.length || 0}</div>
				<p class="text-xs text-muted-foreground mb-4">Total members registered</p>
				
				<!-- Growth chart based on created dates -->
				{@const monthlyData = (() => {
					const months = [];
					const now = new Date();
					
					// Create 12 months data (current month - 11 to current month)
					for (let i = 11; i >= 0; i--) {
						const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
						const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
						const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
						
						const count = (data.members || []).filter(member => {
							const created = new Date(member.created);
							return created >= monthStart && created <= monthEnd;
						}).length;
						
						months.push({
							month: date.toLocaleDateString('en', { month: 'short' }),
							count: count
						});
					}
					return months;
				})()}
				
				<div class="h-20 flex items-end justify-between gap-1">
					{#each monthlyData as monthData}
						{@const maxCount = Math.max(...monthlyData.map(m => m.count), 1)}
						<div class="bg-primary/20 rounded-t flex-1 transition-all hover:bg-primary/30 group relative"
							 style="height: {Math.max(8, (monthData.count / maxCount) * 80)}px">
							<div class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
								{monthData.count} members
							</div>
						</div>
					{/each}
				</div>
				<div class="flex justify-between text-xs text-muted-foreground mt-2">
					<span>{monthlyData[0]?.month}</span>
					<span>{monthlyData[monthlyData.length - 1]?.month}</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
	
	<Card.Root>
		<Card.Header>
			<Card.Title>User Management</Card.Title>
			<Card.Description>View all registered users</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<th class="text-left p-2">Name</th>
							<th class="text-left p-2">Email</th>
							<th class="text-left p-2">Updated</th>
							<th class="text-left p-2">Verified</th>
						</tr>
					</thead>
					<tbody>
						{#each data.members || [] as member}
							<tr class="border-b">
								<td class="p-2">
									<div class="flex items-center gap-2">
										<span class="font-medium">
											{member.name || member.email?.split('@')[0] || 'Unknown'}
										</span>
										{#if member.admin}
											<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
												admin
											</span>
										{/if}
									</div>
								</td>
								<td class="p-2 text-sm text-muted-foreground">{member.email}</td>
								<td class="p-2 text-sm text-muted-foreground">
									{new Date(member.updated).toLocaleDateString('en-GB')}
								</td>
								<td class="p-2">
									{#if member.verified}
										<span class="text-green-600 text-sm">✓ Verified</span>
									{:else}
										<span class="text-yellow-600 text-sm">⚠ Pending</span>
									{/if}
								</td>
							</tr>
						{/each}
						{#if !data.members || data.members.length === 0}
							<tr>
								<td colspan="4" class="p-4 text-center text-muted-foreground">
									No users found
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</Card.Content>
	</Card.Root>
		{/if}
	</ErrorBoundary>
	</div>
</div>