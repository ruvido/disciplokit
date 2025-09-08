// Create initial admin user on PocketBase bootstrap
onAfterBootstrap((e) => {
    const adminEmail = $os.getenv("ADMIN_EMAIL")
    const adminPassword = $os.getenv("ADMIN_PASSWORD")
    
    if (!adminEmail || !adminPassword) {
        console.log("Admin credentials not found in environment variables")
        return
    }
    
    try {
        const admin = $app.dao().findFirstRecordByData("users", "email", adminEmail)
        if (!admin) {
            const collection = $app.dao().findCollectionByNameOrId("users")
            const record = new Record(collection, {
                email: adminEmail,
                password: adminPassword,
                role: "admin"
            })
            $app.dao().saveRecord(record)
            console.log("Admin user created successfully with email:", adminEmail)
        } else {
            console.log("Admin user already exists")
        }
    } catch (e) {
        console.log("Admin creation error:", e)
    }
})