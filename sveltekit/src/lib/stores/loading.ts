import { writable } from 'svelte/store';

export const loading = writable(false);
export const loadingMessage = writable('Loading...');

export function setLoading(isLoading: boolean, message?: string) {
    loading.set(isLoading);
    if (message) {
        loadingMessage.set(message);
    }
}