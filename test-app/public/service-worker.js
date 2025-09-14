const CACHE_NAME = 'testapp-cache-v2';
const urlsToCache = [
  '/',
  '/css/base.css',                         // 存在するCSSファイルに変更
  '/css/light.css',
  '/css/dark.css',
  '/icons/android-chrome-192x192.png',
];

// base64からUint8Arrayに変換する関数（通常のJSでも使用可能）
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated');

  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑 古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  console.log('📨 通知を受信:', data);

  const options = {
    body: data.body || '通知本文なし',
    icon: '/icons/android-chrome-192x192.png',
    lang: 'ja',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '通知', options)
  );
});

self.addEventListener('pushsubscriptionchange', async event => {
  console.log('📡 pushsubscriptionchange 発生');

  // VAPID公開鍵をUint8Array化（この値はフロントJSと同じもの）
  const applicationServerKey = urlBase64ToUint8Array(
    'BO5UhrGnKBsUq-vZg0pqrAtlQW2bGWDJFfkAZz4DA4QqLdYijpjNrTpYg9YE7yKrGHSgP-3tp-9SUdqnMkmTaYA'
  );

  try {
    // 新しい購読情報を取得
    const newSubscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    // サーバへ送信
    await fetch('/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubscription)
    });

    console.log('✅ 新しい購読情報を再登録しました');
  } catch (error) {
    console.error('❌ 購読情報の再登録に失敗:', error);
  }
});
