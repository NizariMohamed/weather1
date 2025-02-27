const cacheName = "weatherApp-v1";
const filesToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/image"
];

self.addEventListener(install, event=> {
    event.waitUntil(
        caches.open(cacheName).then(cache =>{
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("fetch", event =>{
    event.respondWidth(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
})