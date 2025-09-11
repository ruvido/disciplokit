/**
 * Input sanitization utilities for form data
 */

/**
 * Sanitize string input by trimming whitespace and removing dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string {
    if (!input) return '';
    
    return input
        .toString()
        .trim()
        .replace(/[<>]/g, '') // Remove basic HTML tags
        .slice(0, 1000); // Limit length to prevent DoS
}

/**
 * Sanitize and validate email address
 */
export function sanitizeEmail(email: string | null | undefined): string {
    const sanitized = sanitizeString(email).toLowerCase();
    return sanitized.slice(0, 254); // RFC 5321 email length limit
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
        return { valid: false, message: 'La password deve essere di almeno 6 caratteri' };
    }
    
    if (password.length > 128) {
        return { valid: false, message: 'La password è troppo lunga' };
    }
    
    return { valid: true };
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData(data: Record<string, FormDataEntryValue | null>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(data)) {
        if (key === 'email') {
            sanitized[key] = sanitizeEmail(value?.toString());
        } else {
            sanitized[key] = sanitizeString(value?.toString());
        }
    }
    
    return sanitized;
}

/**
 * Validate user role
 */
export function isValidRole(role: string): boolean {
    return ['member', 'moderator', 'admin'].includes(role);
}