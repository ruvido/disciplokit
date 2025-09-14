import PocketBase from 'pocketbase';

const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';

console.log('🔗 PocketBase FIXED:', {
    isServer: typeof window === 'undefined',
    processEnvUrl: process.env.POCKETBASE_URL,
    finalUrl: pocketbaseUrl
});

export const pb = new PocketBase(pocketbaseUrl);

pb.authStore.onChange(() => {
    if (typeof window !== 'undefined') {
        console.log('authStore changed', pb.authStore.isValid);
    }
});