// Service Worker para notificações avançadas
const CACHE_NAME = "ceo-sync-v1"
const urlsToCache = ["/", "/favicon.ico"]

// Instalar o service worker
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retornar cache se disponível, senão buscar na rede
      return response || fetch(event.request)
    }),
  )
})

// Lidar com cliques em notificações
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  // Abrir ou focar na janela do CEO SYNC
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Se já há uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url.includes("localhost") || client.url.includes("ceo-sync")) {
          return client.focus()
        }
      }

      // Senão, abrir nova janela
      return clients.openWindow("/")
    }),
  )
})

// Lidar com notificações push (para futuras implementações)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "ceo-sync",
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})
