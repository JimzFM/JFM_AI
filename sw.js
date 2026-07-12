const CACHE_NAME = 'relay-cache-v5';
// Bumped to v5: force client update to clear Brave search UI leftovers
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js',
  'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css',
  'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js'
];

// Shell resources that should always be freshly fetched (network-first)
const NETWORK_FIRST = ['./index.html', './sw.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // let API POSTs pass through untouched

  const url = new URL(event.request.url);
  const pathname = url.pathname;
  const isNetworkFirst = NETWORK_FIRST.some(p => pathname.endsWith(p.replace('./', '/')));

  if (isNetworkFirst) {
    // FIX: Network-first for index.html — users get new versions immediately on deploy
    event.respondWith(
      fetch(event.request)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const clone = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResp;
        })
        .catch(() => caches.match(event.request)) // fall back to cache if offline
    );
  } else {
    // Cache-first for static assets (icons, CDN scripts)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((networkResp) => {
            if (networkResp && networkResp.status === 200 && url.origin === self.location.origin) {
              const clone = networkResp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResp;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
