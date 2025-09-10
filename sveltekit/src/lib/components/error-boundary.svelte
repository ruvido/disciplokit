<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/components/ui/button';
    
    let { 
        error = null, 
        title = 'Something went wrong',
        showRetry = true,
        children
    }: { 
        error?: string | null; 
        title?: string; 
        showRetry?: boolean;
        children?: any;
    } = $props();

    function retry() {
        window.location.reload();
    }
</script>

{#if error}
    <div class="flex flex-col items-center justify-center p-8 text-center">
        <div class="rounded-full bg-destructive/10 p-3 mb-4">
            <svg class="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">{title}</h3>
        <p class="text-muted-foreground mb-4 max-w-md">{error}</p>
        {#if showRetry}
            <Button onclick={retry} variant="outline">
                Try Again
            </Button>
        {/if}
    </div>
{:else}
    {@render children?.()}
{/if}