require('dotenv').config({ path: '../.env' });
const { Telegraf } = require('telegraf');
const Config = require('./config');

class DisciploBot {
    constructor() {
        this.config = new Config();
        this.bot = null;
        this.telegramSecret = null;
        this.httpServer = null;
        this.botConfig = null;
    }

    async initialize() {
        console.log('🔗 Connecting to PocketBase at: http://localhost:8090');
        
        // Load bot configuration from PocketBase
        this.botConfig = await this.config.getTelegramBotConfig();
        
        // Get secret from environment variables
        this.telegramSecret = process.env.TELEGRAM_LINK_SECRET;
        if (!this.telegramSecret) {
            throw new Error('Bot secret not configured in environment (TELEGRAM_LINK_SECRET)');
        }
        
        // Initialize Telegraf bot
        this.bot = new Telegraf(this.botConfig.token);
        
        console.log(`✅ Bot "${this.botConfig.name}" initialized successfully`);
        
        return true;
    }

    async start() {
        console.log('🔄 Starting minimal bot launch...'); 
        
        await this.bot.launch();
        
        console.log('🚀 MINIMAL Disciplo Telegram Bot is running!');
    }
}

// Start the bot
(async () => {
    const disciploBot = new DisciploBot();
    await disciploBot.initialize();
    await disciploBot.start();
})();