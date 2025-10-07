// Define o nome do cache
const CACHE_NAME = 'educalink-crm-cache-v1';

// Lista de arquivos essenciais para o "app shell" que serão cacheados
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/icon.svg',
  // Adicione aqui outros assets estáticos importantes se houver (CSS, etc.)
  // O Service Worker não consegue ver o importmap, então não podemos cachear os módulos CDN diretamente aqui.
  // A estratégia de cache abaixo cuidará disso.
];

// Evento de instalação: abre o cache e adiciona os arquivos do app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: intercepta as requisições e serve do cache se disponível
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se a resposta estiver no cache, retorna ela
        if (response) {
          return response;
        }

        // Caso contrário, faz a requisição à rede
        return fetch(event.request).then(
          (response) => {
            // Se a resposta da rede for inválida, não armazena e retorna
            if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              return response;
            }

            // Clona a resposta. Uma resposta é um Stream e só pode ser consumida uma vez.
            // Precisamos de uma para o navegador e outra para o cache.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Adiciona a resposta da rede ao cache para futuras requisições
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Evento de ativação: limpa caches antigos
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
});