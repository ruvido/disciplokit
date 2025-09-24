const { Telegraf } = require('telegraf')

const bot = new Telegraf('8267420203:AAGz2WqQPZsbpiNJjlqWfbNhfsNDlt7B3KQ')

console.log('🧪 Test Bot Starting...')

// Test commands
bot.start((ctx) => {
    console.log('✅ /start test passed!')
    ctx.reply('🎉 Test Bot funziona! Scrivi /test per provare altri comandi.')
})

bot.command('test', (ctx) => {
    console.log('✅ /test command received!')
    ctx.reply('✅ Comando /test funziona perfettamente!')
})

bot.command('ping', (ctx) => {
    console.log('✅ /ping command received!')
    ctx.reply('🏓 Pong! Bot risponde correttamente.')
})

bot.command('info', (ctx) => {
    console.log('✅ /info command received!')
    const info = `
🤖 *Test Bot Info*
- Nome: @disciplo_bot
- Status: ✅ Online
- Version: Test Mode
- Framework: Telegraf
- Runtime: Bun
    `
    ctx.reply(info, { parse_mode: 'Markdown' })
})

// Echo any text message
bot.on('text', (ctx) => {
    const text = ctx.message.text
    if (!text.startsWith('/')) {
        console.log(`💬 Echo test: "${text}"`)
        ctx.reply(`📢 Hai scritto: "${text}"`)
    }
})

bot.catch((err) => {
    console.error('❌ Test Bot error:', err)
})

bot.launch().then(() => {
    console.log('🚀 Test Bot is running!')
    console.log('📋 Comandi disponibili:')
    console.log('   /start - Test comando start')
    console.log('   /test - Test comando personalizzato')
    console.log('   /ping - Test ping/pong')
    console.log('   /info - Info del bot')
    console.log('   Scrivi qualsiasi testo per echo test')
}).catch(err => {
    console.error('❌ Test launch failed:', err)
    process.exit(1)
})

process.once('SIGINT', () => {
    console.log('🛑 Stopping test bot...')
    bot.stop('SIGINT')
})
process.once('SIGTERM', () => {
    console.log('🛑 Stopping test bot...')
    bot.stop('SIGTERM')
})