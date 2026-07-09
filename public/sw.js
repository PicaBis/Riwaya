// Bump this on every meaningful change to the caching strategy below so
// `activate` actually purges the previous cache. Do NOT rely on this alone
// to keep pages fresh across deployments — see the network-first navigation
// strategy below, which is what actually prevents serving a stale HTML shell
// that points at JS chunk files a newer deployment no longer serves.
const CACHE = "riwayati-v2";
const PDF_CACHE = "riwayati-pdfs-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
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

  // Page navigations (the HTML document) MUST be network-first. Each
  // deployment ships a new HTML shell that references newly hashed JS chunk
  // files; an old deployment's chunks are not guaranteed to still exist on
  // the server. Serving a cached HTML shell after a new deploy means the
  // browser requests chunk files that 404, which crashes the app with a
  // "Loading chunk X failed" error. Only fall back to the cache when
  // genuinely offline, and never let that fallback go stale silently.
  if (e.request.mode === "navigate" || e.request.destination === "document") {
    e.respondWith(
      fetch(e.request, { credentials: "same-origin" })
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => caches.open(CACHE).then((cache) => cache.match(e.request)))
    );
    return;
  }

  // Static, content-hashed assets (JS/CSS chunks, images) are safe to serve
  // cache-first — their filename changes whenever their content does, so a
  // cache hit is always correct, with a background refresh to stay warm.
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
