import { fail } from '@sveltejs/kit';
import type { ActionFailure } from '@sveltejs/kit';

/**
 * Standard error messages for common scenarios
 */
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Access denied. Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    REQUIRED_FIELDS: 'Please fill in all required fields.',
    UPDATE_FAILED: 'Failed to update. Please try again.',
    DELETE_FAILED: 'Failed to delete. Please try again.',
    CREATE_FAILED: 'Failed to create. Please try again.'
} as const;

/**
 * Handle PocketBase errors with consistent messaging
 */
export function handlePocketBaseError(error: any): ActionFailure<{ error: string }> {
    console.error('PocketBase error:', error);
    
    // Handle specific PocketBase error codes
    if (error?.status === 400) {
        return fail(400, { error: ERROR_MESSAGES.VALIDATION_ERROR });
    }
    
    if (error?.status === 401) {
        return fail(401, { error: ERROR_MESSAGES.UNAUTHORIZED });
    }
    
    if (error?.status === 403) {
        return fail(403, { error: ERROR_MESSAGES.FORBIDDEN });
    }
    
    if (error?.status === 404) {
        return fail(404, { error: ERROR_MESSAGES.NOT_FOUND });
    }
    
    // Default to server error
    return fail(500, { error: ERROR_MESSAGES.SERVER_ERROR });
}

/**
 * Validate required form fields
 */
export function validateRequired(
    data: Record<string, FormDataEntryValue | null>, 
    required: string[]
): { isValid: true } | ActionFailure<{ error: string; [key: string]: any }> {
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
        const result: any = { error: ERROR_MESSAGES.REQUIRED_FIELDS };
        
        // Preserve form data for re-display
        for (const [key, value] of Object.entries(data)) {
            if (value && typeof value === 'string') {
                result[key] = value;
            }
        }
        
        return fail(400, result);
    }
    
    return { isValid: true };
}

/**
 * Create standardized success response
 */
export function successResponse(message: string, data?: Record<string, any>) {
    return {
        success: true,
        message,
        ...data
    };
}