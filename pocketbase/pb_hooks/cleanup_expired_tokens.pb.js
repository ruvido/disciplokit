// Cleanup expired telegram invite tokens
// Runs every time a new token is created to keep database clean

onRecordAfterCreateSuccess((e) => {

    console.log('🧹 New token created, cleaning up expired tokens...');

    try {
        const now = new Date().toISOString();

        // Find all expired tokens
        const expiredTokens = $app.dao().findRecordsByFilter(
            'telegram_invite_tokens',
            `expires_at < "${now}"`
        );

        if (expiredTokens.length === 0) {
            console.log('🧹 No expired tokens to clean up');
            e.next();
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
    
    e.next();
}, 'telegram_invite_tokens');

// Note: Cleanup only happens when new tokens are created
// No startup cleanup needed since database may not be ready during bootstrap