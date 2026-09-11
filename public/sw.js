// Service Worker — solo notificaciones push (sin interceptar navegación ni HTML).
const CACHE_NAME = 'english-practice-v7-push-only';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

// Sin listener "fetch": la navegación va siempre directa a la red.

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
