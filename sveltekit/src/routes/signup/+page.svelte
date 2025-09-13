<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ActionData } from './$types';

	interface Props {
		form?: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Registrati - Disciplo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold">Registrati su Disciplo</h1>
			<p class="mt-2 text-muted-foreground">Crea il tuo account</p>
		</div>

		<form 
			method="POST" 
			class="space-y-4"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
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
					value={form?.email || ''}
					required
					disabled={loading}
				/>
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					required
					disabled={loading}
				/>
			</div>

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 rounded-md p-3">
					<p class="text-sm text-red-600">{form.error}</p>
				</div>
			{/if}

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Registrazione...' : 'Registrati'}
			</Button>
		</form>

		<div class="text-center">
			<p class="text-muted-foreground">
				Hai già un account?
				<a href="/login" class="text-primary hover:underline">Accedi</a>
			</p>
		</div>
	</div>
</div>