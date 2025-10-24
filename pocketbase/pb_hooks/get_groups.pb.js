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

            // Get JSON data using official .string() method (PocketBase JSVM pattern)
            let rawData = record.get('data');
            let recordData = {};

            if (rawData && typeof rawData.string === 'function') {
                // Use .string() method for byte arrays
                const jsonString = rawData.string();
                recordData = JSON.parse(jsonString);
            } else {
                recordData = rawData || {};
            }

            const telegramId = recordData.telegram?.id;

            console.log("Processing record:", record.id, record.get("name"), "telegram_id:", telegramId)

            groupsData.push({
                id: record.id,
                name: record.get("name"),
                data: recordData,
                telegram_id: telegramId,
                created: record.get("created"),
                updated: record.get("updated")
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