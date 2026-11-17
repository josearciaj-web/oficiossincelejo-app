// Pruebas funcionales automatizadas del MVP OficiosSincelejo (backend de demostración).
// Ejecutar: npm run test:e2e  (sirve la carpeta public en el puerto 8080 y abre la app en modo demostración).
// Resultado: tests/resultados-e2e.json. Sale con código 1 si algún caso falla.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const URL = process.env.APP_URL || 'http://localhost:8080/?demo';
const IMG = path.join(__dirname, 'foto.png');

const casos = [];
function caso(id, rf, nombre, esperado, fn) { casos.push({ id, rf, nombre, esperado, fn }); }

async function abrir(browser, rol = 'hogar', vp = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(URL);
  await page.waitForSelector('#resultados .w');
  if (rol !== 'hogar') { await page.selectOption('#demo-rol', rol); await page.waitForTimeout(250); }
  page._errores = errores;
  return { ctx, page };
}
const nav = (page, v) => page.click(`#navbar [data-go="${v}"]`);
const textos = (page, sel) => page.$$eval(sel, (els) => els.map((e) => e.textContent.trim()));

caso('CP01', 'RF03', 'Búsqueda por oficio', 'Al elegir Plomería solo aparecen plomeros', async (b) => {
  const { ctx, page } = await abrir(b);
  await page.click('[data-of="plomeria"]');
  const of = await textos(page, '#resultados .w .oficio');
  await ctx.close();
  if (!of.length || !of.every((o) => o === 'Plomería')) throw new Error('Oficios: ' + of.join(', '));
  return `${of.length} resultado(s), todos de Plomería`;
});
caso('CP02', 'RF04', 'Filtro por barrio', 'Al elegir Venecia solo aparecen trabajadores que atienden Venecia o toda la ciudad', async (b) => {
  const { ctx, page } = await abrir(b);
  const ids = await (async () => { await page.selectOption('#barrio', 'Venecia'); return page.$$eval('#resultados .w', (e) => e.map((x) => x.dataset.perfil)); })();
  const zonas = await page.evaluate((ids) => ids, ids);
  await ctx.close();
  const esperados = ['w1', 'w2', 'w5', 'w6'];
  if (zonas.sort().join() !== esperados.sort().join()) throw new Error('Obtenidos: ' + zonas.join(','));
  return `${zonas.length} resultados, coinciden con los datos de prueba`;
});
caso('CP03', 'RNF02', 'Tiempo de respuesta de la búsqueda', 'La lista se actualiza en menos de 3 segundos', async (b) => {
  const { ctx, page } = await abrir(b);
  const ms = await page.evaluate(async () => {
    const t0 = performance.now();
    document.querySelector('[data-of="electricidad"]').click();
    await new Promise((r) => requestAnimationFrame(() => r()));
    return performance.now() - t0;
  });
  await ctx.close();
  if (ms > 3000) throw new Error(ms + ' ms');
  return `${ms.toFixed(0)} ms en el navegador (sin contar la red)`;
});
caso('CP04', 'RF05', 'Contacto por WhatsApp', 'El botón abre wa.me con el número del trabajador y un mensaje listo', async (b) => {
  const { ctx, page } = await abrir(b);
  await page.click('[data-perfil="w1"]');
  const href = await page.getAttribute('#wa', 'href');
  await ctx.close();
  if (!href.startsWith('https://wa.me/573004512876?text=') || !decodeURIComponent(href).includes('plomería')) throw new Error(href);
  return 'Enlace https://wa.me/573004512876 con mensaje que menciona el oficio';
});
caso('CP05', 'RF01, RF02', 'Registro de un trabajador nuevo con fotos', 'El perfil queda en estado pendiente con foto de perfil y 2 fotos de trabajos', async (b) => {
  const { ctx, page } = await abrir(b, 'nuevo');
  await nav(page, 'trabajador');
  await page.fill('#fw-n', 'Eder Julio Sierra');
  await page.selectOption('#fw-o', 'plomeria');
  await page.fill('#fw-w', '3015550000');
  await page.fill('#fw-x', '7');
  await page.click('[data-z="Majagual"]');
  await page.fill('#fw-d', 'Plomería general y destapes.');
  await page.setInputFiles('#fw-pf', IMG);
  await page.setInputFiles('#fw-add', [IMG, IMG]);
  await page.waitForFunction(() => document.querySelectorAll('#fw-th .thumb').length === 2);
  await page.check('#fw-aut');
  const t0 = Date.now();
  await page.click('#fw-ok');
  await page.waitForSelector('.banner.warn');
  const ban = await page.textContent('.banner.warn');
  const fotos = await page.$$eval('.kpi .n', (e) => e[2].textContent);
  await ctx.close();
  if (!/revisión/.test(ban) || fotos !== '2/6') throw new Error(ban + ' ' + fotos);
  return `Perfil en revisión, fotos ${fotos}, guardado en ${Date.now() - t0} ms`;
});
caso('CP06', 'RF01', 'Validación del formulario vacío', 'El sistema no guarda y muestra los 5 errores', async (b) => {
  const { ctx, page } = await abrir(b, 'nuevo');
  await nav(page, 'trabajador');
  await page.click('#fw-ok');
  const err = await page.innerHTML('#fw-err');
  await ctx.close();
  const n = err.split('<br>').length;
  if (n !== 5) throw new Error(err);
  return '5 mensajes: nombre, WhatsApp, experiencia, barrio y autorización';
});
caso('CP07', 'RNF05', 'Autorización de datos obligatoria (Ley 1581)', 'Sin marcar la autorización el perfil no se envía', async (b) => {
  const { ctx, page } = await abrir(b, 'nuevo');
  await nav(page, 'trabajador');
  await page.fill('#fw-n', 'Eder Julio Sierra'); await page.fill('#fw-w', '3015550000'); await page.fill('#fw-x', '7'); await page.click('[data-z="Majagual"]');
  await page.click('#fw-ok');
  const err = await page.textContent('#fw-err');
  await page.click('#fw-pol');
  const pol = await page.isVisible('#fw-polbox');
  await ctx.close();
  if (!/autorizar/.test(err) || !pol) throw new Error(err);
  return 'Mensaje "Debes autorizar…" y política visible desde el formulario';
});
caso('CP08', 'RF06', 'Aprobación de perfiles por el administrador', 'Un perfil pendiente aprobado aparece en la búsqueda', async (b) => {
  const { ctx, page } = await abrir(b, 'admin');
  await nav(page, 'admin');
  const antes = await page.$$eval('#admin-body [data-t]', (e) => e.map((x) => x.dataset.t));
  await page.click('[data-t="w8"] [data-a="aprobar"]');
  await page.waitForFunction(() => !document.querySelector('[data-t="w8"]'));
  await nav(page, 'buscar');
  await page.click('[data-of="electricidad"]');
  const ids = await page.$$eval('#resultados .w', (e) => e.map((x) => x.dataset.perfil));
  await ctx.close();
  if (!antes.includes('w8') || !ids.includes('w8')) throw new Error(ids.join());
  return 'Kevin Arrieta (pendiente) pasa a la búsqueda de Electricidad';
});
caso('CP09', 'RF06', 'Rechazo con motivo y desactivación', 'El perfil rechazado queda con su motivo; el desactivado sale de la búsqueda', async (b) => {
  const { ctx, page } = await abrir(b, 'admin');
  await nav(page, 'admin');
  await page.click('[data-t="w8"] [data-a="rechazar"]');
  await page.fill('#mr-w8', 'Fotos borrosas');
  await page.click('[data-t="w8"] [data-ok]');
  await page.waitForFunction(() => !document.querySelector('[data-t="w8"]'));
  await page.click('[data-tab="todos"]');
  const est = await page.textContent('[data-t="w8"] .badge');
  await page.click('[data-t="w7"] [data-a="desactivar"]');
  await page.waitForFunction(() => /inactivo/.test(document.querySelector('[data-t="w7"] .badge').textContent));
  await nav(page, 'buscar');
  const ids = await page.$$eval('#resultados .w', (e) => e.map((x) => x.dataset.perfil));
  await ctx.close();
  if (est !== 'rechazado' || ids.includes('w7')) throw new Error(est + ' ' + ids);
  return 'Estado "rechazado"; Osvaldo Medina (desactivado) ya no aparece';
});
caso('CP10', 'RF07', 'Cambio de disponibilidad', 'El trabajador marca "No disponible" y el filtro "Solo disponibles" lo oculta', async (b) => {
  const { ctx, page } = await abrir(b, 'trabajador');
  await nav(page, 'trabajador');
  await page.click('#disp-t');
  await page.waitForFunction(() => document.querySelector('#disp-t').getAttribute('aria-pressed') === 'false');
  await nav(page, 'buscar');
  await page.check('#disp');
  const ids = await page.$$eval('#resultados .w', (e) => e.map((x) => x.dataset.perfil));
  await ctx.close();
  if (ids.includes('w1')) throw new Error(ids.join());
  return 'Rafael Montes deja de aparecer con el filtro activo';
});
caso('CP11', 'RF07', 'Edición del perfil', 'El cambio de descripción se ve en el perfil público', async (b) => {
  const { ctx, page } = await abrir(b, 'trabajador');
  await nav(page, 'trabajador');
  await page.click('#editar');
  await page.fill('#fw-d', 'Nueva descripción de prueba');
  await page.click('#fw-ok');
  await page.waitForSelector('#disp-t');
  await page.click('#ver');
  const txt = await page.textContent('#perfil-datos');
  await ctx.close();
  if (!txt.includes('Nueva descripción de prueba')) throw new Error('no cambió');
  return 'Descripción actualizada visible para los hogares';
});
caso('CP12', 'RF08', 'Calificación de 1 a 5 estrellas', 'La calificación y el comentario aparecen en el perfil', async (b) => {
  const { ctx, page } = await abrir(b);
  await page.click('[data-perfil="w7"]');
  await page.click('#rv-ok');
  const e1 = await page.textContent('#rv-err');
  await page.click('[data-st="4"]');
  await page.fill('#rv-c', 'Puntual y ordenado');
  await page.click('#rv-ok');
  await page.waitForFunction(() => document.querySelector('#perfil-datos').textContent.includes('Puntual y ordenado'));
  await ctx.close();
  if (!/Elige/.test(e1)) throw new Error(e1);
  return 'Sin estrellas avisa "Elige de 1 a 5"; con 4 estrellas se publica';
});
caso('CP13', 'RF09', 'Verificación de cédula', 'El administrador marca la cédula y el perfil muestra la insignia', async (b) => {
  const { ctx, page } = await abrir(b, 'admin');
  await nav(page, 'admin');
  await page.click('[data-tab="todos"]');
  await page.click('[data-t="w4"] [data-a="cedula"]');
  await page.waitForFunction(() => document.querySelector('[data-t="w4"]').textContent.includes('Quitar verificación'));
  await nav(page, 'buscar');
  await page.check('#ver');
  const ids = await page.$$eval('#resultados .w', (e) => e.map((x) => x.dataset.perfil));
  await ctx.close();
  if (!ids.includes('w4')) throw new Error(ids.join());
  return 'Carmen Salgado aparece con el filtro "Solo con cédula verificada"';
});
caso('CP14', 'RF10', 'Reporte de perfiles', 'El reporte del hogar llega al panel del administrador', async (b) => {
  const { ctx, page } = await abrir(b);
  await page.click('[data-perfil="w6"]');
  await page.click('#rep-open');
  await page.selectOption('#rep-m', 'Cobro abusivo');
  await page.click('#rep-ok');
  await page.waitForSelector('#rep-box .banner.ok');
  await page.selectOption('#demo-rol', 'admin'); await page.waitForTimeout(250);
  await nav(page, 'admin');
  await page.click('[data-tab="reportes"]');
  const t = await page.textContent('#admin-body');
  await ctx.close();
  if (!t.includes('Cobro abusivo') || !t.includes('Andrés Payares')) throw new Error(t.slice(0, 200));
  return 'Reporte "Cobro abusivo" sobre Andrés Payares visible en Reportes';
});
caso('CP15', 'RF11', 'Perfil destacado', 'La solicitud llega al administrador y al activarla el perfil sale primero', async (b) => {
  const { ctx, page } = await abrir(b, 'admin');
  await nav(page, 'admin');
  await page.click('[data-tab="destacados"]');
  await page.click('[data-t="w4"] [data-a="destacar"]');
  await page.waitForFunction(() => /Activos \(3\)/.test(document.querySelector('#admin-body').textContent));
  await nav(page, 'buscar');
  await page.click('[data-of="pintura"]');
  const prim = await page.$eval('#resultados .w', (e) => e.dataset.perfil + '|' + e.className);
  await ctx.close();
  if (!prim.startsWith('w4') || !prim.includes('dest')) throw new Error(prim);
  return 'Carmen Salgado activada por 30 días y marcada como Destacado';
});
caso('CP16', 'RF12', 'Indicadores del piloto', 'El panel muestra trabajadores aprobados, contactos y calificaciones frente a las metas', async (b) => {
  const { ctx, page } = await abrir(b, 'admin');
  await nav(page, 'admin');
  await page.click('[data-tab="indicadores"]');
  const k = await textos(page, '#admin-body .kpi');
  await ctx.close();
  if (k.length !== 4 || !k[0].includes('Meta piloto: 15') || !k[1].includes('Meta piloto: 30')) throw new Error(k.join(' | '));
  return k.map((x) => x.replace(/\s+/g, ' ')).slice(0, 3).join('; ');
});
caso('CP17', 'RF13', 'Conteo de contactos por WhatsApp', 'Cada clic en WhatsApp suma 1 al indicador (una vez por sesión)', async (b) => {
  const { ctx, page } = await abrir(b);
  await page.click('[data-perfil="w2"]');
  await page.$eval('#wa', (a) => { a.removeAttribute('href'); a.removeAttribute('target'); });
  await page.click('#wa'); await page.click('#wa');
  await page.waitForTimeout(300);
  const n = await page.evaluate(() => new Promise((r) => window.Backend.onContactos((l) => r(l.reduce((s, d) => s + ((d.items || {}).w2 || 0), 0)))));
  await ctx.close();
  if (n !== 5) throw new Error('contactos w2 = ' + n);
  return 'De 4 a 5 contactos; el segundo clic no se cuenta dos veces';
});
caso('CP18', 'RF14', 'Eliminación del perfil por el titular', 'El trabajador elimina su perfil y sus fotos', async (b) => {
  const { ctx, page } = await abrir(b, 'trabajador');
  await nav(page, 'trabajador');
  await page.click('#borrar');
  await page.click('#borrar-ok');
  await page.waitForSelector('#fw');
  await nav(page, 'buscar');
  const ids = await page.$$eval('#resultados .w', (e) => e.map((x) => x.dataset.perfil));
  await ctx.close();
  if (ids.includes('w1')) throw new Error(ids.join());
  return 'El perfil sale de la búsqueda y la app vuelve al formulario de registro';
});
caso('CP19', 'RF02', 'Límite de 6 fotos', 'No se aceptan más de 6 fotos por perfil', async (b) => {
  const { ctx, page } = await abrir(b, 'nuevo');
  await nav(page, 'trabajador');
  await page.setInputFiles('#fw-add', Array(8).fill(IMG));
  await page.waitForFunction(() => document.querySelectorAll('#fw-th .thumb').length === 6);
  const oculto = await page.$eval('#fw-add-l', (e) => e.hidden);
  await ctx.close();
  if (!oculto) throw new Error('botón visible');
  return '6 miniaturas y el botón "Agregar fotos" se oculta';
});
caso('CP20', 'RNF06', 'Escape de HTML en datos del usuario (OWASP ASVS V5)', 'Un nombre con código HTML se muestra como texto y no se ejecuta', async (b) => {
  const { ctx, page } = await abrir(b, 'nuevo');
  await nav(page, 'trabajador');
  await page.fill('#fw-n', 'Pepe <img src=x onerror="window.__xss=1"> Ruiz');
  await page.fill('#fw-w', '3015550000'); await page.fill('#fw-x', '2'); await page.click('[data-z="Centro"]'); await page.check('#fw-aut');
  await page.click('#fw-ok');
  await page.waitForSelector('.banner.warn');
  await page.selectOption('#demo-rol', 'admin'); await page.waitForTimeout(250);
  await nav(page, 'admin');
  await page.waitForTimeout(200);
  const x = await page.evaluate(() => window.__xss);
  const img = await page.$$eval('#admin-body img[src="x"]', (e) => e.length);
  await ctx.close();
  if (x || img) throw new Error('XSS ejecutado');
  return 'El texto se muestra escapado; el script no se ejecuta';
});
caso('CP21', 'RNF01', 'Diseño adaptado a celular', 'En pantallas de 360 px no hay desplazamiento horizontal en ninguna vista', async (b) => {
  const { ctx, page } = await abrir(b, 'admin', { width: 360, height: 740 });
  const res = [];
  for (const v of ['buscar', 'trabajador', 'admin']) {
    await nav(page, v); await page.waitForTimeout(150);
    res.push(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  }
  await page.click('[data-tab="indicadores"]');
  res.push(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await ctx.close();
  if (res.includes(false)) throw new Error(res.join());
  return '4 vistas revisadas a 360 px sin desbordamiento';
});
caso('CP22', 'RNF04', 'Accesibilidad básica', 'Imágenes con alt, controles con nombre accesible y tamaño táctil de 44 px o más', async (b) => {
  const { ctx, page } = await abrir(b);
  const r = await page.evaluate(() => {
    const sinAlt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length;
    const ctrls = [...document.querySelectorAll('button, select, input, a')].filter((e) => e.offsetParent);
    const sinNombre = ctrls.filter((e) => !(e.getAttribute('aria-label') || e.textContent.trim() || e.closest('label') || e.placeholder)).length;
    const peq = [...document.querySelectorAll('.chip, .nav button, #barrio, .w, .btn')].filter((e) => e.getBoundingClientRect().height < 44).length;
    return { sinAlt, sinNombre, peq, total: ctrls.length };
  });
  await ctx.close();
  if (r.sinAlt || r.sinNombre || r.peq) throw new Error(JSON.stringify(r));
  return `${r.total} controles revisados: 0 sin nombre, 0 imágenes sin alt, 0 objetivos táctiles menores de 44 px`;
});
caso('CP23', 'RF15', 'Registro asistido por el administrador', 'El administrador registra dos trabajadores sin cuenta, uno con un oficio nuevo, y el publicado aparece en la búsqueda', async (b) => {
  const { ctx, page } = await abrir(b, 'admin');
  await nav(page, 'admin');
  const datos = [['Luis Carlos Mendoza', 'refrigeracion', '3011112233', true], ['Rosa Elena Pérez', 'modisteria', '3024445566', false]];
  for (const [n, o, w, pub] of datos) {
    await page.click('#adm-nuevo');
    await page.fill('#fw-n', n); await page.selectOption('#fw-o', o); await page.fill('#fw-w', w); await page.fill('#fw-x', '5');
    await page.click('[data-z="Boston"]'); await page.check('#fw-aut'); await page.check('#fw-ced');
    if (!pub) await page.uncheck('#fw-pub');
    await page.click('#fw-ok'); await page.waitForSelector('#adm-nuevo');
  }
  await page.click('[data-tab="pendientes"]');
  const pend = await page.textContent('#admin-body');
  await nav(page, 'buscar');
  const chips = await page.$$eval('[data-of]', (e) => e.length);
  await page.click('[data-of="refrigeracion"]');
  const res = await page.$$eval('#resultados .w', (e) => e.map((x) => x.dataset.perfil));
  await ctx.close();
  if (res.length !== 1 || !pend.includes('Rosa Elena Pérez') || chips !== 19) throw new Error(res + ' ' + chips);
  return `2 perfiles creados con una sola cuenta: uno publicado (visible en Refrigeración y aires) y otro en "Por aprobar". 18 oficios en el catálogo más el botón Todos`;
});

(async () => {
  // imagen de prueba
  if (!fs.existsSync(IMG)) {
    const b0 = await chromium.launch(); const p = await b0.newPage({ viewport: { width: 400, height: 300 } });
    await p.setContent('<div style="width:400px;height:300px;background:linear-gradient(135deg,#2B6CB0,#DCEBFA)"></div>');
    await p.screenshot({ path: IMG }); await b0.close();
  }
  const srv = process.env.APP_URL ? null : await require('../scripts/servir.js').servir(8080);
  const browser = await chromium.launch();
  const out = [];
  for (const c of casos) {
    const t0 = Date.now();
    try { const obs = await c.fn(browser); out.push({ id: c.id, rf: c.rf, nombre: c.nombre, esperado: c.esperado, resultado: 'Aprobado', obs, ms: Date.now() - t0 }); }
    catch (e) { out.push({ id: c.id, rf: c.rf, nombre: c.nombre, esperado: c.esperado, resultado: 'Fallido', obs: String(e.message || e).slice(0, 300), ms: Date.now() - t0 }); }
    console.log(out[out.length - 1].id, out[out.length - 1].resultado, out[out.length - 1].obs);
  }
  await browser.close();
  if (srv) srv.close();
  const v = require('playwright/package.json').version;
  fs.writeFileSync(path.join(__dirname, 'resultados-e2e.json'), JSON.stringify({ fecha: new Date().toISOString(), playwright: v, casos: out }, null, 1));
  const fallas = out.filter((c) => c.resultado !== 'Aprobado').length;
  console.log(`\n${out.length - fallas} de ${out.length} casos aprobados`);
  process.exit(fallas ? 1 : 0);
})();
