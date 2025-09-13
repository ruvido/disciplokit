/// <reference path="../pb_data/types.d.ts" />

// Custom API endpoint for bot to trigger group sync (server-side only)
const syncGroupEndpoint = $os.getenv('POCKETBASE_SYNC_GROUP_ENDPOINT');

if (!syncGroupEndpoint) {
    console.error("❌ POCKETBASE_SYNC_GROUP_ENDPOINT not configured in environment");
    process.exit(1);
}

routerAdd("POST", syncGroupEndpoint, (e) => {
    console.log("🎯 Hook called successfully!");
    
    try {
        // Parse request data
        const data = new DynamicModel({
            telegram_id: "",
            name: "",
            timestamp: 0
        });
        
        e.bindBody(data);
        console.log("📨 Request data:", `telegram_id: ${data.telegram_id}, name: ${data.name}`);
        
        // Check required fields
        if (!data.telegram_id || !data.name || !data.timestamp) {
            return e.json(400, {
                "error": "Missing required fields",
                "required": ["telegram_id", "name", "timestamp"]
            });
        }
        
        // Validate HMAC token
        const syncToken = e.request.header.get('x-sync-token');
        const secret = $os.getenv('TELEGRAM_LINK_SECRET');
        
        if (!syncToken) {
            return e.json(401, { "error": "Missing sync token" });
        }
        
        if (!secret) {
            return e.json(500, { "error": "Secret not configured" });
        }
        
        // Recreate HMAC token server-side
        const tokenData = `${data.telegram_id}_${data.timestamp}`;
        const expectedToken = $security.hs256(tokenData, secret).substring(0, 16);
        
        if (syncToken !== expectedToken) {
            console.log(`❌ Token mismatch: expected ${expectedToken}, got ${syncToken}`);
            return e.json(401, { "error": "Invalid token" });
        }
        
        console.log("🔐 Token validation passed");
        
        // Find admin member for moderator field
        let adminMemberId = null;
        const adminEmail = $os.getenv('POCKETBASE_ADMIN_EMAIL');
        
        if (adminEmail) {
            const adminMembers = $app.findRecordsByFilter("members", `email = "${adminEmail}"`);
            if (adminMembers.length > 0) {
                adminMemberId = adminMembers[0].id;
            }
        }
        
        // Check for existing group
        const existingGroups = $app.findRecordsByFilter("groups", `data.telegram_id = "${data.telegram_id}"`);
        
        if (existingGroups.length > 0) {
            // Update existing group
            const existingGroup = existingGroups[0];
            existingGroup.set('name', data.name);
            $app.save(existingGroup);
            
            console.log(`✅ Updated existing group: ${data.name}`);
            return e.json(200, {
                "success": true,
                "action": "updated",
                "group_id": existingGroup.id
            });
        } else {
            // Create new group
            const allGroups = $app.findRecordsByFilter("groups", "");
            const isFirstGroup = allGroups.length === 0;
            
            const groupsCollection = $app.findCollectionByNameOrId("groups");
            const newGroup = new Record(groupsCollection);
            
            newGroup.set('name', data.name);
            newGroup.set('data', {
                telegram_id: data.telegram_id,
                description: isFirstGroup ? 'Default group' : 'Telegram group',
                type: isFirstGroup ? 'default' : 'local'
            });
            newGroup.set('members', []);
            newGroup.set('moderator', adminMemberId);
            
            $app.save(newGroup);
            
            console.log(`✅ Created new group: ${data.name}`);
            return e.json(200, {
                "success": true,
                "action": "created",
                "group_id": newGroup.id
            });
        }
        
    } catch (error) {
        console.error("❌ Hook error:", error.message);
        return e.json(500, {
            "error": "Internal server error",
            "message": error.message
        });
    }
});
