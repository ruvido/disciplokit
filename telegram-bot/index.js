require('dotenv').config({ path: '../.env' })
const { Telegraf } = require('telegraf')
const Config = require('./config')
const express = require('express')

console.log('✅ ENV e Config importati')

console.log('🔧 Creando istanza Config...')
const config = new Config()
console.log('✅ Config istanziata, PocketBase connesso')

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

console.log('🚀 Disciplo Telegram Bot Starting...')

bot.start((ctx) => {
    ctx.reply('Benvenuto in Disciplo!')
})

bot.on('my_chat_member', async (ctx) => {
    const chatMember = ctx.update.my_chat_member
    const chat = chatMember.chat
    
    if (chatMember.new_chat_member.status === 'administrator') {
        console.log(`Bot aggiunto a gruppo: ${chat.title} (ID: ${chat.id})`)
        
        // Sync group with PocketBase
        console.log('🔄 Sincronizzando gruppo con PocketBase...')
        const groupInfo = {
            id: chat.id,
            title: chat.title
        }
        
        const syncSuccess = await config.syncTelegramGroup(groupInfo)
        if (syncSuccess) {
            console.log('✅ Gruppo sincronizzato con successo in PocketBase')
            
            // Send simple signup-direct link
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
            const signupUrl = `${frontendUrl}/signup?type=direct`
            
            ctx.reply(`Benvenuti su Disciplo!

Membri del gruppo, registratevi qui:
${signupUrl}

Obbligatorio per rimanere nel gruppo.`)
            
        } else {
            console.log('❌ Errore sincronizzazione PocketBase')
            ctx.reply('Bot attivato! Errore nella sincronizzazione - contatta l\'amministratore')
        }
    }
})

bot.catch((err) => {
    console.error('❌ Bot error:', err)
})

bot.launch().then(() => {
    console.log('🚀 Bot principale is running!')
}).catch(err => {
    console.error('❌ Launch failed:', err)
    process.exit(1)
})

process.once('SIGINT', () => {
    console.log('🛑 Stopping bot...')
    bot.stop('SIGINT')
})
// HTTP Server for API endpoints
const app = express()
app.use(express.json())

// Sync user groups endpoint
app.post('/sync-user-groups', async (req, res) => {
    try {
        const { user_id, telegram_id } = req.body
        
        if (!user_id || !telegram_id) {
            return res.status(400).json({ error: 'Missing user_id or telegram_id' })
        }
        
        console.log(`🔄 Syncing groups for user ${user_id} (Telegram: ${telegram_id})`)
        
        // Get all groups from PocketBase via custom API
        const groups = await config.getAllGroups()
        
        if (!groups) {
            throw new Error('Failed to fetch groups from PocketBase')
        }
        
        console.log(`📋 Found ${groups.length} groups to check`)
        
        let addedToGroups = []
        
        // Check each group
        for (const group of groups) {
            try {
                const groupTelegramId = group.telegram_id
                if (!groupTelegramId) continue
                
                console.log(`🔍 Checking membership in group: ${group.name} (${groupTelegramId})`)
                
                // Check if user is member of this Telegram group
                const chatMember = await bot.telegram.getChatMember(groupTelegramId, parseInt(telegram_id))
                
                if (chatMember && ['member', 'administrator', 'creator'].includes(chatMember.status)) {
                    console.log(`✅ User is member of group ${group.name}`)
                    
                    // Add to group_members via API
                    const addSuccess = await config.addToGroupMembers(group.id, user_id, false)
                    if (addSuccess) {
                        addedToGroups.push({
                            group_id: group.id,
                            group_name: group.name
                        })
                        console.log(`✅ Added user to group_members: ${group.name}`)
                    }
                } else {
                    console.log(`⏭️  User not member of group: ${group.name}`)
                }
                
            } catch (error) {
                console.log(`⚠️  Could not check group ${group.name}: ${error.message}`)
                // Continue with next group
            }
        }
        
        console.log(`🎉 Sync completed. Added to ${addedToGroups.length} groups`)
        
        res.json({
            success: true,
            groups_added: addedToGroups,
            total_checked: groups.length
        })
        
    } catch (error) {
        console.error('❌ Error syncing user groups:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', bot: 'running' })
})

// Start HTTP server
const port = process.env.BOT_PORT
const server = app.listen(port, () => {
    console.log(`🌐 Bot HTTP server running on port ${port}`)
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} busy, trying alternative...`)
        const altServer = app.listen(0, () => {
            console.log(`🌐 Bot HTTP server running on port ${altServer.address().port}`)
        })
    } else {
        console.error('Server error:', err)
        process.exit(1)
    }
})

// Graceful shutdown
const shutdown = () => {
    console.log('🛑 Stopping bot and server...')
    server.close(() => {
        console.log('✅ HTTP server closed')
        bot.stop('SIGTERM')
        process.exit(0)
    })
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)