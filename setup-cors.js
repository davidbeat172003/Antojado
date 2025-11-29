#!/usr/bin/env node

/**
 * Script para configurar CORS en Firebase Storage
 * Nota: Esta es una solución temporal. Para producción, usa:
 * gsutil cors set cors-config.json gs://antojado-9d910.appspot.com
 */

const fs = require('fs');
const path = require('path');

// En realidad, la mejor solución es usar gsutil directamente
// Pero podemos usar el emulador o una alternativa

console.log('┌─────────────────────────────────────────────────────┐');
console.log('│  Configurar CORS en Firebase Storage               │');
console.log('└─────────────────────────────────────────────────────┘\n');

console.log('Para configurar CORS correctamente, necesitas:');
console.log('');
console.log('1. Instalar Google Cloud SDK:');
console.log('   → https://cloud.google.com/sdk/docs/install');
console.log('');
console.log('2. Después de instalar, ejecuta en esta carpeta:');
console.log('');
console.log('   gcloud auth login');
console.log('   gcloud config set project antojado-9d910');
console.log('   gsutil cors set cors-config.json gs://antojado-9d910.appspot.com');
console.log('');
console.log('3. Verifica que funcionó:');
console.log('   gsutil cors get gs://antojado-9d910.appspot.com');
console.log('');
console.log('─────────────────────────────────────────────────────');
console.log('Alternativamente, en Firebase Console:');
console.log('');
console.log('1. Ve a Storage > Reglas');
console.log('2. Reemplaza con:');
console.log('');
console.log(`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`);
console.log('');
console.log('3. Haz clic en "Publicar"');
console.log('');
