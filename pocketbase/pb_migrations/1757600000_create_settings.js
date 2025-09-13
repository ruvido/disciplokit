/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
        type:     "base",
        name:     "settings",
        // listRule: "@request.auth.role = 'admin'",
        // viewRule: "@request.auth.role = 'admin'",
        // createRule: "@request.auth.role = 'admin'",
        // updateRule: "@request.auth.role = 'admin'",
        // deleteRule: "@request.auth.role = 'admin'",
        fields: [
            {
                type:        "text",
                name:        "key",
                required:    true,
                unique:      true,
            }, 
            {
                type:        "json",
                name:        "data",
            }, 
            {
                type:        "text",
                name:        "description",
            }, 
        ],
    })

    console.log("Creating Settings collection")
    app.save(collection);

    
    const tgBotName    = $os.getenv("TELEGRAM_BOT_NAME")
    const tgBotToken   = $os.getenv("TELEGRAM_BOT_TOKEN")
    // const tgBotLinkSecret = $os.getenv("TELEGRAM_LINK_SECRET")
    
    // add default member
    console.log("Updating telegram bot config token")
    // const colle = app.findCollectionByNameOrId("settings")
    const record = new Record(collection)
    record.set("key", "telegram_bot")
    record.set("data", {
        name:  tgBotName,
        token: tgBotToken
        // secret: tgBotLinkSecret
    })
    record.set("description", "Telegram bot settings")
    app.save(record)
})

//   // Insert default bot configuration
//   let record = new Record(collection);
//   record.set("key", "bot_config");
//   record.set("data", {"token": "", "name": ""});
//   record.set("description", "Telegram bot token and username");
//   app.save(record);
//
//   record = new Record(collection);
//   record.set("key", "bot_enabled");
//   record.set("data", true);
//   record.set("description", "Enable/disable telegram bot");
//   app.save(record);
//
// }, (app) => {
//   const collection = app.findCollectionByNameOrId("settings");
//   return app.delete(collection);
// });
