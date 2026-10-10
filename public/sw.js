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