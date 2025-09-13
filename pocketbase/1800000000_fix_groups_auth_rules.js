/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("groups");

  // Add authentication rules for groups collection
  // Only admins and bot can manage groups
  collection.listRule = "@request.auth.id != '' && @request.auth.role = 'admin'";
  collection.viewRule = "@request.auth.id != '' && @request.auth.role = 'admin'";
  collection.createRule = "@request.auth.id != '' && @request.auth.role = 'admin'";
  collection.updateRule = "@request.auth.id != '' && @request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.id != '' && @request.auth.role = 'admin'";

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("groups");

  // Revert to no authentication rules
  collection.listRule = null;
  collection.viewRule = null;
  collection.createRule = null;
  collection.updateRule = null;
  collection.deleteRule = null;

  return app.save(collection);
})