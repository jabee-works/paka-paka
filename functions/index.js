const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.database();
const messaging = admin.messaging();

// =============================================
// ルーム名マッピング
// =============================================
const ROOM_NAMES = {
    general: "オープン掲示板",
    game: "ゲーム",
    boardgame: "ボードゲーム",
    anime: "アニメ",
    voice: "声優",
    movie: "映画",
    comic: "漫画",
};

// =============================================
// ヘルパー: 有効なFCMトークンを取得して送信
// =============================================
async function sendToAllTokensExcept(excludeUserId, title, body, data = {}) {
    // 全FCMトークンを取得
    const tokensSnap = await db.ref("fcm_tokens").once("value");
    const tokensData = tokensSnap.val();
    if (!tokensData) return;

    const tokensToSend = [];
    const tokenUserMap = {}; // token -> userId（無効トークン削除用）

    Object.entries(tokensData).forEach(([userId, userData]) => {
        if (userId === excludeUserId) return; // 送信者自身は除外
        if (!userData.token) return;

        tokensToSend.push(userData.token);
        tokenUserMap[userData.token] = userId;
    });

    if (tokensToSend.length === 0) return;

    // multicastで一括送信
    const message = {
        notification: { title, body },
        data: { ...data, title, body },
        tokens: tokensToSend,
    };

    try {
        const response = await messaging.sendEachForMulticast(message);
        console.log(
            `Sent: ${response.successCount} success, ${response.failureCount} failure`
        );

        // 無効なトークンをクリーンアップ
        if (response.failureCount > 0) {
            const invalidTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    if (
                        errorCode === "messaging/invalid-registration-token" ||
                        errorCode ===
                            "messaging/registration-token-not-registered"
                    ) {
                        invalidTokens.push(tokensToSend[idx]);
                    }
                }
            });

            // 無効トークンを削除
            const deletePromises = invalidTokens.map((token) => {
                const userId = tokenUserMap[token];
                if (userId) {
                    console.log(
                        `Removing invalid token for user: ${userId}`
                    );
                    return db.ref(`fcm_tokens/${userId}`).remove();
                }
                return Promise.resolve();
            });
            await Promise.all(deletePromises);
        }
    } catch (error) {
        console.error("Error sending multicast:", error);
    }
}

// =============================================
// 1. 新規メッセージ時にプッシュ通知を送信
// =============================================
exports.onNewMessage = functions.database
    .ref("/rooms/{roomId}/messages/{messageId}")
    .onCreate(async (snapshot, context) => {
        const { roomId } = context.params;
        const messageData = snapshot.val();

        if (!messageData) return null;

        const senderName = messageData.user_name || "名無し";
        const senderId = messageData.user_id;
        const roomName = ROOM_NAMES[roomId] || roomId;
        const messageText =
            messageData.text?.substring(0, 100) || "メッセージ";

        const title = `${senderName}（${roomName}）`;
        const body = messageText;

        return sendToAllTokensExcept(senderId, title, body, {
            type: "message",
            roomId: roomId,
            senderId: senderId,
        });
    });

// =============================================
// 2. 入室時にプッシュ通知を送信
// =============================================
exports.onMemberJoin = functions.database
    .ref("/rooms/{roomId}/members/{memberId}")
    .onCreate(async (snapshot, context) => {
        const { roomId, memberId } = context.params;
        const memberData = snapshot.val();

        if (!memberData) return null;

        const memberName = memberData.user_name || "名無し";
        const roomName = ROOM_NAMES[roomId] || roomId;

        const title = `${memberName}さんが入室`;
        const body = `${roomName}ルーム`;

        return sendToAllTokensExcept(memberId, title, body, {
            type: "join",
            roomId: roomId,
            memberId: memberId,
        });
    });
