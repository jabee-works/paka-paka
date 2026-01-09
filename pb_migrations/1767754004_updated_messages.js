/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "date2413224187",
    "max": "",
    "min": "",
    "name": "create",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // remove field
  collection.fields.removeById("date2413224187")

  // remove field
  collection.fields.removeById("date2552575352")

  return app.save(collection)
})
