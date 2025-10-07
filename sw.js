// Define o nome e a versão do cache. Mudar a versão invalida caches antigos.
const CACHE_NAME = 'educalink-crm-cache-v2';

// Lista de arquivos essenciais para o "app shell" que serão cacheados
const APP_SHELL_URLS = [
  '/index.html',
  '/icon.svg',
  '/manifest.json',
];

// Evento de instalação: abre o cache e adiciona os arquivos do app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aberto e salvando o app shell');
      // Adicionamos /index.html que servirá para todas as rotas de navegação
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

// Evento de ativação: limpa caches antigos para garantir que a nova versão seja usada
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Evento de fetch: intercepta as requisições
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') return;

  // Estratégia para requisições de navegação (ex: abrir o app, mudar de página)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        // 1. Tenta servir o index.html do cache primeiro (para velocidade)
        return cache.match('/index.html').then(cachedResponse => {
          // 2. Em paralelo, busca uma nova versão da rede para atualizar o cache
          const networkFetch = fetch('/index.html').then(networkResponse => {
            if (networkResponse.ok) {
              // Se a busca na rede funcionar, atualiza o cache com a nova versão
              cache.put('/index.html', networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Se a rede falhar, não faz nada, pois já estamos servindo do cache se disponível
          });

          // Retorna a resposta do cache imediatamente se existir, senão, espera pela rede.
          // Isso garante que o app abra offline.
          return cachedResponse || networkFetch;
        });
      })
    );
    return;
  }

  // Estratégia para outros recursos (JS, CSS, imagens, etc.) - Cache First
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Se o recurso estiver no cache, retorna ele
      if (cachedResponse) {
        return cachedResponse;
      }
      // Se não, busca na rede
      return fetch(event.request).then(networkResponse => {
        // Se a busca for bem-sucedida, clona e armazena no cache para a próxima vez
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
