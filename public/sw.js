// Charter — Service Worker
// Strategy: Cache-first for assets, network-first for navigation
// All assets are dynamically cached on first fetch — works with Vite's hashed filenames

const CACHE_NAME = 'charter-v1.0.0';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
];

// ─── Install ──────────────────────────────────────────────────────────────────
// Precache the app shell. skipWaiting so the SW activates immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
// Delete any old cache versions so stale assets don't linger after an update.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (e.g. fonts, analytics)
  if (url.origin !== self.location.origin) return;

  // Navigation requests (HTML pages) → network first, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // All other assets (JS, CSS, images, fonts) → cache first, then network
  // Any asset fetched for the first time is added to cache automatically.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Serve from cache, refresh in background (stale-while-revalidate)
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
            }
          })
          .catch(() => {});
        return cached;
      }

      // Not in cache — fetch from network and cache the response
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});

// ─── Message: SKIP_WAITING ────────────────────────────────────────────────────
// Triggered by the update prompt in the app — activates the new SW immediately.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
