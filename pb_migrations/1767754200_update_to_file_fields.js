
migrate((app) => {
  const messages = app.findCollectionByNameOrId("messages");

  // user_icon フィールドを text に戻す（URLやファイル名を保持するため）
  const userIconMsg = messages.fields.getByName("user_icon");
  userIconMsg.type = "text";
  userIconMsg.options = {};

  // image フィールドを更新
  const imageMsg = messages.fields.getByName("image");
  imageMsg.type = "file";
  imageMsg.mimeTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"];
  imageMsg.thumbs = [];
  imageMsg.maxSelect = 1;
  imageMsg.maxSize = 5242880;
  imageMsg.protected = false;

  app.save(messages);

  // date フィールドを追加（もしなければ）
  try {
    messages.fields.add(new Field({
      "system": false,
      "id": "field_date",
      "name": "date",
      "type": "date",
      "required": false,
      "presentable": false,
      "unique": false,
      "min": "",
      "max": ""
    }));
    app.save(messages);
  } catch (e) { /* already exists or other error */ }

  const members = app.findCollectionByNameOrId("members");

  // user_icon フィールドを更新 (members はファイル本体を持つ)
  const userIconMem = members.fields.getByName("user_icon");
  userIconMem.type = "file";
  userIconMem.mimeTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"];
  userIconMem.thumbs = [];
  userIconMem.maxSelect = 1;
  userIconMem.maxSize = 5242880;
  userIconMem.protected = false;

  app.save(members);
}, (app) => {
})


