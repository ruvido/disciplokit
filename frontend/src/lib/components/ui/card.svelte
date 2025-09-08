<script lang="ts">
	import { cn } from "$lib/utils.js";

	type $$Props = {
		class?: string;
	};

	export let className: $$Props["class"] = undefined;
</script>

<div class={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...$$restProps}>
	<slot />
</div>