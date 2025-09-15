/// <reference path="../pb_data/types.d.ts" />

// API endpoint to get signup configuration (no auth required)
routerAdd("GET", "/api/signup/config", (e) => {
    try {
        // Find signup-steps configuration using server-side API
        const config = $app.findFirstRecordByFilter("settings", "key='signup-steps'");
        
        if (!config) {
            console.log('❌ No signup-steps record found');
            return e.json(404, {
                "error": "Signup configuration not found"
            });
        }
        
        // Get JSON data directly
        const configData = config.get('data') || {};
        
        // Return the configuration data directly
        return e.json(200, configData);
        
    } catch (error) {
        console.error('❌ Error loading signup config:', error);
        return e.json(500, {
            "error": "Failed to load signup configuration",
            "message": error.message
        });
    }
});