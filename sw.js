// Service worker: lets the app open offline (data is cached in localStorage and
// synced to Supabase when the connection returns). Bump CACHE on every change
// to the app shell so installed copies pick up the new version.
const CACHE='obras-v4';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET')return;
  const sameOrigin=url.origin===location.origin;
  // Only the app shell and the version-pinned CDN libraries are cached; Supabase
  // API calls always go to the network.
  if(!sameOrigin&&url.hostname!=='cdn.jsdelivr.net')return;
  if(req.mode==='navigate'||(sameOrigin&&url.pathname.endsWith('.html'))){
    // Network first so a new deploy shows up right away; cache when offline.
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;})
      .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;});
    return hit||net;
  }));
});
