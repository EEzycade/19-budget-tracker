const CACHE_NAME = 'my-site-cache-budget';
const DATA_CACHE_NAME = 'data-cache-budget';

const FILES_TO_CACHE = [
    "/",
    "/css/styles.css",
    "/manifest.json",
    "/index.html",
    "/js/index.js",
    "/js/idb.js",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x52.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
];

self.addEventListener('install', function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// Activate the service worker and remove old data from the cache
// YOUR CODE HERE
//

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing all old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// Intercept fetch requests
// YOUR CODE HERE
//

self.addEventListener('fetch', function (evt) {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(evt.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            return cache.match(evt.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }
    else {
        evt.respondWith(
            fetch(evt.request).catch(function () {
                return caches.match(evt.request).then(function (response) {
                    if (response) {
                        return response;
                    } else if (evt.request.headers.get('accept').includes('text/html')) {
                        // return the cached home page for all requests for html pages
                        return caches.match('/');
                    }
                });
            })
        );
    }
});