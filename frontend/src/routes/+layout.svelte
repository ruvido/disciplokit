<script lang="ts">
	import '../app.css';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import { LogOut, User } from 'lucide-svelte';

	onMount(() => {
		auth.init();
	});

	function handleLogout() {
		auth.logout();
		goto('/login');
	}

	$: user = $auth.user;
	$: isAuthenticated = $auth.isAuthenticated;
	$: currentPath = $page.url.pathname;
</script>

<div class="min-h-screen bg-background">
	{#if isAuthenticated && user}
		<header class="border-b bg-card">
			<div class="container mx-auto flex h-16 items-center justify-between px-4">
				<div class="flex items-center space-x-4">
					<h1 class="text-xl font-semibold">SvelteCo MVP</h1>
					<nav class="flex space-x-4">
						<a
							href="/dashboard"
							class="text-sm font-medium transition-colors hover:text-primary {currentPath === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}"
						>
							Dashboard
						</a>
					</nav>
				</div>
				
				<div class="flex items-center space-x-4">
					<div class="flex items-center space-x-2 text-sm">
						<User size={16} />
						<span>{user.email}</span>
						<span class="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
							{user.role}
						</span>
					</div>
					<Button variant="ghost" size="sm" on:click={handleLogout}>
						<LogOut size={16} />
						Logout
					</Button>
				</div>
			</div>
		</header>
	{/if}

	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>
</div>