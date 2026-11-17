/* Backend para la versión en Firebase: Authentication (correo y anónimo) y Cloud Firestore (plan gratuito Spark). */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, runTransaction } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let uid = null;
const lista = (s) => s.docs.map((d) => Object.assign({ id: d.id }, d.data()));
async function leer(path) { const s = await getDoc(doc(db, path)); return s.exists() ? s.data() : null; }
// Avisa en pantalla cuando Firestore rechaza o no responde (por ejemplo, base de datos sin crear o reglas sin publicar).
const conAviso = (err) => (e) => {
  console.error(e);
  const msg = e && e.code === 'permission-denied' ? 'Permiso denegado: revisa que las reglas de Firestore estén publicadas.' : (e && e.message) || '';
  window.dispatchEvent(new CustomEvent('backend-error', { detail: msg }));
  if (err) err(e);
};
// Reseñas y contactos se guardan como un documento por (usuario, trabajador): id = uid__tid.
// Así las reglas validan cada calificación y cada clic. Aquí se agrupan en la forma que espera la app.
const SEP = '__';
function agrupar(s, valor) {
  const m = {};
  s.docs.forEach((d) => { const x = d.data(); const autor = d.id.split(SEP)[0]; (m[autor] = m[autor] || { id: autor, items: {} }).items[x.tid] = valor(x); });
  return Object.values(m);
}

window.Backend = {
  mode: 'firebase',
  onSesion: (cb) => {
    onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try { await signInAnonymously(auth); } catch (e) { cb({ uid: null, canWrite: false }); }
        return;
      }
      uid = u.uid;
      let isAdmin = false;
      if (!u.isAnonymous) { try { isAdmin = (await getDoc(doc(db, 'admins', u.uid))).exists(); } catch (e) { isAdmin = false; } }
      cb({ uid: u.uid, isAdmin, canWrite: true, signedIn: true, anon: u.isAnonymous, email: u.email || '' });
    });
  },
  entrar: (e, p) => signInWithEmailAndPassword(auth, e, p),
  crearCuenta: (e, p) => createUserWithEmailAndPassword(auth, e, p),
  salir: () => signOut(auth),
  onTrabajadores: (me, cb, err) => onSnapshot(me.isAdmin ? collection(db, 'trabajadores') : query(collection(db, 'trabajadores'), where('estado', '==', 'aprobado')), (s) => cb(lista(s)), conAviso(err)),
  onResenas: (cb, err) => onSnapshot(collection(db, 'resenas'), (s) => cb(agrupar(s, (x) => ({ e: x.e, c: x.c, f: x.f }))), conAviso(err)),
  onContactos: (cb, err) => onSnapshot(collection(db, 'contactos'), (s) => cb(agrupar(s, (x) => x.n)), conAviso(err)),
  onReportes: (cb, err) => onSnapshot(collection(db, 'reportes'), (s) => cb(lista(s)), err),
  onMio: (u, cb, err) => onSnapshot(doc(db, 'trabajadores', u), (s) => cb(s.exists() ? Object.assign({ id: s.id }, s.data()) : null), err),
  getFotos: async (u) => { const s = await getDocs(collection(db, 'fotos', u, 'items')); const m = {}; s.forEach((d) => (m[d.id] = d.data().data)); return m; },
  subirFoto: async (u, data) => { const ref = doc(collection(db, 'fotos', u, 'items')); await setDoc(ref, { data, f: new Date().toISOString() }); return ref.id; },
  borrarFoto: (u, id) => deleteDoc(doc(db, 'fotos', u, 'items', id)),
  crearTrabajador: (id, datos) => setDoc(doc(db, 'trabajadores', id), datos),
  crearMio: (datos) => setDoc(doc(db, 'trabajadores', uid), datos),
  actualizarMio: (patch) => updateDoc(doc(db, 'trabajadores', uid), patch),
  actualizarTrabajador: (id, patch) => updateDoc(doc(db, 'trabajadores', id), patch),
  eliminarMio: async (fotos) => { for (const f of fotos) { try { await deleteDoc(doc(db, 'fotos', uid, 'items', f)); } catch (e) { } } await deleteDoc(doc(db, 'trabajadores', uid)); },
  eliminarTrabajador: async (id, fotos) => { for (const f of fotos) { try { await deleteDoc(doc(db, 'fotos', id, 'items', f)); } catch (e) { } } await deleteDoc(doc(db, 'trabajadores', id)); },
  guardarResena: (tid, val) => setDoc(doc(db, 'resenas', uid + SEP + tid), { autor: uid, tid, e: Math.round(Number(val.e)), c: String(val.c || '').slice(0, 280), f: val.f }),
  contar: (tid) => runTransaction(db, async (tx) => { const ref = doc(db, 'contactos', uid + SEP + tid); const s = await tx.get(ref); if (s.exists()) tx.update(ref, { n: s.data().n + 1 }); else tx.set(ref, { tid, n: 1 }); }),
  reportar: async (r) => { const cur = (await leer('reportes/' + uid)) || {}; const items = (cur.items || []).concat([r]).slice(-50); await setDoc(doc(db, 'reportes', uid), { items }); },
  resolverReporte: async (autor, i) => { const cur = (await leer('reportes/' + autor)) || {}; const items = (cur.items || []).slice(); if (items[i]) items[i] = Object.assign({}, items[i], { estado: 'resuelto' }); await setDoc(doc(db, 'reportes', autor), { items }); }
};
window.dispatchEvent(new Event('backend-ready'));
