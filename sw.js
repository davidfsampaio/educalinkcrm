// Define o nome e a versão do cache. Mudar a versão invalida caches antigos.
const CACHE_NAME = 'educalink-crm-cache-v3';

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
      console.log('SW install: Caching app shell');
      return cache.addAll(APP_SHELL_URLS);
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
  // Sempre serve o `index.html` do cache para garantir que o app carregue.
  // Isso contorna o problema do servidor que não serve o arquivo HTML corretamente.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(response => {
        // Se o index.html estiver no cache, retorna ele. Senão (caso muito raro após a instalação), busca na rede.
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Estratégia para todos os outros recursos (JS, imagens, fontes, etc.)
  // "Cache first": serve do cache se disponível, senão busca na rede e armazena para a próxima vez.
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se tivermos uma resposta no cache, retorna ela.
      if (response) {
        return response;
      }
      // Se não, busca na rede.
      return fetch(event.request).then((fetchResponse) => {
        // Se a resposta da rede for válida, clona, armazena no cache e retorna.
        if (fetchResponse && fetchResponse.ok) {
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