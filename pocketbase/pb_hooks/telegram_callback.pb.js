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
        
        // Set Telegram data
        member.set("telegram_id", data.id.toString());
        
        if (data.first_name) {
            member.set("telegram_name", data.first_name);
        }
        
        if (data.username) {
            // Store additional data in JSON field if needed
            const existingData = member.get("data");
            let memberData = {};
            
            try {
                if (existingData) {
                    const jsonString = existingData.string ? existingData.string() : existingData;
                    memberData = JSON.parse(jsonString);
                }
            } catch (parseError) {
                console.log("📊 Creating new data object");
                memberData = {};
            }
            
            memberData.telegram_username = data.username;
            memberData.telegram_linked_at = new Date().toISOString();
            
            member.set("data", JSON.stringify(memberData));
        }
        
        // Save updated member record
        $app.save(member);
        
        console.log(`✅ SUCCESS: User ${authRecord.id} linked with Telegram ID ${data.id}`);
        
        return e.json(200, { 
            "success": true,
            "message": "Telegram account linked successfully",
            "telegram_id": data.id
        });
        
    } catch (error) {
        console.error("❌ Telegram callback error:", error);
        return e.json(500, {
            "error": "Internal server error",
            "message": error.message
        });
    }
});