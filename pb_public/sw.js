// ファイル名: sw.js

self.addEventListener('push', function(event) {
    // サーバーから通知データが来たときに動く
    let data = { title: '新着メッセージ', body: 'メッセージが届きました' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch(e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: 'icon.svg', // アイコン画像のパス
        badge: 'icon.svg', // Androidのステータスバー用アイコン
        vibrate: [100, 50, 100],
        data: {
            url: self.registration.scope // 通知をタップしたときの飛び先
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    // 通知をタップしたときの動作
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // すでにアプリが開いていればフォーカス、なければ開く
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) return;
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});