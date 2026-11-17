// Servidor local mínimo para probar la app: node scripts/servir.js  ->  http://localhost:8080
const http = require('http');
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..', 'public');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
function servir(puerto = 8080) {
  const srv = http.createServer((req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (ruta.endsWith('/')) ruta += 'index.html';
    const archivo = path.normalize(path.join(RAIZ, ruta));
    if (!archivo.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
    fs.readFile(archivo, (err, data) => {
      if (err) { res.writeHead(404); return res.end('No encontrado'); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  });
  return new Promise((ok) => srv.listen(puerto, () => ok(srv)));
}
module.exports = { servir };
if (require.main === module) servir(+process.env.PORT || 8080).then(() => console.log('OficiosSincelejo en http://localhost:' + (process.env.PORT || 8080) + '  (modo demostración: agrega ?demo)'));
