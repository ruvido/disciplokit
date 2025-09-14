/// <reference path="../pb_data/types.d.ts" />

// Server-side API endpoint for generating unique Telegram invite links

routerAdd("POST", "/api/invite-link/{groupId}", (e) => {
    console.log("🎯 Server-side invite link generation requested");
    
    try {
        // Check if user is authenticated (custom route authentication)
        const authHeader = e.request.header.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return e.json(401, { "error": "Authentication required" });
        }
        
        const token = authHeader.substring(7); // Remove "Bearer "
        let authRecord;
        
        try {
            // Verify the auth token manually
            authRecord = $tokens.getAuthRecordFromToken(token);
            if (!authRecord) {
                return e.json(401, { "error": "Invalid authentication token" });
            }
        } catch (err) {
            console.error("Token verification error:", err);
            return e.json(401, { "error": "Authentication failed" });
        }
        
        const groupId = e.pathParam("groupId");
        if (!groupId) {
            return e.json(400, { "error": "Group ID required" });
        }
        
        console.log(`📨 Request: groupId=${groupId}, userId=${authRecord.id}`);
        
        // Get the group from database
        const group = $app.findRecordById("groups", groupId);
        if (!group) {
            return e.json(404, { "error": "Group not found" });
        }
        
        // Check if user is a member of the group  
        const members = group.get("members") || [];
        if (!members.includes(authRecord.id)) {
            return e.json(403, { "error": "You are not a member of this group" });
        }
        
        // Get the Telegram group ID from group data
        const groupData = group.get("data") || {};
        const telegramGroupId = groupData.telegram_id;
        
        if (!telegramGroupId) {
            return e.json(400, { "error": "Group is not linked to Telegram" });
        }
        
        // Get bot token from settings
        const settings = $app.findFirstRecordByFilter("settings", "key = 'telegram_bot'");
        if (!settings) {
            return e.json(500, { "error": "Bot configuration not found" });
        }
        
        const settingsData = settings.get("data") || {};
        const botToken = settingsData.token;
        
        if (!botToken) {
            return e.json(500, { "error": "Bot token not configured" });
        }
        
        console.log(`🔗 Creating invite link for Telegram group: ${telegramGroupId}`);
        
        // Generate expiry time (1 hour from now)
        const expiryTime = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour
        const unixExpiry = Math.floor(expiryTime.getTime() / 1000);
        
        // Call Telegram Bot API directly
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;
        
        const telegramRequest = new http.Request();
        telegramRequest.url = telegramApiUrl;
        telegramRequest.method = "POST";
        telegramRequest.headers = {
            "Content-Type": "application/json"
        };
        telegramRequest.body = JSON.stringify({
            chat_id: telegramGroupId,
            expire_date: unixExpiry,
            member_limit: 1,
            name: `Disciplo-${authRecord.id.substring(0, 8)}`
        });
        
        const telegramResponse = telegramRequest.send();
        
        if (telegramResponse.statusCode !== 200) {
            console.error(`❌ Telegram API error: ${telegramResponse.statusCode} - ${telegramResponse.body}`);
            return e.json(500, { 
                "error": "Failed to create invite link",
                "details": "Telegram API communication failed"
            });
        }
        
        const telegramData = JSON.parse(telegramResponse.body);
        
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
        mappingRecord.set("user_id", authRecord.id);
        mappingRecord.set("group_id", groupId);
        mappingRecord.set("telegram_group_id", telegramGroupId);
        mappingRecord.set("expires", expiryTime.toISOString());
        mappingRecord.set("used", false);
        
        $app.save(mappingRecord);
        
        console.log(`✅ Mapping saved server-side: ${inviteLink} → user ${authRecord.id}`);
        
        return e.json(200, {
            "success": true,
            "invite_link": inviteLink
        });
        
    } catch (error) {
        console.error("❌ Server-side invite generation error:", error.message);
        return e.json(500, {
            "error": "Internal server error",
            "message": error.message
        });
    }
});