import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

export interface User {
	id: string;
	email: string;
	role: 'admin' | 'user';
	created: string;
	updated: string;
}

export interface AuthData {
	token: string;
	record: User;
}