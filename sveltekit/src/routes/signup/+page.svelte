<script lang="ts">
	import type { PageData } from './$types';
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let email = '';
	let password = '';
	let name = '';
	let loading = false;
	let error = '';

	// If advanced config available, redirect to advanced flow
	$: if (data.signupConfig) {
		const firstStep = data.signupConfig.steps[0].id;
		goto(`/signup/${firstStep}`);
	}

	async function handleSignup() {
		if (!email || !password || !name) {
			error = 'Please fill all fields';
			return;
		}

		loading = true;
		error = '';

		try {
			await pb.collection('members').create({
				email,
				password,
				passwordConfirm: password,
				name,
				verified: false
			});

			// Auto login after signup
			await pb.collection('members').authWithPassword(email, password);

			goto('/dashboard');
		} catch (err: any) {
			console.error('Signup error:', err);
			error = err.message || 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Registrati - Disciplo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-foreground">Create Account</h1>
			<p class="mt-2 text-muted-foreground">Join our community</p>
		</div>

		<form on:submit|preventDefault={handleSignup} class="space-y-4">
			{#if error}
				<div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
					{error}
				</div>
			{/if}

			<div>
				<label for="name" class="block text-sm font-medium text-foreground mb-2">Full Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
					placeholder="Mario Rossi"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-foreground mb-2">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
					placeholder="mario@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-foreground mb-2">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength="8"
					class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
					placeholder="Create a secure password"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
			>
				{loading ? 'Creating Account...' : 'Create Account'}
			</button>
		</form>

		<div class="text-center">
			<p class="text-muted-foreground">
				Already have an account?
				<a href="/login" class="text-primary hover:underline">Sign in</a>
			</p>
		</div>
	</div>
</div>