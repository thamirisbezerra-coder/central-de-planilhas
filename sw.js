const CACHE_NAME = 'amostras-v2026-update-1'; // Mudei o nome para forçar a atualização no navegador dos usuários
const urlsToCache = [
  './',
  './centraldeamostras.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Instalação do Service Worker e Cache dos recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Força o SW a ativar imediatamente
});

// Busca os recursos: tenta a rede primeiro, se falhar, usa o cache (Estratégia Network First para HTML)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, clona e atualiza o cache
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Se falhar (offline), tenta pegar do cache
        return caches.match(event.request);
      })
  );
});

// Limpeza de caches antigos (Importante para remover a versão anterior do site)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Assume o controle da página imediatamente
});
