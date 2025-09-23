migrate((app) => {
  // Create telegram_invite_tokens collection for signup-direct flow
  let collection = new Collection({
    type: "base",
    name: "telegram_invite_tokens",
    listRule: "",     // Server-only access - no client auth needed
    viewRule: "",     // Server-only access - no client auth needed
    createRule: "",   // Server-only access - no client auth needed
    updateRule: "",   // Server-only access - no client auth needed
    deleteRule: "",   // Server-only access - no client auth needed
    fields: [
      {
        type: "text",
        name: "token_hash",
        required: true,
        max: 64,
        unique: true
      },
      {
        type: "number",
        name: "telegram_user_id",
        required: true
      },
      {
        type: "text",
        name: "telegram_first_name",
        required: true,
        max: 100
      },
      {
        type: "text",
        name: "telegram_last_name",
        required: false,
        max: 100
      },
      {
        type: "text",
        name: "telegram_username",
        required: false,
        max: 50
      },
      {
        type: "text",
        name: "group_name",
        required: true,
        max: 200
      },
      {
        type: "select",
        name: "status",
        required: true,
        maxSelect: 1,
        values: ["pending", "used", "expired"]
      },
      {
        type: "date",
        name: "expires_at",
        required: true
      },
      {
        type: "date",
        name: "used_at",
        required: false
      },
      {
        name: "created",
        onCreate: true,
        onUpdate: false,
        presentable: false,
        system: false,
        type: "autodate"
      },
      {
        name: "updated",
        onCreate: true,
        onUpdate: true,
        presentable: false,
        system: false,
        type: "autodate"
      }
    ]
  });

  app.save(collection);
}, (app) => {
  // Rollback: delete collection
  let collection = app.findCollectionByNameOrId("telegram_invite_tokens");
  if (collection) {
    app.delete(collection);
  }
});