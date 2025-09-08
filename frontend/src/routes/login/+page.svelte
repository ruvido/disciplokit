<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	onMount(() => {
		if ($auth.isAuthenticated) {
			goto('/dashboard');
		}
	});

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}

		loading = true;
		error = '';

		const result = await auth.login(email, password);

		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || 'Login failed';
		}

		loading = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>Login - SvelteCo MVP</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	<Card class="w-full max-w-md p-6">
		<div class="space-y-6">
			<div class="text-center">
				<h1 class="text-2xl font-bold">Welcome Back</h1>
				<p class="text-muted-foreground">Sign in to your account</p>
			</div>

			<form on:submit|preventDefault={handleLogin} class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="admin@test.com"
						bind:value={email}
						disabled={loading}
						on:keydown={handleKeyDown}
					/>
				</div>

				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="Enter your password"
						bind:value={password}
						disabled={loading}
						on:keydown={handleKeyDown}
					/>
				</div>

				{#if error}
					<div class="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
						{error}
					</div>
				{/if}

				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>

			<div class="text-center text-sm">
				<p class="text-muted-foreground">
					Don't have an account?
					<a href="/signup" class="font-medium text-primary hover:underline">
						Sign up
					</a>
				</p>
			</div>

			<div class="text-center text-xs text-muted-foreground border-t pt-4">
				<p><strong>Demo Credentials:</strong></p>
				<p>Admin: admin@test.com / admin123456</p>
			</div>
		</div>
	</Card>
</div>