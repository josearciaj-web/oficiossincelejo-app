// Pruebas de las reglas de seguridad de Firestore con el emulador de Firebase.
// Ejecutar: npm run test:reglas  (necesita Java 21; en GitHub Actions corre solo).
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';

let env;
const PASS = { firebase: { sign_in_provider: 'password' } };
const ANON = { firebase: { sign_in_provider: 'anonymous' } };
const db = (uid, tok = PASS) => (uid ? env.authenticatedContext(uid, tok) : env.unauthenticatedContext()).firestore();

const perfil = (extra = {}) => Object.assign({
  nombre: 'Rafael Montes', oficio: 'plomeria', whatsapp: '3004512876', experiencia: 12, zonas: ['Venecia'],
  descripcion: 'Plomería general', miniatura: '', fotos: [], estado: 'pendiente', disponible: true,
  destacado: false, destacadoHasta: '', cedulaVerificada: false, solicitudDestacado: false, motivoRechazo: '',
  autorizacion: true, fechaAutorizacion: '2026-11-17T00:00:00Z', creado: '2026-11-17T00:00:00Z'
}, extra);

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-oficios', firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') } });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const f = ctx.firestore();
    await setDoc(doc(f, 'admins/admin1'), { rol: 'admin' });
    await setDoc(doc(f, 'trabajadores/w1'), perfil({ estado: 'aprobado' }));
    await setDoc(doc(f, 'trabajadores/w2'), perfil({ nombre: 'Kevin', estado: 'pendiente' }));
    await setDoc(doc(f, 'reportes/hogar1'), { items: [{ tid: 'w1', motivo: 'Cobro abusivo' }] });
  });
});

// ---------- Perfiles ----------
test('Un visitante lee perfiles aprobados', () => assertSucceeds(getDoc(doc(db(null), 'trabajadores/w1'))));
test('Un visitante no lee perfiles pendientes', () => assertFails(getDoc(doc(db(null), 'trabajadores/w2'))));
test('La búsqueda pública filtrada por aprobados funciona', () => assertSucceeds(getDocs(query(collection(db('anon1', ANON), 'trabajadores'), where('estado', '==', 'aprobado')))));
test('La búsqueda pública sin filtro se rechaza', () => assertFails(getDocs(collection(db('anon1', ANON), 'trabajadores'))));
test('El administrador lista todos los perfiles', () => assertSucceeds(getDocs(collection(db('admin1'), 'trabajadores'))));
test('El trabajador crea su propio perfil pendiente', () => assertSucceeds(setDoc(doc(db('t9'), 'trabajadores/t9'), perfil())));
test('El trabajador no puede crearse aprobado', () => assertFails(setDoc(doc(db('t9'), 'trabajadores/t9'), perfil({ estado: 'aprobado' }))));
test('El trabajador no puede crearse con cédula verificada', () => assertFails(setDoc(doc(db('t9'), 'trabajadores/t9'), perfil({ cedulaVerificada: true }))));
test('Nadie crea el perfil de otra persona', () => assertFails(setDoc(doc(db('t9'), 'trabajadores/otro'), perfil())));
test('Una sesión anónima no crea perfiles', () => assertFails(setDoc(doc(db('t9', ANON), 'trabajadores/t9'), perfil())));
test('Se exige la autorización de datos', () => assertFails(setDoc(doc(db('t9'), 'trabajadores/t9'), perfil({ autorizacion: false }))));
test('Se rechaza un WhatsApp inválido', () => assertFails(setDoc(doc(db('t9'), 'trabajadores/t9'), perfil({ whatsapp: '12345' }))));
test('Se rechazan más de 6 fotos', () => assertFails(setDoc(doc(db('t9'), 'trabajadores/t9'), perfil({ fotos: ['1', '2', '3', '4', '5', '6', '7'] }))));
test('El trabajador cambia su disponibilidad', () => assertSucceeds(updateDoc(doc(db('w1'), 'trabajadores/w1'), { disponible: false })));
test('El trabajador no puede aprobarse a sí mismo', () => assertFails(updateDoc(doc(db('w2'), 'trabajadores/w2'), { estado: 'aprobado' })));
test('El trabajador no puede destacarse a sí mismo', () => assertFails(updateDoc(doc(db('w1'), 'trabajadores/w1'), { destacado: true })));
test('El administrador aprueba perfiles', () => assertSucceeds(updateDoc(doc(db('admin1'), 'trabajadores/w2'), { estado: 'aprobado' })));
test('El administrador hace el registro asistido', () => assertSucceeds(setDoc(doc(db('admin1'), 'trabajadores/ra-abc123'), perfil({ estado: 'aprobado', cedulaVerificada: true, registroAsistido: true }))));
test('Un usuario común no hace registro asistido', () => assertFails(setDoc(doc(db('t9'), 'trabajadores/ra-abc123'), perfil())));
test('El titular elimina su perfil', () => assertSucceeds(deleteDoc(doc(db('w1'), 'trabajadores/w1'))));
test('Otro usuario no elimina el perfil', () => assertFails(deleteDoc(doc(db('t9'), 'trabajadores/w1'))));

// ---------- Fotos ----------
test('El titular sube una foto', () => assertSucceeds(setDoc(doc(db('w1'), 'fotos/w1/items/f1'), { data: 'data:image/jpeg;base64,AAAA', f: 'x' })));
test('Se rechaza una foto de más de 250 KB', () => assertFails(setDoc(doc(db('w1'), 'fotos/w1/items/f1'), { data: 'x'.repeat(260000), f: 'x' })));
test('Nadie sube fotos al perfil de otro', () => assertFails(setDoc(doc(db('t9'), 'fotos/w1/items/f1'), { data: 'x', f: 'x' })));

// ---------- Calificaciones ----------
const resena = (uid, e = 4) => ({ autor: uid, tid: 'w1', e, c: 'Puntual', f: '2026-11-17' });
test('Un usuario registrado califica con 4 estrellas', () => assertSucceeds(setDoc(doc(db('h1'), 'resenas/h1__w1'), resena('h1'))));
test('Se rechaza una calificación de 7 estrellas', () => assertFails(setDoc(doc(db('h1'), 'resenas/h1__w1'), resena('h1', 7))));
test('Se rechaza una calificación de 0 estrellas', () => assertFails(setDoc(doc(db('h1'), 'resenas/h1__w1'), resena('h1', 0))));
test('Nadie califica en nombre de otro', () => assertFails(setDoc(doc(db('h1'), 'resenas/h2__w1'), resena('h2'))));
test('Una sesión anónima no califica', () => assertFails(setDoc(doc(db('h1', ANON), 'resenas/h1__w1'), resena('h1'))));

// ---------- Contactos por WhatsApp ----------
test('Un contacto nuevo empieza en 1', () => assertSucceeds(setDoc(doc(db('a1', ANON), 'contactos/a1__w1'), { tid: 'w1', n: 1 })));
test('No se puede crear un contacto en 50', () => assertFails(setDoc(doc(db('a1', ANON), 'contactos/a1__w1'), { tid: 'w1', n: 50 })));
test('El contador sube de 1 en 1', async () => {
  await assertSucceeds(setDoc(doc(db('a1', ANON), 'contactos/a1__w1'), { tid: 'w1', n: 1 }));
  await assertSucceeds(updateDoc(doc(db('a1', ANON), 'contactos/a1__w1'), { n: 2 }));
  await assertFails(updateDoc(doc(db('a1', ANON), 'contactos/a1__w1'), { n: 12 }));
});
test('Nadie suma contactos con el id de otra sesión', () => assertFails(setDoc(doc(db('a1', ANON), 'contactos/a2__w1'), { tid: 'w1', n: 1 })));

// ---------- Reportes y administradores ----------
test('El autor lee su reporte', () => assertSucceeds(getDoc(doc(db('hogar1'), 'reportes/hogar1'))));
test('Otro usuario no lee reportes ajenos', () => assertFails(getDoc(doc(db('t9'), 'reportes/hogar1'))));
test('El administrador lee los reportes', () => assertSucceeds(getDocs(collection(db('admin1'), 'reportes'))));
test('El correo administrador aprueba perfiles', () => assertSucceeds(updateDoc(doc(env.authenticatedContext('jose1', { email: 'Jose.Arciaj@cecar.edu.co', firebase: { sign_in_provider: 'password' } }).firestore(), 'trabajadores/w2'), { estado: 'aprobado' })));
test('Otro correo no es administrador', () => assertFails(updateDoc(doc(env.authenticatedContext('otro1', { email: 'otro@gmail.com', firebase: { sign_in_provider: 'password' } }).firestore(), 'trabajadores/w2'), { estado: 'aprobado' })));
test('Nadie se nombra administrador desde la app', () => assertFails(setDoc(doc(db('t9'), 'admins/t9'), { rol: 'admin' })));
