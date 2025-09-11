import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import crypto from 'crypto';

function generateLinkParam(userId: string, expiryDays: number = 7): string {
    const timestamp = Date.now();
    const expiry = timestamp + (expiryDays * 24 * 60 * 60 * 1000);
    const hash = crypto.createHash('md5').update(`${userId}_${expiry}_disciplo_secret`).digest('hex').substring(0, 8);
    return `${userId}_${expiry}_${hash}`;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.user) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get bot config from settings
        const botConfigRecord = await locals.pb.collection('settings').getFirstListItem('key = "telegram_bot"');
        if (!botConfigRecord?.data?.token) {
            return json({ error: 'Bot not configured' }, { status: 500 });
        }

        const botConfig = botConfigRecord.data as { token: string; name: string };
        const botToken = botConfig.token;
        let botUsername = botConfig.name;

        // If bot name not stored, fetch it and update
        if (!botUsername) {
            const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
            const botInfo = await botInfoResponse.json();
            
            if (!botInfo.ok) {
                return json({ error: 'Bot configuration error' }, { status: 500 });
            }

            botUsername = botInfo.result.username;
            
            // Update the record with bot name for future use
            try {
                await locals.pb.collection('settings').update(botConfigRecord.id, {
                    data: { token: botToken, name: botUsername }
                });
            } catch (e) {
                console.log('Failed to update bot name:', e);
            }
        }

        // Get link expiry days from settings
        let expiryDays = 7;
        try {
            const expiryRecord = await locals.pb.collection('settings').getFirstListItem('key = "link_expiry_days"');
            if (expiryRecord?.data) {
                expiryDays = expiryRecord.data as number;
            }
        } catch (e) {
            // Use default if setting not found
        }

        // Generate secure link parameter
        const linkParam = generateLinkParam(locals.user.id, expiryDays);
        const telegramLink = `https://t.me/${botUsername}?start=${linkParam}`;

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