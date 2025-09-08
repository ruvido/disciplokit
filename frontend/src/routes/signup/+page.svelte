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
	let passwordConfirm = '';
	let loading = false;
	let error = '';

	onMount(() => {
		if ($auth.isAuthenticated) {
			goto('/dashboard');
		}
	});

	async function handleSignup() {
		if (!email || !password || !passwordConfirm) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== passwordConfirm) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		loading = true;
		error = '';

		const result = await auth.signup(email, password, passwordConfirm);

		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || 'Signup failed';
		}

		loading = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSignup();
		}
	}
</script>

<svelte:head>
	<title>Sign Up - SvelteCo MVP</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	<Card class="w-full max-w-md p-6">
		<div class="space-y-6">
			<div class="text-center">
				<h1 class="text-2xl font-bold">Create Account</h1>
				<p class="text-muted-foreground">Sign up for a new account</p>
			</div>

			<form on:submit|preventDefault={handleSignup} class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="your@email.com"
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
						placeholder="Create a password"
						bind:value={password}
						disabled={loading}
						on:keydown={handleKeyDown}
					/>
				</div>

				<div class="space-y-2">
					<Label for="passwordConfirm">Confirm Password</Label>
					<Input
						id="passwordConfirm"
						type="password"
						placeholder="Confirm your password"
						bind:value={passwordConfirm}
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
					{loading ? 'Creating account...' : 'Create Account'}
				</Button>
			</form>

			<div class="text-center text-sm">
				<p class="text-muted-foreground">
					Already have an account?
					<a href="/login" class="font-medium text-primary hover:underline">
						Sign in
					</a>
				</p>
			</div>
		</div>
	</Card>
</div>