/* OficiosSincelejo: interfaz y lógica. Los datos pasan por window.Backend (claude, firebase o demo). */
(function () {
  'use strict';

  // ---------- Catálogos ----------
  const OFICIOS = [
    { id: 'plomeria', n: 'Plomería' },
    { id: 'electricidad', n: 'Electricidad' },
    { id: 'albanileria', n: 'Albañilería' },
    { id: 'pintura', n: 'Pintura' },
    { id: 'aseo', n: 'Aseo del hogar' },
    { id: 'tecnico', n: 'Técnico de electrodomésticos' },
    { id: 'carpinteria', n: 'Carpintería' },
    { id: 'cerrajeria', n: 'Cerrajería' },
    { id: 'refrigeracion', n: 'Refrigeración y aires' },
    { id: 'soldadura', n: 'Soldadura y ornamentación' },
    { id: 'techos', n: 'Techos e impermeabilización' },
    { id: 'jardineria', n: 'Jardinería' },
    { id: 'mecanica', n: 'Mecánica de motos' },
    { id: 'modisteria', n: 'Modistería y costura' },
    { id: 'cuidado', n: 'Cuidado de niños y mayores' },
    { id: 'fumigacion', n: 'Fumigación' },
    { id: 'mudanzas', n: 'Acarreos y mudanzas' },
    // Para agregar un oficio: copia una línea de arriba, cambia id (sin tildes ni espacios) y n (nombre visible).
    // Deja "Otro oficio" siempre de último.
    { id: 'otro', n: 'Otro oficio' }
  ];
  const BARRIOS = ['Toda la ciudad', 'Centro', 'Majagual', 'Boston', 'Venecia', 'La Ford', 'San Carlos', 'Mochila', 'El Bosque', 'La Selva',
    'Las Margaritas', 'Pioneros', 'Villa Paz', 'Uribe Uribe', 'Puerta Roja', 'Florencia', 'Las Delicias', 'El Cortijo', 'Altos del Rosario', 'Villa Orieta'];
  const PRECIO_DESTACADO = 15000;
  const DIAS_DESTACADO = 30;
  const MAX_FOTOS = 6;
  const META_TRABAJADORES = 15, META_CONTACTOS = 30;
  const MOTIVOS = ['Información falsa', 'No responde o no existe', 'Cobro abusivo', 'Mal trato o inseguridad', 'Otro'];

  const ICONS = {
    plomeria: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    electricidad: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    albanileria: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9.3h18M3 14.7h18M9 4v5.3M15 9.3v5.4M9 14.7V20"/>',
    pintura: '<rect x="3" y="3" width="14" height="6" rx="1"/><path d="M17 6h3v6h-8v3"/><rect x="10.5" y="15" width="3" height="6" rx="1"/>',
    aseo: '<path d="M12 3v8"/><path d="M7 21l1.5-10h7L17 21z"/><path d="M10 15v6M14 15v6"/>',
    tecnico: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 9h14M8 5v2M8 12v4"/>',
    carpinteria: '<path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7L3 15l3 3 8-8"/>',
    cerrajeria: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    refrigeracion: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9 4l3 2 3-2M9 20l3-2 3 2"/>',
    soldadura: '<path d="M4 20l7-7"/><path d="M11 13l3-3 4 4-3 3z"/><path d="M7 5v3M4 8h3M10 6l2-2"/>',
    techos: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    jardineria: '<path d="M5 21c0-9 6-15 15-16-1 9-7 15-15 16z"/><path d="M5 21l8-8"/>',
    mecanica: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    modisteria: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.1 8.1 20 20M8.1 15.9 20 4"/>',
    cuidado: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',
    fumigacion: '<rect x="7" y="10" width="9" height="12" rx="2"/><path d="M9.5 10V6h4v4M13.5 7H17M20 4v1M20 8v1M18.5 6h3"/>',
    mudanzas: '<rect x="2" y="6" width="12" height="10"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    otro: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    yo: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    admin: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z"/>',
    back: '<path d="M15 5l-7 7 7 7"/>'
  };
  const icon = (k, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ICONS.otro}</svg>`;

  // ---------- Utilidades ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const oficioN = (id) => (OFICIOS.find((o) => o.id === id) || OFICIOS[OFICIOS.length - 1]).n;
  const cop = (n) => '$' + Math.round(n).toLocaleString('es-CO');
  const hoyISO = () => new Date().toISOString().slice(0, 10);
  const fechaCorta = (iso) => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const masDias = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const destacadoActivo = (t) => !!(t && t.destacado && t.destacadoHasta && t.destacadoHasta >= hoyISO());
  const avatarFallback = (nombre) => {
    const ini = String(nombre || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1D6A43"/><text x="50" y="62" font-family="Arial" font-size="38" font-weight="700" fill="#F3B416" text-anchor="middle">${ini.replace(/[<&>]/g, '')}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };
  const fotoPerfil = (t) => (t && t.miniatura) || avatarFallback(t && t.nombre);
  const waNumero = (n) => String(n || '').replace(/\D/g, '');
  const waLink = (t) => {
    const msg = `Hola ${t.nombre.split(' ')[0]}, te encontré en OficiosSincelejo. Necesito un servicio de ${oficioN(t.oficio).toLowerCase()}. ¿Tienes disponibilidad?`;
    return `https://wa.me/57${waNumero(t.whatsapp)}?text=${encodeURIComponent(msg)}`;
  };
  function toast(msg) {
    const old = $('.toast'); if (old) old.remove();
    const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = msg;
    document.body.appendChild(d); setTimeout(() => d.remove(), 3200);
  }
  function stars(avg, n) {
    if (!n) return '<span class="small muted">Sin calificaciones</span>';
    const full = Math.round(avg);
    let s = '<span class="stars" aria-label="' + avg.toFixed(1) + ' de 5">';
    for (let i = 1; i <= 5; i++) s += i <= full ? '★' : '<span class="off">★</span>';
    return s + '</span> <span class="small muted">' + avg.toFixed(1) + ' (' + n + ')</span>';
  }
  function errMsg(e) {
    const c = e && (e.code || e.message || '');
    if (/quota/.test(c)) return 'Se llenó el espacio de la base de datos. Avisa al administrador.';
    if (/invalid_argument|permission|denied|not_writer|not_granted/.test(c)) return 'No tienes permiso para guardar esto. Revisa que hayas iniciado sesión.';
    if (/network|unavailable/.test(c)) return 'No hay conexión. Intenta de nuevo en un momento.';
    return 'No se pudo guardar. Intenta de nuevo.';
  }

  // Comprime una imagen a JPEG dentro de un límite de caracteres (data URL).
  function comprimir(file, maxLado, limite) {
    return new Promise((resolve, reject) => {
      if (!/^image\//.test(file.type)) return reject(new Error('tipo'));
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('lectura'));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('imagen'));
        img.onload = () => {
          let lado = maxLado, q = 0.78, out = '';
          for (let i = 0; i < 8; i++) {
            const k = Math.min(1, lado / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
            const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
            out = c.toDataURL('image/jpeg', q);
            if (out.length <= limite) return resolve(out);
            q = Math.max(0.45, q - 0.1); if (q <= 0.45) lado = Math.round(lado * 0.8);
          }
          resolve(out);
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  // ---------- Estado ----------
  const B = () => window.Backend;
  const S = {
    me: { uid: null, isAdmin: false, canWrite: false, signedIn: false, anon: true, email: '' },
    loaded: false,
    trabajadores: [], resenas: [], contactos: [], reportes: [],
    miPerfil: undefined,
    view: 'buscar', perfilId: null, adminTab: 'pendientes',
    f: { q: '', oficio: '', barrio: 'Toda la ciudad', disp: false, ver: false },
    editando: false, fotosCache: {}, contactados: new Set(), confirm: null,
    authModo: 'entrar'
  };
  let unsubs = [];

  const publicos = () => S.trabajadores.filter((t) => t.estado === 'aprobado');
  const porId = (id) => S.trabajadores.find((t) => t.id === id) || (S.miPerfil && S.miPerfil.id === id ? S.miPerfil : null);
  function resenasDe(tid) {
    const out = [];
    for (const d of S.resenas) { const it = d.items && d.items[tid]; if (it && it.e) out.push({ autor: d.id, e: it.e, c: it.c || '', f: it.f }); }
    return out.sort((a, b) => String(b.f).localeCompare(String(a.f)));
  }
  function rating(tid) { const r = resenasDe(tid); const n = r.length; return { n, avg: n ? r.reduce((s, x) => s + x.e, 0) / n : 0 }; }
  function contactosDe(tid) { let n = 0; for (const d of S.contactos) n += (d.items && d.items[tid]) || 0; return n; }
  const miResena = (tid) => { const d = S.resenas.find((x) => x.id === S.me.uid); return d && d.items && d.items[tid]; };

  // ---------- Esqueleto ----------
  function shell() {
    const app = $('#app');
    const demo = B().mode === 'demo';
    app.innerHTML = `
      <header class="top"><div class="wrap">
        <button class="logo" id="go-home" aria-label="Ir al inicio">OficiosSincelejo <span class="tag">Sucre</span></button>
        <div class="who small" id="who"></div>
      </div></header>
      ${demo ? `<div class="demo"><div class="wrap"><strong>${window.__SIN_CONFIG ? 'Modo demostración: falta conectar Firebase. Los datos son de ejemplo y no se guardan.' : 'Prototipo con datos de ejemplo.'}</strong>
        <span>Ver como:</span>
        <select id="demo-rol" aria-label="Ver como" style="width:auto;min-height:36px;padding:4px 8px">
          <option value="hogar">Hogar</option><option value="trabajador">Trabajador registrado</option><option value="nuevo">Trabajador nuevo</option><option value="admin">Administrador</option>
        </select></div></div>` : ''}
      <main class="wrap" id="view" tabindex="-1"></main>
      <nav class="nav" aria-label="Secciones"><div class="wrap" id="navbar"></div></nav>`;
    $('#go-home').onclick = () => go('buscar');
    if (demo) { const sel = $('#demo-rol'); sel.value = B().rol(); sel.onchange = () => B().setRol(sel.value); }
  }
  function renderNav() {
    const items = [['buscar', 'Buscar', 'buscar'], ['trabajador', 'Soy trabajador', 'yo']];
    if (S.me.isAdmin) items.push(['admin', 'Administrar', 'admin']);
    $('#navbar').innerHTML = items.map(([v, n, i]) => `<button data-go="${v}" ${S.view === v || (v === 'buscar' && S.view === 'perfil') ? 'aria-current="page"' : ''}>${icon(i)}<span>${n}</span></button>`).join('');
    $('#navbar').querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => go(b.dataset.go)));
    const who = $('#who');
    if (B().mode === 'firebase') who.textContent = S.me.signedIn && !S.me.anon ? S.me.email + (S.me.isAdmin ? ' · Admin' : '') : 'Visitante';
    else if (B().mode === 'claude') who.textContent = S.me.isAdmin ? 'Administrador' : (S.me.uid ? 'Sesión activa' : 'Visitante');
    else who.textContent = '';
  }
  function go(view, extra) {
    if (view === 'perfil') S.perfilId = extra;
    if (view !== 'trabajador') S.editando = false;
    S.view = view; S.confirm = null;
    renderNav(); render();
    const v = $('#view'); window.scrollTo(0, 0); v.focus({ preventScroll: true });
  }
  function render() {
    if (!S.loaded) { $('#view').innerHTML = '<div class="empty"><h3>Cargando trabajadores…</h3></div>'; return; }
    if (S.view === 'buscar') return renderBuscar();
    if (S.view === 'perfil') return renderPerfil();
    if (S.view === 'trabajador') return renderTrabajador();
    if (S.view === 'admin') return S.me.isAdmin ? renderAdmin() : go('buscar');
    if (S.view === 'privacidad') return renderPrivacidad();
  }
  // Datos nuevos: refresca sin borrar lo que la persona está escribiendo.
  function refresh() {
    renderNav();
    if (!S.loaded) return;
    if (S.view === 'buscar') { if ($('#resultados')) return renderResultados(); return renderBuscar(); }
    if (S.view === 'perfil') return renderPerfilDatos();
    if (S.view === 'trabajador' && !S.editando) return renderTrabajador();
    if (S.view === 'admin') return renderAdminBody();
  }

  // ---------- Buscar (hogares) ----------
  function renderBuscar() {
    const v = $('#view');
    v.innerHTML = `
      <div class="stack">
        <div><h1>Encuentra un trabajador de confianza en Sincelejo</h1>
        <p class="muted small" style="margin:6px 0 0">Busca por oficio y barrio. Escríbele directo por WhatsApp, sin comisiones.</p></div>
        <div class="searchbar">${icon('buscar')}<input type="search" id="q" placeholder="Ej: plomero, fuga, pintura de fachada" value="${esc(S.f.q)}" aria-label="Buscar"></div>
        <div class="chips" role="group" aria-label="Oficio">
          <button class="chip" data-of="" aria-pressed="${!S.f.oficio}">Todos</button>
          ${OFICIOS.map((o) => `<button class="chip" data-of="${o.id}" aria-pressed="${S.f.oficio === o.id}">${icon(o.id)}${o.n}</button>`).join('')}
        </div>
        <div class="filters">
          <select id="barrio" aria-label="Barrio">${BARRIOS.map((b) => `<option ${b === S.f.barrio ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>
        </div>
        <div class="toggles">
          <label><input type="checkbox" id="disp" ${S.f.disp ? 'checked' : ''}> Solo disponibles</label>
          <label><input type="checkbox" id="ver" ${S.f.ver ? 'checked' : ''}> Solo con cédula verificada</label>
        </div>
        <div id="resultados" aria-live="polite"></div>
      </div>`;
    $('#q').oninput = (e) => { S.f.q = e.target.value; renderResultados(); };
    v.querySelectorAll('[data-of]').forEach((b) => (b.onclick = () => {
      S.f.oficio = b.dataset.of; v.querySelectorAll('[data-of]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.of === S.f.oficio))); renderResultados();
    }));
    $('#barrio').onchange = (e) => { S.f.barrio = e.target.value; renderResultados(); };
    $('#disp').onchange = (e) => { S.f.disp = e.target.checked; renderResultados(); };
    $('#ver').onchange = (e) => { S.f.ver = e.target.checked; renderResultados(); };
    renderResultados();
  }
  function filtrar() {
    const q = norm(S.f.q).trim();
    let r = publicos().filter((t) => {
      if (S.f.oficio && t.oficio !== S.f.oficio) return false;
      if (S.f.barrio !== 'Toda la ciudad') { const z = t.zonas || []; if (!z.includes(S.f.barrio) && !z.includes('Toda la ciudad')) return false; }
      if (S.f.disp && !t.disponible) return false;
      if (S.f.ver && !t.cedulaVerificada) return false;
      if (q) { const txt = norm([t.nombre, oficioN(t.oficio), t.descripcion, (t.zonas || []).join(' ')].join(' ')); if (!q.split(/\s+/).every((p) => txt.includes(p))) return false; }
      return true;
    });
    return r.map((t) => ({ t, r: rating(t.id), d: destacadoActivo(t) }))
      .sort((a, b) => (b.d - a.d) || ((b.t.disponible ? 1 : 0) - (a.t.disponible ? 1 : 0)) || (b.r.avg - a.r.avg) || (b.r.n - a.r.n) || a.t.nombre.localeCompare(b.t.nombre));
  }
  function tarjeta({ t, r, d }) {
    return `<button class="w ${d ? 'dest' : ''}" data-perfil="${esc(t.id)}">
      <img class="av" src="${esc(fotoPerfil(t))}" alt="">
      <span class="meta">
        <span class="row" style="gap:6px">${d ? '<span class="badge b-sun">Destacado</span>' : ''}${t.cedulaVerificada ? '<span class="badge b-ok">Cédula verificada</span>' : ''}</span>
        <span class="name">${esc(t.nombre)}</span>
        <span class="oficio">${icon(t.oficio)}${esc(oficioN(t.oficio))}</span>
        <span>${stars(r.avg, r.n)}</span>
        <span class="small muted">${t.disponible ? '<span class="dot" style="background:var(--brand)"></span> Disponible' : '<span class="dot" style="background:var(--muted)"></span> No disponible ahora'} · ${esc(t.experiencia || 0)} años · ${esc((t.zonas || []).slice(0, 3).join(', '))}${(t.zonas || []).length > 3 ? '…' : ''}</span>
      </span></button>`;
  }
  function renderResultados() {
    const box = $('#resultados'); if (!box) return;
    const res = filtrar();
    if (!publicos().length) {
      box.innerHTML = `<div class="card empty"><h3>Todavía no hay trabajadores publicados</h3><p>Cuando un trabajador se registre y el equipo apruebe su perfil, aparecerá aquí. ¿Eres plomero, electricista u otro oficio? Regístrate en <strong>Soy trabajador</strong>.</p><button class="btn primary" data-go2="trabajador">Registrar mi oficio</button></div>`;
    } else if (!res.length) {
      box.innerHTML = `<div class="card empty"><h3>No encontramos trabajadores con esos filtros</h3><p>Prueba con otro barrio o quita "Solo disponibles".</p></div>`;
    } else {
      box.innerHTML = `<p class="small muted" style="margin:0 0 8px">${res.length} ${res.length === 1 ? 'trabajador' : 'trabajadores'}</p><div class="list">${res.map(tarjeta).join('')}</div>`;
    }
    box.querySelectorAll('[data-perfil]').forEach((b) => (b.onclick = () => go('perfil', b.dataset.perfil)));
    box.querySelectorAll('[data-go2]').forEach((b) => (b.onclick = () => go(b.dataset.go2)));
  }

  // ---------- Perfil público ----------
  function renderPerfil() {
    const v = $('#view');
    v.innerHTML = `<div class="stack">
      <button class="btn sm" id="volver" style="width:max-content">${icon('back')} Volver</button>
      <div id="perfil-datos" class="stack"></div>
      <div id="perfil-form" class="stack"></div>
    </div>`;
    $('#volver').onclick = () => go('buscar');
    renderPerfilDatos(); renderPerfilForm();
  }
  function renderPerfilDatos() {
    const box = $('#perfil-datos'); if (!box) return;
    const t = porId(S.perfilId);
    if (!t || (t.estado !== 'aprobado' && !S.me.isAdmin && t.id !== S.me.uid)) {
      box.innerHTML = '<div class="card empty"><h3>Este perfil no está disponible</h3><p>Puede estar en revisión o desactivado.</p></div>';
      const f = $('#perfil-form'); if (f) f.innerHTML = ''; return;
    }
    const r = rating(t.id), d = destacadoActivo(t), rs = resenasDe(t.id);
    box.innerHTML = `
      ${t.estado !== 'aprobado' ? `<div class="banner warn">Vista previa: este perfil está <strong>${esc(t.estado)}</strong> y los hogares todavía no lo ven.</div>` : ''}
      <div class="card stack">
        <div class="row" style="align-items:flex-start;gap:16px;flex-wrap:nowrap">
          <img class="av lg" src="${esc(fotoPerfil(t))}" alt="Foto de ${esc(t.nombre)}">
          <div class="stack" style="gap:6px;min-width:0">
            <div class="row" style="gap:6px">${d ? '<span class="badge b-sun">Destacado</span>' : ''}${t.cedulaVerificada ? '<span class="badge b-ok">Cédula verificada</span>' : '<span class="badge b-muted">Cédula sin verificar</span>'}</div>
            <h1 style="font-size:1.4rem">${esc(t.nombre)}</h1>
            <span class="oficio">${icon(t.oficio)}${esc(oficioN(t.oficio))}</span>
            <div>${stars(r.avg, r.n)}</div>
          </div>
        </div>
        <dl class="kv">
          <dt>Disponibilidad</dt><dd>${t.disponible ? '<strong style="color:var(--brand)">Disponible</strong>' : 'No disponible ahora'}</dd>
          <dt>Experiencia</dt><dd>${esc(t.experiencia || 0)} años</dd>
          <dt>Atiende en</dt><dd>${esc((t.zonas || []).join(', ') || 'Sin zonas')}</dd>
        </dl>
        ${t.descripcion ? `<p style="margin:0">${esc(t.descripcion)}</p>` : ''}
        <a class="btn primary big" id="wa" href="${esc(waLink(t))}" target="_blank" rel="noopener">${icon('wa')} Escribir por WhatsApp</a>
        <div class="row small muted" style="justify-content:center">WhatsApp: <span class="phone">${esc(waNumero(t.whatsapp))}</span>
          <button class="btn sm" id="copiar">Copiar número</button></div>
      </div>
      <div class="card stack"><h2>Trabajos realizados</h2><div id="galeria" class="gallery"><p class="small muted">Cargando fotos…</p></div></div>
      <div class="card stack"><h2>Calificaciones de vecinos</h2>
        ${rs.length ? rs.map((x) => `<div class="rev"><div>${stars(x.e, 1).replace(/ <span class="small muted">.*<\/span>$/, '')} <span class="small muted">${esc(fechaCorta(x.f))}</span></div>${x.c ? `<p style="margin:4px 0 0">${esc(x.c)}</p>` : ''}</div>`).join('') : '<p class="muted" style="margin:0">Todavía nadie ha calificado a este trabajador.</p>'}
      </div>`;
    $('#wa').onclick = () => registrarContacto(t.id);
    $('#copiar').onclick = async () => {
      try { await navigator.clipboard.writeText(waNumero(t.whatsapp)); toast('Número copiado'); }
      catch (e) { const s = window.getSelection(); const rg = document.createRange(); rg.selectNodeContents($('.phone')); s.removeAllRanges(); s.addRange(rg); toast('Número seleccionado: cópialo'); }
    };
    cargarGaleria(t);
  }
  async function cargarGaleria(t) {
    const g = $('#galeria'); if (!g) return;
    const ids = t.fotos || [];
    if (!ids.length) { g.innerHTML = '<p class="small muted" style="grid-column:1/-1;margin:0">Este trabajador no ha subido fotos de trabajos.</p>'; return; }
    try {
      const fotos = await obtenerFotos(t.id);
      const lista = ids.map((id) => fotos[id]).filter(Boolean);
      if (!$('#galeria')) return;
      $('#galeria').innerHTML = lista.length ? lista.map((src, i) => `<img src="${esc(src)}" alt="Trabajo ${i + 1} de ${esc(t.nombre)}" loading="lazy">`).join('') : '<p class="small muted" style="grid-column:1/-1;margin:0">No se pudieron cargar las fotos.</p>';
    } catch (e) { if ($('#galeria')) $('#galeria').innerHTML = '<p class="small muted" style="grid-column:1/-1;margin:0">No se pudieron cargar las fotos.</p>'; }
  }
  async function obtenerFotos(uid, fresh) {
    if (!fresh && S.fotosCache[uid]) return S.fotosCache[uid];
    const m = await B().getFotos(uid); S.fotosCache[uid] = m; return m;
  }
  async function registrarContacto(tid) {
    if (S.contactados.has(tid) || !S.me.canWrite || !S.me.uid) return;
    S.contactados.add(tid);
    try { await B().contar(tid); } catch (e) { /* el conteo es opcional */ }
  }
  function renderPerfilForm() {
    const box = $('#perfil-form'); if (!box) return;
    const t = porId(S.perfilId);
    if (!t || t.estado !== 'aprobado') { box.innerHTML = ''; return; }
    const puede = S.me.canWrite && S.me.uid && !S.me.anon && t.id !== S.me.uid;
    const mia = miResena(t.id);
    let html = `<div class="card stack"><h2>Califica a ${esc(t.nombre.split(' ')[0])}</h2>`;
    if (t.id === S.me.uid) html += '<p class="muted" style="margin:0">No puedes calificar tu propio perfil.</p>';
    else if (!puede) html += `<p class="muted" style="margin:0">${B().mode === 'firebase' ? 'Inicia sesión en <strong>Soy trabajador</strong> (también sirve para hogares) para calificar y reportar perfiles.' : 'Para calificar necesitas una sesión con permiso de escritura.'}</p>`;
    else {
      let sel = mia ? mia.e : 0;
      html += `<div class="starpick" role="radiogroup" aria-label="Calificación">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-st="${i}" role="radio" aria-checked="${i === sel}" aria-label="${i} estrellas" class="${i <= sel ? 'on' : ''}">★</button>`).join('')}</div>
        <label class="f">Comentario (opcional)<textarea id="rv-c" maxlength="280" placeholder="¿Cómo te fue con el trabajo?">${esc(mia ? mia.c : '')}</textarea></label>
        <p class="err" id="rv-err" hidden></p>
        <button class="btn primary" id="rv-ok">${mia ? 'Actualizar calificación' : 'Publicar calificación'}</button>`;
      html += '</div>';
      html += `<div class="card stack"><h3>¿Algo anda mal con este perfil?</h3><div id="rep-box"><button class="btn danger sm" id="rep-open">Reportar perfil</button></div></div>`;
      box.innerHTML = html;
      box.querySelectorAll('[data-st]').forEach((b) => (b.onclick = () => {
        sel = +b.dataset.st; box.querySelectorAll('[data-st]').forEach((x) => { const i = +x.dataset.st; x.classList.toggle('on', i <= sel); x.setAttribute('aria-checked', String(i === sel)); });
      }));
      $('#rv-ok').onclick = async () => {
        const er = $('#rv-err');
        if (!sel) { er.textContent = 'Elige de 1 a 5 estrellas.'; er.hidden = false; return; }
        er.hidden = true; $('#rv-ok').disabled = true;
        try { await B().guardarResena(t.id, { e: sel, c: $('#rv-c').value.trim().slice(0, 280), f: new Date().toISOString() }); toast('Calificación publicada'); }
        catch (e) { er.textContent = errMsg(e); er.hidden = false; }
        $('#rv-ok').disabled = false;
      };
      $('#rep-open').onclick = () => {
        $('#rep-box').innerHTML = `<div class="stack"><label class="f">Motivo<select id="rep-m">${MOTIVOS.map((m) => `<option>${m}</option>`).join('')}</select></label>
          <label class="f">Cuéntanos qué pasó<textarea id="rep-d" maxlength="400"></textarea></label><p class="err" id="rep-err" hidden></p>
          <div class="row"><button class="btn danger" id="rep-ok">Enviar reporte</button><button class="btn" id="rep-x">Cancelar</button></div></div>`;
        $('#rep-x').onclick = () => renderPerfilForm();
        $('#rep-ok').onclick = async () => {
          $('#rep-ok').disabled = true;
          try { await B().reportar({ t: t.id, m: $('#rep-m').value, d: $('#rep-d').value.trim().slice(0, 400), f: new Date().toISOString(), estado: 'abierto' }); $('#rep-box').innerHTML = '<div class="banner ok">Recibimos tu reporte. El equipo lo revisará.</div>'; }
          catch (e) { const er = $('#rep-err'); er.textContent = errMsg(e); er.hidden = false; $('#rep-ok').disabled = false; }
        };
      };
      return;
    }
    html += '</div>';
    box.innerHTML = html;
  }

  // ---------- Panel del trabajador ----------
  function renderTrabajador() {
    const v = $('#view');
    if (B().mode === 'firebase' && (!S.me.signedIn || S.me.anon)) return renderAuth();
    if (!S.me.uid) {
      v.innerHTML = `<div class="card empty"><h3>Necesitas una sesión para registrarte</h3><p>Abre esta página con tu cuenta para crear tu perfil de trabajador.</p></div>`; return;
    }
    if (S.miPerfil === undefined) { v.innerHTML = '<div class="empty"><h3>Cargando tu perfil…</h3></div>'; return; }
    if (!S.miPerfil && !S.me.canWrite) { v.innerHTML = `<div class="card empty"><h3>Tu acceso a esta página es solo de lectura</h3><p>Para registrar tu oficio, pide al equipo de OficiosSincelejo que te dé acceso de colaborador.</p></div>`; return; }
    if (!S.miPerfil || S.editando) return renderFormulario();
    const t = S.miPerfil, r = rating(t.id), d = destacadoActivo(t), c = contactosDe(t.id);
    const estado = {
      pendiente: ['warn', 'Tu perfil está en revisión. El equipo lo aprueba en máximo 2 días hábiles.'],
      aprobado: ['ok', 'Tu perfil está publicado. Los hogares de Sincelejo ya te pueden encontrar.'],
      inactivo: ['danger', 'Tu perfil está desactivado. Escribe al equipo de OficiosSincelejo para revisarlo.'],
      rechazado: ['danger', 'Tu perfil no fue aprobado' + (t.motivoRechazo ? ': ' + t.motivoRechazo : '.') + ' Corrige los datos y vuelve a enviarlo.']
    }[t.estado] || ['info', ''];
    v.innerHTML = `<div class="stack">
      <h1>Hola, ${esc(t.nombre.split(' ')[0])}</h1>
      <div class="banner ${estado[0]}">${esc(estado[1])}</div>
      <div class="card stack">
        <div class="row" style="justify-content:space-between">
          <div><h2>¿Estás disponible para trabajar?</h2><p class="small muted" style="margin:4px 0 0">Los hogares ven primero a los trabajadores disponibles.</p></div>
          <button class="btn ${t.disponible ? 'primary' : ''}" id="disp-t" aria-pressed="${!!t.disponible}">${t.disponible ? 'Sí, disponible' : 'No disponible'}</button>
        </div>
      </div>
      <div class="kpis">
        <div class="kpi"><div class="small muted">Contactos por WhatsApp</div><div class="n">${c}</div></div>
        <div class="kpi"><div class="small muted">Calificación</div><div class="n">${r.n ? r.avg.toFixed(1) : '–'}</div><div class="small muted">${r.n} ${r.n === 1 ? 'reseña' : 'reseñas'}</div></div>
        <div class="kpi"><div class="small muted">Fotos de trabajos</div><div class="n">${(t.fotos || []).length}/${MAX_FOTOS}</div></div>
        <div class="kpi"><div class="small muted">Cédula</div><div class="n" style="font-size:1.1rem">${t.cedulaVerificada ? 'Verificada' : 'Sin verificar'}</div></div>
      </div>
      <div class="card stack">
        <h2>Perfil destacado</h2>
        ${d ? `<div class="banner ok">Tu perfil aparece de primero en tu oficio hasta el <strong>${esc(fechaCorta(t.destacadoHasta))}</strong>.</div>`
            : `<p style="margin:0">Aparece de primero cuando un hogar busca ${esc(oficioN(t.oficio).toLowerCase())}. Cuesta <strong>${cop(PRECIO_DESTACADO)} al mes</strong>. El pago se hace con QR y el equipo lo activa al confirmarlo.</p>
               ${t.solicitudDestacado ? '<div class="banner info">Ya enviaste la solicitud. El equipo te escribirá por WhatsApp para el pago.</div>' : '<button class="btn sun" id="sol-dest">Solicitar perfil destacado</button>'}`}
      </div>
      <div class="card stack">
        <h2>Tu perfil</h2>
        <div class="row"><button class="btn primary" id="editar">Editar perfil y fotos</button>${t.estado === 'aprobado' ? '<button class="btn" id="ver">Ver como lo ven los hogares</button>' : ''}</div>
        <div id="borrar-box"><button class="btn danger sm" id="borrar">Eliminar mi perfil</button></div>
        <button class="btn sm" id="pol" style="width:max-content">Política de tratamiento de datos</button>
      </div>
      ${B().mode === 'firebase' ? '<button class="btn" id="salir" style="width:max-content">Cerrar sesión</button>' : ''}
    </div>`;
    $('#disp-t').onclick = async () => { try { await B().actualizarMio({ disponible: !t.disponible }); toast(!t.disponible ? 'Ahora apareces como disponible' : 'Ahora apareces como no disponible'); } catch (e) { toast(errMsg(e)); } };
    const sd = $('#sol-dest'); if (sd) sd.onclick = async () => { try { await B().actualizarMio({ solicitudDestacado: true }); toast('Solicitud enviada'); } catch (e) { toast(errMsg(e)); } };
    $('#editar').onclick = () => { S.editando = true; renderFormulario(); };
    const vr = $('#ver'); if (vr) vr.onclick = () => go('perfil', t.id);
    $('#borrar').onclick = () => {
      $('#borrar-box').innerHTML = `<div class="confirm stack"><strong>¿Eliminar tu perfil y tus fotos?</strong><span class="small">Los hogares dejarán de verte. Esta acción no se puede deshacer.</span>
        <div class="row"><button class="btn danger" id="borrar-ok">Sí, eliminar</button><button class="btn" id="borrar-x">Cancelar</button></div></div>`;
      $('#borrar-x').onclick = () => renderTrabajador();
      $('#borrar-ok').onclick = async () => { try { await B().eliminarMio(t.fotos || []); toast('Perfil eliminado'); } catch (e) { toast(errMsg(e)); } };
    };
    const sl = $('#salir'); if (sl) sl.onclick = () => B().salir();
    $('#pol').onclick = () => verPolitica();
  }

  function renderAuth() {
    const v = $('#view'); const reg = S.authModo === 'crear';
    v.innerHTML = `<div class="stack">
      <h1>${reg ? 'Crea tu cuenta' : 'Entra a tu cuenta'}</h1>
      <p class="muted" style="margin:0">Trabajadores: crea tu cuenta para publicar tu oficio. Hogares: con una cuenta puedes calificar y reportar perfiles.</p>
      <form class="card stack" id="auth" novalidate>
        <label class="f">Correo electrónico<input type="email" id="au-e" autocomplete="email" required></label>
        <label class="f">Contraseña <span class="hint">Mínimo 8 caracteres</span><input type="password" id="au-p" autocomplete="${reg ? 'new-password' : 'current-password'}" required minlength="8"></label>
        <p class="err" id="au-err" hidden></p>
        <button class="btn primary big" type="submit">${reg ? 'Crear cuenta' : 'Entrar'}</button>
        <button class="btn" type="button" id="au-sw">${reg ? 'Ya tengo cuenta' : 'No tengo cuenta, crear una'}</button>
      </form></div>`;
    $('#au-sw').onclick = () => { S.authModo = reg ? 'entrar' : 'crear'; renderAuth(); };
    $('#auth').onsubmit = async (e) => {
      e.preventDefault(); const er = $('#au-err'); er.hidden = true;
      const em = $('#au-e').value.trim(), pw = $('#au-p').value;
      if (!/^\S+@\S+\.\S+$/.test(em)) { er.textContent = 'Escribe un correo válido.'; er.hidden = false; return; }
      if (pw.length < 8) { er.textContent = 'La contraseña debe tener mínimo 8 caracteres.'; er.hidden = false; return; }
      try { await (reg ? B().crearCuenta(em, pw) : B().entrar(em, pw)); }
      catch (x) {
        const c = String(x && x.code || '');
        er.textContent = /email-already/.test(c) ? 'Ese correo ya tiene cuenta. Entra con tu contraseña.' : /invalid-credential|wrong-password|user-not-found/.test(c) ? 'Correo o contraseña incorrectos.' : /weak-password/.test(c) ? 'La contraseña es muy débil.' : 'No se pudo iniciar sesión. Revisa tu conexión.';
        er.hidden = false;
      }
    };
  }

  // Formulario de registro y edición (RF01, RF02, RF07)
  function renderFormulario(adminTarget) {
    const v = $('#view');
    const asistido = !!(adminTarget && adminTarget.asistido);
    const t = asistido ? {} : (adminTarget || S.miPerfil || {});
    const nuevo = !t.id;
    const st = { zonas: new Set(t.zonas || []), fotos: [], borrar: [], miniatura: t.miniatura || '', existentes: (t.fotos || []).slice() };
    v.innerHTML = `<div class="stack">
      ${!adminTarget ? `<button class="btn sm" id="f-x" style="width:max-content">${icon('back')} ${nuevo ? 'Volver' : 'Cancelar'}</button>` : `<button class="btn sm" id="f-x" style="width:max-content">${icon('back')} Volver al panel</button>`}
      <h1>${asistido ? 'Registrar un trabajador' : adminTarget ? 'Editar perfil de ' + esc(t.nombre) : nuevo ? 'Registra tu oficio' : 'Edita tu perfil'}</h1>
      ${asistido ? '<p class="muted" style="margin:0">Registro asistido: llena los datos con el trabajador al lado. Puedes registrar todos los trabajadores que necesites.</p>' : nuevo && !adminTarget ? '<p class="muted" style="margin:0">Te toma menos de 5 minutos. El equipo revisa tu perfil antes de publicarlo.</p>' : ''}
      <form id="fw" class="card stack" novalidate>
        <label class="f">Nombre completo<input type="text" id="fw-n" maxlength="60" autocomplete="name" value="${esc(t.nombre || '')}"></label>
        <label class="f">Oficio principal<select id="fw-o">${OFICIOS.map((o) => `<option value="${o.id}" ${t.oficio === o.id ? 'selected' : ''}>${o.n}</option>`).join('')}</select></label>
        <label class="f">Número de WhatsApp <span class="hint">10 dígitos, empieza por 3. Ej: 3001234567</span><input type="tel" id="fw-w" inputmode="numeric" maxlength="10" value="${esc(waNumero(t.whatsapp))}"></label>
        <label class="f">Años de experiencia<input type="number" id="fw-x" min="0" max="60" inputmode="numeric" value="${esc(t.experiencia != null ? t.experiencia : '')}"></label>
        <div class="f" style="display:flex;flex-direction:column;gap:6px"><strong>Barrios donde trabajas</strong><span class="hint small muted">Toca para marcar. Si vas a cualquier barrio, marca "Toda la ciudad".</span>
          <div class="zonas" id="fw-z">${BARRIOS.map((b) => `<button type="button" class="chip" data-z="${esc(b)}" aria-pressed="${st.zonas.has(b)}">${esc(b)}</button>`).join('')}</div></div>
        <label class="f">Cuéntale a los hogares qué haces <span class="hint">Máximo 300 caracteres</span><textarea id="fw-d" maxlength="300" placeholder="Ej: Arreglo fugas, instalo sanitarios y lavaplatos. Llevo mis herramientas.">${esc(t.descripcion || '')}</textarea></label>
        <div class="stack" style="gap:6px"><strong>Foto de perfil</strong>
          <div class="row"><img class="av" id="fw-av" src="${esc(st.miniatura || avatarFallback(t.nombre || '?'))}" alt="">
          <label class="btn">Elegir foto<input type="file" id="fw-pf" accept="image/*" hidden></label></div></div>
        <div class="stack" style="gap:6px"><strong>Fotos de trabajos realizados</strong><span class="small muted">Hasta ${MAX_FOTOS} fotos. Muestran tu trabajo y generan confianza.</span>
          <div class="thumbs" id="fw-th"></div>
          <label class="btn" id="fw-add-l">Agregar fotos<input type="file" id="fw-add" accept="image/*" multiple hidden></label></div>
        ${asistido ? `<label class="check"><input type="checkbox" id="fw-aut"><span>El trabajador leyó la <a href="#" id="fw-pol">política de tratamiento de datos</a> y autorizó publicar su nombre, oficio, barrios, fotos y WhatsApp (Ley 1581 de 2012).</span></label>
          <label class="check"><input type="checkbox" id="fw-ced"><span>Vi su cédula en persona (no se guarda el número).</span></label>
          <label class="check"><input type="checkbox" id="fw-pub" checked><span>Publicar el perfil de una vez, sin pasar por "Por aprobar".</span></label>` : ''}
        ${!adminTarget ? `<label class="check"><input type="checkbox" id="fw-aut" ${t.autorizacion ? 'checked' : ''}><span>Autorizo a OficiosSincelejo a publicar mi nombre, oficio, barrios, fotos y número de WhatsApp para que los hogares me contacten, según la <a href="#" id="fw-pol">política de tratamiento de datos</a> (Ley 1581 de 2012). Puedo actualizar o eliminar mi perfil cuando quiera.</span></label>` : ''}
        <div id="fw-polbox" class="banner info legal" hidden>${politicaHTML()}</div>
        <p class="err" id="fw-err" hidden></p>
        <button class="btn primary big" type="submit" id="fw-ok">${asistido ? 'Registrar trabajador' : adminTarget ? 'Guardar cambios' : nuevo ? 'Enviar mi perfil a revisión' : 'Guardar cambios'}</button>
      </form></div>`;
    $('#f-x').onclick = () => { if (adminTarget) { S.view = 'admin'; render(); } else { S.editando = false; renderTrabajador(); } };
    const pol = $('#fw-pol'); if (pol) pol.onclick = (e) => { e.preventDefault(); const pb = $('#fw-polbox'); pb.hidden = !pb.hidden; };
    v.querySelectorAll('[data-z]').forEach((b) => (b.onclick = () => { const z = b.dataset.z; st.zonas.has(z) ? st.zonas.delete(z) : st.zonas.add(z); b.setAttribute('aria-pressed', String(st.zonas.has(z))); }));
    const ownerUid = asistido ? 'ra-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) : (t.id || S.me.uid);
    const dibujarThumbs = async () => {
      let existentes = {};
      if (st.existentes.length) { try { existentes = await obtenerFotos(ownerUid); } catch (e) { existentes = {}; } }
      const items = st.existentes.map((id) => ({ k: 'e:' + id, src: existentes[id] })).concat(st.fotos.map((f, i) => ({ k: 'n:' + i, src: f })));
      $('#fw-th').innerHTML = items.length ? items.map((it) => `<div class="thumb"><img src="${esc(it.src || avatarFallback('?'))}" alt=""><button type="button" data-rm="${esc(it.k)}" aria-label="Quitar foto">×</button></div>`).join('') : '<span class="small muted">Aún no has agregado fotos.</span>';
      $('#fw-th').querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => {
        const [k, id] = b.dataset.rm.split(':');
        if (k === 'e') { st.existentes = st.existentes.filter((x) => x !== id); st.borrar.push(id); } else st.fotos.splice(+id, 1);
        dibujarThumbs();
      }));
      $('#fw-add-l').hidden = st.existentes.length + st.fotos.length >= MAX_FOTOS;
    };
    dibujarThumbs();
    $('#fw-pf').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { st.miniatura = await comprimir(f, 240, 24000); $('#fw-av').src = st.miniatura; } catch (x) { toast('Esa foto no se pudo leer. Usa una imagen JPG o PNG.'); }
    };
    $('#fw-add').onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        if (st.existentes.length + st.fotos.length >= MAX_FOTOS) { toast('Máximo ' + MAX_FOTOS + ' fotos'); break; }
        try { st.fotos.push(await comprimir(f, 900, 170000)); } catch (x) { toast('Una de las fotos no se pudo leer.'); }
      }
      e.target.value = ''; dibujarThumbs();
    };
    $('#fw').onsubmit = async (e) => {
      e.preventDefault();
      const er = $('#fw-err'); er.hidden = true;
      const nombre = $('#fw-n').value.trim().replace(/\s+/g, ' ');
      const wa = waNumero($('#fw-w').value);
      const exp = parseInt($('#fw-x').value, 10);
      const fallas = [];
      if (nombre.length < 5 || nombre.split(' ').length < 2) fallas.push('Escribe tu nombre y apellido.');
      if (!/^3\d{9}$/.test(wa)) fallas.push('El WhatsApp debe tener 10 dígitos y empezar por 3.');
      if (isNaN(exp) || exp < 0 || exp > 60) fallas.push('Escribe tus años de experiencia (0 a 60).');
      if (!st.zonas.size) fallas.push('Marca al menos un barrio donde trabajas.');
      if ((!adminTarget || asistido) && !$('#fw-aut').checked) fallas.push(asistido ? 'Marca que el trabajador autorizó el tratamiento de sus datos.' : 'Debes autorizar el tratamiento de tus datos para publicar tu perfil.');
      if (fallas.length) { er.innerHTML = fallas.map(esc).join('<br>'); er.hidden = false; er.scrollIntoView({ block: 'center' }); return; }
      const btn = $('#fw-ok'); btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        const nuevosIds = [];
        for (const data of st.fotos) nuevosIds.push(await B().subirFoto(ownerUid, data));
        for (const id of st.borrar) { try { await B().borrarFoto(ownerUid, id); } catch (x) { /* foto huérfana, no bloquea */ } }
        delete S.fotosCache[ownerUid];
        const datos = {
          nombre, oficio: $('#fw-o').value, whatsapp: wa, experiencia: exp, zonas: BARRIOS.filter((b) => st.zonas.has(b)),
          descripcion: $('#fw-d').value.trim().slice(0, 300), miniatura: st.miniatura || '', fotos: st.existentes.concat(nuevosIds).slice(0, MAX_FOTOS),
          actualizado: new Date().toISOString()
        };
        if (asistido) {
          const pub = $('#fw-pub').checked, ahora = new Date().toISOString();
          Object.assign(datos, { estado: pub ? 'aprobado' : 'pendiente', disponible: true, destacado: false, destacadoHasta: '', cedulaVerificada: $('#fw-ced').checked, solicitudDestacado: false, motivoRechazo: '', autorizacion: true, fechaAutorizacion: ahora, creado: ahora, registroAsistido: true, registradoPor: S.me.uid || '' });
          await B().crearTrabajador(ownerUid, datos);
          toast(pub ? 'Trabajador registrado y publicado' : 'Trabajador registrado. Queda en "Por aprobar"');
          S.adminTab = pub ? 'todos' : 'pendientes'; S.view = 'admin'; render(); return;
        }
        if (adminTarget) { await B().actualizarTrabajador(t.id, datos); toast('Cambios guardados'); S.view = 'admin'; render(); return; }
        if (nuevo) {
          Object.assign(datos, { estado: 'pendiente', disponible: true, destacado: false, destacadoHasta: '', cedulaVerificada: false, solicitudDestacado: false, motivoRechazo: '', autorizacion: true, fechaAutorizacion: new Date().toISOString(), creado: new Date().toISOString() });
          await B().crearMio(datos); toast('Perfil enviado a revisión');
        } else {
          if (t.estado === 'rechazado') { datos.estado = 'pendiente'; }
          await B().actualizarMio(datos); toast('Cambios guardados');
        }
        S.editando = false;
        if (S.view === 'trabajador') renderTrabajador();
      } catch (x) { er.textContent = errMsg(x); er.hidden = false; btn.disabled = false; btn.textContent = 'Intentar de nuevo'; }
    };
  }

  // ---------- Administración (RF06) ----------
  function renderAdmin() {
    const v = $('#view');
    const pend = S.trabajadores.filter((t) => t.estado === 'pendiente').length;
    const sol = S.trabajadores.filter((t) => t.solicitudDestacado && !destacadoActivo(t) && t.estado === 'aprobado').length;
    const rep = reportesAbiertos().length;
    const tabs = [['pendientes', 'Por aprobar', pend], ['todos', 'Trabajadores', 0], ['destacados', 'Destacados', sol], ['reportes', 'Reportes', rep], ['indicadores', 'Indicadores', 0]];
    v.innerHTML = `<div class="stack"><h1>Panel de administración</h1>
      <div class="row" style="justify-content:space-between"><span class="small muted">Registro asistido: crea perfiles para trabajadores que no tienen cuenta o no manejan la app.</span><button class="btn primary" id="adm-nuevo">+ Registrar un trabajador</button></div>
      <div class="tabs" role="tablist">${tabs.map(([k, n, c]) => `<button role="tab" data-tab="${k}" aria-selected="${S.adminTab === k}">${n}${c ? ` <span class="badge b-sun">${c}</span>` : ''}</button>`).join('')}</div>
      <div id="admin-body" class="stack"></div></div>`;
    v.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { S.adminTab = b.dataset.tab; S.confirm = null; renderAdmin(); }));
    $('#adm-nuevo').onclick = () => renderFormulario({ asistido: true });
    renderAdminBody();
  }
  function reportesAbiertos() {
    const out = [];
    for (const d of S.reportes) (d.items || []).forEach((r, i) => out.push(Object.assign({ autor: d.id, i }, r)));
    return out.filter((r) => r.estado !== 'resuelto').sort((a, b) => String(b.f).localeCompare(String(a.f)));
  }
  function adminCard(t, acciones) {
    return `<div class="card stack" data-t="${esc(t.id)}">
      <div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:12px"><img class="av" src="${esc(fotoPerfil(t))}" alt="">
        <div class="stack" style="gap:4px;min-width:0"><strong>${esc(t.nombre)}</strong><span class="oficio">${esc(oficioN(t.oficio))}</span>
        <span class="small muted">WhatsApp ${esc(waNumero(t.whatsapp))} · ${esc(t.experiencia)} años · ${esc((t.zonas || []).join(', '))}</span>
        <span class="row" style="gap:6px">${estadoBadge(t)}${t.cedulaVerificada ? '<span class="badge b-ok">Cédula verificada</span>' : '<span class="badge b-muted">Cédula sin verificar</span>'}${destacadoActivo(t) ? '<span class="badge b-sun">Destacado hasta ' + esc(fechaCorta(t.destacadoHasta)) + '</span>' : ''}</span></div></div>
      ${t.descripcion ? `<p class="small" style="margin:0">${esc(t.descripcion)}</p>` : ''}
      <div class="row">${acciones}</div><div class="slot"></div></div>`;
  }
  function estadoBadge(t) {
    const m = { aprobado: 'b-ok', pendiente: 'b-warn', inactivo: 'b-muted', rechazado: 'b-danger' };
    return `<span class="badge ${m[t.estado] || 'b-muted'}">${esc(t.estado)}</span>`;
  }
  async function adm(id, patch, ok) { try { await B().actualizarTrabajador(id, patch); toast(ok); } catch (e) { toast(errMsg(e)); } }
  function renderAdminBody() {
    const box = $('#admin-body'); if (!box) return;
    const tab = S.adminTab;
    if (tab === 'pendientes') {
      const l = S.trabajadores.filter((t) => t.estado === 'pendiente').sort((a, b) => String(a.creado).localeCompare(String(b.creado)));
      box.innerHTML = l.length ? `<p class="small muted" style="margin:0">Revisa que el nombre, el oficio y las fotos sean reales. Si viste la cédula en el registro asistido, márcala como verificada.</p>` + l.map((t) => adminCard(t,
        `<button class="btn primary sm" data-a="aprobar">Aprobar</button><button class="btn sm" data-a="ver">Ver perfil</button><button class="btn sm" data-a="cedula">${t.cedulaVerificada ? 'Quitar verificación' : 'Cédula verificada'}</button><button class="btn danger sm" data-a="rechazar">Rechazar</button>`)).join('')
        : '<div class="card empty"><h3>No hay perfiles por aprobar</h3><p>Los perfiles nuevos aparecen aquí apenas el trabajador los envía.</p></div>';
    } else if (tab === 'todos') {
      const l = S.trabajadores.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
      box.innerHTML = l.length ? l.map((t) => adminCard(t,
        `<button class="btn sm" data-a="editar">Editar</button><button class="btn sm" data-a="ver">Ver perfil</button><button class="btn sm" data-a="cedula">${t.cedulaVerificada ? 'Quitar verificación' : 'Cédula verificada'}</button>
         ${t.estado === 'aprobado' ? '<button class="btn danger sm" data-a="desactivar">Desactivar</button>' : '<button class="btn primary sm" data-a="aprobar">' + (t.estado === 'inactivo' ? 'Reactivar' : 'Aprobar') + '</button>'}
         <button class="btn danger sm" data-a="eliminar">Eliminar</button>`)).join('')
        : '<div class="card empty"><h3>Aún no hay trabajadores registrados</h3></div>';
    } else if (tab === 'destacados') {
      const sol = S.trabajadores.filter((t) => t.solicitudDestacado && !destacadoActivo(t) && t.estado === 'aprobado');
      const act = S.trabajadores.filter((t) => destacadoActivo(t));
      box.innerHTML = `<div class="card stack"><h2>Solicitudes</h2><p class="small muted" style="margin:0">Confirma el pago de ${cop(PRECIO_DESTACADO)} y activa ${DIAS_DESTACADO} días.</p>${sol.length ? '' : '<p class="muted" style="margin:0">No hay solicitudes pendientes.</p>'}</div>`
        + sol.map((t) => adminCard(t, `<button class="btn sun sm" data-a="destacar">Pago confirmado: activar ${DIAS_DESTACADO} días</button><button class="btn sm" data-a="nodest">Descartar solicitud</button>`)).join('')
        + `<div class="card stack"><h2>Activos (${act.length})</h2><p class="small muted" style="margin:0">Ingreso mensual estimado: <strong>${cop(act.length * PRECIO_DESTACADO)}</strong></p></div>`
        + act.map((t) => adminCard(t, `<button class="btn sm" data-a="destacar">Renovar ${DIAS_DESTACADO} días</button><button class="btn danger sm" data-a="quitardest">Quitar destacado</button>`)).join('');
    } else if (tab === 'reportes') {
      const l = reportesAbiertos();
      box.innerHTML = l.length ? l.map((r) => { const t = porId(r.t); return `<div class="card stack"><div class="row" style="justify-content:space-between"><strong>${esc(r.m)}</strong><span class="small muted">${esc(fechaCorta(r.f))}</span></div>
        <span>Perfil: <strong>${esc(t ? t.nombre : 'eliminado')}</strong> ${t ? estadoBadge(t) : ''}</span>${r.d ? `<p style="margin:0">${esc(r.d)}</p>` : ''}
        <div class="row"><button class="btn sm" data-rr="${esc(r.autor)}|${r.i}">Marcar resuelto</button>${t ? `<button class="btn sm" data-rv="${esc(t.id)}">Ver perfil</button>${t.estado === 'aprobado' ? `<button class="btn danger sm" data-rd="${esc(t.id)}">Desactivar perfil</button>` : ''}` : ''}</div></div>`; }).join('')
        : '<div class="card empty"><h3>No hay reportes abiertos</h3><p>Cuando un hogar reporte un perfil, aparecerá aquí.</p></div>';
      box.querySelectorAll('[data-rr]').forEach((b) => (b.onclick = async () => { const [autor, i] = b.dataset.rr.split('|'); try { await B().resolverReporte(autor, +i); toast('Reporte resuelto'); } catch (e) { toast(errMsg(e)); } }));
      box.querySelectorAll('[data-rv]').forEach((b) => (b.onclick = () => go('perfil', b.dataset.rv)));
      box.querySelectorAll('[data-rd]').forEach((b) => (b.onclick = () => adm(b.dataset.rd, { estado: 'inactivo' }, 'Perfil desactivado')));
      return;
    } else if (tab === 'indicadores') {
      const tot = S.trabajadores.length, apr = publicos().length;
      let cont = 0; S.contactos.forEach((d) => Object.values(d.items || {}).forEach((n) => (cont += n || 0)));
      let nr = 0, sr = 0; S.resenas.forEach((d) => Object.values(d.items || {}).forEach((x) => { if (x && x.e) { nr++; sr += x.e; } }));
      const top = publicos().map((t) => ({ t, c: contactosDe(t.id) })).sort((a, b) => b.c - a.c).slice(0, 5);
      const por = OFICIOS.map((o) => ({ o, n: publicos().filter((t) => t.oficio === o.id).length })).filter((x) => x.n);
      const pct = (a, b) => Math.min(100, Math.round((a / b) * 100));
      box.innerHTML = `<p class="small muted" style="margin:0">Indicadores de la sección 8 del plan PMI (seguimiento del piloto).</p>
        <div class="kpis">
          <div class="kpi"><div class="small muted">Trabajadores aprobados</div><div class="n">${apr}</div><div class="small muted">Meta piloto: ${META_TRABAJADORES}</div><div class="bar"><span style="width:${pct(apr, META_TRABAJADORES)}%"></span></div></div>
          <div class="kpi"><div class="small muted">Contactos por WhatsApp</div><div class="n">${cont}</div><div class="small muted">Meta piloto: ${META_CONTACTOS}</div><div class="bar"><span style="width:${pct(cont, META_CONTACTOS)}%"></span></div></div>
          <div class="kpi"><div class="small muted">Calificaciones</div><div class="n">${nr}</div><div class="small muted">Promedio ${nr ? (sr / nr).toFixed(1) : '–'}</div></div>
          <div class="kpi"><div class="small muted">Registrados en total</div><div class="n">${tot}</div><div class="small muted">${tot - apr} sin publicar</div></div>
        </div>
        <div class="card stack"><h2>Más contactados</h2>${top.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>Trabajador</th><th>Oficio</th><th class="num">Contactos</th></tr></thead><tbody>${top.map((x) => `<tr><td>${esc(x.t.nombre)}</td><td>${esc(oficioN(x.t.oficio))}</td><td class="num">${x.c}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted" style="margin:0">Sin datos todavía.</p>'}</div>
        <div class="card stack"><h2>Trabajadores por oficio</h2>${por.length ? `<div class="scroll"><table class="tbl"><tbody>${por.map((x) => `<tr><td>${esc(x.o.n)}</td><td class="num">${x.n}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted" style="margin:0">Sin datos todavía.</p>'}</div>`;
      return;
    }
    box.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => {
      const card = b.closest('[data-t]'); const id = card.dataset.t; const t = porId(id); const a = b.dataset.a; const slot = card.querySelector('.slot');
      if (a === 'aprobar') return adm(id, { estado: 'aprobado', motivoRechazo: '' }, 'Perfil aprobado y publicado');
      if (a === 'desactivar') return adm(id, { estado: 'inactivo' }, 'Perfil desactivado');
      if (a === 'cedula') return adm(id, { cedulaVerificada: !t.cedulaVerificada }, t.cedulaVerificada ? 'Verificación quitada' : 'Cédula marcada como verificada');
      if (a === 'destacar') { const base = destacadoActivo(t) ? new Date(t.destacadoHasta) : new Date(); base.setDate(base.getDate() + DIAS_DESTACADO); return adm(id, { destacado: true, destacadoHasta: base.toISOString().slice(0, 10), solicitudDestacado: false }, 'Perfil destacado activado'); }
      if (a === 'quitardest') return adm(id, { destacado: false, destacadoHasta: '' }, 'Destacado quitado');
      if (a === 'nodest') return adm(id, { solicitudDestacado: false }, 'Solicitud descartada');
      if (a === 'ver') return go('perfil', id);
      if (a === 'editar') { S.view = 'admin-edit'; return renderFormulario(t); }
      if (a === 'rechazar') {
        slot.innerHTML = `<div class="stack"><label class="f">Motivo del rechazo<input type="text" id="mr-${esc(id)}" maxlength="140" placeholder="Ej: las fotos no muestran trabajos reales"></label><div class="row"><button class="btn danger sm" data-ok>Rechazar perfil</button><button class="btn sm" data-x>Cancelar</button></div></div>`;
        slot.querySelector('[data-x]').onclick = () => (slot.innerHTML = '');
        slot.querySelector('[data-ok]').onclick = () => adm(id, { estado: 'rechazado', motivoRechazo: slot.querySelector('input').value.trim() }, 'Perfil rechazado');
        return;
      }
      if (a === 'eliminar') {
        slot.innerHTML = `<div class="confirm stack"><strong>¿Eliminar a ${esc(t.nombre)} y sus fotos?</strong><span class="small">No se puede deshacer. Si solo quieres ocultarlo, usa Desactivar.</span><div class="row"><button class="btn danger sm" data-ok>Sí, eliminar</button><button class="btn sm" data-x>Cancelar</button></div></div>`;
        slot.querySelector('[data-x]').onclick = () => (slot.innerHTML = '');
        slot.querySelector('[data-ok]').onclick = async () => { try { await B().eliminarTrabajador(id, t.fotos || []); toast('Perfil eliminado'); } catch (e) { toast(errMsg(e)); } };
      }
    }));
  }

  // ---------- Política de datos ----------
  function politicaHTML() {
    return `<h3>Política de tratamiento de datos personales</h3>
      <p>OficiosSincelejo es un proyecto académico de estudiantes de Ingeniería de Sistemas de la Corporación Universitaria del Caribe (CECAR). Esta política aplica la Ley 1581 de 2012.</p>
      <h3>Qué datos recogemos</h3><p>De los trabajadores: nombre, oficio, número de WhatsApp, años de experiencia, barrios donde trabaja, descripción y fotos. De los hogares: las calificaciones, comentarios y reportes que escriben. No pedimos ni guardamos el número de cédula: el equipo la revisa en persona y solo registra si fue verificada.</p>
      <h3>Para qué los usamos</h3><p>Para publicar el perfil del trabajador y que los hogares de Sincelejo lo contacten por WhatsApp, y para medir cuántos contactos y calificaciones recibe. No vendemos ni compartimos los datos con terceros.</p>
      <h3>Tus derechos</h3><p>Puedes conocer, actualizar y corregir tus datos desde <strong>Soy trabajador</strong>, y eliminar tu perfil con el botón <strong>Eliminar mi perfil</strong>. También puedes revocar la autorización escribiendo al equipo del proyecto.</p>`;
  }
  function verPolitica() { S.prev = S.view; S.view = 'privacidad'; render(); window.scrollTo(0, 0); }
  function renderPrivacidad() {
    $('#view').innerHTML = `<div class="stack legal"><button class="btn sm" id="pv-x" style="width:max-content">${icon('back')} Volver</button>${politicaHTML()}</div>`;
    $('#pv-x').onclick = () => { S.view = S.prev || 'trabajador'; render(); };
  }

  // ---------- Arranque ----------
  async function start() {
    shell(); renderNav(); render();
    const be = B();
    be.onSesion(async (me) => {
      S.me = Object.assign({ uid: null, isAdmin: false, canWrite: false, signedIn: false, anon: true, email: '' }, me);
      unsubs.forEach((u) => { try { u(); } catch (e) { } }); unsubs = [];
      S.miPerfil = S.me.uid ? undefined : null;
      let pend = 3; const listo = () => { if (--pend <= 0 && !S.loaded) { S.loaded = true; render(); } };
      unsubs.push(be.onTrabajadores(S.me, (l) => { S.trabajadores = l; listo(); refresh(); }, () => { listo(); }));
      unsubs.push(be.onResenas((l) => { S.resenas = l; listo(); refresh(); }, () => listo()));
      unsubs.push(be.onContactos((l) => { S.contactos = l; listo(); refresh(); }, () => listo()));
      if (S.me.uid) unsubs.push(be.onMio(S.me.uid, (doc) => { S.miPerfil = doc; refresh(); }, () => { S.miPerfil = null; refresh(); }));
      if (S.me.isAdmin) unsubs.push(be.onReportes((l) => { S.reportes = l; refresh(); }, () => { }));
      if (!S.me.isAdmin && S.view === 'admin') S.view = 'buscar';
      renderNav(); render();
    });
  }
  if (window.Backend) start(); else window.addEventListener('backend-ready', start, { once: true });
})();
