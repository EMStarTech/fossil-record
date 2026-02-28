// ============================================================
//  FOSSIL RECORD — Service Worker
//  Enables offline support and installability
// ============================================================

const CACHE_NAME = 'fossil-record-v1';

// Files to cache for offline use
const CACHE_FILES = [
  '/fossil-record/',
  '/fossil-record/index.html',
  '/fossil-record/manifest.json',
];

// ── INSTALL — cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES).catch(() => {
        // Fail silently if some files aren't available yet
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH — serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Don't intercept API calls to Cloudflare Worker
  if (event.request.url.includes('workers.dev') || 
      event.request.url.includes('api.anthropic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET responses
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If offline and not cached, return the main app
        return caches.match('/fossil-record/index.html');
      });
    })
  );
});
