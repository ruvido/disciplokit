migrate((app) => {
  let collection = app.findCollectionByNameOrId("users")
  collection.schema.push({
    type: "select",
    name: "role",
    options: {
      values: ["admin", "user"]
    }
  })
  app.save(collection)
}, (app) => {
  let collection = app.findCollectionByNameOrId("users")
  collection.schema = collection.schema.filter(field => field.name !== "role")
  app.save(collection)
})