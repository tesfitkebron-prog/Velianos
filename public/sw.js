// Service worker minimal pour rendre Velianos installable comme PWA
// Règle stricte : aucun cache applicatif. Les chunks Next.js changent à chaque
// build et un cache SW provoquerait des ChunkLoadError.
const CACHE_NAME = "velianos-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.caches && typeof caches.keys === "function") {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith("velianos") || key.startsWith("workbox") || key.startsWith("next"))
            .map((key) => caches.delete(key)),
        );
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/_next/")) return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" }).catch(() =>
      fetch(event.request),
    ),
  );
});

// Notifications Web Push (nouveau client, nouveau SMS, etc.)
self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  if (!payload || typeof payload !== "object") {
    payload = {
      body: typeof payload === "string" ? payload : "",
    };
  }

  const title =
    typeof payload.title === "string" && payload.title
      ? payload.title
      : "Velianos";
  const options = {
    body:
      typeof payload.body === "string" && payload.body
        ? payload.body
        : "Nouveau client reçu.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag:
      typeof payload.tag === "string" && payload.tag
        ? payload.tag
        : "velianos-notification",
    renotify: true,
    data: {
      url:
        typeof payload.url === "string" && payload.url.startsWith("/")
          ? payload.url
          : "/clients",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url =
    typeof data.url === "string" && data.url.startsWith("/")
      ? data.url
      : "/clients";

  event.waitUntil(
    (async () => {
      const fenetres = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const fenetre of fenetres) {
        if ("focus" in fenetre) {
          await fenetre.focus();
          if ("navigate" in fenetre) {
            try {
              await fenetre.navigate(url);
            } catch {
              // La navigation peut échouer si la fenêtre a été fermée.
            }
          }
          return;
        }
      }

      await self.clients.openWindow(url);
    })(),
  );
});