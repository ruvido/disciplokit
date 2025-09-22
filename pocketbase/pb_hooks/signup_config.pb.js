/// <reference path="../pb_data/types.d.ts" />

// API endpoint to get signup configuration (no auth required)
routerAdd("GET", "/api/signup", (e) => {
    try {
        // Get type parameter from URL (default: simple)
        const type = e.request.url.query().get("type") || "simple";

        // Find signup config for the specified type
        const config = $app.findFirstRecordByFilter("settings", `key='signup-${type}'`);

        if (!config) {
            console.log(`❌ No signup-${type} record found`);
            return e.json(404, {
                "error": `Signup configuration '${type}' not found`
            });
        }

        // Get JSON data using official .string() method
        let rawConfigData = config.get('data');
        let configData = {};

        if (rawConfigData && typeof rawConfigData.string === 'function') {
            // Use .string() method for byte arrays
            const jsonString = rawConfigData.string();
            configData = JSON.parse(jsonString);
            console.log('🔄 Used .string() method for configData');
        } else {
            configData = rawConfigData || {};
            console.log('🔄 Used configData direct object');
        }

        console.log('✅ configData keys:', Object.keys(configData));

        // Load signup-options for resolving options_ref
        console.log('🔍 Looking for signup-options config...');
        const optionsConfig = $app.findFirstRecordByFilter("settings", "key='signup-options'");
        let optionsData = {};

        if (optionsConfig) {
            console.log('✅ Found signup-options config');
            try {
                // Get JSON data using official .string() method
                let rawOptionsData = optionsConfig.get('data');

                if (rawOptionsData && typeof rawOptionsData.string === 'function') {
                    // Use .string() method for byte arrays
                    const jsonString = rawOptionsData.string();
                    optionsData = JSON.parse(jsonString);
                    console.log('🔄 Used .string() method for optionsData');
                } else {
                    optionsData = rawOptionsData || {};
                    console.log('🔄 Used optionsData direct object');
                }

                console.log('✅ optionsData keys:', Object.keys(optionsData));
                console.log('✅ regions array length:', optionsData.regions ? optionsData.regions.length : 'NOT FOUND');
            } catch (error) {
                console.error('❌ Error parsing optionsData:', error);
                optionsData = {};
            }
        }

        // Resolve options_ref in config
        console.log('🔧 Starting options_ref resolution...');
        if (configData.steps) {
            console.log('📝 Found steps:', configData.steps.length);
            configData.steps.forEach((step, stepIndex) => {
                console.log(`📝 Processing step ${stepIndex}: ${step.id}`);
                if (step.fields) {
                    console.log(`📝 Found fields in step ${stepIndex}:`, step.fields.length);
                    step.fields.forEach((field, fieldIndex) => {
                        console.log(`📝 Processing field ${fieldIndex}: ${field.name}, type: ${field.type}, has options_ref: ${!!field.options_ref}`);
                        if (field.options_ref) {
                            const [optionsKey, optionsPath] = field.options_ref.split('.');
                            console.log(`🔍 Resolving: ${field.options_ref}, key: ${optionsKey}, path: ${optionsPath}`);

                            // For signup-options.regions -> look for optionsData.regions
                            if (optionsKey === 'signup-options' && optionsData[optionsPath]) {
                                console.log(`✅ Found options for ${optionsPath}, length:`, optionsData[optionsPath].length);
                                field.options = optionsData[optionsPath];
                                delete field.options_ref;
                                console.log(`✅ Field ${field.name} now has options instead of options_ref`);
                            } else {
                                console.log(`❌ No options found for ${optionsPath} in:`, Object.keys(optionsData));
                            }
                        }
                    });
                }
            });
        }

        // Return the configuration data with resolved options
        return e.json(200, configData);

    } catch (error) {
        console.error('❌ Error loading signup config:', error);
        return e.json(500, {
            "error": "Failed to load signup configuration",
            "message": error.message
        });
    }
});

// Legacy endpoint for backward compatibility
routerAdd("GET", "/api/signup/config", (e) => {
    try {
        // Find old signup-steps configuration
        const config = $app.findFirstRecordByFilter("settings", "key='signup-steps'");

        if (!config) {
            console.log('❌ No signup-steps record found - redirecting to new endpoint');
            return e.json(404, {
                "error": "Legacy signup configuration not found. Use /api/signup?type=simple instead"
            });
        }

        // Get JSON data directly
        const configData = config.get('data') || {};

        // Return the configuration data directly
        return e.json(200, configData);

    } catch (error) {
        console.error('❌ Error loading legacy signup config:', error);
        return e.json(500, {
            "error": "Failed to load signup configuration",
            "message": error.message
        });
    }
});