const CACHE_NAME = 'my-admin-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.png'
];

// Check if we're in development mode
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
  // Skip caching in development
  if (isDevelopment) {
    console.log('Service Worker: Development mode - skipping cache installation');
    self.skipWaiting();
    return;
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Skip caching in development - always fetch fresh
  if (isDevelopment) {
    return;
  }
  
  const request = event.request;

  // Only handle same-origin GET requests. Let cross-origin (e.g., Firebase) pass through.
  const isGET = request.method === 'GET';
  const isSameOrigin = new URL(request.url).origin === self.location.origin;
  const isNavigationRequest = request.mode === 'navigate';

  if (!isGET || !isSameOrigin) {
    return; // Do not intercept
  }

  // Network-first for navigations to avoid stale shells
  if (isNavigationRequest) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // Cache-first for static same-origin GETs (icons, manifest, root)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Clone and cache safe responses
        const responseClone = response.clone();
        // Only cache basic, successful responses
        if (response.status === 200 && response.type === 'basic') {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone)).catch(() => {});
        }
        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
