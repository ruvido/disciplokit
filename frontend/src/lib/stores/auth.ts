import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { pb, type User } from '$lib/pocketbase';

interface AuthStore {
	isAuthenticated: boolean;
	user: User | null;
	loading: boolean;
}

const initialState: AuthStore = {
	isAuthenticated: false,
	user: null,
	loading: true
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthStore>(initialState);

	return {
		subscribe,
		
		async init() {
			if (!browser) return;
			
			update(state => ({ ...state, loading: true }));
			
			try {
				if (pb.authStore.isValid) {
					await pb.collection('users').authRefresh();
					const user = pb.authStore.model as User;
					set({
						isAuthenticated: true,
						user,
						loading: false
					});
				} else {
					set({
						isAuthenticated: false,
						user: null,
						loading: false
					});
				}
			} catch (error) {
				console.error('Auth init error:', error);
				pb.authStore.clear();
				set({
					isAuthenticated: false,
					user: null,
					loading: false
				});
			}
		},

		async login(email: string, password: string) {
			try {
				const authData = await pb.collection('users').authWithPassword(email, password);
				const user = authData.record as User;
				
				set({
					isAuthenticated: true,
					user,
					loading: false
				});
				
				return { success: true, user };
			} catch (error: any) {
				console.error('Login error:', error);
				return { 
					success: false, 
					error: error?.message || 'Login failed' 
				};
			}
		},

		async signup(email: string, password: string, passwordConfirm: string) {
			try {
				const userData = {
					email,
					password,
					passwordConfirm,
					role: 'user'
				};
				
				const record = await pb.collection('users').create(userData);
				
				const authData = await pb.collection('users').authWithPassword(email, password);
				const user = authData.record as User;
				
				set({
					isAuthenticated: true,
					user,
					loading: false
				});
				
				return { success: true, user };
			} catch (error: any) {
				console.error('Signup error:', error);
				return { 
					success: false, 
					error: error?.message || 'Signup failed' 
				};
			}
		},

		logout() {
			pb.authStore.clear();
			set({
				isAuthenticated: false,
				user: null,
				loading: false
			});
		}
	};
}

export const auth = createAuthStore();