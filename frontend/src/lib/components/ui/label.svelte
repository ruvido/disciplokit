<script lang="ts">
	import { Label as LabelPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = LabelPrimitive.Props;

	export let className: $$Props["class"] = undefined;

	$: class_ = cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	);
</script>

<LabelPrimitive.Root class={class_} {...$$restProps} on:mousedown>
	<slot />
</LabelPrimitive.Root>