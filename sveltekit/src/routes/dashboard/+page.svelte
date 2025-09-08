<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	
	interface Props {
		data: PageData;
	}
	
	let { data }: Props = $props();
	
	// Format date helper
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
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

<div class="container mx-auto p-6 space-y-8">
	<!-- Header Section -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Member Dashboard</h1>
			<p class="text-muted-foreground">Manage your account and view your statistics</p>
		</div>
		<Button href="/settings" variant="outline">
			Edit Profile
		</Button>
	</div>
	
	<!-- Profile Overview Card -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center space-x-4">
				<div class="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
					{data.user?.email?.substring(0, 2).toUpperCase()}
				</div>
				<div class="flex-1">
					<Card.Title class="text-2xl">{data.user?.name || data.user?.email?.split('@')[0]}</Card.Title>
					<Card.Description class="flex items-center gap-4 mt-1">
						<span>{data.user?.email}</span>
						<span class="capitalize">{data.user?.role}</span>
					</Card.Description>
				</div>
				<div class="text-right">
					{#if data.user?.verified}
						<div class="flex items-center gap-2 text-green-600">
							<span class="text-sm font-medium">✓ Verified</span>
						</div>
					{:else}
						<div class="flex items-center gap-2 text-yellow-600">
							<span class="text-sm font-medium">⚠ Unverified</span>
						</div>
					{/if}
				</div>
			</div>
		</Card.Header>
	</Card.Root>
	
	<!-- Stats Grid -->
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Account Status</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold capitalize">{data.user?.role || 'Member'}</div>
				<p class="text-xs text-muted-foreground">
					Your current access level
				</p>
			</Card.Content>
		</Card.Root>
		
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Member Since</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{daysSinceRegistration(data.user?.created)} days</div>
				<p class="text-xs text-muted-foreground">
					Joined {formatDate(data.user?.created)}
				</p>
			</Card.Content>
		</Card.Root>
		
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Email Status</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{data.user?.verified ? 'Verified' : 'Pending'}
				</div>
				<p class="text-xs text-muted-foreground">
					{data.user?.verified ? 'Your email is confirmed' : 'Please verify your email'}
				</p>
			</Card.Content>
		</Card.Root>
		
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Last Updated</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{new Date(data.user?.updated).toLocaleDateString()}
				</div>
				<p class="text-xs text-muted-foreground">
					{new Date(data.user?.updated).toLocaleTimeString()}
				</p>
			</Card.Content>
		</Card.Root>
	</div>
	
	<!-- Account Information -->
	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Account Information</Card.Title>
				<Card.Description>Your account details and metadata</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p class="text-muted-foreground">User ID</p>
						<p class="font-mono">{data.user?.id}</p>
					</div>
					<div>
						<p class="text-muted-foreground">Collection</p>
						<p class="font-mono">{data.user?.collectionName}</p>
					</div>
					<div>
						<p class="text-muted-foreground">Created</p>
						<p>{formatDate(data.user?.created)}</p>
					</div>
					<div>
						<p class="text-muted-foreground">Modified</p>
						<p>{formatDate(data.user?.updated)}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
		
		<Card.Root>
			<Card.Header>
				<Card.Title>Quick Actions</Card.Title>
				<Card.Description>Common tasks and settings</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<Button variant="outline" class="w-full justify-start">
					Update Profile
				</Button>
				<Button variant="outline" class="w-full justify-start">
					Change Email
				</Button>
				<Button variant="outline" class="w-full justify-start">
					Change Password
				</Button>
				{#if !data.user?.verified}
					<Button variant="default" class="w-full justify-start">
						Verify Email
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>