import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import crypto from 'crypto';

function generateLinkParam(userId: string, expiryDays: number = 7): string {
    const timestamp = Date.now();
    const expiry = timestamp + (expiryDays * 24 * 60 * 60 * 1000);
    
    // Generate cryptographically secure random token
    const randomBytes = crypto.randomBytes(16);
    const token = randomBytes.toString('hex').substring(0, 12);
    
    // Create HMAC for integrity verification using secret from ENV
    const secret = process.env.TELEGRAM_LINK_SECRET;
    if (!secret) {
        throw new Error('Bot secret not configured in environment');
    }
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${userId}_${expiry}_${token}`);
    const signature = hmac.digest('hex').substring(0, 8);
    
    return `${userId}_${expiry}_${token}_${signature}`;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.user) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get bot config from settings
        const botConfigRecord = await locals.pb.collection('settings').getFirstListItem(locals.pb.filter('key = {:key}', { key: 'telegram_bot' }));
        if (!botConfigRecord?.data?.token) {
            return json({ error: 'Bot not configured' }, { status: 500 });
        }

        const botConfig = botConfigRecord.data as { token: string; name: string };
        const botToken = botConfig.token;
        let botUsername = botConfig.name;

        // If bot name not stored, return error - bot name should be pre-configured
        if (!botUsername) {
            return json({ error: 'Bot username not configured in settings' }, { status: 500 });
        }

        // Get link expiry days from settings
        let expiryDays = 7;
        try {
            const expiryRecord = await locals.pb.collection('settings').getFirstListItem(locals.pb.filter('key = {:key}', { key: 'link_expiry_days' }));
            if (expiryRecord?.data) {
                expiryDays = expiryRecord.data as number;
            }
        } catch (e) {
            // Use default if setting not found
        }

        // Generate secure link parameter
        const linkParam = generateLinkParam(locals.user.id, expiryDays);
        const telegramLink = `https://telegram.me/${botUsername}?start=${linkParam}`;

        return json({ 
            success: true, 
            link: telegramLink,
            expiryDays: expiryDays
        });

    } catch (error) {
        console.error('Error generating telegram link:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};