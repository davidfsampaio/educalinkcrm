// Define o nome e a versão do cache. Mudar a versão invalida caches antigos.
const CACHE_NAME = 'educalink-crm-cache-v5';

// Lista de arquivos essenciais para o "app shell" que serão cacheados
const APP_SHELL_URLS = [
  '/index.html',
  '/index.tsx',
  '/icon.svg',
  '/manifest.json',
];

// Evento de instalação: abre o cache e adiciona os arquivos do app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW install: Caching app shell');
      return cache.addAll(APP_SHELL_URLS);
    }).then(() => {
      // Força o novo service worker a se tornar ativo assim que a instalação for concluída.
      return self.skipWaiting();
    })
  );
});

// Evento de ativação: limpa caches antigos e assume o controle imediatamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW activate: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Força o novo service worker a assumir o controle da página imediatamente.
      return self.clients.claim();
    })
  );
});

// Evento de fetch: intercepta as requisições de rede
self.addEventListener('fetch', (event) => {
  // Estratégia para requisições de navegação (abrir o app, F5, etc.)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // IMPORTANTE: Só tenta cachear requisições GET. 
  // O Cache API não suporta métodos como POST, PUT ou DELETE. 
  // Tentar usar cache.put com esses métodos causa erro 'Failed to fetch'.
  if (event.request.method !== 'GET') {
    return;
  }

  // Estratégia para recursos estáticos: "Cache first"
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        // Só armazena em cache se a resposta for válida e da mesma origem ou recursos permitidos
        if (fetchResponse && fetchResponse.ok && event.request.method === 'GET') {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    })
  );
});


// Listener para notificações PUSH
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Nova Notificação', body: event.data.text() };
  }

  const { title, body, icon, badge } = data;

  const options = {
    body: body || 'Você tem uma nova atualização no EducaLink.',
    icon: icon || '/icon.svg',
    badge: badge || '/icon.svg',
  };

  event.waitUntil(self.registration.showNotification(title || 'EducaLink CRM', options));
});


// Listener para o clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});