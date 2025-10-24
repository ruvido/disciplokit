// Email Templates System - Load templates from filesystem and override system emails

function loadEmailTemplate(templateName, variables = {}) {
    try {
        // Read template from filesystem
        const templatePath = `email_templates/${templateName}.md`
        let content = $os.readFile(templatePath)
        
        // Replace PocketBase placeholders with actual values
        Object.keys(variables).forEach(key => {
            const placeholder = `{${key}}`
            content = content.replaceAll(placeholder, variables[key])
        })
        
        // Convert markdown to HTML (simple conversion)
        let html = content
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
            .replace(/^---$/gm, '<hr>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<p><h1>/g, '<h1>')
            .replace(/<\/h1><\/p>/g, '</h1>')
            .replace(/<p><hr><\/p>/g, '<hr>')
            .replace(/<p><\/p>/g, '')
        
        return html
    } catch (error) {
        console.error(`Failed to load email template ${templateName}:`, error)
        return null
    }
}

// Override verification email for ALL collections with custom template
onMailerRecordVerificationSend((e) => {
    console.log(`VERIFICATION HOOK for collection: ${e.record.collection().name}`)
    
    try {
        // Inline template loading instead of function - using official PocketBase method
        const templatePath = `email_templates/verification_email.md`
        const fileBytes = $os.readFile(templatePath)
        let content = toString(fileBytes)
        console.log("File read successfully:", content.length, "characters")
        
        const appSettings = e.app.settings()
        
        // Use official PocketBase method to get token and settings
        const token = e.meta.token
        const appName = appSettings.meta.appName
        const appUrl = appSettings.meta.appURL
        
        // Replace placeholders manually
        content = content.replace(/\{APP_NAME\}/g, appName)
        content = content.replace(/\{APP_URL\}/g, appUrl)
        content = content.replace(/\{TOKEN\}/g, token)
        
        // Convert markdown to HTML
        let html = content
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<p><h1>/g, '<h1>')
            .replace(/<\/h1><\/p>/g, '</h1>')
            .replace(/<p><\/p>/g, '')
        
        e.message.subject = `Verifica la tua Email - ${appName}`
        e.message.html = html
        console.log("Template applicato con successo!")
        
    } catch (error) {
        console.error('Email template override failed:', error)
    }
    
    e.next()
})