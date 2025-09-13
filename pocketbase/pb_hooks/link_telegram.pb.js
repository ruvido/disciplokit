/// <reference path="../pb_data/types.d.ts" />

// Custom API endpoint for bot to link Telegram accounts
routerAdd("POST", "/api/custom/link-telegram", (e) => {
    // Create data model for request validation
    const data = new DynamicModel({
        linkParam: "",
        telegramId: "",
        telegramUsername: ""
    });
    
    // Bind and validate request body
    e.bindBody(data);
    
    // Validate required fields
    if (!data.linkParam || !data.telegramId) {
        return e.json(400, {
            "error": "Missing required parameters",
            "required": ["linkParam", "telegramId"]
        });
    }
    
    try {
        // Parse and validate link parameter
        const parts = data.linkParam.split('_');
        if (parts.length !== 4) {
            return e.json(400, {"error": "Invalid link format"});
        }
        
        const [userId, expiry, token, signature] = parts;
        
        // Check expiry
        const now = Date.now();
        if (parseInt(expiry) < now) {
            return e.json(400, {"error": "Link expired"});
        }
        
        // Get secret from environment
        const secret = $os.getenv('TELEGRAM_LINK_SECRET');
        if (!secret) {
            return e.json(500, {"error": "Bot secret not configured"});
        }
        
        // Validate HMAC signature - debug version
        const message = `${userId}_${expiry}_${token}`;
        const expectedSignature = $security.hs256(message, secret).substring(0, 8);
        
        console.log('DEBUG signature validation:');
        console.log('- message:', message);
        console.log('- secret length:', secret.length);
        console.log('- expected:', expectedSignature);
        console.log('- received:', signature);
        if (signature !== expectedSignature) {
            return e.json(400, {"error": "Invalid signature"});
        }
        
        // Find and update member record
        const member = $app.findRecordById("members", userId);
        if (!member) {
            return e.json(404, {"error": "Member not found"});
        }
        
        // Prepare update data
        member.set("telegram_id", data.telegramId.toString());
        
        if (data.telegramUsername) {
            member.set("telegram_name", data.telegramUsername);
        }
        
        // Save the updated member
        $app.save(member);
        
        console.log(`✅ Linked member ${userId} with Telegram ID ${data.telegramId}`);
        
        return e.json(200, {
            "success": true,
            "message": "User linked successfully"
        });
        
    } catch (error) {
        console.error('❌ Error linking user to Telegram:', error);
        return e.json(500, {
            "error": "Internal server error",
            "message": error.message
        });
    }
});