// cleanup.pb.js
// PocketBase v0.23+ 用

cronAdd("delete_old_messages", "0 * * * *", () => {
    try {
        $app.db()
            .newQuery("DELETE FROM messages WHERE created < datetime('now', '-48 hours')")
            .execute();

        console.log("[Cleanup] 48時間経過したメッセージを削除しました。");
    } catch (e) {
        console.log("[Cleanup Error] " + e.message);
    }
})

cronAdd("cleanup_inactive_members", "*/1 * * * *", () => {
    try {
        // 2分以上更新がないメンバーを削除（SYSTEM_PROFILEを除く）
        // ハートビートが20秒間隔なので、2分は十分なバッファ
        $app.db()
            .newQuery("DELETE FROM members WHERE room != 'SYSTEM_PROFILE' AND updated < datetime('now', '-2 minutes')")
            .execute();

        console.log("[Cleanup] 2分以上活動がないメンバーをクリーンアップしました。");
    } catch (e) {
        console.log("[Cleanup Error] " + e.message);
    }
})
