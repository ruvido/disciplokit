import PocketBase from 'pocketbase';

const isServer = typeof window === 'undefined';

// Environment-aware URL selection
function getPocketBaseUrl(): string {
    if (isServer) {
        // Server-side: use POCKETBASE_URL for container networking
        return process.env.POCKETBASE_URL || 'http://pocketbase:8090';
    } else {
        // Client-side: use browser-accessible URL
        // Try to get from window (injected by server) or fallback to localhost
        return (window as any).__POCKETBASE_URL__ || 'http://localhost:8090';
    }
}

const pocketbaseUrl = getPocketBaseUrl();

console.log('🔗 PocketBase Environment-aware:', {
    isServer,
    serverUrl: process.env.POCKETBASE_URL,
    finalUrl: pocketbaseUrl
});

export const pb = new PocketBase(pocketbaseUrl);

pb.authStore.onChange(() => {
    if (typeof window !== 'undefined') {
        console.log('authStore changed', pb.authStore.isValid);
    }
});