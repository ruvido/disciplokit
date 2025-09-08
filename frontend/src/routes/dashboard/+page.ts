import { auth } from '$lib/stores/auth';
import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { get } from 'svelte/store';

export async function load() {
	if (browser) {
		const authState = get(auth);
		
		if (!authState.loading && !authState.isAuthenticated) {
			throw redirect(302, '/login');
		}
	}
	
	return {};
}