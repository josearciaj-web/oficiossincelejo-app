/* Backend de demostración: datos de ejemplo en memoria, para el prototipo navegable. Nada se guarda al recargar. */
(function () {
  'use strict';
  const hoy = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const iso = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString(); };
  const PAL = { plomeria: ['#2B6CB0', '#DCEBFA'], electricidad: ['#B7791F', '#FDF0D2'], albanileria: ['#9C4221', '#F7E1D7'], pintura: ['#6B46C1', '#ECE4FB'], aseo: ['#2F855A', '#DDF3E6'], tecnico: ['#4A5568', '#E6E9EE'], carpinteria: ['#7B341E', '#F3E3D3'], cerrajeria: ['#2C5282', '#DDE6F5'] };
  function foto(oficio, texto) {
    const [a, b] = PAL[oficio] || ['#1D6A43', '#DCEFE3'];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="${b}"/><path d="M0 220 L300 160 L300 300 L0 300Z" fill="${a}" opacity=".25"/><circle cx="230" cy="80" r="40" fill="${a}" opacity=".35"/><text x="150" y="150" font-family="Arial" font-size="22" font-weight="700" fill="${a}" text-anchor="middle">${texto}</text><text x="150" y="182" font-family="Arial" font-size="14" fill="${a}" text-anchor="middle">Foto de ejemplo</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function avatar(nombre, oficio) {
    const [a] = PAL[oficio] || ['#1D6A43'];
    const ini = nombre.split(' ').slice(0, 2).map((p) => p[0]).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${a}"/><circle cx="50" cy="40" r="18" fill="#fff" opacity=".85"/><path d="M18 100c4-22 18-32 32-32s28 10 32 32z" fill="#fff" opacity=".85"/><text x="50" y="47" font-family="Arial" font-size="16" font-weight="700" fill="${a}" text-anchor="middle">${ini}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  const base = [
    ['w1', 'Rafael Montes Pérez', 'plomeria', '3004512876', 12, ['Venecia', 'Boston', 'La Ford', 'Majagual'], 'Arreglo fugas, destapo tuberías e instalo sanitarios y lavaplatos. Llevo mis herramientas.', 'aprobado', true, true, true, ['Baño instalado', 'Fuga reparada', 'Lavaplatos nuevo']],
    ['w2', 'Yuleidis Atencia Ruiz', 'aseo', '3127789045', 6, ['Toda la ciudad'], 'Aseo general de casas y apartamentos por días. Limpieza profunda de cocina y baños.', 'aprobado', true, false, true, ['Cocina limpia', 'Sala ordenada']],
    ['w3', 'Luis Alberto Vergara', 'electricidad', '3015566332', 15, ['Centro', 'San Carlos', 'Mochila', 'El Bosque'], 'Instalaciones eléctricas, tomas, breakers y lámparas. Revisión de cortos.', 'aprobado', true, true, false, ['Tablero nuevo', 'Lámparas LED', 'Tomas 220']],
    ['w4', 'Carmen Salgado Díaz', 'pintura', '3208891122', 8, ['Las Margaritas', 'Pioneros', 'Villa Paz'], 'Pintura de fachadas, interiores y rejas. Estuco y resanes.', 'aprobado', false, false, true, ['Fachada pintada', 'Habitación']],
    ['w5', 'Jhon Jairo Mercado', 'albanileria', '3045523190', 20, ['Toda la ciudad'], 'Pisos, enchapes, muros y remodelación de baños y cocinas.', 'aprobado', true, true, true, ['Enchape de baño', 'Piso cerámico', 'Muro levantado', 'Cocina']],
    ['w6', 'Andrés Payares Ortega', 'tecnico', '3112204578', 9, ['Boston', 'Venecia', 'Uribe Uribe'], 'Reparo neveras, lavadoras y aires acondicionados. Voy a domicilio.', 'aprobado', true, false, false, ['Nevera reparada', 'Aire acondicionado']],
    ['w7', 'Osvaldo Medina Pérez', 'carpinteria', '3157710042', 18, ['Centro', 'La Selva', 'Puerta Roja'], 'Puertas, closets y muebles a la medida. Arreglo de bisagras y chapas.', 'aprobado', true, false, false, ['Closet a la medida']],
    ['w8', 'Kevin Arrieta Rivera', 'electricidad', '3226654310', 3, ['Florencia', 'Las Delicias', 'El Cortijo'], 'Instalación de ventiladores, lámparas y tomas. Precios justos.', 'pendiente', true, false, false, ['Ventilador instalado']]
  ];
  const T = {}, F = {};
  base.forEach(([id, nombre, oficio, wa, exp, zonas, desc, estado, disp, ced, dest, fotos]) => {
    F[id] = {}; const ids = fotos.map((txt, i) => { const fid = id + 'f' + i; F[id][fid] = foto(oficio, txt); return fid; });
    T[id] = { id, nombre, oficio, whatsapp: wa, experiencia: exp, tarifa: ({ plomeria: 30000, electricidad: 35000, pintura: 40000, aseo: 60000, albanileria: 50000, tecnico: 30000, carpinteria: 40000, cerrajeria: 25000 })[oficio] || 30000, zonas, descripcion: desc, estado, disponible: disp, cedulaVerificada: ced, destacado: dest, destacadoHasta: dest ? hoy(18) : '', solicitudDestacado: id === 'w4', motivoRechazo: '', miniatura: avatar(nombre, oficio), fotos: ids, autorizacion: true, creado: iso(-30), actualizado: iso(-2) };
  });
  T.w2.destacado = false; T.w2.destacadoHasta = '';
  const R = {
    h1: { items: { w1: { e: 5, c: 'Llegó puntual y dejó todo limpio. Muy recomendado.', f: iso(-3) }, w3: { e: 5, c: 'Resolvió el corto en una hora.', f: iso(-9) }, w5: { e: 4, c: 'Buen trabajo en el baño, se demoró un día más.', f: iso(-12) } } },
    h2: { items: { w1: { e: 4, c: 'Buen precio.', f: iso(-6) }, w2: { e: 5, c: 'Muy juiciosa y de confianza.', f: iso(-4) }, w6: { e: 4, c: '', f: iso(-15) } } },
    h3: { items: { w5: { e: 5, c: 'Excelente enchape.', f: iso(-20) }, w4: { e: 3, c: 'Quedó bien pero tocó repasar una pared.', f: iso(-8) } } }
  };
  const C = { h1: { items: { w1: 3, w3: 2, w5: 1 } }, h2: { items: { w1: 2, w2: 4, w6: 1 } }, h3: { items: { w5: 2, w4: 1, w7: 1 } } };
  const RP = { h3: { items: [{ t: 'w7', m: 'No responde o no existe', d: 'Le escribí dos veces y no contestó.', f: iso(-1), estado: 'abierto' }] } };

  const ROLES = { hogar: { uid: 'hogar-demo', isAdmin: false }, trabajador: { uid: 'w1', isAdmin: false }, nuevo: { uid: 'nuevo-demo', isAdmin: false }, admin: { uid: 'admin-demo', isAdmin: true } };
  let rol = 'hogar', sesionCb = null;
  const subs = { t: new Set(), r: new Set(), c: new Set(), rp: new Set(), mio: new Set() };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const listT = () => Object.values(T).map(clone);
  const listMap = (M) => Object.keys(M).map((k) => Object.assign({ id: k }, clone(M[k])));
  function emit() {
    subs.t.forEach((cb) => cb(listT())); subs.r.forEach((cb) => cb(listMap(R))); subs.c.forEach((cb) => cb(listMap(C))); subs.rp.forEach((cb) => cb(listMap(RP)));
    subs.mio.forEach((x) => x.cb(T[x.u] ? clone(T[x.u]) : null));
  }
  const later = (fn) => new Promise((res) => setTimeout(() => { fn(); emit(); res(); }, 120));
  const sub = (set, cb, first) => { set.add(cb); setTimeout(() => cb(first()), 60); return () => set.delete(cb); };
  const me = () => { const r = ROLES[rol]; return { uid: r.uid, isAdmin: r.isAdmin, canWrite: true, signedIn: true, anon: false, email: '' }; };

  window.Backend = {
    mode: 'demo',
    rol: () => rol,
    setRol: (r) => { rol = r; if (sesionCb) sesionCb(me()); },
    onSesion: (cb) => { sesionCb = cb; setTimeout(() => cb(me()), 0); },
    onTrabajadores: (m, cb) => sub(subs.t, cb, listT),
    onResenas: (cb) => sub(subs.r, cb, () => listMap(R)),
    onContactos: (cb) => sub(subs.c, cb, () => listMap(C)),
    onReportes: (cb) => sub(subs.rp, cb, () => listMap(RP)),
    onMio: (u, cb) => { const x = { u, cb }; subs.mio.add(x); setTimeout(() => cb(T[u] ? clone(T[u]) : null), 60); return () => subs.mio.delete(x); },
    getFotos: async (u) => clone(F[u] || {}),
    subirFoto: async (u, data) => { const fid = 'f' + Math.random().toString(36).slice(2, 9); (F[u] = F[u] || {})[fid] = data; return fid; },
    borrarFoto: async (u, id) => { if (F[u]) delete F[u][id]; },
    crearTrabajador: (id, d) => later(() => { T[id] = Object.assign({ id }, clone(d)); }),
    crearMio: (d) => later(() => { const u = ROLES[rol].uid; T[u] = Object.assign({ id: u }, clone(d)); }),
    actualizarMio: (p) => later(() => { const u = ROLES[rol].uid; Object.assign(T[u], clone(p)); }),
    actualizarTrabajador: (id, p) => later(() => Object.assign(T[id], clone(p))),
    eliminarMio: () => later(() => { const u = ROLES[rol].uid; delete T[u]; delete F[u]; }),
    eliminarTrabajador: (id) => later(() => { delete T[id]; delete F[id]; }),
    guardarResena: (tid, v) => later(() => { const u = ROLES[rol].uid; (R[u] = R[u] || { items: {} }).items[tid] = clone(v); }),
    contar: (tid) => later(() => { const u = ROLES[rol].uid; const d = (C[u] = C[u] || { items: {} }); d.items[tid] = (d.items[tid] || 0) + 1; }),
    reportar: (r) => later(() => { const u = ROLES[rol].uid; (RP[u] = RP[u] || { items: [] }).items.push(clone(r)); }),
    resolverReporte: (a, i) => later(() => { if (RP[a] && RP[a].items[i]) RP[a].items[i].estado = 'resuelto'; })
  };
  window.dispatchEvent(new Event('backend-ready'));
})();
