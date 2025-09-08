migrate((app) => {
    const adminEmail = $os.getenv("ADMIN_EMAIL")
    const adminPassword = $os.getenv("ADMIN_PASSWORD")
    
    // Only create admin if both email and password are provided
    if (!adminEmail || !adminPassword) {
        console.log("Skipping admin creation - ADMIN_EMAIL or ADMIN_PASSWORD not set")
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
    mrecord.set("role", "admin")
    app.save(mrecord)
})
