/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    // 1. messages コレクション作成
    const messages = new Collection({
        name: "messages",
        type: "base",
        listRule: "",   // 誰でも見れる
        viewRule: "",   // 誰でも見れる
        createRule: "", // 誰でも書ける
        updateRule: "", // リアクション更新用
        deleteRule: "", // 自分の古いメッセージ削除用
        schema: [
            { name: "text", type: "text" },
            { name: "room", type: "text" },
            { name: "user_id", type: "text" },
            { name: "user_name", type: "text" },
            { name: "user_color", type: "text" },
            { name: "user_bio", type: "text" },
            { name: "user_icon", type: "text" }, // Base64画像テキスト
            { name: "image", type: "text" },     // Base64画像テキスト
            { name: "reactions_data", type: "json" }
        ]
    });
    app.save(messages);

    // 2. members コレクション作成
    const members = new Collection({
        name: "members",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        schema: [
            { name: "room", type: "text" },
            { name: "user_id", type: "text" },
            { name: "user_name", type: "text" },
            { name: "user_color", type: "text" },
            { name: "user_bio", type: "text" },
            { name: "user_icon", type: "text" }
        ]
    });
    app.save(members);

    // 3. inquiries コレクション作成
    const inquiries = new Collection({
        name: "inquiries",
        type: "base",
        listRule: null, // Adminのみ
        viewRule: null,
        createRule: "", // 誰でも送信可能
        updateRule: null,
        deleteRule: null,
        schema: [
            { name: "type", type: "text" },
            { name: "content", type: "text" },
            { name: "user_id", type: "text" },
            { name: "user_name", type: "text" },
            { name: "contact_email", type: "text" }
        ]
    });
    app.save(inquiries);

    // 4. access_logs コレクション作成
    const accessLogs = new Collection({
        name: "access_logs",
        type: "base",
        listRule: null, // Adminのみ
        viewRule: null,
        createRule: null, // APIからは作成不可(Hookから作成)
        updateRule: null,
        deleteRule: null,
        schema: [
            { name: "ip_address", type: "text" },
            { name: "user_id", type: "text" },
            { name: "user_name", type: "text" },
            { name: "user_agent", type: "text" }
        ]
    });
    app.save(accessLogs);

}, (app) => {
    // 戻す時の処理（コレクション削除）
    try { app.delete(app.findCollectionByNameOrId("messages")); } catch(e) {}
    try { app.delete(app.findCollectionByNameOrId("members")); } catch(e) {}
    try { app.delete(app.findCollectionByNameOrId("inquiries")); } catch(e) {}
    try { app.delete(app.findCollectionByNameOrId("access_logs")); } catch(e) {}
})