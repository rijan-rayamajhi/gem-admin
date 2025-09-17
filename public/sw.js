const CACHE_NAME = 'my-admin-v1';
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
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
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
    })
  );
});
