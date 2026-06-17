const CACHE_NAME = 'cybershield-v1';
const FICHIERS_A_GARDER = [
  './index.html',
  './style.css',
  './dashboard.html',
  './dashboard.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FICHIERS_A_GARDER);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(reponse) {
      return reponse || fetch(event.request);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(noms) {
      return Promise.all(
        noms.filter(function(nom) {
          return nom !== CACHE_NAME;
        }).map(function(nom) {
          return caches.delete(nom);
        })
      );
    })
  );
});
