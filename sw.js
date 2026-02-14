/* =========================================================
   Service Worker - Calculadora PCL-SOAT
   Estrategia:
   - App Shell (index.html): network-first con fallback cache/offline
   - Assets (js/css/img/json): cache-first con actualización en background
   - Limpieza de caches antiguos por versión
   ========================================================= */

const SW_VERSION = "pclsoat-sw-v3"; // cambia este string cuando publiques cambios importantes
const CACHE_APP = `${SW_VERSION}-app`;
const CACHE_ASSETS = `${SW_VERSION}-assets`;

// Lista mínima para app-shell offline (ajusta si tu index depende de otros archivos locales)
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./Diosa.png"
];

// Archivos que queremos tratar como "navegación" (app shell)
function isNavigationRequest(request) {
  return request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_APP);
    await cache.addAll(APP_SHELL);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Limpia caches antiguos
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k !== CACHE_APP && k !== CACHE_ASSETS)
        .map(k => caches.delete(k))
    );
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    // 1) Navegación / App Shell -> network-first
    if (isNavigationRequest(req)) {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_APP);
        cache.put("./index.html", fresh.clone()); // mantiene el shell fresco
        return fresh;
      } catch (e) {
        const cache = await caches.open(CACHE_APP);
        // fallback a index para SPA/PWA
        const cached = await cache.match("./index.html");
        return cached || new Response("Offline", { status: 200, headers: { "Content-Type": "text/plain" } });
      }
    }

    // 2) Assets -> cache-first + update in background
    const url = new URL(req.url);

    // Importante: ya NO hacemos trato especial para licencia_valora.json.
    // La licencia firmada vive en localStorage/IndexedDB (cliente), no en un JSON público.

    // Solo cacheamos recursos del mismo origen (tu GitHub Pages)
    const sameOrigin = url.origin === self.location.origin;
    if (!sameOrigin) {
      return fetch(req);
    }

    const cache = await caches.open(CACHE_ASSETS);
    const cached = await cache.match(req);

    if (cached) {
      // Actualización en background (stale-while-revalidate)
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(req, { cache: "no-store" });
          if (fresh && fresh.ok) await cache.put(req, fresh.clone());
        } catch (_) {}
      })());
      return cached;
    }

    // Si no está en caché, intenta red y guarda
    try {
      const fresh = await fetch(req, { cache: "no-store" });
      if (fresh && fresh.ok) await cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      // fallback simple: si no hay red y no está en cache, responde 404 offline
      return new Response("Offline resource not available", { status: 404, headers: { "Content-Type": "text/plain" } });
    }

  })());
});
