/// <reference path="../pb_data/types.d.ts" />

// Hook to control moderator change permissions in groups
onRecordUpdate((e) => {
    // WebUI operations: allow all changes (admin has full access)
    if (!e.request) {
        console.log('✅ WebUI access - allowing all operations');
        e.next();
        return;
    }

    // Admin user from auth collection can modify everything
    if (e.request.auth && e.request.auth.admin === true) {
        console.log('✅ Admin user access - skipping validation');
        e.next();
        return;
    }

    // Non-authenticated users should be blocked
    if (!e.request.auth || !e.request.auth.id) {
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