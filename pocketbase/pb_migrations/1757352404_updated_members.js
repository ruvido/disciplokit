/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id || @request.auth.role = 'admin'",
    "listRule": "id = @request.auth.id || @request.auth.role = 'admin'",
    "updateRule": "id = @request.auth.id || @request.auth.role = 'admin'",
    "viewRule": "id = @request.auth.id || @request.auth.role = 'admin'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id",
    "listRule": "id = @request.auth.id",
    "updateRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
