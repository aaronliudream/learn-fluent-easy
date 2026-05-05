// Big Moon English — minimal PWA service worker.
// Goal: satisfy installability ("Add to Home Screen" native prompt on
// Android Chrome) and provide light HTML/asset caching. Designed to be
// safe to remove later — see kill-switch pattern in PWA docs.

const VERSION = "v2";
const HTML_CACHE = `bm-html-${VERSION}`;
const ASSET_CACHE = `bm-assets-${VERSION}`;
const TTS_CACHE = `bm-tts-${VERSION}`;

self.addEventListener("install", (event) => {
  // Activate immediately on first install
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Clean up old versions
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith("bm-") && !n.endsWith(VERSION))
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Cross-origin: only handle Supabase TTS audio bucket (CacheFirst, immutable).
  // Audio files are content-addressed (sha256-named .mp3) — same URL = same
  // bytes forever, so it's safe to cache aggressively. Eliminates network
  // entirely on repeat plays across sessions.
  if (url.origin !== self.location.origin) {
    if (
      /\.supabase\.co$/.test(url.hostname) &&
      url.pathname.includes("/storage/v1/object/public/tts-audio/")
    ) {
      event.respondWith((async () => {
        const cache = await caches.open(TTS_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          // Only cache successful full responses (skip 206 Range probes).
          if (fresh.ok && fresh.status === 200) {
            cache.put(req, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch {
          return cached || new Response("", { status: 503 });
        }
      })());
    }
    return;
  }

  // NEVER cache OAuth callback or Supabase auth flows
  if (url.pathname.startsWith("/~oauth") || url.pathname.startsWith("/auth")) {
    return;
  }

  // NEVER cache API / functions
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/functions")) {
    return;
  }

  // HTML navigations: NetworkFirst with 3s timeout, fall back to cache
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await Promise.race([
          fetch(req),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
        ]);
        const cache = await caches.open(HTML_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        const shell = await caches.match("/");
        if (shell) return shell;
        return new Response("Offline", { status: 503 });
      }
    })());
    return;
  }

  // Static hashed assets: CacheFirst
  if (url.pathname.startsWith("/assets/") || /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        return cached || new Response("", { status: 503 });
      }
    })());
  }
});
