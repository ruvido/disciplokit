/// <reference path="../pb_data/types.d.ts" />

// Hook to set default values when creating new members
onRecordCreate((e) => {
    const adminEmail = $os.getenv('POCKETBASE_ADMIN_EMAIL');
    if (!adminEmail) {
        console.error('❌ POCKETBASE_ADMIN_EMAIL is required in .env file');
        return; // Don't crash the hook, just skip admin role assignment
    }

    const memberEmail = e.record.get('email');
    
    // Set default role to "member" if not admin and not already specified
    if (!e.record.get('role')) {
        if (memberEmail === adminEmail) {
            e.record.set('role', 'admin');
            console.log('✅ Set admin role for:', memberEmail);
        } else {
            e.record.set('role', 'member');
            console.log('✅ Set default role: member for:', memberEmail);
        }
    }
    
    // Set default emailVisibility to true if not specified  
    if (e.record.get('emailVisibility') === undefined || e.record.get('emailVisibility') === null) {
        e.record.set('emailVisibility', true);
        console.log('✅ Set default emailVisibility: true');
    }
    
    e.next();
}, "members");