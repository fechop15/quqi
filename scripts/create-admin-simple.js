/**
 * Script simple para crear usuario admin usando las credenciales del proyecto
 * Este script usa el Firebase Client SDK y crea el usuario directamente
 *
 * NOTA: Este approach requiere que primero crees el usuario en Authentication
 * y luego agregues el perfil en Firestore manualmente.
 *
 * Para una solución más simple, usa la consola de Firebase:
 * https://console.firebase.google.com/project/quqi-3ecdf/authentication
 */

console.log('=== Crear Usuario Admin - Método Recomendado ===\n');
console.log('Opción 1: Usar Firebase Console (RECOMENDADO)');
console.log('------------------------------------------------');
console.log('1. Ve a: https://console.firebase.google.com/project/quqi-3ecdf/authentication/users');
console.log('2. Click en "Add user"');
console.log('3. Ingresa email y contraseña del admin');
console.log('4. Copia el UID que aparece al crear el usuario');
console.log('');
console.log('5. Ve a Firestore: https://console.firebase.google.com/project/quqi-3ecdf/firestore/data');
console.log('6. Click en "Start collection"');
console.log('7. Collection ID: users');
console.log('8. Document ID: (pega el UID del paso 4)');
console.log('9. Agrega estos campos:');
console.log('   - Field: email | Type: string | Value: tu-email@ejemplo.com');
console.log('   - Field: nombre | Type: string | Value: Tu Nombre');
console.log('   - Field: role | Type: string | Value: admin');
console.log('   - Field: activo | Type: boolean | Value: true');
console.log('');
console.log('Opción 2: Usar Firebase CLI');
console.log('------------------------------------------------');
console.log('npm install -g firebase-tools');
console.log('firebase login');
console.log('firebase use quqi-3ecdf');
console.log('# Luego crea un script con firebase-admin');
console.log('');
console.log('=== Reglas de Seguridad para Firestore ===');
console.log('Copia esto en: https://console.firebase.google.com/project/quqi-3ecdf/firestore/rules');
console.log('');
console.log(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isLoggedIn() {
      return request.auth != null;
    }

    function getUserRole() {
      return get(/databases/\$(database)/documents/users/\$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return getUserRole() == 'admin';
    }

    function isManager() {
      return getUserRole() == 'gerente' || isAdmin();
    }

    match /users/{userId} {
      allow read: if isLoggedIn() && (userId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }

    match /productos/{productoId} {
      allow read: if isLoggedIn();
      allow create, update: if isLoggedIn() && isManager();
      allow delete: if isAdmin();
    }

    match /ingresos/{ingresoId} {
      allow read: if isLoggedIn() && isManager();
      allow create, update, delete: if isLoggedIn() && isManager();
    }

    match /egresos/{egresoId} {
      allow read: if isLoggedIn() && isManager();
      allow create, update, delete: if isLoggedIn() && isManager();
    }

    match /ventas/{ventaId} {
      allow read: if isLoggedIn() &&
        (isAdmin() || isManager() || resource.data.vendedorId == request.auth.uid);
      allow create: if isLoggedIn();
      allow update: if isLoggedIn() && (isAdmin() || isManager());
      allow delete: if isAdmin();
    }
  }
}`);
