#!/usr/bin/env node

console.log('╔═════════════════════════════════════════════════════╗');
console.log('║  Configuración CORS - Firebase Storage             ║');
console.log('╚═════════════════════════════════════════════════════╝\n');

console.log('Para configurar CORS en Firebase Storage, tienes 2 opciones:\n');

console.log('🚀 OPCIÓN 1: Desde Firebase Console (RECOMENDADO - 2 minutos)');
console.log('───────────────────────────────────────────────────────');
console.log('1. Abre: https://console.firebase.google.com/project/antojado-9d910');
console.log('2. Ve a Storage > Reglas');
console.log('3. Reemplaza todo con:\n');

const rules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

console.log(rules);

console.log('\n4. Haz clic en "Publicar"');
console.log('\n✅ CORS estará configurado automáticamente\n');

console.log('═══════════════════════════════════════════════════════\n');

console.log('📋 OPCIÓN 2: Usando gcloud CLI');
console.log('───────────────────────────────────────────────────────');
console.log('1. Descarga Google Cloud SDK:');
console.log('   https://cloud.google.com/sdk/docs/install\n');

console.log('2. Ejecuta en PowerShell (desde la carpeta del proyecto):');
console.log('   gcloud auth login');
console.log('   gcloud config set project antojado-9d910');
console.log('   gsutil cors set cors-config.json gs://antojado-9d910.appspot.com\n');

console.log('═══════════════════════════════════════════════════════\n');

console.log('⚠️  IMPORTANTE:');
console.log('La mayoría de usuarios usan la Opción 1 porque es más rápida.');
console.log('Si sigue habiendo errores CORS después de publicar las reglas,');
console.log('puede deberse a caché del navegador. Intenta:');
console.log('  • Ctrl + Shift + Delete (limpiar caché)');
console.log('  • Abrir en incógnito');
console.log('  • Esperar 5-10 minutos\n');

console.log('═══════════════════════════════════════════════════════\n');
console.log('✔️  Una vez completado, recarga la app en http://localhost:5173\n');
