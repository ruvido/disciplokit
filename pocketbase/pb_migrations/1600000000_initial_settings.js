migrate((app) => {
    const settings = app.settings()

    settings.meta.appName = "DisciploKit"
    settings.meta.appURL = "http://127.0.0.1:8090"
    settings.logs.maxDays = 2
    settings.logs.logAuthId = true
    settings.logs.logIP = false

    app.save(settings)
})
