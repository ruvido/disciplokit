/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/custom/add-group-member", (e) => {
    const data = $apis.requestInfo(e).data
    
    // Validate HMAC token
    const secret = $os.getenv("TELEGRAM_LINK_SECRET")
    const token = e.request.header.get("X-Sync-Token")
    const userId = data.user_id
    const groupId = data.group_id
    const moderator = data.moderator || false
    const timestamp = data.timestamp
    
    if (!secret || !token || !userId || !groupId || !timestamp) {
        throw new BadRequestError("Missing required parameters")
    }
    
    // Validate timestamp (5 minutes window)
    const now = Date.now()
    if (Math.abs(now - timestamp) > 300000) {
        throw new BadRequestError("Token expired")
    }
    
    // Verify HMAC token
    const expectedData = `${userId}_${groupId}_${timestamp}`
    const expectedToken = $security.hs256(expectedData, secret).substring(0, 16)
    
    if (token !== expectedToken) {
        throw new BadRequestError("Invalid token")
    }
    
    try {
        // Check if user already exists in group
        const existing = $app.dao().findFirstRecordByFilter(
            "group_members",
            `member_id = "${userId}" && group_id = "${groupId}"`
        )
        
        // User already exists, return existing record
        return e.json(200, {
            "id": existing.id,
            "member_id": existing.member_id,
            "group_id": existing.group_id,
            "moderator": existing.moderator,
            "status": existing.status,
            "message": "User already in group"
        })
        
    } catch (error) {
        // User not in group, create new record
        try {
            const collection = $app.dao().findCollectionByNameOrId("group_members")
            const record = new Record(collection)
            
            record.set("member_id", userId)
            record.set("group_id", groupId)
            record.set("moderator", moderator)
            record.set("status", "active")
            
            $app.dao().saveRecord(record)
            
            return e.json(201, {
                "id": record.id,
                "member_id": record.get("member_id"),
                "group_id": record.get("group_id"),
                "moderator": record.get("moderator"),
                "status": record.get("status"),
                "message": "User added to group successfully"
            })
            
        } catch (createError) {
            throw new BadRequestError(`Failed to add user to group: ${createError}`)
        }
    }
})