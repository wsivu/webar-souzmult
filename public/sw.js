const CACHE = 'webar-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/ui.js',
  './js/capture.js',
  './face.html',
  './models/lariska.glb',
  './models/oranges.glb',
  './models/hare.glb',
  './models/moped.glb',
  './targets/cheb.mind',
  './targets/shapo.mind',
  './targets/volk.mind',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).
    then(()=> self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
