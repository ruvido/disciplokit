/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990")

  // Remove updateRule to let the hook handle all validation
  collection.updateRule = null

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990")

  // Restore previous updateRule
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.id = moderator"

  return app.save(collection)
})