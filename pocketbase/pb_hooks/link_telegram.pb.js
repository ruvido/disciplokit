/// <reference path="../pb_data/types.d.ts" />

// Custom API endpoint for bot and web app to link Telegram accounts
routerAdd("POST", "/api/custom/link-telegram", (e) => {
    console.log('🔥 Link Telegram endpoint called');

    // Create data model for web app request - simplified nested object
    const webAppData = new DynamicModel({
        user_id: "",
        telegram_data: {}  // Use .get() to access nested object
    });

    try {
        // Try to bind as web app request first
        e.bindBody(webAppData);
        console.log('📋 Web app data parsed:', JSON.stringify(webAppData));

        // Check if this is a web app request (has user_id and telegram_data)
        if (webAppData.user_id && webAppData.telegram_data) {
            // Web app flow - direct user ID with Telegram data
            console.log('✅ Detected web app request flow');

            const userId = webAppData.user_id;

            // Access telegram_data directly - DynamicModel allows direct access after bindBody
            let telegramData;
            const rawTelegramData = webAppData.telegram_data;  // Direct access works after bindBody
            console.log(`🔍 Raw telegram data:`, JSON.stringify(rawTelegramData));

            // Handle wrapped Go object - parse from JSON string representation
            try {
                // Convert Go wrapped object to plain JavaScript object via JSON
                const jsonString = JSON.stringify(rawTelegramData);
                telegramData = JSON.parse(jsonString);
                console.log(`🔄 Converted Go wrapped object to JS object`);
            } catch (parseError) {
                console.error(`❌ Failed to parse telegram data:`, parseError);
                return e.json(400, {"error": "Invalid telegram data format"});
            }

            console.log(`👤 Web app request for user: ${userId}, Telegram ID: ${telegramData?.id}`);
            console.log(`📋 Parsed telegram data:`, JSON.stringify(telegramData));

            try {
                // Find and update member record using $app directly (server-side)
                console.log(`🔍 Looking up member with ID: ${userId}`);
                const member = $app.findRecordById("members", userId);
                if (!member) {
                    console.error(`❌ Member ${userId} not found`);
                    return e.json(404, {"error": "Member not found"});
                }

                console.log(`✅ Member found: ${member.get("email")} - updating with Telegram data`);

                // Update member with Telegram data - server-side with full privileges
                // Safe access to telegram data properties
                const telegramId = telegramData?.id;
                const firstName = telegramData?.first_name || "";
                const lastName = telegramData?.last_name || "";
                const telegramName = (firstName + " " + lastName).trim();
                const telegramUsername = telegramData?.username;

                if (!telegramId) {
                    console.error('❌ Telegram ID is missing from data');
                    return e.json(400, {"error": "Telegram ID is required"});
                }

                const memberTelegramData = {
                    id: telegramId.toString(),
                    name: telegramName
                };
                if (telegramUsername) {
                    memberTelegramData.username = telegramUsername;
                }
                member.set("telegram", memberTelegramData);

                console.log(`💾 Saving member with telegram.id: ${telegramId}`);
                // Save using $app - this has full server-side access
                $app.save(member);

                console.log(`✅ SUCCESS: Linked member ${userId} with Telegram ID ${telegramId}`);

                return e.json(200, {
                    "success": true,
                    "message": "Telegram account linked successfully",
                    "telegram.id": telegramId
                });

            } catch (error) {
                console.error('❌ Error in web app flow:', error);
                return e.json(500, {
                    "error": "Internal server error",
                    "message": error.message
                });
            }

        } else {
            console.log('🔄 Not a web app request, trying bot flow...');
        }

    } catch (bindError) {
        console.error('❌ Error binding web app data:', bindError);
        console.log('🔄 Web app binding failed, trying bot flow...');
    }

    // Original bot flow - with linkParam validation
    const data = new DynamicModel({
        linkParam: "",
        telegramId: "",
        telegramUsername: ""
    });

    // Bind and validate request body
    e.bindBody(data);

    // Validate required fields for bot flow
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
        
        // Prepare update data - ensure telegramId is properly converted
        const telegramId = data.telegramId;
        if (!telegramId) {
            return e.json(400, {"error": "Telegram ID is required"});
        }
        
        const telegramData = {
            id: String(telegramId)
        };
        if (data.telegramUsername) {
            telegramData.name = String(data.telegramUsername);
        }
        member.set("telegram", telegramData);
        
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