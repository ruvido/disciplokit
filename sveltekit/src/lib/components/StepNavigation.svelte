<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	
	interface Props {
		isFirstStep: boolean;
		isLastStep: boolean;
		loading?: boolean;
		canGoBack?: boolean;
	}
	
	let { isFirstStep, isLastStep, loading = false, canGoBack = true }: Props = $props();
</script>

<div class="flex justify-between items-center pt-6 border-t">
	{#if !isFirstStep && canGoBack}
		<form method="POST" action="?/previous" use:enhance>
			<Button type="submit" variant="outline" disabled={loading}>
				← Indietro
			</Button>
		</form>
	{:else}
		<div></div>
	{/if}
	
	<Button type="submit" form="step-form" disabled={loading}>
		{#if loading}
			Salvando...
		{:else if isLastStep}
			Completa registrazione
		{:else}
			Continua →
		{/if}
	</Button>
</div>