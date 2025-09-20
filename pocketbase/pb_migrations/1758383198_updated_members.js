/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool1547992806",
    "name": "emailVisibility",
    "presentable": false,
    "required": false,
    "system": true,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool1547992806",
    "name": "emailVisibility",
    "presentable": false,
    "required": true,
    "system": true,
    "type": "bool"
  }))

  return app.save(collection)
})
