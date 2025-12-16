// Version cache name for each release
const CACHE_NAME = "wheel-of-fortune-v1";

// Adjust paths to match your hosting (root or subpath)
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./script.js?v=1",
  "./manifest.json",
  "./icon.png"
];

// Precache on install and take control immediately
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Clear old caches and claim clients
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  event.waitUntil(self.clients.claim());
});

// Helper: is it a navigation (HTML)?
function isNavigateRequest(request) {
  return request.mode === "navigate";
}

// Fetch strategy:
// - HTML: network-first with cache fallback
// - Other assets: cache-first with network fallback + runtime caching
self.addEventListener("fetch", event => {
  const { request } = event;

  if (isNavigateRequest(request)) {
    event.respondWith(
      fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => cached || Promise.reject("offline and not cached"))
    })
  );
});
