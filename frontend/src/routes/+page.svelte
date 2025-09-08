<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		const unsubscribe = auth.subscribe(authState => {
			if (!authState.loading) {
				if (authState.isAuthenticated) {
					goto('/dashboard');
				} else {
					goto('/login');
				}
			}
		});

		return unsubscribe;
	});
</script>

<div class="flex min-h-[50vh] items-center justify-center">
	<div class="text-center">
		<h1 class="text-2xl font-bold text-muted-foreground">Loading...</h1>
	</div>
</div>