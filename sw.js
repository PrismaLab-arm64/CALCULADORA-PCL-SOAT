const CACHE_NAME = 'pcl-soat-v26-5';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './licencia_valora.json',
  './Diosa.png',
  './icon.png'
];

// Instalación: precache core
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

// Activación: limpia caches viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())));
      await self.clients.claim();
    })()
  );
});

// Fetch: network-first para licencias, cache-first para lo demás
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo same-origin
  if (url.origin !== self.location.origin) return;

  // Licencias: network-first (para revocación/renovación rápida)
  if (url.pathname.endsWith('/licencia_valora.json')) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req, { cache: 'no-store' });
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          const cached = await caches.match(req);
          return cached || new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      })()
    );
    return;
  }

  // Navegación: intenta cache, si no, index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cached = await caches.match('./index.html');
        return cached || fetch(req);
      })()
    );
    return;
  }

  // Resto: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
      return resp;
    }))
  );
});
