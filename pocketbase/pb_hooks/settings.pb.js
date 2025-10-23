/// <reference path="../pb_data/types.d.ts" />

// Hook triggered when settings collection records are updated
onRecordUpdate((e) => {
    // Only trigger webhook for telegram_bot config changes
    if (e.record.get('key') === 'telegram_bot') {
        console.log('🔄 Telegram bot config updated, notifying bot...');
        
        // Get bot webhook configuration from environment
        const botPort = $os.getenv('BOT_PORT');
        const botWebhookPath = $os.getenv('BOT_WEBHOOK_PATH');
        const botSecret = $os.getenv('BOT_WEBHOOK_SECRET');

        // Fail fast if any required config is missing
        if (!botPort || !botWebhookPath || !botSecret) {
            console.error('❌ Bot webhook config incomplete - skipping notification');
            console.error('Missing:', {
                BOT_PORT: !!botPort,
                BOT_WEBHOOK_PATH: !!botWebhookPath,
                BOT_WEBHOOK_SECRET: !!botSecret
            });
            return;
        }

        // Construct webhook URL
        const webhookUrl = `http://localhost:${botPort}${botWebhookPath}`;
        console.log('📡 Calling bot webhook:', webhookUrl);
        
        try {
            // Send webhook notification to bot
            const response = $http.send({
                url: webhookUrl,
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-pb-secret': botSecret 
                },
                data: JSON.stringify({
                    event: 'config_reload',
                    timestamp: new Date().toISOString(),
                    record_id: e.record.getId()
                }),
                timeout: 5000 // 5 second timeout
            });
            
            if (response.statusCode >= 200 && response.statusCode < 300) {
                console.log('✅ Bot webhook notification successful');
            } else {
                console.error('❌ Bot webhook failed with status:', response.statusCode);
            }
            
        } catch (error) {
            console.error('❌ Bot webhook error:', error.message);
            // Don't throw - we don't want to break the original update
        }
    }
    
    // IMPORTANT: Call e.next() to continue the update process
    e.next();
}, "settings");