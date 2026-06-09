const CACHE_NAME = 'livespeech-cache-v2'; // 🌟 Aggiornato a v2 per forzare il browser a ricaricare tutto
const assetsToCache = [
    '/livespeechtext/',
    '/livespeechtext/index.html',
    '/livespeechtext/manifest.json',
    // Fogli di stile (CSS)
    '/livespeechtext/CSS/main.css',
    '/livespeechtext/CSS/style-base.css',
    '/livespeechtext/CSS/style-dark.css',
    '/livespeechtext/CSS/style-desktop.css',
    '/livespeechtext/CSS/style-lingua.css',
    '/livespeechtext/CSS/style-mobile.css',
    '/livespeechtext/CSS/style-pwa.css',
    // File JavaScript (JS)
    '/livespeechtext/js/app.js',
    '/livespeechtext/js/faq-data.js',
    // Immagini e Icone
    '/livespeechtext/assets/Logo.png',
    '/livespeechtext/assets/icon-192.png',
    '/livespeechtext/assets/icon-512.png',
    '/livespeechtext/assets/luffy-hat.png',
    '/livespeechtext/assets/sparkles.png'
];

// 1. Installa il Service Worker e memorizza i file base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache aperta con successo!');
      return cache.addAll(assetsToCache);
    })
  );
  // Forza il Service Worker attivo a prendere il controllo della pagina immediatamente
  self.skipWaiting();
});

// 2. Svuota la vecchia cache (v1) quando si attiva la nuova versione (v2)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Rimozione vecchia cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Gestisce le richieste quando l'app è aperta (Strategia: Cache con fallback sulla rete)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Se il file è in cache lo restituisce subito, altrimenti lo chiede a internet
      return response || fetch(event.request);
    })
  );
});
