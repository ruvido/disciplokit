<script lang="ts">
	interface Props {
		currentStep: number;
		totalSteps: number;
		stepName?: string;
	}
	
	let { currentStep, totalSteps, stepName }: Props = $props();
	
	const progressPercentage = $derived((currentStep / totalSteps) * 100);
</script>

<div class="w-full mb-8">
	<div class="flex justify-between text-sm text-muted-foreground mb-2">
		<span>Step {currentStep} di {totalSteps}</span>
		{#if stepName}
			<span>{stepName}</span>
		{/if}
	</div>
	
	<div class="w-full bg-gray-200 rounded-full h-2">
		<div 
			class="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
			style="width: {progressPercentage}%"
		></div>
	</div>
	
	<div class="flex justify-between text-xs text-muted-foreground mt-1">
		<span>{Math.round(progressPercentage)}% completato</span>
		<span>{totalSteps - currentStep} step rimanenti</span>
	</div>
</div>