import { writable, derived } from 'svelte/store';
import { pb } from '$lib/pocketbase';
import type { RecordModel } from 'pocketbase';

interface AuthStore {
    user: RecordModel | null;
    isValid: boolean;
}

function createAuthStore() {
    const { subscribe, set } = writable<AuthStore>({
        user: pb.authStore.model,
        isValid: pb.authStore.isValid
    });

    pb.authStore.onChange(() => {
        set({
            user: pb.authStore.model,
            isValid: pb.authStore.isValid
        });
    });

    return {
        subscribe,
        signOut: async () => {
            pb.authStore.clear();
        },
        get user() {
            return pb.authStore.model;
        },
        get isValid() {
            return pb.authStore.isValid;
        }
    };
}

export const auth = createAuthStore();

export const isAdmin = derived(
    auth,
    $auth => $auth.user?.role === 'admin'
);