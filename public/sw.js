const CACHE = "riwayati-v1";

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
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
      return cached || fetched;
    })
  );
});