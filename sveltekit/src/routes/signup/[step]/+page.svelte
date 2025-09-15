<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import FieldRenderer from '$lib/components/FieldRenderer.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import StepNavigation from '$lib/components/StepNavigation.svelte';
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
		
		// Populate with existing user data
		if (data.currentUserData) {
			Object.assign(result, data.currentUserData);
		}
		
		// Override with form data from server (in case of validation errors)
		if (form?.formData) {
			Object.assign(result, form.formData);
		}
		
		return result;
	});
</script>

<svelte:head>
	<title>{data.stepConfig.title} - Registrazione Disciplo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4 py-8">
	<div class="w-full max-w-2xl space-y-8">
		<!-- Progress Bar -->
		<ProgressBar 
			currentStep={data.navigation.currentIndex + 1}
			totalSteps={data.navigation.totalSteps}
			stepName={data.stepConfig.title}
		/>
		
		<!-- Step Content -->
		<div class="bg-white rounded-lg shadow-sm border p-8">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-foreground">{data.stepConfig.title}</h1>
				{#if data.stepConfig.description}
					<p class="mt-2 text-muted-foreground">{data.stepConfig.description}</p>
				{/if}
			</div>
			
			<!-- Step Form -->
			<form 
				id="step-form"
				method="POST" 
				action="?/next"
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
			</form>
			
			<!-- Navigation -->
			<StepNavigation
				isFirstStep={data.navigation.isFirstStep}
				isLastStep={data.navigation.isLastStep}
				loading={loading}
			/>
		</div>
		
		<!-- Additional Info -->
		<div class="text-center text-sm text-muted-foreground">
			{#if !data.navigation.isFirstStep}
				<p>Hai già un account? <a href="/login" class="text-primary hover:underline">Accedi</a></p>
			{/if}
		</div>
	</div>
</div>