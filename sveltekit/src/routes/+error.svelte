<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
</script>

<div class="container mx-auto flex min-h-[60vh] items-center justify-center p-6">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl">
				{$page.status === 403 ? 'Access Denied' : 
				 $page.status === 404 ? 'Page Not Found' : 
				 'An Error Occurred'}
			</Card.Title>
			<Card.Description>
				{#if $page.error?.message}
					{$page.error.message}
				{:else if $page.status === 403}
					You don't have permission to access this page.
				{:else if $page.status === 404}
					The page you're looking for doesn't exist.
				{:else}
					Something went wrong. Please try again.
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if $page.error?.hint}
				<p class="mb-4 text-sm text-muted-foreground">{$page.error.hint}</p>
			{/if}
			<div class="flex gap-4">
				<Button href="/" variant="outline">Go Home</Button>
				<Button href="/dashboard">Go to Dashboard</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>