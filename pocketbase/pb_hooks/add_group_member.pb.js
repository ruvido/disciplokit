/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/custom/add-group-member", (e) => {
    console.log("🔍 add-group-member endpoint called")

    // Parse request data using DynamicModel (official PocketBase JSVM pattern)
    const data = new DynamicModel({
        user_id: "",
        group_id: "",
        moderator: false,
        timestamp: 0
    });

    e.bindBody(data);

    // Validate HMAC token
    const secret = $os.getenv("TELEGRAM_LINK_SECRET")
    const token = e.request.header.get("X-Sync-Token")
    const userId = data.user_id
    const groupId = data.group_id
    const moderator = data.moderator || false
    const timestamp = data.timestamp

    console.log("📨 Request data:", `user_id: ${userId}, group_id: ${groupId}, moderator: ${moderator}, timestamp: ${timestamp}`)

    if (!secret || !token || !userId || !groupId || !timestamp) {
        console.log("❌ Missing required parameters")
        throw new BadRequestError("Missing required parameters")
    }
    
    // Validate timestamp (5 minutes window)
    const now = Date.now()
    if (Math.abs(now - timestamp) > 300000) {
        console.log("❌ Token expired")
        throw new BadRequestError("Token expired")
    }

    // Verify HMAC token
    const expectedData = `${userId}_${groupId}_${timestamp}`
    const expectedToken = $security.hs256(expectedData, secret).substring(0, 16)

    console.log("🔐 Token validation - expected:", expectedToken, "got:", token)

    if (token !== expectedToken) {
        console.log("❌ Invalid token")
        throw new BadRequestError("Invalid token")
    }

    console.log("✅ Token validation passed")
    
    // Check if user already exists in group (using official $app pattern)
    console.log("🔍 Checking if user already in group...")
    const existingList = $app.findRecordsByFilter("group_members",
        `member_id = '${userId}' && group_id = '${groupId}'`);

    if (existingList.length > 0) {
        const existing = existingList[0];
        console.log("✅ User already exists in group, returning existing record")

        // User already exists, return existing record
        return e.json(200, {
            "id": existing.id,
            "member_id": existing.get("member_id"),
            "group_id": existing.get("group_id"),
            "moderator": existing.get("moderator"),
            "status": existing.get("status"),
            "message": "User already in group"
        })
    }

    // User not in group, create new record
    console.log("🔍 User not in group, creating new record...")
    try {
        const collection = $app.findCollectionByNameOrId("group_members")
        const record = new Record(collection)

        record.set("member_id", userId)
        record.set("group_id", groupId)
        record.set("moderator", moderator)
        record.set("status", "active")

        console.log("💾 Saving new group_member record...")
        $app.save(record)

        console.log("✅ User added to group successfully")

        return e.json(201, {
            "id": record.id,
            "member_id": record.get("member_id"),
            "group_id": record.get("group_id"),
            "moderator": record.get("moderator"),
            "status": record.get("status"),
            "message": "User added to group successfully"
        })

    } catch (createError) {
        console.log("❌ Failed to create record:", createError.message)
        throw new BadRequestError(`Failed to add user to group: ${createError}`)
    }
})