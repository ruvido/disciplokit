import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const pb = new PocketBase(PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

pb.authStore.onChange(() => {
    if (typeof window !== 'undefined') {
        console.log('authStore changed', pb.authStore.isValid);
    }
});