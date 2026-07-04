const CACHE = "riwayati-v1";
const PDF_CACHE = "riwayati-pdfs-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        "/",
        "/about",
        "/library",
        "/novel/shajarat-sina",
        "/favicon.svg",
        "/logo.svg",
        "/manifest.json",
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE && key !== PDF_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") {
    e.respondWith(fetch(e.request));
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request, { credentials: "same-origin" }).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(PDF_CACHE).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => new Response("Offline", { status: 503 }))
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request).then((cached) => {
        const fetched = fetch(e.request, { credentials: "same-origin" }).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            cache.put(e.request, clone);
          }
          return response;
        });
        return cached || fetched;
      })
    )
  );
});
