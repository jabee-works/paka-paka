/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "date2552575352",
    "max": "",
    "min": "",
    "name": "updated",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "date2552575352",
    "max": "",
    "min": "",
    "name": "update",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
