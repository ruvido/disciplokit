/// <reference path="../pb_data/types.d.ts" />

// Hook to control moderator change permissions in groups
onRecordUpdate((e) => {
    // Admin can modify everything - skip validation
    if (e.request.auth.role === 'admin') {
        e.next();
        return;
    }
    
    // Non-authenticated users should be blocked by update rule
    if (!e.request.auth.id) {
        throw new BadRequestError('Non autorizzato');
    }
    
    // Check if user is current moderator
    if (e.request.auth.id !== e.record.get('moderator')) {
        throw new BadRequestError('Solo il moderatore può modificare questo gruppo');
    }
    
    // Moderator can only change the 'moderator' field
    const allowedFields = ['moderator'];
    const submittedFields = Object.keys(e.request.data || {});
    
    for (const field of submittedFields) {
        if (!allowedFields.includes(field)) {
            throw new BadRequestError(`Puoi modificare solo il campo moderator, non: ${field}`);
        }
    }
    
    console.log(`✅ Moderator ${e.request.auth.id} changing moderator of group: ${e.record.get('name')}`);
    
    // Continue with the update
    e.next();
}, "groups");