// pb_hooks/main.pb.js

onRecordAfterCreateRequest((e) => {
    const msg = e.record;
    
    // 1. オープン掲示板なら通知しない
    if (msg.get("room") === "general") {
        return;
    }

    // OneSignal設定
    const APP_ID = "dda1bc87-8d43-439a-9b29-c6dc7235263d";
    const API_KEY = "os_v2_app_3wq3zb4ninbzvgzjy3ohenjghw5i26pruyne6uvs2djfe6ge4z562mdqkf2mh245ntcttpr254kiozohth7kdgxt7ypzmfxz35wg4ly"; // ※新しいキーに再生成してください

    // 2. 通知対象のフィルタを作成
    // "room_id"タグが今の部屋 と一致 AND "user_id"タグが送信者以外
    const filters = [
        { field: "tag", key: "room_id", relation: "=", value: msg.get("room") },
        { operator: "AND" },
        { field: "tag", key: "is_notify_on", relation: "=", value: "true" },
        { operator: "AND" },
        { field: "tag", key: "user_id", relation: "!=", value: msg.get("user_id") }
    ];

    try {
        const res = $http.send({
            url: "https://onesignal.com/api/v1/notifications",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + API_KEY,
            },
            body: JSON.stringify({
                app_id: APP_ID,
                filters: filters,
                headings: { en: `${msg.get("user_name")} (${msg.get("room")})` }, // 部屋名を入れるにはcollection参照が必要ですが一旦IDで
                contents: { en: msg.get("text") },
                url: "https://paka-paka.netlify.app/" // アプリのURL
            }),
            timeout: 5 // 秒
        });
    } catch (err) {
        console.log("Notification Failed:", err);
    }

}, "messages");