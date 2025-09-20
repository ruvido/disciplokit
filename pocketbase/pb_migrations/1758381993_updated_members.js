/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // remove field
  collection.fields.removeById("select1466534506")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select1466534506",
    "maxSelect": 1,
    "name": "role",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "member",
      "moderator",
      "admin"
    ]
  }))

  return app.save(collection)
})
