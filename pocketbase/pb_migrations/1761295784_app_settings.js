migrate((app) => {
    const settings = app.settings()

    // Configure application settings from environment variables
    const appName = $os.getenv("APP_NAME")
    const pocketbaseUrl = $os.getenv("POCKETBASE_URL")

    const missing = []
    if (!appName) missing.push("APP_NAME")
    if (!pocketbaseUrl) missing.push("POCKETBASE_URL")
    
    if (missing.length > 0) {
        throw new Error(`❌ APP CONFIG FAIL: Missing variables in .env file: ${missing.join(', ')}\n💡 Add these to /home/ruvido/dev/disciplokit/.env and restart PocketBase`)
    }

    settings.meta.appName = appName
    settings.meta.appURL = pocketbaseUrl

    app.save(settings)
})