const CACHE_NAME = 'livespeech-cache-v1';
const assetsToCache = [
  '/livespeechtext/',
  '/livespeechtext/index.html',
  '/livespeechtext/style.css'
];

// Installa il Service Worker e memorizza i file base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Gestisce le richieste quando l'app è aperta
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});