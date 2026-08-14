// Service Worker for Myanmar79 · 霓虹财富 PWA
// 版本 v2：网络优先 + 缓存兜底，避免旧缓存优先策略导致更新后页面无法刷新
const CACHE_NAME = 'myanmar79-cache-v2';

// 需要预缓存的资源列表（以当前项目实际文件为准）
const PRE_CACHE_URLS = [
    './index.html',
    './manifest.json',
    './icon-192.png'
];

// 安装事件：预缓存核心资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(PRE_CACHE_URLS).catch((err) => {
                    console.warn('[SW] 预缓存部分资源失败:', err);
                });
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// 激活事件：清理旧版本缓存（包括旧版 myanmar79-cache-v1）
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// 请求拦截：网络优先策略，网络失败时回退到缓存（保证离线可用）
self.addEventListener('fetch', (event) => {
    // 跳过非 GET 请求和 chrome-extension 请求
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 只缓存成功响应
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, responseToCache))
                    .catch(() => {});
                return response;
            })
            .catch(() => {
                // 网络失败时回退到缓存
                return caches.match(event.request);
            })
    );
});
