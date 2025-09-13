<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import LoadingSpinner from '$lib/components/loading-spinner.svelte';

	interface Props {
		type: 'login' | 'signup';
		error?: string;
		email?: string;
	}

	let { type, error, email = '' }: Props = $props();
	let isSubmitting = $state(false);
	let clientError = $state('');

	// Client-side email validation for instant feedback
	function validateEmail(email: string): string | null {
		if (!email) return 'Email richiesta';
		if (!email.includes('@')) return 'Formato email non valido';
		if (email.length > 254) return 'Email troppo lunga';
		return null;
	}

	// Client-side password validation
	function validatePassword(password: string): string | null {
		if (!password) return 'Password richiesta';
		if (password.length < 6) return 'Password troppo corta (minimo 6 caratteri)';
		if (password.length > 128) return 'Password troppo lunga';
		return null;
	}

	// Enhanced form submission with client-side validation
	function handleSubmit(event: Event) {
		console.log('🚀 Form submission started for:', type);
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		
		const emailValue = formData.get('email')?.toString() || '';
		const passwordValue = formData.get('password')?.toString() || '';
		console.log('📝 Form data:', { email: emailValue, password: passwordValue ? '[PROVIDED]' : '[MISSING]' });

		// Pre-validate on client
		const emailError = validateEmail(emailValue);
		const passwordError = validatePassword(passwordValue);

		if (emailError || passwordError) {
			console.log('❌ Client validation failed:', emailError || passwordError);
			clientError = emailError || passwordError || '';
			event.preventDefault();
			return;
		}

		console.log('✅ Client validation passed, submitting...');
		clientError = '';
		isSubmitting = true;
	}
</script>

<form 
	method="POST" 
	class="space-y-4" 
	onsubmit={handleSubmit}
	use:enhance={() => {
		console.log('🔄 SvelteKit enhance activated');
		return async ({ update, result }) => {
			console.log('📨 Server response received:', result);
			isSubmitting = false;
			await update();
		};
	}}
>
	<div class="space-y-2">
		<Label for="email">Email</Label>
		<Input
			id="email"
			name="email"
			type="email"
			value={email}
			required
			disabled={isSubmitting}
			class="transition-colors"
			placeholder="your@email.com"
		/>
	</div>

	<div class="space-y-2">
		<Label for="password">Password</Label>
		<Input
			id="password"
			name="password"
			type="password"
			required
			disabled={isSubmitting}
			class="transition-colors"
			placeholder="La tua password"
		/>
	</div>

	{#if error || clientError}
		<div class="bg-destructive/10 border border-destructive/20 rounded-md p-3">
			<p class="text-sm text-destructive">{clientError || error}</p>
		</div>
	{/if}

	<Button 
		type="submit" 
		class="w-full" 
		disabled={isSubmitting}
	>
		{#if isSubmitting}
			<LoadingSpinner message="" />
			<span class="ml-2">
				{type === 'login' ? 'Accesso in corso...' : 'Registrazione in corso...'}
			</span>
		{:else}
			{type === 'login' ? 'Accedi' : 'Registrati'}
		{/if}
	</Button>
</form>