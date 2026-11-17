// Respaldo de la base de datos (HU-16). Exporta todas las colecciones a un archivo JSON en la carpeta respaldos/.
// Uso: 1) En la consola de Firebase: Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada.
//      2) Guarda el archivo fuera del repositorio. NUNCA lo subas a GitHub.
//      3) GOOGLE_APPLICATION_CREDENTIALS=/ruta/clave.json npm run respaldo
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { mkdirSync, writeFileSync } from 'node:fs';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const salida = {};
async function volcar(col, destino) {
  const snap = await col.get();
  for (const d of snap.docs) {
    destino[d.ref.path] = d.data();
    for (const sub of await d.ref.listCollections()) await volcar(sub, destino);
  }
}
for (const col of await db.listCollections()) await volcar(col, salida);
mkdirSync('respaldos', { recursive: true });
const archivo = `respaldos/respaldo-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
writeFileSync(archivo, JSON.stringify(salida, null, 1));
console.log(`Respaldo guardado: ${archivo} (${Object.keys(salida).length} documentos)`);
