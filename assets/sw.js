/* =========================================================
 Service Worker - Calculadora PCL-SOAT
========================================================= */
const SW_VERSION = "pclsoat-sw-v5";
const CACHE_APP = `${SW_VERSION}-app`;
const CACHE_ASSETS = `${SW_VERSION}-assets`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./Diosa.png",
  "./assets/js/license.js"
];

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
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_APP && k !== CACHE_ASSETS).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    if (isNavigationRequest(req)) {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_APP);
        cache.put("./index.html", fresh.clone());
        return fresh;
      } catch (e) {
        const cache = await caches.open(CACHE_APP);
        const cached = await cache.match("./index.html");
        return cached || new Response("Offline", { status: 200, headers: { "Content-Type": "text/plain" } });
      }
    }

    const url = new URL(req.url);
    const sameOrigin = url.origin === self.location.origin;
    if (!sameOrigin) return fetch(req);

    const cache = await caches.open(CACHE_ASSETS);
    const cached = await cache.match(req);
    if (cached) {
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(req, { cache: "no-store" });
          if (fresh && fresh.ok) await cache.put(req, fresh.clone());
        } catch (_) {}
      })());
      return cached;
    }

    try {
      const fresh = await fetch(req, { cache: "no-store" });
      if (fresh && fresh.ok) await cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      return new Response("Offline resource not available", { status: 404, headers: { "Content-Type": "text/plain" } });
    }
  })());
});
