// firebase-messaging-sw.js
// FCMバックグラウンド通知用 Service Worker

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB_tiPU9B2FgpJMaP5zvPfGsxHaIgk9Pbg",
    authDomain: "paka-paka-32ebd.firebaseapp.com",
    databaseURL: "https://paka-paka-32ebd-default-rtdb.firebaseio.com",
    projectId: "paka-paka-32ebd",
    storageBucket: "paka-paka-32ebd.firebasestorage.app",
    messagingSenderId: "289050189836",
    appId: "1:289050189836:web:fd2810ae03b3ada06bce29",
    measurementId: "G-618QVCQ7H8"
});

const messaging = firebase.messaging();

// バックグラウンドメッセージ受信時の処理
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    // FCM SDKは、payload.notificationが存在する場合、自動的にOS通知を表示します。
    // ここで再度 showNotification を呼ぶと2回通知が出てしまうため、早期リターンします。
    if (payload.notification) {
        return;
    }

    const notificationTitle = payload.data?.title || '新着メッセージ';
    const notificationOptions = {
        body: payload.data?.body || 'メッセージが届きました',
        icon: './icon.svg',
        badge: './icon.svg',
        vibrate: [100, 50, 100],
        tag: payload.data?.roomId || 'paka-paka',
        data: {
            url: self.registration.scope,
            roomId: payload.data?.roomId || null,
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // すでにアプリが開いていればフォーカス
            for (const client of clientList) {
                if (client.focused) return;
                return client.focus();
            }
            // 開いていなければ新しいウィンドウで開く
            return clients.openWindow('./index.html');
        })
    );
});
