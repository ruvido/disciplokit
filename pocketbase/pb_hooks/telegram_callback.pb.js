/// <reference path="../pb_data/types.d.ts" />

// Custom API endpoint for Telegram Login Widget callback
routerAdd("POST", "/api/telegram-callback", (e) => {
    try {
        // Extract session data from cookie (similar to SvelteKit)
        const cookies = e.request.header.get("Cookie") || "";
        let sessionToken = null;
        
        // Parse session cookie (pb_auth)
        const cookiePairs = cookies.split(';');
        for (const pair of cookiePairs) {
            const [name, value] = pair.trim().split('=');
            if (name === 'pb_auth') {
                sessionToken = decodeURIComponent(value);
                break;
            }
        }
        
        if (!sessionToken) {
            console.log("❌ No session token found in cookies");
            return e.json(401, { "error": "Authentication required" });
        }
        
        // Get auth record from session token
        let authRecord;
        try {
            authRecord = $tokens.getAuthRecordFromToken(sessionToken);
            if (!authRecord) {
                return e.json(401, { "error": "Invalid session" });
            }
        } catch (tokenError) {
            console.error("❌ Token validation error:", tokenError);
            return e.json(401, { "error": "Invalid session token" });
        }
        
        // Parse request body
        const data = new DynamicModel({
            id: "",
            first_name: "",
            username: "",
            auth_date: "",
            hash: ""
        });
        
        e.bindBody(data);
        
        // Validate required fields
        if (!data.id) {
            return e.json(400, { "error": "Missing Telegram ID" });
        }
        
        console.log(`🔗 Telegram callback: user ${authRecord.id} → telegram_id ${data.id}`);
        
        // Update member record with Telegram information
        const member = $app.findRecordById("members", authRecord.id);
        if (!member) {
            return e.json(404, { "error": "User record not found" });
        }
        
        // Set Telegram data - combine first_name + last_name into name (consistent with widget flow)
        const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const telegramName = (firstName + " " + lastName).trim();

        const telegramData = {
            id: data.id.toString(),
            name: telegramName
        };

        if (data.username) {
            telegramData.username = data.username;
        }

        member.set("telegram", telegramData);
        
        // Save updated member record
        $app.save(member);
        
        console.log(`✅ SUCCESS: User ${authRecord.id} linked with Telegram ID ${data.id}`);
        
        return e.json(200, { 
            "success": true,
            "message": "Telegram account linked successfully",
            "telegram.id": data.id
        });
        
    } catch (error) {
        console.error("❌ Telegram callback error:", error);
        return e.json(500, {
            "error": "Internal server error",
            "message": error.message
        });
    }
});