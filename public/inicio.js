// Arranque: elige el backend. Usa Firebase si firebase-config.js está lleno; si no, o si la dirección
// tiene ?demo, abre el modo de demostración con datos de ejemplo que no se guardan.
import { firebaseConfig } from './firebase-config.js';

const demoPedido = new URLSearchParams(location.search).has('demo');
const sinConfig = !firebaseConfig || /PEGA_AQUI|TU-PROYECTO/.test(JSON.stringify(firebaseConfig));

function aviso(texto) {
  let b = document.getElementById('aviso-conexion');
  if (!b) {
    b = document.createElement('div');
    b.id = 'aviso-conexion';
    b.setAttribute('role', 'alert');
    b.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99;background:#9B2C2C;color:#fff;padding:10px 16px;font:600 14px/1.4 system-ui,sans-serif;text-align:center';
    document.body.appendChild(b);
  }
  b.textContent = texto;
}
window.addEventListener('backend-error', (e) => aviso('No se pudo conectar con la base de datos. ' + (e.detail || 'Revisa tu conexión a Internet.')));

if (demoPedido || sinConfig) {
  window.__SIN_CONFIG = sinConfig && !demoPedido;
  const s = document.createElement('script');
  s.src = 'backend-demo.js';
  document.body.appendChild(s);
} else {
  import('./backend-firebase.js').catch((e) => {
    console.error(e);
    aviso('No se pudo cargar Firebase. Revisa tu conexión a Internet y recarga la página.');
  });
}
