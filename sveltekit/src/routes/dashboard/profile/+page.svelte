<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import MobileMenu from "$lib/components/mobile-menu.svelte";
	import LoadingSpinner from "$lib/components/loading-spinner.svelte";
	import ErrorBoundary from "$lib/components/error-boundary.svelte";
	import { page } from '$app/stores';
	
	interface Props {
		data: PageData;
	}
	
	let { data }: Props = $props();
	let isLoading = $state(false);
	
	// Menu items based on user role
	const menuItems = data.user?.role === 'admin' 
		? [
			{ href: '/dashboard/profile', label: 'Profile' },
			{ href: '/admin/dashboard', label: 'Members' }
		]
		: [
			{ href: '/dashboard/profile', label: 'Profile' }
		];
	
	// Format date helper
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	// Calculate days since registration
	function daysSinceRegistration(created: string) {
		const diff = Date.now() - new Date(created).getTime();
		return Math.floor(diff / (1000 * 60 * 60 * 24));
	}
</script>

<div class="min-h-screen bg-background">
	<MobileMenu 
		menuItems={menuItems}
		currentPath={$page.url.pathname}
		userEmail={data.user?.email}
	/>
	
	<div class="container mx-auto p-4 max-w-2xl space-y-6">
		{#snippet errorBoundaryContent()}
			{#if isLoading}
				<LoadingSpinner message="Loading profile..." />
			{:else}
		<!-- Profile Header -->
		<div class="text-center space-y-4">
			<div class="mx-auto h-20 w-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
				{data.user?.email?.substring(0, 2).toUpperCase()}
			</div>
			<div>
				<h1 class="text-2xl font-bold">{data.user?.name || data.user?.email?.split('@')[0]}</h1>
				<p class="text-muted-foreground">{data.user?.email}</p>
				<div class="flex items-center justify-center gap-2 mt-2">
					<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
						{data.user?.role === 'admin' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20' : 
						 data.user?.role === 'moderator' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' : 
						 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'}">
						{data.user?.role}
					</span>
					{#if data.user?.verified}
						<span class="text-green-600 text-sm">Verified</span>
					{:else}
						<span class="text-yellow-600 text-sm">Unverified</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-2 gap-4">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-center">Member Since</Card.Title>
				</Card.Header>
				<Card.Content class="text-center">
					<div class="text-xl font-bold">{daysSinceRegistration(data.user?.created)} days</div>
					<p class="text-xs text-muted-foreground mt-1">
						{formatDate(data.user?.created)}
					</p>
				</Card.Content>
			</Card.Root>
			
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-center">Last Active</Card.Title>
				</Card.Header>
				<Card.Content class="text-center">
					<div class="text-xl font-bold">
						{new Date(data.user?.updated).toLocaleDateString('en-GB')}
					</div>
					<p class="text-xs text-muted-foreground mt-1">
						{new Date(data.user?.updated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
					</p>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Account Details -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Account Information</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="flex justify-between items-center py-2 border-b border-border/50">
					<span class="text-sm text-muted-foreground">Email</span>
					<span class="text-sm font-medium">{data.user?.email}</span>
				</div>
				<div class="flex justify-between items-center py-2 border-b border-border/50">
					<span class="text-sm text-muted-foreground">Role</span>
					<span class="text-sm font-medium capitalize">{data.user?.role}</span>
				</div>
				<div class="flex justify-between items-center py-2 border-b border-border/50">
					<span class="text-sm text-muted-foreground">Status</span>
					<span class="text-sm font-medium {data.user?.verified ? 'text-green-600' : 'text-yellow-600'}">
						{data.user?.verified ? 'Verified' : 'Unverified'}
					</span>
				</div>
				<div class="flex justify-between items-center py-2 border-b border-border/50">
					<span class="text-sm text-muted-foreground">User ID</span>
					<span class="text-sm font-mono text-muted-foreground">{data.user?.id.substring(0, 8)}...</span>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Quick Actions -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Quick Actions</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<Button variant="outline" class="w-full justify-start text-left">
					Edit Profile
				</Button>
				<Button variant="outline" class="w-full justify-start text-left">
					Change Email
				</Button>
				<Button variant="outline" class="w-full justify-start text-left">
					Change Password
				</Button>
				{#if !data.user?.verified}
					<Button variant="default" class="w-full justify-start text-left">
						Verify Email
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>
			{/if}
		{/snippet}

		<ErrorBoundary error={null} children={errorBoundaryContent}></ErrorBoundary>
	</div>
</div>