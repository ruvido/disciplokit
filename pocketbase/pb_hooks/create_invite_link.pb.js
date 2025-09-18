/// <reference path="../pb_data/types.d.ts" />

// Custom API endpoint for creating Telegram invite links (server-side)
routerAdd("POST", "/api/custom/create-invite-link", (e) => {
    // Create data model for request validation
    const data = new DynamicModel({
        groupId: "",
        userId: ""
    });
    
    // Bind and validate request body
    e.bindBody(data);
    
    // Validate required fields
    if (!data.groupId || !data.userId) {
        return e.json(400, {
            "error": "Missing required parameters",
            "required": ["groupId", "userId"]
        });
    }
    
    try {
        console.log(`🎯 Creating invite link for group ${data.groupId}, user ${data.userId}`);
        
        // Get the group from database
        const group = $app.findRecordById("groups", data.groupId);
        if (!group) {
            return e.json(404, { "error": "Group not found" });
        }
        
        // Get the Telegram group ID from group data (parse JSON)
        const rawData = group.get("data");
        console.log(`📊 Raw data:`, rawData);
        
        let groupData = {};
        try {
            if (rawData) {
                // Use .string() method for PocketBase JSON fields
                const jsonString = rawData.string ? rawData.string() : rawData;
                groupData = JSON.parse(jsonString);
            }
        } catch (parseError) {
            console.error(`❌ Failed to parse group data:`, parseError);
            return e.json(500, { "error": "Invalid group data format" });
        }
        
        console.log(`📊 Parsed group data:`, groupData);
        
        const telegramGroupId = groupData.telegram?.id;
        console.log(`🎯 Telegram group ID:`, telegramGroupId);

        // Debug: try different ways to access the property
        console.log(`🔍 Telegram object:`, groupData.telegram);
        console.log(`🔍 Telegram ID:`, groupData.telegram?.id);
        console.log(`🔍 Object keys:`, Object.keys(groupData));
        console.log(`🔍 typeof groupData:`, typeof groupData);

        if (!telegramGroupId) {
            console.error(`❌ No telegram.id found in group data:`, groupData);
            return e.json(400, { "error": "Group is not linked to Telegram" });
        }
        
        // Get bot token from settings
        const settings = $app.findFirstRecordByFilter("settings", "key = 'telegram_bot'");
        if (!settings) {
            return e.json(500, { "error": "Bot configuration not found" });
        }
        
        const rawSettingsData = settings.get("data");
        let settingsData = {};
        try {
            if (rawSettingsData) {
                const jsonString = rawSettingsData.string ? rawSettingsData.string() : rawSettingsData;
                settingsData = JSON.parse(jsonString);
            }
        } catch (parseError) {
            console.error(`❌ Failed to parse settings data:`, parseError);
            return e.json(500, { "error": "Invalid settings data format" });
        }
        
        const botToken = settingsData.token;
        console.log(`🤖 Bot token found:`, botToken ? 'YES' : 'NO');
        
        if (!botToken) {
            return e.json(500, { "error": "Bot token not configured" });
        }
        
        console.log(`🔗 Creating invite link for Telegram group: ${telegramGroupId}`);
        
        // Generate expiry time (1 hour from now)
        const expiryTime = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour
        const unixExpiry = Math.floor(expiryTime.getTime() / 1000);
        
        // Call Telegram Bot API directly using PocketBase JSVM $http.send()
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;
        
        const telegramResponse = $http.send({
            method: "POST",
            url: telegramApiUrl,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chat_id: telegramGroupId,
                expire_date: unixExpiry,
                member_limit: 3, // Allow Telegram to send chat_member events
                name: `Disciplo-${data.userId.substring(0, 8)}`
            })
        });
        
        console.log(`📡 Telegram response status:`, telegramResponse.statusCode);
        
        if (telegramResponse.statusCode !== 200) {
            console.error(`❌ Telegram API error: ${telegramResponse.statusCode}`);
            return e.json(500, { 
                "error": "Failed to create invite link",
                "details": `Telegram API error: ${telegramResponse.statusCode}`
            });
        }
        
        if (!telegramResponse.body) {
            console.error(`❌ Empty Telegram response`);
            return e.json(500, { 
                "error": "Empty response from Telegram API"
            });
        }
        
        // Convert byte array to string manually
        let responseBody = '';
        if (Array.isArray(telegramResponse.body)) {
            // Convert byte array to string
            responseBody = String.fromCharCode(...telegramResponse.body);
        } else {
            responseBody = telegramResponse.body.string ? telegramResponse.body.string() : telegramResponse.body;
        }
        console.log(`📡 Telegram response body:`, responseBody);
        
        let telegramData;
        try {
            telegramData = JSON.parse(responseBody);
        } catch (parseError) {
            console.error(`❌ Failed to parse Telegram response:`, parseError);
            console.error(`❌ Raw response:`, responseBody);
            return e.json(500, { 
                "error": "Invalid Telegram API response",
                "details": parseError.message
            });
        }
        
        if (!telegramData.ok || !telegramData.result || !telegramData.result.invite_link) {
            console.error(`❌ Telegram response error:`, telegramData);
            return e.json(500, { 
                "error": "Failed to create invite link",
                "details": telegramData.description || "Invalid Telegram response"
            });
        }
        
        const inviteLink = telegramData.result.invite_link;
        console.log(`✅ Telegram invite link created: ${inviteLink}`);
        
        // Save mapping server-side (bypasses createRule)
        const inviteMappingsCollection = $app.findCollectionByNameOrId("invite_mappings");
        const mappingRecord = new Record(inviteMappingsCollection);
        
        mappingRecord.set("invite_link", inviteLink);
        mappingRecord.set("user_id", data.userId);
        mappingRecord.set("group_id", data.groupId);
        mappingRecord.set("telegram_group_id", telegramGroupId);
        mappingRecord.set("expires", expiryTime.toISOString());
        mappingRecord.set("used", false);
        
        $app.save(mappingRecord);
        
        console.log(`✅ Mapping saved server-side: ${inviteLink} → user ${data.userId}`);
        
        return e.json(200, {
            "success": true,
            "invite_link": inviteLink
        });
        
    } catch (error) {
        console.error("❌ Server-side invite creation error:", error.message);
        return e.json(500, {
            "error": "Internal server error",
            "message": error.message
        });
    }
});