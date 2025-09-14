migrate((app) => {
  let collection = new Collection({
    type: "base",
    name: "invite_mappings",
    listRule: "@request.auth.id != \"\"",
    viewRule: "@request.auth.id != \"\"",
    createRule: "@request.auth.id != \"\"",
    updateRule: null,
    deleteRule: "@request.auth.role = \"admin\""
  })

  collection.fields.add(new TextField({
    name: "invite_link",
    required: true,
    unique: true
  }))

  collection.fields.add(new RelationField({
    name: "user_id",
    required: true,
    collectionId: app.findCollectionByNameOrId("members").id,
    maxSelect: 1
  }))

  collection.fields.add(new RelationField({
    name: "group_id", 
    required: true,
    collectionId: app.findCollectionByNameOrId("groups").id,
    maxSelect: 1
  }))

  collection.fields.add(new TextField({
    name: "telegram_group_id",
    required: true
  }))

  collection.fields.add(new DateField({
    name: "expires",
    required: true
  }))

  collection.fields.add(new BoolField({
    name: "used"
  }))

  app.save(collection)
}, (app) => {
  let collection = app.findCollectionByNameOrId("invite_mappings")
  app.delete(collection)
})