<script lang="ts">
    let { message = 'Loading...' }: { message?: string } = $props();
</script>

<div class="flex items-center justify-center p-8">
    <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        {#if message}
            <span class="text-muted-foreground">{message}</span>
        {/if}
    </div>
</div>