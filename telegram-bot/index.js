require('dotenv').config({ path: '../.env' });
const { Telegraf } = require('telegraf');
const Config = require('./config');
const crypto = require('crypto');
const express = require('express');

class DisciploBot {
    constructor() {
        this.config = new Config();
        this.bot = null;
        this.telegramSecret = null;
        this.httpServer = null;
        this.botConfig = null;
    }

    async initialize() {
        let retries = 0;
        const maxRetries = 5;
        const baseDelay = 1000; // 1 second
        
        while (retries < maxRetries) {
            try {
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
                
                // Set up bot handlers
                this.setupHandlers();
                
                // Set up HTTP server for webhooks
                this.setupHttpServer();
                
                return true;
            } catch (error) {
                retries++;
                console.error(`❌ Failed to initialize bot (attempt ${retries}/${maxRetries}):`, error.message);
                
                if (retries >= maxRetries) {
                    console.error('❌ Max retries reached. Exiting...');
                    process.exit(1);
                }
                
                // Exponential backoff
                const delay = baseDelay * Math.pow(2, retries - 1);
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    validateLinkParam(linkParam) {
        try {
            const parts = linkParam.split('_');
            if (parts.length !== 4) {
                return { valid: false, error: 'Invalid link format' };
            }

            const [userId, expiry, token, signature] = parts;
            
            // Check expiry
            const now = Date.now();
            if (parseInt(expiry) < now) {
                return { valid: false, error: 'Link expired' };
            }

            // Get secret from bot config (should be loaded during initialization)
            const secret = this.telegramSecret;
            if (!secret) {
                return { valid: false, error: 'Bot secret not configured' };
            }
            
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(`${userId}_${expiry}_${token}`);
            const expectedSignature = hmac.digest('hex').substring(0, 8);

            if (signature !== expectedSignature) {
                return { valid: false, error: 'Invalid signature' };
            }

            return { valid: true, userId };
        } catch (error) {
            return { valid: false, error: 'Token validation error' };
        }
    }

    setupHandlers() {
        // Handle /start command with linking parameter
        this.bot.start(async (ctx) => {
            console.log('🎯 /start received! Payload:', ctx.startPayload);
            const startPayload = ctx.startPayload;
            
            if (startPayload) {
                // Validate link parameter
                const validation = this.validateLinkParam(startPayload);
                
                if (!validation.valid) {
                    ctx.reply('❌ Link non valido o scaduto. Genera un nuovo link dalla dashboard.');
                    console.error(`❌ Invalid link parameter: ${validation.error}`);
                    return;
                }
                
                const memberId = validation.userId;
                const telegramId = ctx.from.id;
                const telegramUsername = ctx.from.username;
                
                // Pass the full validated linkParam to the API
                const success = await this.config.linkUserTelegram(startPayload, telegramId, telegramUsername);
                
                if (success) {
                    ctx.reply('✅ Account collegato con successo! Ora puoi essere gestito dalla dashboard Disciplo.');
                    console.log(`✅ Linked member ${memberId} with Telegram ID ${telegramId}`);
                } else {
                    ctx.reply('❌ Errore nel collegamento. Riprova più tardi o contatta l\'amministratore.');
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
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
            try {
                // Use polling instead of webhooks for development
                await this.bot.launch({
                    polling: {
                        timeout: 30,
                        limit: 100,
                        allowed_updates: ['message', 'callback_query', 'my_chat_member']
                    }
                });
                console.log('🚀 Disciplo Telegram Bot is running (polling mode)...');
                break;
                
            } catch (error) {
                retries++;
                console.error(`❌ Failed to start bot (attempt ${retries}/${maxRetries}):`, error.message);
                
                if (retries >= maxRetries) {
                    console.error('❌ Max retries reached. Telegram servers might be down.');
                    process.exit(1);
                }
                
                const delay = 5000 * retries; // 5, 10, 15 seconds
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        // Start HTTP server
        const port = process.env.BOT_PORT || 3000;
        this.httpServer.listen(port, () => {
            console.log(`🌐 HTTP server listening on port ${port}`);
        });
        
        // Enable graceful stop
        process.once('SIGINT', () => {
            this.bot.stop('SIGINT');
            if (this.httpServer) {
                this.httpServer.close();
            }
        });
        process.once('SIGTERM', () => {
            this.bot.stop('SIGTERM');
            if (this.httpServer) {
                this.httpServer.close();
            }
        });
    }

    setupHttpServer() {
        const app = express();
        app.use(express.json());

        // Webhook endpoint for configuration reload
        app.post('/webhook/config-reload', async (req, res) => {
            try {
                // Validate webhook secret
                const providedSecret = req.headers['x-pb-secret'];
                const expectedSecret = process.env.BOT_WEBHOOK_SECRET;

                if (!providedSecret || !expectedSecret) {
                    return res.status(401).json({ error: 'Missing authentication' });
                }

                if (providedSecret !== expectedSecret) {
                    return res.status(401).json({ error: 'Invalid authentication' });
                }

                console.log('🔄 Configuration reload requested via webhook');
                
                // Reload configuration
                await this.reloadConfig();
                
                res.json({ 
                    status: 'success', 
                    message: 'Configuration reloaded',
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Webhook error:', error);
                res.status(500).json({ 
                    error: 'Configuration reload failed',
                    message: error.message
                });
            }
        });

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                bot: this.bot ? 'running' : 'stopped',
                timestamp: new Date().toISOString()
            });
        });

        this.httpServer = app;
    }

    async reloadConfig() {
        try {
            console.log('🔄 Reloading bot configuration...');
            
            // Load fresh configuration from PocketBase (only token and name)
            const newConfig = await this.config.getTelegramBotConfig();
            
            // Update stored configuration
            this.botConfig = newConfig;
            
            // Secret remains from ENV (doesn't change)
            console.log('✅ Configuration reloaded successfully');
            console.log('📋 Updated: token and name from PocketBase');
            console.log('🔑 Secret: unchanged from environment variables');
            
        } catch (error) {
            console.error('❌ Failed to reload configuration:', error);
            throw error;
        }
    }
}

// Start the bot
(async () => {
    const disciploBot = new DisciploBot();
    await disciploBot.initialize();
    await disciploBot.start();
})();