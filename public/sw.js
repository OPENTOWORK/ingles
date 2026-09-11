// Service Worker for English Practice App
const CACHE_NAME = 'english-practice-v6';
const OFFLINE_CACHE_NAME = 'english-practice-offline-v6';
const IS_LOCAL_DEVELOPMENT =
  self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

/** Solo recursos estáticos inmutables (no HTML ni bundles de Next). */
const OFFLINE_ASSETS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/mascot/1.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/uk-flag.png',
];

self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches
      .open(OFFLINE_CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Failed to cache offline assets:', error);
        return self.skipWaiting();
      }),
  );
});

self.addEventListener('activate', (event) => {
  if (IS_LOCAL_DEVELOPMENT) {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
        .then(() => self.clients.claim()),
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .then(() => caches.open(OFFLINE_CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS)))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (IS_LOCAL_DEVELOPMENT) return;

  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);

  // Bundles de Next: siempre red. Sin fallback a caché (evita CSS/JS de builds antiguos).
  if (url.pathname.startsWith('/_next/static/')) {
    return fetch(request);
  }

  // HTML / navegación: red primero; solo offline.html si la red falla de verdad.
  // No usar response.ok: 304, 401 o 5xx deben llegar al navegador, no sustituirse por offline.
  if (request.mode === 'navigate') {
    try {
      return await fetch(request);
    } catch {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
      throw new Error('Navigation unavailable offline');
    }
  }

  // API: red con fallback mínimo.
  if (url.pathname.startsWith('/api/')) {
    try {
      return await fetch(request);
    } catch {
      return new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Imágenes / audio: red con caché opcional (no crítico para layout).
  if (isMediaRequest(request)) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(OFFLINE_CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw new Error('Media unavailable offline');
    }
  }

  return fetch(request);
}

function isMediaRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.match(/\.(mp3|wav|ogg|jpg|jpeg|png|gif|svg|webp|ico)$/) ||
    url.pathname.startsWith('/audio/') ||
    url.pathname.startsWith('/images/')
  );
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_ALL_CACHES') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name)))),
    );
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME });
  }
});

// Push notifications (buzón)
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let payload = {};
    try {
      payload = event.data ? event.data.json() : {};
    } catch {
      payload = { body: event.data ? event.data.text() : 'Tienes un mensaje nuevo.' };
    }

    const appClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });
    const buzonIsVisible = appClients.some((client) => {
      const clientUrl = new URL(client.url);
      return client.visibilityState === 'visible' && clientUrl.pathname.startsWith('/buzon');
    });
    if (buzonIsVisible) return;

    await self.registration.showNotification(payload.title || 'Nuevo mensaje en Dralo', {
      body: payload.body || 'Tienes un mensaje nuevo.',
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      vibrate: [120, 60, 120],
      tag: payload.tag || 'dralo-buzon',
      renotify: true,
      data: {
        url: payload.url || '/buzon/',
        messageId: payload.messageId || null,
      },
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil((async () => {
    const targetUrl = new URL(event.notification.data?.url || '/buzon/', self.location.origin).href;
    const appClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });
    const existing = appClients.find((client) => new URL(client.url).origin === self.location.origin);

    if (existing) {
      if ('navigate' in existing) await existing.navigate(targetUrl);
      return existing.focus();
    }
    return self.clients.openWindow(targetUrl);
  })());
});

console.log('Service Worker loaded:', CACHE_NAME);
