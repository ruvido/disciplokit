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
	
	let { field, value = $bindable(''), error, disabled = false }: Props = $props();

	// State for custom text inputs (Altro, Estero)
	let customValues = $state<Record<string, string>>({});

	// Check if option needs custom text input
	function needsCustomInput(option: string): boolean {
		return /altro|estero/i.test(option);
	}

	// Check if option is currently selected
	function isOptionChecked(option: string): boolean {
		return Array.isArray(value) && value.some(v =>
			v === option || v.startsWith(option + ':')
		);
	}

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
			bind:value
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
			bind:value
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
			bind:value
			required={field.required}
			disabled={disabled}
			autocomplete={getAutocomplete(field.name, field.type)}
		/>
	{:else if field.type === 'date'}
		<Input
			id={field.name}
			name={field.name}
			type="date"
			bind:value
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
			bind:value
		>
			<option value="" disabled>Seleziona {field.label.toLowerCase()}</option>
			{#each field.options || [] as option}
				<option value={option}>
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
			bind:value
		></textarea>
		{#if field.maxLength}
			<p class="text-xs text-muted-foreground">
				{(value?.length || 0)}/{field.maxLength} caratteri
			</p>
		{/if}
	{:else if field.type === 'checkbox'}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			{#each field.options || [] as option}
				<div class="space-y-2">
					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id="{field.name}-{option}"
							name={field.name}
							value={option}
							checked={isOptionChecked(option)}
							disabled={disabled}
							class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							onchange={(e) => {
								const target = e.target as HTMLInputElement;
								const currentValues = Array.isArray(value) ? [...value] : [];

								if (target.checked) {
									// Add option if not already present
									if (!currentValues.some(v => v === option || v.startsWith(option + ':'))) {
										currentValues.push(option);
									}
								} else {
									// Remove option and custom value
									const filteredValues = currentValues.filter(v =>
										v !== option && !v.startsWith(option + ':')
									);
									value = filteredValues;
									// Clear custom input
									if (needsCustomInput(option)) {
										delete customValues[option];
									}
									return;
								}
								value = currentValues;
							}}
						/>
						<label
							for="{field.name}-{option}"
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{option}
						</label>
					</div>

					<!-- Dynamic text input for "Altro" or "Estero" options -->
					{#if needsCustomInput(option) && isOptionChecked(option)}
						<Input
							type="text"
							placeholder="Specifica..."
							bind:value={customValues[option]}
							disabled={disabled}
							class="ml-6"
							oninput={() => {
								// Replace "Altro"/"Estero" with custom value in array
								if (customValues[option]?.trim()) {
									const currentValues = Array.isArray(value) ? [...value] : [];
									const customValue = customValues[option].trim();

									// Remove old value (either base option or previous custom)
									const filtered = currentValues.filter(v =>
										v !== option && !v.startsWith(option + ':')
									);

									// Add new custom value
									filtered.push(customValue);
									value = filtered;
								}
							}}
						/>
					{/if}
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
			onchange={(e) => {
				const target = e.target as HTMLInputElement;
				const file = target.files?.[0];
				value = file;
			}}
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