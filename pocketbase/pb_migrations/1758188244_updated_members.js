/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // remove field
  collection.fields.removeById("text3423285350")

  // remove field
  collection.fields.removeById("text573593622")

  // remove field
  collection.fields.removeById("text2900039487")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "json70459610",
    "maxSize": 0,
    "name": "telegram",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "bool2282622326",
    "name": "admin",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "bool2605256118",
    "name": "banned",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2620428958")

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3423285350",
    "max": 0,
    "min": 0,
    "name": "telegram_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text573593622",
    "max": 0,
    "min": 0,
    "name": "telegram_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2900039487",
    "max": 0,
    "min": 0,
    "name": "telegram_username",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("json70459610")

  // remove field
  collection.fields.removeById("bool2282622326")

  // remove field
  collection.fields.removeById("bool2605256118")

  return app.save(collection)
})
