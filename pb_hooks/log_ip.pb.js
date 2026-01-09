// log_ip.pb.js
// PocketBase v0.23+ 用

onRecordAfterCreateSuccess((e) => {
    try {
        const record = e.record;

        // e は HookEvent なので、e.requestInfo は利用可能
        const requestInfo = e.requestInfo;
        if (!requestInfo) return;

        const clientIp = requestInfo.remoteIp;
        const userAgent = requestInfo.headers["user-agent"];

        const collection = $app.findCollectionByNameOrId("access_logs");
        const logRecord = new Record(collection, {
            "ip_address": clientIp,
            "user_id": record.get("user_id"),
            "user_name": record.get("user_name"),
            "user_agent": userAgent,
        });

        $app.save(logRecord);

        console.log(`[IP LOG] User: ${record.get("user_name")}, IP: ${clientIp}`);

    } catch (err) {
        console.error("[IP LOG ERROR]", err);
    }
}, "members");
