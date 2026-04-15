/**
 * Script para crear un usuario administrador en Firebase
 *
 * Uso:
 * 1. npm install -g firebase-tools
 * 2. firebase login
 * 3. node scripts/create-admin.js
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const readline = require('readline');

// Interfaz para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  console.log('=== Crear Usuario Admin en Firebase ===\n');

  // Pedir credenciales al usuario
  const projectId = await question('Project ID de Firebase (quqi-3ecdf): ');
  const email = await question('Email del admin: ');
  const password = await question('Contraseña (mínimo 6 caracteres): ');
  const nombre = await question('Nombre completo: ');

  rl.close();

  try {
    // Inicializar Firebase Admin
    const adminApp = initializeApp({
      credential: cert(
        `${process.env.HOME}/.config/firebase/${projectId}-firebase-adminsdk.json`
      ),
      projectId,
    });

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    // Crear usuario en Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: nombre,
    });

    console.log('\n✅ Usuario creado en Authentication:', userRecord.uid);

    // Crear perfil en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      nombre,
      role: 'admin',
      activo: true,
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Perfil creado en Firestore');
    console.log('\n=== Usuario Admin Creado Exitosamente ===');
    console.log(`Email: ${email}`);
    console.log(`Nombre: ${nombre}`);
    console.log(`Role: admin`);
    console.log('\nYa puedes iniciar sesión en /login');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n--- Alternativa: Crear manualmente en Firebase Console ---');
    console.log('1. Ve a: https://console.firebase.google.com/project/quqi-3ecdf/authentication/users');
    console.log('2. Click en "Add user" y crea el usuario con email y contraseña');
    console.log('3. Copia el UID del usuario creado');
    console.log('4. Ve a Firestore: https://console.firebase.google.com/project/quqi-3ecdf/firestore/data');
    console.log('5. Crea una colección "users" con un documento cuyo ID sea el UID copiado');
    console.log('6. Agrega los campos:');
    console.log('   - email: ' + email);
    console.log('   - nombre: ' + nombre);
    console.log('   - role: admin');
    console.log('   - activo: true (boolean)');
    process.exit(1);
  }
}

createAdmin();
