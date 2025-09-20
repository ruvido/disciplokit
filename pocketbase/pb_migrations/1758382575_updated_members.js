/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id || @request.auth.admin = true",
    "updateRule": "id = @request.auth.id || @request.auth.admin = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // update collection data
  unmarshal({
    "deleteRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
})
