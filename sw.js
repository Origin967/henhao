// Service Worker for Myanmar79 · 霓虹财富 PWA
const CACHE_NAME = 'myanmar79-cache-v1';

// 需要预缓存的资源列表
const PRE_CACHE_URLS = [
    './',
    './youxi.html',
    './icon-192.png',
    './icon-512.png',
    './manifest.json'
];

// 安装事件：预缓存核心资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRE_CACHE_URLS).catch((err) => {
                console.warn('[SW] 预缓存部分资源失败:', err);
            });
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// 请求拦截：缓存优先策略
self.addEventListener('fetch', (event) => {
    // 跳过非 GET 请求和 chrome-extension 请求
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((response) => {
                // 只缓存成功响应
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            }).catch(() => {
                // 网络失败时，对于页面请求返回缓存（如果有）
                return caches.match(event.request);
            });
        })
    );
});
