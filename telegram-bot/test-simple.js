const { Telegraf } = require('telegraf')

const bot = new Telegraf('8267420203:AAGz2WqQPZsbpiNJjlqWfbNhfsNDlt7B3KQ')

console.log('Starting test bot...')

bot.start((ctx) => {
    console.log('Start command received!')
    ctx.reply('Hello! Test bot works!')
})

bot.catch((err) => {
    console.error('Bot error:', err)
})

bot.launch().then(() => {
    console.log('Bot is running!')
}).catch(err => {
    console.error('Launch failed:', err)
    process.exit(1)
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))