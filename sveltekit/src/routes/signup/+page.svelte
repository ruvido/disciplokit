<script lang="ts">
	import { enhance } from '$app/forms';
	import FieldRenderer from '$lib/components/FieldRenderer.svelte';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	let loading = $state(false);

	// Prepare form data with current values
	const formData = $derived(() => {
		const result: Record<string, any> = {};

		// Override with form data from server (in case of validation errors)
		if (form?.formData) {
			Object.assign(result, form.formData);
		}

		return result;
	});
</script>

<svelte:head>
	<title>{data.stepConfig.title} - Disciplo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4 py-8">
	<div class="w-full max-w-2xl space-y-8">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-3xl font-bold text-foreground">{data.stepConfig.title}</h1>
			{#if data.stepConfig.description}
				<p class="mt-2 text-muted-foreground">{data.stepConfig.description}</p>
			{/if}
		</div>

		<!-- Simple Form -->
		<div class="bg-white rounded-lg shadow-sm border p-8">
			<form
				method="POST"
				enctype="multipart/form-data"
				class="space-y-6"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				{#each data.stepConfig.fields as field}
					<FieldRenderer
						field={field}
						value={formData[field.name]}
						error={form?.errors?.[field.name]}
						disabled={loading}
					/>
				{/each}

				{#if form?.error}
					<div class="bg-red-50 border border-red-200 rounded-md p-4">
						<p class="text-sm text-red-600">{form.error}</p>
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
				>
					{loading ? 'Invio in corso...' : 'Invia Richiesta'}
				</button>
			</form>
		</div>

		<!-- Footer -->
		<div class="text-center text-sm text-muted-foreground">
			<p>Hai già un account? <a href="/login" class="text-primary hover:underline">Accedi</a></p>
		</div>
	</div>
</div>