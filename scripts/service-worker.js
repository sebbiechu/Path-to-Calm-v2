const cacheName = 'breathing-v1';
const assets = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/scripts/script.js',
  '/sounds/inhale.mp3',
  '/sounds/exhale.mp3',
  '/sounds/hold.mp3',
  '/images/people.png',
  '/images/cloudwalker.gif',
  '/images/inhale.svg',
  '/images/exhale.svg',
  '/images/hold.svg',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(assets))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
