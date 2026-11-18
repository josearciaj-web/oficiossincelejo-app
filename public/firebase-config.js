// Configuración de la app web de Firebase (proyecto oficiossincelejo-app).
// No es secreta: la seguridad de los datos depende de las reglas de firestore.rules.
export const firebaseConfig = {
  apiKey: 'AIzaSyCBe5D5hGbaURVrCnr4B5HNWZ-6uJt2YYU',
  authDomain: 'oficiossincelejo-app.firebaseapp.com',
  projectId: 'oficiossincelejo-app',
  storageBucket: 'oficiossincelejo-app.firebasestorage.app',
  messagingSenderId: '73430177112',
  appId: '1:73430177112:web:c679b616b35ca0ca3c812d'
};

// Correos de administradores. Deben coincidir con la lista ADMIN_CORREOS de firestore.rules.
// También se puede dar el rol creando el documento admins/{UID} en la consola.
export const adminCorreos = ['jose.arciaj@cecar.edu.co'];
