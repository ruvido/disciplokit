const PocketBase = require('pocketbase');

class Config {
    constructor() {
        const host = process.env.HOST;
        const port = process.env.POCKETBASE_PORT;
        
        if (!host || !port) {
            console.error('❌ HOST and POCKETBASE_PORT environment variables are required');
            process.exit(1);
        }
        
        const pocketbaseUrl = `http://${host}:${port}`;
        this.pb = new PocketBase(pocketbaseUrl);
        console.log(`🔗 Connecting to PocketBase at: ${pocketbaseUrl}`);
    }

    async getTelegramBotConfig() {
        try {
            const records = await this.pb.collection('config').getFullList({
                filter: 'key = "telegram_bot"'
            });

            if (records.length === 0) {
                throw new Error('Telegram bot configuration not found in PocketBase');
            }

            const config = records[0];
            if (!config.data || !config.data.token) {
                throw new Error('Telegram bot token not found in configuration');
            }

            return {
                token: config.data.token,
                name: config.data.name || 'Disciplo Bot'
            };
        } catch (error) {
            console.error('Error loading bot configuration:', error);
            throw error;
        }
    }

    async linkUserTelegram(memberId, telegramId, telegramUsername = null) {
        try {
            await this.pb.collection('members').update(memberId, {
                telegram_id: telegramId.toString(),
                telegram_username: telegramUsername
            });
            return true;
        } catch (error) {
            console.error('Error linking user to Telegram:', error);
            return false;
        }
    }

    async syncTelegramGroup(groupInfo) {
        try {
            const existingGroups = await this.pb.collection('groups').getFullList({
                filter: `telegram_id = "${groupInfo.id}"`
            });

            if (existingGroups.length > 0) {
                // Update existing group
                await this.pb.collection('groups').update(existingGroups[0].id, {
                    name: groupInfo.title,
                    description: groupInfo.description || '',
                    type: groupInfo.type || 'default'
                });
            } else {
                // Create new group
                await this.pb.collection('groups').create({
                    telegram_id: groupInfo.id.toString(),
                    name: groupInfo.title,
                    description: groupInfo.description || '',
                    type: groupInfo.type || 'default'
                });
            }
            return true;
        } catch (error) {
            console.error('Error syncing Telegram group:', error);
            return false;
        }
    }
}

module.exports = Config;