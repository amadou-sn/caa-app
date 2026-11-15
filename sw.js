/* Hors connexion : on essaie d'abord le réseau (pour avoir la dernière version), sinon la copie gardée sur le téléphone. */
var CACHE = 'caa-v1';
var FILES = ['./', 'index.html', 'core.js', 'config/sn.js', 'config/base.js', 'i18n/fr.js',
  'modules/fast.js', 'modules/risque.js', 'modules/tension.js', 'modules/autres.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function(r){
    var copy = r.clone();
    caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
    return r;
  }).catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match('index.html'); }); }));
});
