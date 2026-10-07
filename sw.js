// Troque a VERSAO a cada deploy para forçar a atualização do cache.
const VERSAO = 'v4';
const CACHE = `coracao-${VERSAO}`;
const NUCLEO = ['./', 'index.html', 'style.css', 'script.js', 'manifest.json',
    'img/rapha.webp', 'img/casal.webp', 'img/icon-192.png', 'img/icon-512.png',
    'img/icon-maskable-512.png', 'click.mp3', 'tension.mp3', 'summer-forever.mp3'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(NUCLEO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Navegadores pedem áudio em pedaços (Range); precisamos responder 206 a partir do cache.
async function respostaParcial(req, res) {
    const buf = await res.arrayBuffer();
    const m = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range'));
    const ini = Number(m[1]);
    const fim = m[2] ? Number(m[2]) : buf.byteLength - 1;
    return new Response(buf.slice(ini, fim + 1), {
        status: 206,
        headers: {
            'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
            'Content-Range': `bytes ${ini}-${fim}/${buf.byteLength}`,
            'Content-Length': String(fim - ini + 1)
        }
    });
}

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    const ehAudio = /\.mp3$/i.test(url.pathname);

    e.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const guardado = await cache.match(req, { ignoreSearch: true });

        if (ehAudio && guardado) {
            return req.headers.has('range') ? respostaParcial(req, guardado) : guardado;
        }
        if (req.mode === 'navigate') {
            try {
                return await fetch(req);
            } catch {
                return guardado || cache.match('index.html');
            }
        }
        // stale-while-revalidate: responde rápido e atualiza em segundo plano
        const rede = fetch(req).then(r => {
            if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone());
            return r;
        }).catch(() => guardado);
        return guardado || rede;
    })());
});
