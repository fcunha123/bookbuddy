// ============================================================
//  BookBuddy — Service Worker
//  public/sw.js
//
//  Handles: offline caching, push notifications, background sync
// ============================================================

const CACHE_NAME   = "bookbuddy-v1";
const STATIC_CACHE = "bookbuddy-static-v1";

// Assets to cache immediately on install
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  // Fonts (Fredoka One + Boogaloo from Google)
  "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Boogaloo&display=swap",
];

// ── Install: pre-cache shell ─────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ───────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for API, cache-first for assets ────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache Supabase API calls
  if (url.hostname.includes("supabase.co")) {
    event.respondWith(fetch(request));
    return;
  }

  // For navigation requests → serve index.html (SPA routing)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/index.html")
      )
    );
    return;
  }

  // For everything else → cache-first with network fallback
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          // Cache successful GET responses
          if (
            response.ok &&
            request.method === "GET" &&
            !url.pathname.startsWith("/api/")
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});

// ── Push Notifications ──────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "BookBuddy", body: "Você tem uma nova notificação!", icon: "/icons/icon-192.png", badge: "/icons/icon-72.png" };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon,
      badge:   data.badge,
      vibrate: [100, 50, 100],
      data:    { url: data.url ?? "/" },
      actions: data.actions ?? [],
    })
  );
});

// Tap notification → open or focus app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === target && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(target);
      })
  );
});

// ── Background Sync (queue actions made offline) ─────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-loans") {
    event.waitUntil(syncPendingLoans());
  }
});

async function syncPendingLoans() {
  // Read pending actions stored in IndexedDB by the app
  // and replay them against Supabase when back online.
  // Implementation depends on your offline queue setup.
  console.log("[SW] Syncing pending loan actions…");
}
