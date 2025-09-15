<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	// This page should redirect to first signup step
	// If we end up here, redirect client-side as backup
	onMount(async () => {
		console.log('🔄 Client-side redirect to /signup/basic');
		await goto('/signup/basic');
	});
</script>

<svelte:head>
	<title>Registrati - Disciplo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold">Caricamento...</h1>
			<p class="mt-2 text-muted-foreground">Preparando la registrazione</p>
		</div>
	</div>
</div>