<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { User, Shield, Calendar, Mail } from 'lucide-svelte';

	onMount(() => {
		if (!$auth.loading && !$auth.isAuthenticated) {
			goto('/login');
		}
	});

	$: user = $auth.user;
	$: loading = $auth.loading;

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Dashboard - SvelteCo MVP</title>
</svelte:head>

{#if loading}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-muted-foreground">Loading...</h1>
		</div>
	</div>
{:else if user}
	<div class="space-y-6">
		<div>
			<h1 class="text-3xl font-bold">Welcome back!</h1>
			<p class="text-muted-foreground">Here's your account overview</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<Card class="p-6">
				<div class="flex items-center space-x-4">
					<div class="rounded-full bg-primary/10 p-3">
						<User class="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 class="text-lg font-semibold">Profile Information</h3>
						<p class="text-sm text-muted-foreground">Your account details</p>
					</div>
				</div>
				
				<div class="mt-4 space-y-3">
					<div class="flex items-center space-x-2">
						<Mail size={16} class="text-muted-foreground" />
						<span class="text-sm">{user.email}</span>
					</div>
					<div class="flex items-center space-x-2">
						<Shield size={16} class="text-muted-foreground" />
						<span class="text-sm capitalize">{user.role} User</span>
						<span class="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
							{user.role}
						</span>
					</div>
					<div class="flex items-center space-x-2">
						<Calendar size={16} class="text-muted-foreground" />
						<span class="text-sm">Joined {formatDate(user.created)}</span>
					</div>
				</div>
			</Card>

			<Card class="p-6">
				<div class="flex items-center space-x-4">
					<div class="rounded-full bg-green-100 p-3">
						<Shield class="h-6 w-6 text-green-600" />
					</div>
					<div>
						<h3 class="text-lg font-semibold">Account Status</h3>
						<p class="text-sm text-muted-foreground">Authentication & permissions</p>
					</div>
				</div>
				
				<div class="mt-4 space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm">Authentication Status</span>
						<span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
							Authenticated
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm">Role Permissions</span>
						<span class="text-xs text-muted-foreground">
							{#if user.role === 'admin'}
								Full Access
							{:else}
								Standard User
							{/if}
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm">Last Updated</span>
						<span class="text-xs text-muted-foreground">
							{formatDate(user.updated)}
						</span>
					</div>
				</div>
			</Card>
		</div>

		{#if user.role === 'admin'}
			<Card class="border-orange-200 bg-orange-50 p-6">
				<div class="flex items-center space-x-4">
					<div class="rounded-full bg-orange-100 p-3">
						<Shield class="h-6 w-6 text-orange-600" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-orange-900">Admin Access</h3>
						<p class="text-sm text-orange-700">You have administrator privileges</p>
					</div>
				</div>
				
				<div class="mt-4 space-y-2 text-sm text-orange-800">
					<p>• User management capabilities</p>
					<p>• System configuration access</p>
					<p>• Full application permissions</p>
				</div>
			</Card>
		{/if}

		<Card class="p-6">
			<h3 class="text-lg font-semibold mb-4">MVP Features Implemented</h3>
			<div class="grid gap-3 text-sm">
				<div class="flex items-center space-x-2">
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					<span>✅ User Registration & Login</span>
				</div>
				<div class="flex items-center space-x-2">
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					<span>✅ Role-based Authentication (Admin/User)</span>
				</div>
				<div class="flex items-center space-x-2">
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					<span>✅ Protected Routes</span>
				</div>
				<div class="flex items-center space-x-2">
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					<span>✅ PocketBase Backend Integration</span>
				</div>
				<div class="flex items-center space-x-2">
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					<span>✅ Responsive UI with shadcn/ui</span>
				</div>
			</div>
		</Card>
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-muted-foreground">Access Denied</h1>
			<p class="text-muted-foreground">Please log in to view this page</p>
		</div>
	</div>
{/if}