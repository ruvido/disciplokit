import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Load env vars from parent directory for local dev, or use process.env for Docker build
	const env = loadEnv(mode, '../', '');

	return {
		plugins: [tailwindcss(), sveltekit()],
		define: {
			// Make env vars available to the app
			'process.env.TELEGRAM_LINK_SECRET': JSON.stringify(env.TELEGRAM_LINK_SECRET || process.env.TELEGRAM_LINK_SECRET),
			'process.env.HOST': JSON.stringify(env.HOST || process.env.HOST),
			'process.env.POCKETBASE_PORT': JSON.stringify(env.POCKETBASE_PORT || process.env.POCKETBASE_PORT),
			'process.env.POCKETBASE_URL': JSON.stringify(env.POCKETBASE_URL || process.env.POCKETBASE_URL)
		},
		envPrefix: 'PUBLIC_',
		server: {
			host: true,  // Permette connessioni esterne
			allowedHosts: ['localhost', 'branco.realmen.it']  // Host permessi per dev locale e produzione
		}
	};
});
