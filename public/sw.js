const CACHE = "riwayati-v1";
const PDF_CACHE = "riwayati-pdfs-v1";

self.addEventListener("install", (e) => {
  (e as any).waitUntil(
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
});

self.addEventListener("fetch", (e: any) => {
  const url = new URL(e.request.url);

  if (url.pathname.startsWith("/api/novel-asset/")) {
    e.respondWith(
      caches.open(PDF_CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          const fetched = fetch(e.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(e.request, response.clone());
            }
            return response;
          });
          return cached || fetched;
        })
      )
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request).then((cached) => {
        const fetched = fetch(e.request).then((response) => {
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