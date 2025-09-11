/**
 * Client-side auth utilities for optimized UX
 */

/**
 * Pre-clear auth cookies for instant logout UX
 * This provides immediate feedback while server processes the logout
 */
export function preemptiveCookieClear() {
    if (typeof document === 'undefined') return;
    
    try {
        // Clear the PocketBase auth cookie immediately
        document.cookie = 'pb_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict';
        
        // Also clear any other auth-related cookies
        document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (err) {
        // Silently fail - server-side logout will still work
        console.debug('Could not clear cookies client-side:', err);
    }
}

/**
 * Show loading state during auth operations
 */
export function setAuthLoading(loading: boolean, operation: string = 'auth') {
    if (typeof document === 'undefined') return;
    
    try {
        if (loading) {
            document.body.style.cursor = 'wait';
            document.body.classList.add('auth-loading');
        } else {
            document.body.style.cursor = '';
            document.body.classList.remove('auth-loading');
        }
    } catch (err) {
        // Silently fail
        console.debug('Could not set loading state:', err);
    }
}

/**
 * Validate email format client-side
 */
export function validateEmailFormat(email: string): { valid: boolean; message?: string } {
    if (!email) {
        return { valid: false, message: 'Email richiesta' };
    }
    
    if (email.length > 254) {
        return { valid: false, message: 'Email troppo lunga' };
    }
    
    // Very basic validation - just check for @ symbol
    if (!email.includes('@')) {
        return { valid: false, message: 'Formato email non valido' };
    }
    
    return { valid: true };
}

/**
 * Enhanced form submission with optimistic updates
 */
export function enhanceAuthForm(
    form: HTMLFormElement,
    options: {
        onSubmit?: () => void;
        onSuccess?: () => void;
        onError?: (error: string) => void;
    } = {}
) {
    if (typeof document === 'undefined') return;
    
    const { onSubmit, onSuccess, onError } = options;
    
    form.addEventListener('submit', (event) => {
        const formData = new FormData(form);
        const email = formData.get('email')?.toString() || '';
        const password = formData.get('password')?.toString() || '';
        
        // Client-side validation
        const emailValidation = validateEmailFormat(email);
        if (!emailValidation.valid) {
            event.preventDefault();
            onError?.(emailValidation.message || 'Email non valida');
            return;
        }
        
        if (password.length < 6) {
            event.preventDefault();
            onError?.('Password troppo corta (minimo 6 caratteri)');
            return;
        }
        
        // Start loading state
        setAuthLoading(true);
        onSubmit?.();
    });
}