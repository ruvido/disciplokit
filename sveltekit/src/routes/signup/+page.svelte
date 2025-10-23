<script lang="ts">
	import { enhance, applyAction } from '$app/forms';
	import FieldRenderer from '$lib/components/FieldRenderer.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import LoadingSpinner from '$lib/components/loading-spinner.svelte';
	import type { PageData, ActionData } from './$types';
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
	
	// Multi-step state management (Svelte 5 official patterns)
	let currentStepIndex = $state(0);
	let loading = $state(false);
	let stepErrors = $state<Record<string, string>>({});

	// Initialize form data synchronously to avoid race condition
	let allFormData = $state<Record<string, any>>(
		(() => {
			const initialData: Record<string, any> = {};

			if (data.signupConfig?.steps) {
				data.signupConfig.steps.forEach(step => {
					step.fields?.forEach(field => {
						initialData[field.name] = field.type === 'checkbox' ? [] : '';
					});
				});
			}

			if (data.prefillData) {
				Object.assign(initialData, data.prefillData);
			}

			return initialData;
		})()
	);

	// Derived values from config (NO hardcoding!)
	const currentStep = $derived(data.signupConfig?.steps?.[currentStepIndex]);
	const totalSteps = $derived(data.signupConfig?.steps?.length || 1);
	const isLastStep = $derived(currentStepIndex === totalSteps - 1);
	const isFirstStep = $derived(currentStepIndex === 0);
	const progressPercentage = $derived(((currentStepIndex + 1) / totalSteps) * 100);

	// Prepare form data with current values and prefill
	const formData = $derived(() => {
		const result: Record<string, any> = { ...allFormData };

		// Start with prefill data from server (for direct signup)
		if (data.prefillData) {
			Object.assign(result, data.prefillData);
		}

		// Override with form data from server (in case of validation errors)
		if (form?.formData) {
			Object.assign(result, form.formData);
		}

		return result;
	});

	// Step navigation functions
	function nextStep() {
		// Only validate when going forward
		if (!validateCurrentStep()) return;
		
		if (currentStepIndex < totalSteps - 1) {
			currentStepIndex++;
			stepErrors = {}; // Clear errors when moving to next step
		}
	}

	function prevStep() {
		// No validation when going back - just navigate
		if (currentStepIndex > 0) {
			currentStepIndex--;
			stepErrors = {}; // Clear errors when moving back
		}
	}

	// Validate current step fields
	function validateCurrentStep(): boolean {
		if (!currentStep?.fields) return true;
		
		const errors: Record<string, string> = {};
		let isValid = true;

		for (const field of currentStep.fields) {
			const value = allFormData[field.name];
			
			if (field.required) {
				if (field.type === 'checkbox') {
					if (!value || (Array.isArray(value) && value.length === 0)) {
						errors[field.name] = `${field.label} è richiesto`;
						isValid = false;
					}
				} else if (field.type === 'file') {
					// File validation will be handled in final submission
				} else if (!value || value.toString().trim() === '') {
					errors[field.name] = `${field.label} è richiesto`;
					isValid = false;
				}
			}

			// Additional validation for specific field types
			if (value && field.type === 'number') {
				const numValue = Number(value);
				if (isNaN(numValue)) {
					errors[field.name] = `${field.label} deve essere un numero`;
					isValid = false;
				} else if (field.min && numValue < field.min) {
					errors[field.name] = `${field.label} deve essere almeno ${field.min}`;
					isValid = false;
				} else if (field.max && numValue > field.max) {
					errors[field.name] = `${field.label} non può essere maggiore di ${field.max}`;
					isValid = false;
				}
			}

			if (value && field.type === 'textarea' && field.maxLength && value.toString().length > field.maxLength) {
				errors[field.name] = `${field.label} non può superare ${field.maxLength} caratteri`;
				isValid = false;
			}
		}

		stepErrors = errors;
		return isValid;
	}

	// Form data is now handled directly via bind:value

	// Note: Final submission now handled by use:enhance in the form
</script>

<svelte:head>
	<title>{currentStep?.title || 'Registrazione'} - Disciplo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4 py-8">
	<div class="w-full max-w-2xl space-y-8">
		<!-- Progress Bar -->
		<ProgressBar 
			currentStep={currentStepIndex + 1}
			totalSteps={totalSteps}
			stepName={currentStep?.title}
		/>

		<!-- Header -->
		<div class="text-center">
			<h1 class="text-3xl font-bold text-foreground">{currentStep?.title || 'Registrazione'}</h1>
			{#if currentStep?.description}
				<p class="mt-2 text-muted-foreground">{currentStep.description}</p>
			{/if}
		</div>

		<!-- Multi-Step Form (Official SvelteKit Pattern) -->
		<div class="bg-white rounded-lg shadow-sm border p-8">
			{#if currentStep?.fields}
				<form 
					method="POST"
					enctype="multipart/form-data"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							if (!isLastStep) {
								nextStep();
							}
						}
					}}
					use:enhance={({ formData, cancel }) => {
						loading = true;
						
						const action = formData.get('action') as string;
						
						// Handle client-side navigation (cancel server submission)
						if (action === 'prev') {
							cancel();
							prevStep();
							loading = false;
							return;
						}
						
						if (action === 'next') {
							cancel();
							nextStep();
							loading = false;
							return;
						}
						
						// Only submit to server for final step
						if (action === 'final') {
							// Prepare final data with all collected info + files + passwordConfirm
							const finalData = { ...allFormData };
							
							// Add passwordConfirm for PocketBase validation
							if (finalData.password) {
								formData.set('passwordConfirm', finalData.password as string);
							}
							
							// Add all collected form data
							Object.entries(finalData).forEach(([key, value]) => {
								if (value !== null && value !== undefined) {
									if (Array.isArray(value)) {
										// Handle checkboxes
										value.forEach(v => formData.append(key, v));
									} else {
										formData.set(key, value.toString());
									}
								}
							});
							
							// Handle file uploads
							const fileInputs = document.querySelectorAll('input[type="file"]');
							fileInputs.forEach((input: any) => {
								if (input.files && input.files[0]) {
									formData.set(input.name, input.files[0]);
								}
							});
							
							// Add required fields for members collection
							formData.set('telegram', '');
							formData.set('role', 'member');
							formData.set('admin', 'false');
							formData.set('banned', 'false');
						}
						
						// Return handler for server submission result
						return async ({ result, update }) => {
							loading = false;
							if (result.type === 'success') {
								// Redirect on success
								const redirectUrl = data.signupConfig?.completion?.redirect || '/dashboard';
								await goto(redirectUrl);
							} else {
								// Apply action for error handling
								await applyAction(result);
							}
						};
					}}
				>
					<!-- Form Fields -->
					<div class="space-y-6">
						{#each currentStep.fields as field}
							<FieldRenderer
								field={field}
								bind:value={allFormData[field.name]}
								error={stepErrors[field.name]}
								disabled={loading}
							/>
						{/each}

						{#if stepErrors._form}
							<div class="bg-red-50 border border-red-200 rounded-md p-4">
								<p class="text-sm text-red-600">{stepErrors._form}</p>
							</div>
						{/if}

						{#if form?.error}
							<div class="bg-red-50 border border-red-200 rounded-md p-4">
								<p class="text-sm text-red-600">{form.error}</p>
							</div>
						{/if}

						<!-- Navigation Buttons (Official SvelteKit Pattern) -->
						<div class="flex justify-between pt-6">
							{#if !isFirstStep}
								<button
									type="button"
									onclick={() => prevStep()}
									disabled={loading}
									class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Indietro
								</button>
							{:else}
								<div></div>
							{/if}

							{#if isLastStep}
								<button
									type="submit"
									name="action"
									value="final"
									disabled={loading}
									class="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
								>
									{loading ? 'Creazione account...' : 'Completa Registrazione'}
								</button>
							{:else}
								<button
									type="button"
									onclick={() => nextStep()}
									disabled={loading}
									class="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
								>
									Avanti
								</button>
							{/if}
						</div>
					</div>
				</form>
			{:else}
				<LoadingSpinner message="Caricamento configurazione..." />
			{/if}
		</div>

		<!-- Footer -->
		<div class="text-center text-sm text-muted-foreground">
			<p>Hai già un account? <a href="/login" class="text-primary hover:underline">Accedi</a></p>
		</div>
	</div>
</div>