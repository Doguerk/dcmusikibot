self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open('cf-v1');
    await cache.addAll([
      './',
      './index.html',
      './about.html',
      './leaderboard.html',
      './offline.html',
      './css/styles.css',
      './js/config.js',
      './js/main.js',
      './js/storage.js',
      './js/audio.js',
      './js/ui.js',
      './js/leaderboard-client.js',
      './play/index.html',
    ]);
  })());
});

self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const cache = await caches.open('cf-v1');
    const cached = await cache.match(e.request);
    if (cached) return cached;
    try {
      const response = await fetch(e.request);
      return response;
    } catch(err){
      // Offline fallback: a tiny HTML with last best score if available
      if (e.request.destination === 'document'){
        const offline = await caches.match('./offline.html');
        if (offline) return offline;
        return new Response(`<!doctype html><meta charset=utf-8><title>Offline — Color Flow</title><body style="font-family:sans-serif;background:#0e0e16;color:#e9ecf1;padding:16px">You're offline. Try again later.<br><a href="./">Home</a></body>`, { headers: { 'Content-Type':'text/html' } });
      }
      throw err;
    }
  })());
});
