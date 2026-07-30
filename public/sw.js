// Service Worker for English Practice App
const CACHE_NAME = 'english-practice-v2';
const STATIC_CACHE_NAME = 'english-practice-static-v2';
const DYNAMIC_CACHE_NAME = 'english-practice-dynamic-v2';
const IS_LOCAL_DEVELOPMENT =
  self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/training',
  '/login',
  '/registro',
  '/manifest.json',
  '/manifest.webmanifest',
  '/mascot/1.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/mascot/1.png',
  '/offline.html',
  // Add critical CSS and JS files
  '/_next/static/css/',
  '/_next/static/js/',
  // Add critical images
  '/uk-flag.png',
  '/hero-background.jpg'
];

// Files to cache on demand
const DYNAMIC_ASSETS = [
  '/api/',
  '/audio/',
  '/images/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  if (IS_LOCAL_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  if (IS_LOCAL_DEVELOPMENT) {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
        .then(() => self.clients.claim())
    );
    return;
  }
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  if (IS_LOCAL_DEVELOPMENT) {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    handleFetch(request)
  );
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Static assets - Cache First
    if (isStaticAsset(request)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // Strategy 2: API calls - Network First with fallback
    if (isApiRequest(request)) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // Strategy 3: Audio/Images - Stale While Revalidate
    if (isMediaRequest(request)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
    }
    
    // Strategy 4: HTML pages - Network First with offline fallback
    if (isPageRequest(request)) {
      return await networkFirstWithOffline(request);
    }
    
    // Default: Network First
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    console.error('Fetch failed:', error);
    return await getOfflineResponse(request);
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Network First with Offline Fallback
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Get offline response
async function getOfflineResponse(request) {
  if (request.mode === 'navigate') {
    return await caches.match('/offline.html');
  }
  
  // Return a generic offline response for other requests
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'This content is not available offline' 
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/) ||
    STATIC_ASSETS.includes(url.pathname)
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/supabase/');
}

function isMediaRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.match(/\.(mp3|wav|ogg|jpg|jpeg|png|gif|svg|webp)$/) ||
    url.pathname.startsWith('/audio/') ||
    url.pathname.startsWith('/images/')
  );
}

function isPageRequest(request) {
  return request.mode === 'navigate' || request.headers.get('accept').includes('text/html');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

async function syncProgressData() {
  try {
    // Get pending progress data from IndexedDB
    const pendingData = await getPendingProgressData();
    
    if (pendingData.length > 0) {
      // Send to server
      const response = await fetch('/api/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressData: pendingData })
      });
      
      if (response.ok) {
        // Clear pending data
        await clearPendingProgressData();
        console.log('Progress data synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync progress data:', error);
  }
}

// Push notifications
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
      const url = new URL(client.url);
      return client.visibilityState === 'visible' && url.pathname.startsWith('/buzon');
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

// Notification click
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

// Helper functions for IndexedDB operations
async function getPendingProgressData() {
  // This would interact with IndexedDB to get pending progress data
  // For now, return empty array
  return [];
}

async function clearPendingProgressData() {
  // This would clear pending progress data from IndexedDB
  // For now, just log
  console.log('Clearing pending progress data');
}

// Cache size management
async function manageCacheSize() {
  const cacheNames = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
  const maxCacheSize = 50 * 1024 * 1024; // 50MB
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    if (requests.length > 100) { // Limit number of cached items
      // Remove oldest items
      const itemsToDelete = requests.slice(0, requests.length - 100);
      await Promise.all(itemsToDelete.map(request => cache.delete(request)));
    }
  }
}

// Periodic cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(manageCacheSize());
  }
});

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker loaded');






















