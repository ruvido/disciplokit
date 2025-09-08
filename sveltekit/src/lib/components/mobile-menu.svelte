<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	
	interface MenuItem {
		href: string;
		label: string;
	}
	
	interface Props {
		menuItems: MenuItem[];
		currentPath: string;
		userEmail?: string;
	}
	
	let { menuItems, currentPath, userEmail }: Props = $props();
	
	let isOpen = $state(false);
	
	function toggleMenu() {
		isOpen = !isOpen;
	}
	
	function closeMenu() {
		isOpen = false;
	}
</script>

<!-- Responsive Header -->
<header class="bg-background border-b sticky top-0 z-50">
	<div class="flex items-center justify-between p-4">
		<h1 class="text-xl font-bold text-primary">DisciploKit</h1>
		
		<!-- Desktop Navigation - visible on md and up -->
		<nav class="hidden md:flex items-center gap-6">
			{#each menuItems as item}
				<a 
					href={item.href}
					class="text-sm font-medium transition-colors hover:text-primary
						{currentPath === item.href || currentPath.startsWith(item.href + '/')
							? 'text-primary' 
							: 'text-muted-foreground'}"
				>
					{item.label}
				</a>
			{/each}
			<div class="flex items-center gap-4 ml-4 border-l pl-4">
				{#if userEmail}
					<span class="text-sm text-muted-foreground">{userEmail}</span>
				{/if}
				<form method="POST" action="/signout">
					<Button type="submit" variant="outline" size="sm">
						Sign Out
					</Button>
				</form>
			</div>
		</nav>
		
		<!-- Mobile Hamburger - visible on mobile only -->
		<button 
			onclick={toggleMenu}
			class="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
			aria-label="Toggle menu"
		>
			<div class="w-5 h-5 flex flex-col justify-center space-y-1">
				<span class="block h-0.5 bg-foreground transition-all {isOpen ? 'rotate-45 translate-y-1.5' : ''}"></span>
				<span class="block h-0.5 bg-foreground transition-all {isOpen ? 'opacity-0' : ''}"></span>
				<span class="block h-0.5 bg-foreground transition-all {isOpen ? '-rotate-45 -translate-y-1.5' : ''}"></span>
			</div>
		</button>
	</div>
</header>

<!-- Mobile Overlay and Slide-out Menu (hidden on desktop) -->
<div class="md:hidden">
	<!-- Overlay -->
	{#if isOpen}
		<div 
			class="fixed inset-0 bg-black/20 z-40"
			onclick={closeMenu}
		></div>
	{/if}

	<!-- Slide-out Menu -->
	<div class="fixed top-0 right-0 h-full w-64 bg-background border-l shadow-lg transform transition-transform z-50 {isOpen ? 'translate-x-0' : 'translate-x-full'}">
		<div class="p-4 border-b">
			<div class="flex items-center justify-between">
				<h2 class="font-semibold">Navigation</h2>
				<button 
					onclick={closeMenu}
					class="p-1 hover:bg-muted rounded"
					aria-label="Close menu"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			{#if userEmail}
				<div class="mt-3 pt-3 border-t">
					<p class="text-xs text-muted-foreground">Signed in as</p>
					<p class="text-sm font-medium truncate">{userEmail}</p>
				</div>
			{/if}
		</div>
		
		<nav class="p-4">
			<ul class="space-y-2">
				{#each menuItems as item}
					<li>
						<a 
							href={item.href}
							onclick={closeMenu}
							class="block px-3 py-2 rounded-md text-sm font-medium transition-colors
								{currentPath === item.href || currentPath.startsWith(item.href + '/')
									? 'bg-primary text-primary-foreground' 
									: 'hover:bg-muted'}"
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		
		<div class="absolute bottom-4 left-4 right-4 border-t pt-4">
			<form method="POST" action="/signout">
				<Button type="submit" variant="outline" class="w-full">
					Sign Out
				</Button>
			</form>
		</div>
	</div>
</div>