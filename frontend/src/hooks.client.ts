import { auth } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

if (browser) {
	let initialized = false;

	auth.subscribe((authState) => {
		if (!initialized && !authState.loading) {
			initialized = true;
			
			const currentPath = window.location.pathname;
			const publicPaths = ['/login', '/signup'];
			const isPublicPath = publicPaths.includes(currentPath);
			
			if (!authState.isAuthenticated && !isPublicPath) {
				goto('/login');
			} else if (authState.isAuthenticated && (isPublicPath || currentPath === '/')) {
				goto('/dashboard');
			}
		}
	});
}