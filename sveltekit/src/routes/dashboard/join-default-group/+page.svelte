<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let isJoining = $state(false);

	// Auto-submit on page load
	let formElement: HTMLFormElement;

	$effect(() => {
		if (formElement && !isJoining && !form) {
			// Auto-submit after a short delay to show the UI
			setTimeout(() => {
				if (formElement) {
					formElement.requestSubmit();
				}
			}, 1500);
		}
	});
</script>

<svelte:head>
	<title>Joining Community - Disciplo</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
	<div class="max-w-md w-full space-y-6">

		<!-- Progress Indicator -->
		<div class="text-center">
			<div class="text-sm text-gray-500 mb-2">Step 2 of 2</div>
			<div class="w-full bg-gray-200 rounded-full h-2">
				<div class="bg-blue-600 h-2 rounded-full w-full transition-all duration-300"></div>
			</div>
		</div>

		<!-- Status Card -->
		<Card class="shadow-xl">
			<CardHeader class="text-center space-y-4">
				<div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
					{#if isJoining}
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
					{:else if form?.success === false}
						<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					{:else}
						<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					{/if}
				</div>
				<CardTitle class="text-2xl">
					{#if isJoining}
						Joining Community...
					{:else if form?.success === false}
						Join Failed
					{:else}
						Almost Ready!
					{/if}
				</CardTitle>
			</CardHeader>

			<CardContent class="space-y-6">
				<!-- User Info -->
				<div class="text-center text-sm text-gray-600">
					<p>Account: <strong>{data.user?.email}</strong></p>
					{#if data.user?.telegram?.name}
						<p>Telegram: <strong>{data.user.telegram.name}</strong></p>
					{/if}
				</div>

				<!-- Status Display -->
				<div class="space-y-3">
					<div class="flex items-center space-x-3">
						<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
							<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
							</svg>
						</div>
						<span class="text-sm">Telegram Connected</span>
					</div>

					<div class="flex items-center space-x-3">
						{#if isJoining}
							<div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
								<div class="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
							</div>
							<span class="text-sm">Joining default community group...</span>
						{:else if form?.success === false}
							<div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
								</svg>
							</div>
							<span class="text-sm text-red-600">Failed to join community</span>
						{:else}
							<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
								</svg>
							</div>
							<span class="text-sm">Community access ready</span>
						{/if}
					</div>
				</div>

				<!-- Error Display -->
				{#if form?.error}
					<div class="bg-red-50 border border-red-200 rounded-md p-4">
						<p class="text-sm text-red-600 font-medium">Error:</p>
						<p class="text-sm text-red-600">{form.error}</p>
					</div>
				{/if}

				<!-- Auto-join Form -->
				<form
					bind:this={formElement}
					method="POST"
					use:enhance={() => {
						isJoining = true;
						return async ({ update }) => {
							isJoining = false;
							await update();
						};
					}}
				>
					{#if form?.success === false}
						<Button
							type="submit"
							class="w-full"
							disabled={isJoining}
						>
							{isJoining ? 'Retrying...' : 'Retry Join Community'}
						</Button>
					{/if}
				</form>

				<!-- Success Message -->
				{#if !isJoining && !form?.error}
					<div class="text-center text-sm text-gray-600">
						<p class="font-medium mb-2">You'll have access to:</p>
						<ul class="space-y-1">
							<li>• Community discussions</li>
							<li>• Group management</li>
							<li>• Full dashboard features</li>
						</ul>
						<p class="mt-4 text-xs text-gray-500">
							{isJoining ? 'Please wait...' : 'Redirecting to dashboard...'}
						</p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Help -->
		{#if form?.success === false}
			<div class="text-center">
				<Button variant="ghost" size="sm" href="/dashboard/groups">
					Go to Profile
				</Button>
			</div>
		{/if}
	</div>
</div>