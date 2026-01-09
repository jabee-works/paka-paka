/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3572739349")

  // remove field
  collection.fields.removeById("text521495826")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "file521495826",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "user_icon",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3572739349")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text521495826",
    "max": 0,
    "min": 0,
    "name": "user_icon",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("file521495826")

  return app.save(collection)
})
