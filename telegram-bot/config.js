const PocketBase = require('pocketbase').default;

class Config {
    constructor() {
        // Prefer POCKETBASE_URL, fallback to HOST:PORT for compatibility
        let pocketbaseUrl = process.env.POCKETBASE_URL;
        
        if (!pocketbaseUrl) {
            const host = process.env.HOST;
            const port = process.env.POCKETBASE_PORT;
            
            if (!host || !port) {
                console.error('❌ POCKETBASE_URL or both HOST and POCKETBASE_PORT environment variables are required');
                console.error('❌ Current values: HOST=' + (host || 'undefined') + ', POCKETBASE_PORT=' + (port || 'undefined'));
                process.exit(1);
            }
            
            pocketbaseUrl = `http://${host}:${port}`;
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
            const telegramData = {
                id: telegramId.toString()
            };

            if (telegramUsername) {
                telegramData.username = telegramUsername;
            }

            const updateData = {
                telegram: telegramData
            };

            await this.pb.collection('members').update(userId, updateData);

            console.log(`✅ User ${userId} linked with Telegram ID ${telegramId}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error linking user with Telegram:', error);
            return false;
        }
    }

    async findUserByTelegramId(telegramId) {
        try {
            const pocketbaseUrl = process.env.POCKETBASE_URL ||
                                 `http://${process.env.HOST}:${process.env.POCKETBASE_PORT}`;
            const endpoint = '/api/custom/find-user-by-telegram';
            const secret = process.env.TELEGRAM_LINK_SECRET;

            if (!pocketbaseUrl || !secret) {
                console.error('❌ Missing PocketBase configuration for find user');
                return null;
            }

            // Generate HMAC token for security
            const timestamp = Date.now();
            const data = `${telegramId}_${timestamp}`;
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(data);
            const token = hmac.digest('hex').substring(0, 16);
            
            console.log(`🔍 Finding user by Telegram ID: ${telegramId}`);
            
            const response = await fetch(`${pocketbaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Sync-Token': token
                },
                body: JSON.stringify({
                    telegram_id: telegramId.toString(),
                    timestamp: timestamp
                })
            });
            
            if (!response.ok) {
                console.log(`❌ User not found for Telegram ID: ${telegramId}`);
                return null;
            }
            
            const result = await response.json();
            console.log(`✅ User found: ${result.id} for Telegram ID: ${telegramId}`);
            return result;
            
        } catch (error) {
            console.error('❌ Error finding user by Telegram ID:', error);
            return null;
        }
    }

    async addToGroupMembers(groupId, userId, moderator = false) {
        try {
            const pocketbaseUrl = process.env.POCKETBASE_URL ||
                                 `http://${process.env.HOST}:${process.env.POCKETBASE_PORT}`;
            const endpoint = '/api/custom/add-group-member';
            const secret = process.env.TELEGRAM_LINK_SECRET;

            if (!pocketbaseUrl || !secret) {
                console.error('❌ Missing PocketBase configuration for add group member');
                return false;
            }

            // Generate HMAC token for security
            const timestamp = Date.now();
            const data = `${userId}_${groupId}_${timestamp}`;
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(data);
            const token = hmac.digest('hex').substring(0, 16);
            
            console.log(`👥 Adding user ${userId} to group ${groupId} (moderator: ${moderator})`);
            
            const response = await fetch(`${pocketbaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Sync-Token': token
                },
                body: JSON.stringify({
                    user_id: userId,
                    group_id: groupId,
                    moderator: moderator,
                    timestamp: timestamp
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('❌ PocketBase add group member API error:', error);
                return false;
            }
            
            const result = await response.json();
            console.log(`✅ User added to group successfully:`, result);
            return true;
            
        } catch (error) {
            console.error('❌ Error adding user to group:', error);
            return false;
        }
    }

    generateSecureGroupToken(groupId) {
        try {
            const secret = process.env.TELEGRAM_LINK_SECRET;
            const timestamp = Date.now();
            const data = `group_signup_${groupId}_${timestamp}`;
            
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(data);
            const token = hmac.digest('hex').substring(0, 32); // Token più lungo per group signup
            
            console.log(`🔑 Generated secure group token for group ${groupId}`);
            return `${token}_${timestamp}`;
        } catch (error) {
            console.error('❌ Error generating group token:', error);
            return null;
        }
    }

    async getAllGroups() {
        try {
            const pocketbaseUrl = process.env.POCKETBASE_URL ||
                                 `http://${process.env.HOST}:${process.env.POCKETBASE_PORT}`;
            const endpoint = '/api/custom/get-groups';
            const secret = process.env.TELEGRAM_LINK_SECRET;

            if (!pocketbaseUrl || !secret) {
                console.error('❌ Missing PocketBase configuration for get groups');
                return null;
            }

            // Generate HMAC token for security
            const timestamp = Date.now();
            const data = `get_groups_${timestamp}`;
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(data);
            const token = hmac.digest('hex').substring(0, 16);
            
            console.log(`📋 Getting all groups from PocketBase...`);
            console.log(`🔗 URL: ${pocketbaseUrl}${endpoint}`);
            console.log(`🔑 Token: ${token}`);
            console.log(`⏰ Timestamp: ${timestamp}`);
            
            const response = await fetch(`${pocketbaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Sync-Token': token
                },
                body: JSON.stringify({
                    timestamp: timestamp
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('❌ PocketBase get groups API error:', error);
                return null;
            }
            
            const result = await response.json();
            console.log(`✅ Retrieved ${result.total} groups from PocketBase`);
            return result.groups;
            
        } catch (error) {
            console.error('❌ Error getting groups from PocketBase:', error);
            return null;
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