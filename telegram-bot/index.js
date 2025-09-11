const { Telegraf } = require('telegraf');
const Config = require('./config');

class DisciploBot {
    constructor() {
        this.config = new Config();
        this.bot = null;
    }

    async initialize() {
        try {
            // Load bot configuration from PocketBase
            const botConfig = await this.config.getTelegramBotConfig();
            
            // Initialize Telegraf bot
            this.bot = new Telegraf(botConfig.token);
            
            console.log(`✅ Bot "${botConfig.name}" initialized successfully`);
            
            // Set up bot handlers
            this.setupHandlers();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize bot:', error.message);
            process.exit(1);
        }
    }

    setupHandlers() {
        // Handle /start command with linking parameter
        this.bot.start(async (ctx) => {
            const startPayload = ctx.startPayload;
            
            if (startPayload && startPayload.startsWith('link_')) {
                // Extract member ID from payload: link_user123 -> user123
                const memberId = startPayload.replace('link_', '');
                const telegramId = ctx.from.id;
                const telegramUsername = ctx.from.username;
                
                const success = await this.config.linkUserTelegram(memberId, telegramId, telegramUsername);
                
                if (success) {
                    ctx.reply('✅ Account collegato con successo! Ora puoi essere gestito dalla dashboard Disciplo.');
                    console.log(`✅ Linked member ${memberId} with Telegram ID ${telegramId}`);
                } else {
                    ctx.reply('❌ Errore nel collegamento. Riprova più tardi o contatta l\\'amministratore.');
                    console.error(`❌ Failed to link member ${memberId} with Telegram ID ${telegramId}`);
                }
            } else {
                ctx.reply('👋 Benvenuto in Disciplo! Usa il bottone nella dashboard per collegare il tuo account.');
            }
        });

        // Handle bot added to group/channel
        this.bot.on('my_chat_member', async (ctx) => {
            const chatMember = ctx.update.my_chat_member;
            const chat = chatMember.chat;
            
            // Check if bot was added as administrator
            if (chatMember.new_chat_member.status === 'administrator') {
                console.log(`🏢 Bot added as admin to: ${chat.title} (ID: ${chat.id})`);
                
                const groupInfo = {
                    id: chat.id,
                    title: chat.title,
                    description: chat.description || '',
                    type: chat.type === 'supergroup' ? 'default' : 'special'
                };
                
                const success = await this.config.syncTelegramGroup(groupInfo);
                
                if (success) {
                    console.log(`✅ Group "${chat.title}" synced to PocketBase`);
                    // Optionally send a message to the group
                    ctx.reply('✅ Disciplo bot attivato! Questo gruppo è ora sincronizzato con la dashboard.');
                } else {
                    console.error(`❌ Failed to sync group "${chat.title}" to PocketBase`);
                }
            }
        });

        // Handle bot removed from group
        this.bot.on('my_chat_member', async (ctx) => {
            const chatMember = ctx.update.my_chat_member;
            
            if (['left', 'kicked'].includes(chatMember.new_chat_member.status)) {
                console.log(`🚪 Bot removed from: ${chatMember.chat.title} (ID: ${chatMember.chat.id})`);
                // Optionally mark group as inactive in PocketBase
            }
        });

        // Error handling
        this.bot.catch((err, ctx) => {
            console.error('❌ Bot error:', err);
            console.error('Context:', ctx.update);
        });
    }

    async start() {
        try {
            await this.bot.launch();
            console.log('🚀 Disciplo Telegram Bot is running...');
            
            // Enable graceful stop
            process.once('SIGINT', () => this.bot.stop('SIGINT'));
            process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
        } catch (error) {
            console.error('❌ Failed to start bot:', error);
            process.exit(1);
        }
    }
}

// Start the bot
(async () => {
    const disciploBot = new DisciploBot();
    await disciploBot.initialize();
    await disciploBot.start();
})();