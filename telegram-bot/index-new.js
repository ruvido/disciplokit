require('dotenv').config({ path: '../.env' });
const { Telegraf } = require('telegraf');
const Config = require('./config');

const bot = new Telegraf('8267420203:AAGz2WqQPZsbpiNJjlqWfbNhfsNDlt7B3KQ');

console.log('🚀 Disciplo Telegram Bot Starting...');

bot.start((ctx) => ctx.reply('👋 Benvenuto in Disciplo! Bot is working!'));

console.log('📡 Clearing any webhooks first...');
bot.telegram.deleteWebhook()
    .then(() => {
        console.log('✅ Webhook cleared');
        console.log('📡 Calling bot.launch()...');
        return bot.launch();
    })
    .then(() => {
        console.log('✅ Bot launched successfully!');
        console.log('🤖 Bot is now running and ready to receive messages');
    })
    .catch(err => {
        console.error('❌ Launch error:', err);
        process.exit(1);
    });

// Enable graceful stop
process.once('SIGINT', () => {
    console.log('🛑 Stopping bot...');
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    console.log('🛑 Stopping bot...');
    bot.stop('SIGTERM');
});