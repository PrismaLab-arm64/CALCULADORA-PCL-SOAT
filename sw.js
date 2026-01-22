const CACHE_NAME = 'pcl-soat-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './Diosa.jpg',
  './icon.png'
];

// Instalación: Guarda los archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos en caché');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación: Limpia cachés viejas si actualizas la versión
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercepción: Sirve los archivos desde la caché si no hay internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, lo devuelve. Si no, lo pide a internet.
        return response || fetch(event.request);
      })
  );
});
