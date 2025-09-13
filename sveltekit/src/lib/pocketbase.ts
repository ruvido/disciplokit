import PocketBase from 'pocketbase';

// Construct URL from existing env vars
const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const port = '8090';
const pocketbaseUrl = `http://${host}:${port}`;

console.log('🔗 PocketBase client initialized:', {
    isServer: typeof window === 'undefined',
    host,
    port,
    finalUrl: pocketbaseUrl
});

export const pb = new PocketBase(pocketbaseUrl);

pb.authStore.onChange(() => {
    if (typeof window !== 'undefined') {
        console.log('authStore changed', pb.authStore.isValid);
    }
});