<svelte:head>
	<title>Richiesta Inviata - Disciplo</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
	<div class="w-full max-w-md space-y-8 text-center">
		<div class="space-y-4">
			<div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
				<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
			</div>

			<h1 class="text-3xl font-bold text-foreground">Richiesta Inviata!</h1>

			<div class="space-y-3 text-muted-foreground">
				<p>La tua richiesta di iscrizione è stata inviata con successo.</p>
				<p>Riceverai una email di conferma quando la tua richiesta sarà approvata dal nostro team.</p>
				<p class="text-sm">Questo processo può richiedere 1-2 giorni lavorativi.</p>
			</div>
		</div>

		<div class="pt-8">
			<a href="/login" class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
				Torna al Login
			</a>
		</div>
	</div>
</div>