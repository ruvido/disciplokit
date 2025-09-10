<script lang="ts">
	import LoginForm from "$lib/components/login-form.svelte";
	import type { ActionData } from './$types';
	
	interface Props {
		form: ActionData;
	}
	
	let { form }: Props = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<LoginForm form={form} />
</div>