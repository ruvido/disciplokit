migrate((app) => {
    const adminEmail = $os.getenv("POCKETBASE_ADMIN_EMAIL")
    const adminPassword = $os.getenv("POCKETBASE_ADMIN_PASSWORD")
    
    // Only create admin if both email and password are provided
    if (!adminEmail || !adminPassword) {
        console.log("Skipping admin creation - POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD not set")
        return
    }
    
    
    // add default admin
    console.log("Creating admin user:", adminEmail)
    const superusers = app.findCollectionByNameOrId("_superusers")
    const record = new Record(superusers)
    record.set("email", adminEmail)
    record.set("password", adminPassword)
    app.save(record)

    // add default member
    console.log("Creating default user:", adminEmail)
    const members = app.findCollectionByNameOrId("members")
    const mrecord = new Record(members)
    mrecord.set("email", adminEmail)
    mrecord.set("password", adminPassword)
    mrecord.set("emailVisibility", true)
    mrecord.set("role", "admin")
    app.save(mrecord)
})
