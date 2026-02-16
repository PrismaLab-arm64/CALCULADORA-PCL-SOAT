/* sw.js — offline-first simple cache */
const SW_VERSION = "pclsoat-sw-v4";
const CACHE_NAME = SW_VERSION;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/styles.css",
  "./assets/js/license.js",
  "./assets/js/app.js",
  "./icon.png",
  "./Diosa.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL.map(u => new Request(u, {cache: "reload"})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : Promise.resolve()));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req, {ignoreSearch:true});
    if (cached) return cached;

    try{
      const fresh = await fetch(req);
      // cachea solo same-origin y respuestas OK
      if (fresh && fresh.ok && new URL(req.url).origin === self.location.origin){
        cache.put(req, fresh.clone());
      }
      return fresh;
    }catch(e){
      // fallback a shell
      return (await cache.match("./index.html")) || Response.error();
    }
  })());
});
