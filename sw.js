const SW_VERSION="pclsoat-sw-v6";
const CACHE_APP=`${SW_VERSION}-app`;
const CACHE_ASSETS=`${SW_VERSION}-assets`;
const APP_SHELL=[
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./Diosa.png",
  "./assets/css/styles.min.css",
  "./assets/js/license.min.js",
  "./assets/js/app.min.js"
];

self.addEventListener("install",(e)=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE_APP);
    await c.addAll(APP_SHELL);
    self.skipWaiting();
  })());
});

self.addEventListener("activate",(e)=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE_APP && k!==CACHE_ASSETS).map(k=>caches.delete(k)));
    self.clients.claim();
  })());
});

function isNav(req){
  return req.mode==="navigate" || (req.method==="GET" && (req.headers.get("accept")||"").includes("text/html"));
}

self.addEventListener("fetch",(e)=>{
  const req=e.request;
  if(req.method!=="GET") return;

  e.respondWith((async()=>{
    if(isNav(req)){
      try{
        const fresh=await fetch(req);
        const c=await caches.open(CACHE_APP);
        c.put("./index.html",fresh.clone());
        return fresh;
      }catch{
        const c=await caches.open(CACHE_APP);
        return (await c.match("./index.html")) || new Response("Offline",{status:200,headers:{"Content-Type":"text/plain"}});
      }
    }

    const url=new URL(req.url);
    if(url.origin!==self.location.origin) return fetch(req);

    const c=await caches.open(CACHE_ASSETS);
    const cached=await c.match(req);
    if(cached){
      e.waitUntil((async()=>{
        try{
          const fresh=await fetch(req,{cache:"no-store"});
          if(fresh && fresh.ok) await c.put(req,fresh.clone());
        }catch{}
      })());
      return cached;
    }

    try{
      const fresh=await fetch(req,{cache:"no-store"});
      if(fresh && fresh.ok) await c.put(req,fresh.clone());
      return fresh;
    }catch{
      return new Response("Offline resource not available",{status:404,headers:{"Content-Type":"text/plain"}});
    }
  })());
});
