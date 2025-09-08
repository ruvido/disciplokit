<script lang="ts">
	import LoginForm from "$lib/components/login-form.svelte";
	import type { ActionData } from './$types';
	
	export let form: ActionData;
</script>

<div class="flex min-h-screen items-center justify-center">
	<LoginForm {form} />
</div>