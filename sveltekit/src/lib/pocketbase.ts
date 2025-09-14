import PocketBase from 'pocketbase';

// Get PocketBase URL from environment variables
const host = process.env.HOST || 'localhost';
const port = process.env.POCKETBASE_PORT || '8090';
const domain = process.env.POCKETBASE_DOMAIN;

// Client-side: use HTTPS domain, Server-side: use internal host:port
const pocketbaseUrl = typeof window !== 'undefined' && domain
  ? `https://${domain}`
  : `http://${host}:${port}`;

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