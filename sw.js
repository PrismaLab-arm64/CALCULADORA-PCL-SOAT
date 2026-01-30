const CACHE_NAME = 'pcl-soat-v26-2'; // cambia este nombre para forzar actualización de caché

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './Diosa.png',
  './icon.png',
  './licencia_valora.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo manejar mismo origen
  if (url.origin !== self.location.origin) return;

  // Licencias: Network-first (no validar contra JSON viejo)
  if (url.pathname.endsWith('/licencia_valora.json')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Navegación: fallback a index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Estáticos: cache-first
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request, { cache: 'no-store' });
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, res.clone());
    return res;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw e;
  }
}
