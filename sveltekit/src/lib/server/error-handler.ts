import { fail } from '@sveltejs/kit';
import type { ActionFailure } from '@sveltejs/kit';

/**
 * Standard error messages in Italian for common scenarios
 */
export const ERROR_MESSAGES = {
    // Authentication & Authorization
    UNAUTHORIZED: 'Accesso negato. Effettua il login per continuare.',
    FORBIDDEN: 'Non hai i permessi per eseguire questa azione.',
    INVALID_CREDENTIALS: 'Email o password non validi.',
    SESSION_EXPIRED: 'La tua sessione è scaduta. Effettua di nuovo il login.',
    
    // Validation
    VALIDATION_ERROR: 'Controlla i dati inseriti e riprova.',
    REQUIRED_FIELDS: 'Compila tutti i campi obbligatori.',
    INVALID_EMAIL: 'Inserisci un indirizzo email valido.',
    WEAK_PASSWORD: 'La password deve essere di almeno 6 caratteri.',
    
    // Resources
    NOT_FOUND: 'La risorsa richiesta non è stata trovata.',
    ALREADY_EXISTS: 'Questo elemento esiste già.',
    
    // Operations
    UPDATE_FAILED: 'Aggiornamento fallito. Riprova.',
    DELETE_FAILED: 'Eliminazione fallita. Riprova.',
    CREATE_FAILED: 'Creazione fallita. Riprova.',
    
    // Server & Connection
    SERVER_ERROR: 'Errore del server. Riprova più tardi.',
    CONNECTION_ERROR: 'Impossibile connettersi al servizio. Controlla la connessione.',
    TIMEOUT_ERROR: 'Operazione scaduta. Riprova.',
    SERVICE_UNAVAILABLE: 'Servizio temporaneamente non disponibile.'
} as const;

/**
 * Enhanced error logging for debugging
 */
function logError(error: any, context?: string) {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        context: context || 'Unknown',
        status: error?.status || 'No status',
        message: error?.message || 'No message',
        data: error?.data || null,
        url: error?.url || null
    };
    
    console.error('PocketBase Error:', logData);
}

/**
 * Handle PocketBase errors with specific error codes and Italian messages
 */
export function handlePocketBaseError(error: any, context?: string): ActionFailure<{ error: string }> {
    logError(error, context);
    
    // Connection/Network errors (no status code)
    if (!error?.status) {
        if (error?.name === 'TypeError' || error?.message?.includes('fetch')) {
            return fail(503, { error: ERROR_MESSAGES.CONNECTION_ERROR });
        }
        if (error?.name === 'AbortError') {
            return fail(408, { error: ERROR_MESSAGES.TIMEOUT_ERROR });
        }
        return fail(500, { error: ERROR_MESSAGES.SERVER_ERROR });
    }
    
    // Handle specific PocketBase HTTP status codes
    switch (error.status) {
        case 400:
            // Check if it's a validation error with specific field issues
            if (error?.data?.email) {
                return fail(400, { error: ERROR_MESSAGES.INVALID_EMAIL });
            }
            if (error?.data?.password) {
                return fail(400, { error: ERROR_MESSAGES.WEAK_PASSWORD });
            }
            return fail(400, { error: ERROR_MESSAGES.VALIDATION_ERROR });
            
        case 401:
            return fail(401, { error: ERROR_MESSAGES.SESSION_EXPIRED });
            
        case 403:
            return fail(403, { error: ERROR_MESSAGES.FORBIDDEN });
            
        case 404:
            return fail(404, { error: ERROR_MESSAGES.NOT_FOUND });
            
        case 409:
            return fail(409, { error: ERROR_MESSAGES.ALREADY_EXISTS });
            
        case 500:
        case 502:
        case 503:
            return fail(503, { error: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
            
        case 408:
        case 504:
            return fail(408, { error: ERROR_MESSAGES.TIMEOUT_ERROR });
            
        default:
            return fail(500, { error: ERROR_MESSAGES.SERVER_ERROR });
    }
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