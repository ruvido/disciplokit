const { Telegraf } = require('telegraf');

const bot = new Telegraf('8267420203:AAGz2WqQPZsbpiNJjlqWfbNhfsNDlt7B3KQ');

console.log('🧪 Testing super minimal bot...');

// Add error handler
bot.catch((err) => {
    console.error('❌ Bot error:', err);
});

bot.launch()
    .then(() => console.log('🚀 SUCCESS!'))
    .catch(err => console.error('❌ LAUNCH ERROR:', err));

// Graceful shutdown
process.once('SIGINT', () => {
    console.log('🛑 SIGINT received');
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    console.log('🛑 SIGTERM received');
    bot.stop('SIGTERM');
});