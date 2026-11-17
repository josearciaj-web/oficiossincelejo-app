# OficiosSincelejo

Directorio web para encontrar trabajadores independientes de oficios varios en Sincelejo. El hogar busca por oficio y barrio, revisa fotos, calificaciones y cédula verificada, y escribe al trabajador por WhatsApp. Sin comisiones.

Proyecto de Ingeniería de Sistemas, CECAR, 2026. Equipo: Jose Jose Arcia Jaramillo, Valery Gándara y Sebastián Vergara.

## Qué tiene

- **Buscar:** 18 oficios, filtro por barrio, disponibles y cédula verificada.
- **Perfil:** foto, hasta 6 fotos de trabajos, calificaciones de 1 a 5 y botón de WhatsApp con mensaje listo.
- **Soy trabajador:** registro con fotos comprimidas en el celular, disponibilidad, edición y borrado del perfil. Autorización de datos según la Ley 1581 de 2012.
- **Administrar:** aprobar o rechazar perfiles, verificar cédula, reportes, perfil destacado, indicadores del piloto y registro asistido de trabajadores sin cuenta.
- **App instalable (PWA)** y modo de demostración con datos de ejemplo.

Tecnología: HTML, CSS y JavaScript sin framework. Firebase Authentication y Cloud Firestore como backend. GitHub Pages como hosting. GitHub Actions corre las pruebas y publica.

## Estructura

```
public/                  La app que se publica
  index.html             Página principal
  app.js                 Interfaz y lógica
  inicio.js              Elige el backend: Firebase o demostración
  backend-firebase.js    Conexión con Firebase
  backend-demo.js        Datos de ejemplo en memoria
  firebase-config.js     Configuración de tu proyecto de Firebase (paso 3)
firestore.rules          Reglas de seguridad de la base de datos
tests/e2e.js             23 pruebas de la app con Playwright
tests/reglas.test.mjs    37 pruebas de las reglas con el emulador de Firebase
scripts/respaldo.mjs     Respaldo de la base de datos a JSON
.github/workflows/       Pruebas y publicación automática
```

## Paso 1. Subir el código a GitHub

1. En GitHub, crea un repositorio nuevo, por ejemplo `oficiossincelejo`. Puede ser público.
2. Sube todos los archivos de esta carpeta, incluida la carpeta oculta `.github`. Con Git:

```bash
git init
git add .
git commit -m "OficiosSincelejo v1.1"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/oficiossincelejo.git
git push -u origin main
```

Si subes los archivos desde la página de GitHub (Add file > Upload files), arrastra la carpeta completa. Revisa que quede `.github/workflows/publicar.yml`.

## Paso 2. Activar GitHub Pages

1. En el repositorio: **Settings > Pages**.
2. En **Source**, elige **GitHub Actions**.
3. Ve a la pestaña **Actions** y abre "Probar y publicar". Si no arrancó, toca **Run workflow**.
4. Cuando termine en verde, la app queda en `https://TU-USUARIO.github.io/oficiossincelejo/`.

Mientras no conectes Firebase, la app abre en **modo demostración**: funciona completa con datos de ejemplo, pero nada se guarda. Un aviso arriba lo indica.

## Paso 3. Conectar Firebase (datos reales)

Todo funciona en el plan gratuito Spark, sin tarjeta.

1. Entra a https://console.firebase.google.com y crea un proyecto. Puedes desactivar Google Analytics.
2. **Authentication > Comenzar > Método de acceso:** habilita **Correo electrónico/contraseña** y **Anónimo**.
3. **Authentication > Configuración > Dominios autorizados:** agrega `TU-USUARIO.github.io`.
4. **Firestore Database > Crear base de datos:** ubicación `southamerica-east1 (São Paulo)`, modo de producción.
5. **Configuración del proyecto > Tus apps > ícono web `</>`:** registra la app y copia el objeto `firebaseConfig`.
6. En GitHub, abre `public/firebase-config.js`, toca el lápiz, pega tus valores y guarda (Commit changes). La Action vuelve a publicar sola.

La configuración web de Firebase no es secreta. La protección de los datos depende de las reglas del paso 4.

## Paso 4. Publicar las reglas de seguridad

Sin este paso la app muestra "Permiso denegado".

**A mano (recomendado la primera vez):** en la consola, **Firestore Database > Reglas**, borra lo que hay, pega todo el contenido de `firestore.rules` y toca **Publicar**.

**Automático (opcional):** cada vez que cambies `firestore.rules`, GitHub Actions las prueba y las publica.
1. En Firebase: **Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada**. Se descarga un JSON. No lo subas al repositorio.
2. En GitHub: **Settings > Secrets and variables > Actions**.
   - Pestaña **Secrets**: crea `FIREBASE_SERVICE_ACCOUNT` y pega el contenido completo del JSON.
   - Pestaña **Variables**: crea `FIREBASE_PROJECT_ID` con el ID de tu proyecto.

## Paso 5. Crear los administradores

1. Abre la app publicada, ve a **Soy trabajador > No tengo cuenta, crear una** y crea la cuenta del administrador.
2. En la consola: **Authentication > Usuarios**, copia el **UID** de esa cuenta.
3. **Firestore Database > Iniciar colección:** ID `admins`. ID del documento: el UID. Campo `rol` (string) = `admin`. Guardar.
4. Recarga la app. Aparece la pestaña **Administrar**.

Desde **Administrar > + Registrar un trabajador** el administrador crea todos los perfiles que necesite para trabajadores que no tienen cuenta (registro asistido).

## Modo demostración para presentaciones

Agrega `?demo` a la dirección: `https://TU-USUARIO.github.io/oficiossincelejo/?demo`. Abre los datos de ejemplo y el selector "Ver como" (hogar, trabajador, administrador), sin tocar la base de datos real.

## Pruebas

GitHub Actions corre las dos suites en cada cambio. Para correrlas en tu computador (Node.js 20 o superior):

```bash
npm install
npx playwright install chromium
npm run test:e2e       # 23 pruebas de la app
npm run test:reglas    # 37 pruebas de las reglas (necesita Java 21)
npm run servir         # abre la app en http://localhost:8080
```

## Respaldo de la base de datos

Con la clave de la cuenta de servicio guardada fuera del repositorio:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/ruta/clave.json npm run respaldo
```

Crea `respaldos/respaldo-FECHA.json` con todas las colecciones. Hazlo cada semana durante el piloto. La carpeta `respaldos/` está en `.gitignore` porque contiene datos personales.

## Límites conocidos

- GitHub Pages no permite encabezados HTTP propios. La página trae una política de seguridad de contenido (CSP) en la etiqueta meta, pero no puede bloquear que otro sitio la muestre dentro de un iframe. Para tener esos encabezados, publica con Firebase Hosting (`firebase.json` ya los trae).
- La búsqueda carga todos los perfiles aprobados en cada visita. Alcanza para el piloto y para unos 1.200 hogares activos al mes dentro del plan gratuito. La paginación queda para la versión 1.2.
- Falta activar Firebase App Check contra abuso y la política de contraseñas en la consola (Authentication > Configuración > Política de contraseñas, mínimo 8 caracteres).

## Licencia

MIT. Ver `LICENSE`.
