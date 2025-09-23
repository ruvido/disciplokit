// Cleanup expired telegram invite tokens
// Runs daily to remove expired tokens and keep database clean

onModelAfterCreate((e) => {
    // Skip if not a telegram_invite_tokens record
    if (e.model.tableName() !== 'telegram_invite_tokens') {
        return;
    }

    console.log('🧹 Scheduling cleanup for expired tokens...');

    // Schedule cleanup to run every hour
    $cron.add('cleanup-expired-tokens', '0 * * * *', () => {
        try {
            const now = new Date().toISOString();

            // Find all expired tokens
            const expiredTokens = $app.dao().findRecordsByFilter(
                'telegram_invite_tokens',
                `expires_at < "${now}"`
            );

            if (expiredTokens.length === 0) {
                console.log('🧹 No expired tokens to clean up');
                return;
            }

            // Delete expired tokens
            expiredTokens.forEach(token => {
                $app.dao().deleteRecord(token);
                console.log(`🗑️ Deleted expired token: ${token.getString('token_hash').substring(0, 8)}...`);
            });

            console.log(`✅ Cleaned up ${expiredTokens.length} expired tokens`);

        } catch (error) {
            console.error('❌ Error during token cleanup:', error);
        }
    });

}, 'telegram_invite_tokens');

// Also run cleanup on PocketBase startup
onServe((e) => {
    console.log('🧹 Running startup cleanup for expired tokens...');

    try {
        const now = new Date().toISOString();

        // Find all expired tokens
        const expiredTokens = $app.dao().findRecordsByFilter(
            'telegram_invite_tokens',
            `expires_at < "${now}"`
        );

        if (expiredTokens.length === 0) {
            console.log('🧹 No expired tokens found on startup');
            return;
        }

        // Delete expired tokens
        expiredTokens.forEach(token => {
            $app.dao().deleteRecord(token);
            console.log(`🗑️ Startup cleanup - deleted expired token: ${token.getString('token_hash').substring(0, 8)}...`);
        });

        console.log(`✅ Startup cleanup completed - removed ${expiredTokens.length} expired tokens`);

    } catch (error) {
        console.error('❌ Error during startup token cleanup:', error);
    }
});