import PocketBase from 'pocketbase';

const pocketbaseUrl = process.env.POCKETBASE_URL;
if (!pocketbaseUrl) {
	console.error('❌ POCKETBASE_URL is required in .env file');
	process.exit(1);
}

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