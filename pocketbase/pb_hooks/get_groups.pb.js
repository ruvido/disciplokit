/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/custom/get-groups", (e) => {
    console.log("🔍 get-groups endpoint called")
    
    try {
        // Parse request data EXACTLY like working hook
        const data = new DynamicModel({
            timestamp: 0
        });

        e.bindBody(data);
        console.log("📨 Request data:", `timestamp: ${data.timestamp}`);

        // Check required fields
        if (!data.timestamp) {
            return e.json(400, {
                "error": "Missing required fields",
                "required": ["timestamp"]
            });
        }
        
        // Validate HMAC token EXACTLY like working hook
        const syncToken = e.request.header.get('x-sync-token');
        const secret = $os.getenv('TELEGRAM_LINK_SECRET');
        
        if (!syncToken) {
            return e.json(401, { "error": "Missing sync token" });
        }
        
        if (!secret) {
            return e.json(500, { "error": "Secret not configured" });
        }
        
        // Recreate HMAC token server-side EXACTLY like working hook
        const tokenData = `get_groups_${data.timestamp}`;
        const expectedToken = $security.hs256(tokenData, secret).substring(0, 16);
        
        if (syncToken !== expectedToken) {
            console.log(`❌ Token mismatch: expected ${expectedToken}, got ${syncToken}`);
            return e.json(401, { "error": "Invalid token" });
        }
        
        console.log("🔐 Token validation passed");
        
        // Get all groups using SAME syntax as working hook
        const records = $app.findRecordsByFilter("groups", "")
        
        console.log("Found records:", records.length)
        
        const groupsData = []
        for (let i = 0; i < records.length; i++) {
            const record = records[i]
            console.log("Processing record:", record.id, record.name)
            groupsData.push({
                id: record.id,
                name: record.name,
                data: record.data,
                telegram_id: record.data?.telegram?.id,
                created: record.created,
                updated: record.updated
            })
        }
        
        return e.json(200, {
            success: true,
            groups: groupsData,
            total: groupsData.length
        })
        
    } catch (error) {
        console.log("❌ Error in get groups:", error.message)
        return e.json(500, {
            "error": "Internal server error",
            "message": error.message
        });
    }
});