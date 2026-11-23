const CACHE_NAME = 'obgyn-lab-static-v1';
const PRECACHE_URLS = ['./', './index.html', './offline.html', './models/reproductive-rigged.glb'];
const STATIC_ASSET = /\.(?:js|css|woff2?|svg|png|jpe?g|webp|glb|json)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const shell = await fetch('./index.html', { cache: 'no-cache' });
      if (!shell.ok) throw new Error('Unable to fetch the application shell');
      const markup = await shell.clone().text();
      await cache.put('./index.html', shell);
      const eagerAssets = [...markup.matchAll(/(?:src|href)=["']([^"']+\/assets\/[^"']+)["']/g)].map((match) => match[1]);
      await cache.addAll([...PRECACHE_URLS.filter((url) => url !== './index.html'), ...eagerAssets]);
    })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('obgyn-lab-static-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', response.clone()));
          return response;
        })
        .catch(async () => (await caches.match('./index.html')) || (await caches.match('./offline.html')))
    );
    return;
  }

  if (STATIC_ASSET.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        });
      })
    );
  }
});
