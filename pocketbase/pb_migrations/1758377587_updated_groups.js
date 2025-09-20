/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990")

  // update collection data
  unmarshal({
    "deleteRule": "",
    "updateRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.id = moderator"
  }, collection)

  return app.save(collection)
})
