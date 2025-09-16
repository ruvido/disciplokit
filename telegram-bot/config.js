const PocketBase = require('pocketbase').default;

class Config {
    constructor() {
        // Prefer POCKETBASE_URL, fallback to HOST:PORT for compatibility
        const pocketbaseUrl = process.env.POCKETBASE_URL ||
                             `http://${process.env.HOST}:${process.env.POCKETBASE_PORT}`;

        if (!pocketbaseUrl) {
            console.error('❌ POCKETBASE_URL or HOST+POCKETBASE_PORT environment variables are required');
            process.exit(1);
        }

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
            const pocketbaseUrl = process.env.POCKETBASE_URL ||
                                 `http://${process.env.HOST}:${process.env.POCKETBASE_PORT}`;
            const endpoint = process.env.POCKETBASE_LINK_ENDPOINT;

            if (!pocketbaseUrl || !endpoint) {
                console.error('❌ Missing PocketBase configuration');
                return false;
            }

            const url = `${pocketbaseUrl}${endpoint}`;
            
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

    async saveInviteMapping(inviteLink, userId, groupId, telegramGroupId, expires) {
        try {
            // Authenticate as admin first
            await this.pb.admins.authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL,
                process.env.POCKETBASE_ADMIN_PASSWORD
            );

            // Create record in invite_mappings collection
            const record = await this.pb.collection('invite_mappings').create({
                invite_link: inviteLink,
                user_id: userId,
                group_id: groupId,
                telegram_group_id: telegramGroupId,
                expires: expires,
                used: false
            });

            console.log(`✅ Invite mapping saved: ${inviteLink} → user ${userId}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error saving invite mapping:', error);
            return false;
        }
    }

    async findInviteMapping(inviteLink) {
        try {
            // Authenticate as admin first
            await this.pb.admins.authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL,
                process.env.POCKETBASE_ADMIN_PASSWORD
            );

            const records = await this.pb.collection('invite_mappings').getFullList({
                filter: this.pb.filter('invite_link = {:link} && used = false', { link: inviteLink })
            });

            if (records.length === 0) {
                console.log(`❌ No mapping found for invite link: ${inviteLink}`);
                return null;
            }

            const mapping = records[0];
            console.log(`✅ Found mapping: ${inviteLink} → user ${mapping.user_id}`);
            return mapping;
            
        } catch (error) {
            console.error('❌ Error finding invite mapping:', error);
            return null;
        }
    }


    async markInviteMappingUsed(inviteLink) {
        try {
            // Authenticate as admin first
            await this.pb.admins.authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL,
                process.env.POCKETBASE_ADMIN_PASSWORD
            );

            const mapping = await this.findInviteMapping(inviteLink);
            if (!mapping) {
                return false;
            }

            await this.pb.collection('invite_mappings').update(mapping.id, {
                used: true
            });

            console.log(`✅ Marked invite mapping as used: ${inviteLink}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error marking invite mapping as used:', error);
            return false;
        }
    }

    async linkUserTelegramFromInvite(userId, telegramId, telegramUsername = null) {
        try {
            // Authenticate as admin first
            await this.pb.admins.authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL,
                process.env.POCKETBASE_ADMIN_PASSWORD
            );

            // Update user record with telegram info
            const updateData = {
                telegram_id: telegramId.toString()
            };

            if (telegramUsername) {
                updateData.telegram_name = telegramUsername;
                updateData.data = JSON.stringify({
                    username: telegramUsername,
                    linked_at: new Date().toISOString()
                });
            }

            await this.pb.collection('members').update(userId, updateData);

            console.log(`✅ User ${userId} linked with Telegram ID ${telegramId}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error linking user with Telegram:', error);
            return false;
        }
    }

    async syncTelegramGroup(groupInfo) {
        try {
            const pocketbaseUrl = process.env.POCKETBASE_URL ||
                                 `http://${process.env.HOST}:${process.env.POCKETBASE_PORT}`;
            const endpoint = process.env.POCKETBASE_SYNC_GROUP_ENDPOINT;
            const secret = process.env.TELEGRAM_LINK_SECRET;

            if (!pocketbaseUrl || !endpoint || !secret) {
                console.error('❌ Missing PocketBase sync group configuration');
                return false;
            }

            const url = `${pocketbaseUrl}${endpoint}`;
            
            // Generate HMAC token for security (same as telegram linking)
            const timestamp = Date.now();
            const data = `${groupInfo.id}_${timestamp}`;
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(data);
            const syncToken = hmac.digest('hex').substring(0, 16);
            
            // Prepare request data
            const requestData = {
                telegram_id: groupInfo.id.toString(),
                name: groupInfo.title,
                timestamp: timestamp // Include timestamp for validation
            };
            
            console.log(`🔗 Calling PocketBase sync group API: ${url}`);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Sync-Token': syncToken
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('❌ PocketBase sync group API error:', error);
                return false;
            }
            
            const result = await response.json();
            console.log('✅ PocketBase sync group API success:', result);
            return true;
            
        } catch (error) {
            console.error('❌ Error calling PocketBase sync group API:', error);
            return false;
        }
    }
}

module.exports = Config;