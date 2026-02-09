/* public/service-worker.js */

// Incremente esta versão quando quiser forçar atualização do cache
const CACHE_NAME = "smartcow-static-v3";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Cache apenas arquivos “estáticos”
const shouldCache = (pathname) =>
  pathname === "/manifest.json" ||
  pathname.startsWith("/icons/") ||
  pathname.startsWith("/assets/") ||
  pathname.endsWith(".js") ||
  pathname.endsWith(".css");

/**
 * ✅ INSTALL
 * - NÃO chama skipWaiting automaticamente
 * - Isso evita que o SW novo “tome conta” e cause reload ao usuário.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
    })()
  );
});

/**
 * ✅ ACTIVATE
 * - limpa caches antigos
 * - NÃO faz clients.claim automaticamente (evita takeover no meio do uso)
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      // NÃO usar clients.claim()
    })()
  );
});

/**
 * ✅ Permite atualizar quando o app mandar (ex: botão "Atualizar")
 */
self.addEventListener("message", (event) => {
  if (event?.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/**
 * ✅ FETCH
 * - network-first para navegação (HTML) => evita app “voltar do nada”
 * - cache-first para assets (/assets, .js, .css, icons)
 */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === "navigate";

  // Navegação (HTML): tenta rede primeiro, cai pro cache se offline
  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request);
          return fresh;
        } catch {
          // offline: entrega shell
          const cached = await caches.match("/index.html");
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Assets: cache-first
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      const fresh = await fetch(event.request);

      if (shouldCache(url.pathname)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, fresh.clone());
      }

      return fresh;
    })()
  );
});
