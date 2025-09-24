const { Telegraf } = require('telegraf')
const bot = new Telegraf('8267420203:AAGz2WqQPZsbpiNJjlqWfbNhfsNDlt7B3KQ')

bot.start((ctx) => ctx.reply('Welcome'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))