/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/custom/find-user-by-telegram", (e) => {
    const data = $apis.requestInfo(e).data
    
    // Validate HMAC token
    const secret = $os.getenv("TELEGRAM_LINK_SECRET")
    const token = e.request.header.get("X-Sync-Token")
    const telegramId = data.telegram_id
    const timestamp = data.timestamp
    
    if (!secret || !token || !telegramId || !timestamp) {
        throw new BadRequestError("Missing required parameters")
    }
    
    // Validate timestamp (5 minutes window)
    const now = Date.now()
    if (Math.abs(now - timestamp) > 300000) {
        throw new BadRequestError("Token expired")
    }
    
    // Verify HMAC token
    const expectedData = `${telegramId}_${timestamp}`
    const expectedToken = $security.hs256(expectedData, secret).substring(0, 16)
    
    if (token !== expectedToken) {
        throw new BadRequestError("Invalid token")
    }
    
    try {
        // Find user by telegram.id
        const user = $app.dao().findFirstRecordByFilter(
            "members", 
            `telegram.id = "${telegramId}"`
        )
        
        return e.json(200, {
            "id": user.id,
            "email": user.email,
            "telegram": user.telegram
        })
        
    } catch (error) {
        // User not found
        throw new NotFoundError("User not found")
    }
})