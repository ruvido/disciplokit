import PocketBase from 'pocketbase';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Enhanced PocketBase client with timeout and connection error handling
 */

/**
 * Create a PocketBase request with timeout
 */
export async function withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 10000,
    timeoutMessage: string = 'Operation timeout'
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            const error = new Error(timeoutMessage);
            error.name = 'AbortError';
            reject(error);
        }, timeoutMs);
    });

    try {
        return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
        throw error;
    }
}

/**
 * Enhanced authentication with context-aware timeout and error handling
 */
export async function authWithPassword(
    pb: PocketBase,
    email: string,
    password: string,
    options: { timeoutMs?: number; context?: string } = {}
) {
    const { timeoutMs = 5000, context = 'login' } = options;
    
    // Context-aware timeout for better UX
    const actualTimeout = context === 'login' ? Math.min(timeoutMs, 5000) : timeoutMs;
    
    return withTimeout(
        () => pb.collection('members').authWithPassword(email, password),
        actualTimeout,
        `${context} timeout - check your connection`
    );
}

/**
 * Enhanced collection operations with timeout
 */
export class EnhancedPocketBaseClient {
    constructor(private pb: PocketBase) {}

    async getList(collection: string, page = 1, perPage = 50, options: { timeoutMs?: number; context?: string } = {}) {
        const { timeoutMs = 5000, context = 'fetch' } = options;
        const actualTimeout = context === 'dashboard' ? 3000 : timeoutMs;
        
        return withTimeout(
            () => this.pb.collection(collection).getList(page, perPage),
            actualTimeout,
            `Failed to fetch ${collection} - timeout`
        );
    }

    async getOne(collection: string, id: string, options: { timeoutMs?: number; context?: string; expand?: string; fields?: string } = {}) {
        const { timeoutMs = 5000, context = 'fetch', expand, fields } = options;
        const actualTimeout = context === 'profile' ? 3000 : timeoutMs;

        return withTimeout(
            () => {
                const query = this.pb.collection(collection);
                const params: any = {};
                if (expand) params.expand = expand;
                if (fields) params.fields = fields;
                return query.getOne(id, params);
            },
            actualTimeout,
            `Failed to fetch ${collection} record - timeout`
        );
    }

    async update(collection: string, id: string, data: any, options: { timeoutMs?: number; context?: string } = {}) {
        const { timeoutMs = 6000, context = 'update' } = options;
        
        return withTimeout(
            () => this.pb.collection(collection).update(id, data),
            timeoutMs,
            `Failed to update ${collection} record - timeout`
        );
    }

    async delete(collection: string, id: string, options: { timeoutMs?: number; context?: string } = {}) {
        const { timeoutMs = 6000, context = 'delete' } = options;
        
        return withTimeout(
            () => this.pb.collection(collection).delete(id),
            timeoutMs,
            `Failed to delete ${collection} record - timeout`
        );
    }

    async create(collection: string, data: any, options: { timeoutMs?: number; context?: string } = {}) {
        const { timeoutMs = 6000, context = 'create' } = options;
        
        return withTimeout(
            () => this.pb.collection(collection).create(data),
            timeoutMs,
            `Failed to create ${collection} record - timeout`
        );
    }

    async authRefresh(options: { timeoutMs?: number; context?: string } = {}) {
        const { timeoutMs = 3000, context = 'refresh' } = options;
        
        return withTimeout(
            () => this.pb.collection('members').authRefresh(),
            timeoutMs,
            'Auth refresh timeout'
        );
    }
}

/**
 * Get enhanced client from request event
 */
export function getEnhancedClient(event: RequestEvent): EnhancedPocketBaseClient {
    return new EnhancedPocketBaseClient(event.locals.pb);
}