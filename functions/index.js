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
// ヘルパー: ルーム内の有効なFCMトークンを取得して送信
// =============================================
async function sendToRoomMembersExcept(roomId, excludeUserId, title, body, data = {}) {
    // 1. 指定されたルームの現在のメンバーを取得
    const membersSnap = await db.ref(`rooms/${roomId}/members`).once("value");
    const membersData = membersSnap.val();
    if (!membersData) return; // 誰もいない

    // 1時間を超えて放置されているメンバー（ゴースト）は除外する
    const GHOST_TIMEOUT_MS = 60 * 60 * 1000;
    const now = Date.now();
    const activeUserIds = [];

    Object.entries(membersData).forEach(([userId, userData]) => {
        if (userId === excludeUserId) return; // 送信者自身は除外
        
        const lastSeen = userData.last_seen || 0;
        if ((now - lastSeen) < GHOST_TIMEOUT_MS) {
            activeUserIds.push(userId);
        }
    });

    if (activeUserIds.length === 0) return;

    // 2. アクティブなメンバーのFCMトークンを取得
    const tokensToSend = [];
    const tokenUserMap = {}; // token -> userId（無効トークン削除用）

    const tokenPromises = activeUserIds.map(async (userId) => {
        const tokenSnap = await db.ref(`fcm_tokens/${userId}`).once("value");
        const tokenData = tokenSnap.val();
        if (tokenData && tokenData.token) {
            tokensToSend.push(tokenData.token);
            tokenUserMap[tokenData.token] = userId;
        }
    });

    await Promise.all(tokenPromises);

    if (tokensToSend.length === 0) return;

    // 3. multicastで一括送信
    const message = {
        notification: { title, body },
        data: { ...data, title, body },
        tokens: tokensToSend,
    };

    try {
        const response = await messaging.sendEachForMulticast(message);
        console.log(
            `[${roomId}] Sent: ${response.successCount} success, ${response.failureCount} failure`
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
                    console.log(`Removing invalid token for user: ${userId}`);
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

        return sendToRoomMembersExcept(roomId, senderId, title, body, {
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

        // 1. 同室のメンバーへ通知
        await sendToRoomMembersExcept(roomId, memberId, title, body, {
            type: "join",
            roomId: roomId,
            memberId: memberId,
        });

        // 2. フォロワーへ通知
        const followersSnap = await db.ref(`followers/${memberId}`).once("value");
        const followersData = followersSnap.val();
        if (!followersData) return null;

        const followerIds = Object.keys(followersData).filter(id => followersData[id] === true);
        if (followerIds.length === 0) return null;

        const followerTitle = `${memberName}さんが入室しました！`;
        const followerBody = `${roomName}ルームでお話しませんか？`;
        
        const tokensToSend = [];
        const tokenUserMap = {};
        
        const tokenPromises = followerIds.map(async (followerId) => {
            const tokenSnap = await db.ref(`fcm_tokens/${followerId}`).once("value");
            const tokenData = tokenSnap.val();
            if (tokenData && tokenData.token) {
                // 既に同室にいるフォロワーには送らない（重複防止）
                const inRoomSnap = await db.ref(`rooms/${roomId}/members/${followerId}`).once("value");
                if (!inRoomSnap.exists()) {
                    tokensToSend.push(tokenData.token);
                    tokenUserMap[tokenData.token] = followerId;
                }
            }
        });
        
        await Promise.all(tokenPromises);
        
        if (tokensToSend.length === 0) return null;
        
        const message = {
            notification: { title: followerTitle, body: followerBody },
            data: { type: "follow_join", roomId: roomId, memberId: memberId, title: followerTitle, body: followerBody },
            tokens: tokensToSend,
        };
        
        try {
            const response = await messaging.sendEachForMulticast(message);
            console.log(`[Followers of ${memberId}] Sent: ${response.successCount} success, ${response.failureCount} failure`);
            
            if (response.failureCount > 0) {
                const invalidTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errorCode = resp.error?.code;
                        if (errorCode === "messaging/invalid-registration-token" || errorCode === "messaging/registration-token-not-registered") {
                            invalidTokens.push(tokensToSend[idx]);
                        }
                    }
                });
                
                const deletePromises = invalidTokens.map((token) => {
                    const userId = tokenUserMap[token];
                    if (userId) return db.ref(`fcm_tokens/${userId}`).remove();
                    return Promise.resolve();
                });
                await Promise.all(deletePromises);
            }
        } catch (error) {
            console.error("Error sending to followers:", error);
        }

        return null;
    });
