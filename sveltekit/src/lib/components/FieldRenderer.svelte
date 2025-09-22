<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	
	interface Props {
		field: {
			name: string;
			type: string;
			label: string;
			placeholder?: string;
			required?: boolean;
			options?: string[];
			min?: number;
			max?: number;
			maxLength?: number;
			accept?: string;
		};
		value?: any;
		error?: string;
		disabled?: boolean;
	}
	
	let { field, value = '', error, disabled = false }: Props = $props();
	
	// Simple value handling
	let displayValue = value || '';

	// Autocomplete mapping for better UX
	function getAutocomplete(fieldName: string, fieldType: string): string {
		const autocompleteMap: Record<string, string> = {
			name: 'name',
			email: 'email',
			birth_year: 'off',
			location: 'off',
			relationship_status: 'off',
			motivation: 'off',
			password: 'new-password'
		};
		return autocompleteMap[fieldName] || 'off';
	}
</script>

<div class="space-y-2">
	<Label for={field.name}>
		{field.label}
		{#if field.required}
			<span class="text-red-500">*</span>
		{/if}
	</Label>
	
	{#if field.type === 'text' || field.type === 'email'}
		<Input
			id={field.name}
			name={field.name}
			type={field.type}
			placeholder={field.placeholder}
			value={displayValue}
			required={field.required}
			disabled={disabled}
			autocomplete={getAutocomplete(field.name, field.type)}
		/>
	{:else if field.type === 'number'}
		<Input
			id={field.name}
			name={field.name}
			type="number"
			placeholder={field.placeholder}
			value={displayValue}
			min={field.min}
			max={field.max}
			required={field.required}
			disabled={disabled}
			autocomplete={getAutocomplete(field.name, field.type)}
		/>
	{:else if field.type === 'password'}
		<Input
			id={field.name}
			name={field.name}
			type="password"
			placeholder={field.placeholder}
			required={field.required}
			disabled={disabled}
			autocomplete={getAutocomplete(field.name, field.type)}
		/>
	{:else if field.type === 'date'}
		<Input
			id={field.name}
			name={field.name}
			type="date"
			value={displayValue}
			required={field.required}
			disabled={disabled}
			autocomplete={getAutocomplete(field.name, field.type)}
		/>
	{:else if field.type === 'select'}
		<select
			id={field.name}
			name={field.name}
			required={field.required}
			disabled={disabled}
			class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		>
			<option value="">Seleziona {field.label.toLowerCase()}</option>
			{#each field.options || [] as option}
				<option value={option} selected={displayValue === option}>
					{option}
				</option>
			{/each}
		</select>
	{:else if field.type === 'textarea'}
		<textarea
			id={field.name}
			name={field.name}
			placeholder={field.placeholder}
			required={field.required}
			disabled={disabled}
			maxlength={field.maxLength}
			rows="4"
			class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		>{displayValue}</textarea>
		{#if field.maxLength}
			<p class="text-xs text-muted-foreground">
				{(displayValue?.length || 0)}/{field.maxLength} caratteri
			</p>
		{/if}
	{:else if field.type === 'checkbox'}
		<div class="space-y-2">
			{#each field.options || [] as option}
				<div class="flex items-center space-x-2">
					<input
						type="checkbox"
						id="{field.name}-{option}"
						name={field.name}
						value={option}
						checked={Array.isArray(value) && value.includes(option)}
						disabled={disabled}
						class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
					/>
					<label 
						for="{field.name}-{option}" 
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						{option}
					</label>
				</div>
			{/each}
		</div>
	{:else if field.type === 'file'}
		<input
			type="file"
			id={field.name}
			name={field.name}
			accept={field.accept}
			required={field.required}
			disabled={disabled}
			class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		/>
		{#if field.maxSize}
			<p class="text-xs text-muted-foreground">
				Dimensione massima: {field.maxSize}
			</p>
		{/if}
	{/if}
	
	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}
</div>