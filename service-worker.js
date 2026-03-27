const CACHE_NAME = 'crm-static-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/theme.css',
  '/js/app.js',
  '/js/ui/navigation.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    return; 
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
