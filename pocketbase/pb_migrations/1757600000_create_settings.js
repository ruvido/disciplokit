/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "name": "settings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "name": "key",
        "type": "text",
        "required": true,
        "unique": true,
        "max": 100,
        "presentable": false,
        "system": false
      },
      {
        "name": "data",
        "type": "json",
        "required": false,
        "presentable": false,
        "system": false
      },
      {
        "name": "description",
        "type": "text",
        "required": false,
        "max": 500,
        "presentable": false,
        "system": false
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null
  });

  app.save(collection);

  // Insert default bot configuration
  let record = new Record(collection);
  record.set("key", "bot_config");
  record.set("data", {"token": "", "name": ""});
  record.set("description", "Telegram bot token and username");
  app.save(record);

  record = new Record(collection);
  record.set("key", "bot_enabled");
  record.set("data", true);
  record.set("description", "Enable/disable telegram bot");
  app.save(record);

}, (app) => {
  const collection = app.findCollectionByNameOrId("settings");
  return app.delete(collection);
});