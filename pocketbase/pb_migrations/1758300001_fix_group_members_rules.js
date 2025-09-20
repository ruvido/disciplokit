/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("group_members")

  // Remove all API rules to allow WebUI superuser access
  collection.listRule = null
  collection.viewRule = null
  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("group_members")

  // Restore previous rules if needed
  collection.listRule = "@request.auth.role = 'admin'"
  collection.viewRule = "@request.auth.role = 'admin'"
  collection.createRule = "@request.auth.role = 'admin'"
  collection.updateRule = "@request.auth.role = 'admin'"
  collection.deleteRule = "@request.auth.role = 'admin'"

  return app.save(collection)
})