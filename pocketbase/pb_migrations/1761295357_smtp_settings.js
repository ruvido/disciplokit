migrate((app) => {
    const settings = app.settings()

    // Configure SMTP settings from environment variables
    const smtpHost = $os.getenv("SMTP_HOST")
    const smtpPort = $os.getenv("SMTP_PORT")
    const smtpUsername = $os.getenv("SMTP_USERNAME")
    const smtpPassword = $os.getenv("SMTP_PASSWORD")
    const smtpFrom = $os.getenv("SMTP_FROM")
    const appName = $os.getenv("APP_NAME")

    const missing = []
    if (!smtpHost) missing.push("SMTP_HOST")
    if (!smtpPort) missing.push("SMTP_PORT") 
    if (!smtpUsername) missing.push("SMTP_USERNAME")
    if (!smtpPassword) missing.push("SMTP_PASSWORD")
    if (!smtpFrom) missing.push("SMTP_FROM")
    
    if (missing.length > 0) {
        throw new Error(`❌ SMTP CONFIG FAIL: Missing variables in .env file: ${missing.join(', ')}\n💡 Add these to /home/ruvido/dev/disciplokit/.env and restart PocketBase`)
    }

    settings.smtp.enabled = true
    settings.smtp.host = smtpHost
    settings.smtp.port = parseInt(smtpPort)
    settings.smtp.username = smtpUsername
    settings.smtp.password = smtpPassword
    settings.smtp.authMethod = "PLAIN"
    settings.smtp.tls = false

    // Parse "Nome <email>" format
    const fromMatch = smtpFrom.match(/^(.+?)\s*<(.+?)>$/)
    if (fromMatch) {
        settings.meta.senderName = fromMatch[1].trim()
        settings.meta.senderAddress = fromMatch[2].trim()
    } else {
        settings.meta.senderName = appName || "DisciploKit"
        settings.meta.senderAddress = smtpFrom
    }

    app.save(settings)
})