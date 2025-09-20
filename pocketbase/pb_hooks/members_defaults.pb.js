/// <reference path="../pb_data/types.d.ts" />

// Hook to set default values when creating new members
onRecordAfterCreateSuccess((e) => {
    console.log('🔍 MEMBERS-DEFAULTS: Hook triggered for new member creation');

    const adminEmail = $os.getenv('POCKETBASE_ADMIN_EMAIL');
    if (!adminEmail) {
        console.error('❌ POCKETBASE_ADMIN_EMAIL is required in .env file');
        e.next();
        return;
    }

    const memberEmail = e.record.get("email");
    console.log('🔍 MEMBERS-DEFAULTS: Processing member:', memberEmail);

    // Set admin=true for admin email, admin=false for others (ALWAYS set by hook)
    if (memberEmail === adminEmail) {
        e.record.set("admin", true);
        console.log('✅ Set admin=true for:', memberEmail);
    } else {
        e.record.set("admin", false);
        console.log('✅ Set admin=false for:', memberEmail);
    }

    // ALWAYS set emailVisibility to true (important for bot communication)
    e.record.set("emailVisibility", true);
    console.log('✅ Set emailVisibility=true for bot communication');

    // Save the updated record
    $app.save(e.record);

    e.next();
}, "members");