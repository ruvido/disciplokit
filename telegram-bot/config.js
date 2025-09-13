const PocketBase = require('pocketbase').default;

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
            // Authenticate as admin first
            await this.pb.admins.authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL,
                process.env.POCKETBASE_ADMIN_PASSWORD
            );

            const records = await this.pb.collection('settings').getFullList({
                filter: this.pb.filter('key = {:key}', { key: 'telegram_bot' })
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

    async linkUserTelegram(linkParam, telegramId, telegramUsername = null) {
        try {
            const host = process.env.HOST;
            const port = process.env.POCKETBASE_PORT;
            const endpoint = process.env.POCKETBASE_LINK_ENDPOINT;
            
            if (!host || !port || !endpoint) {
                console.error('❌ Missing PocketBase configuration');
                return false;
            }
            
            const url = `http://${host}:${port}${endpoint}`;
            
            // Prepare request data
            const requestData = {
                linkParam: linkParam, // Full token with signature
                telegramId: telegramId.toString()
            };
            
            if (telegramUsername) {
                requestData.telegramUsername = telegramUsername;
            }
            
            console.log(`🔗 Calling PocketBase API: ${url}`);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('❌ PocketBase API error:', error);
                return false;
            }
            
            const result = await response.json();
            console.log('✅ PocketBase API success:', result);
            return true;
            
        } catch (error) {
            console.error('❌ Error calling PocketBase API:', error);
            return false;
        }
    }

    async syncTelegramGroup(groupInfo) {
        try {
            const existingGroups = await this.pb.collection('groups').getFullList({
                filter: this.pb.filter('telegram_id = {:telegramId}', { telegramId: groupInfo.id.toString() })
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