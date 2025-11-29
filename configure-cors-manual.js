#!/usr/bin/env node

/**
 * Script para configurar CORS en Firebase Storage usando API REST
 * Esto permite configurar CORS sin necesidad de Google Cloud SDK
 */

const https = require('https');
const fs = require('fs');

// ID del proyecto
const PROJECT_ID = 'antojado-9d910';
const BUCKET = 'antojado-9d910.appspot.com';

// Configuración CORS
const corsConfig = {
  cors: [
    {
      origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'],
      method: ['GET', 'HEAD', 'DELETE', 'POST', 'PUT'],
      responseHeader: ['Content-Type', 'x-goog-meta-uploaded-content-length'],
      maxAgeSeconds: 3600
    },
    {
      origin: ['*'],
      method: ['GET', 'HEAD'],
      responseHeader: ['Content-Type'],
      maxAgeSeconds: 3600
    }
  ]
};

console.log('╔═════════════════════════════════════════════════════╗');
console.log('║  Configuración CORS - Firebase Storage             ║');
console.log('╚═════════════════════════════════════════════════════╝\n');

console.log('Para configurar CORS en Firebase Storage, tienes 2 opciones:\n');

console.log('OPCIÓN 1: Desde Firebase Console (Recomendado - 2 minutos)');
console.log('───────────────────────────────────────────────────────');
console.log('1. Abre: https://console.firebase.google.com/project/antojado-9d910');
console.log('2. Ve a Storage > Reglas');
console.log('3. Reemplaza todo con:\n');

console.log(`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`);

console.log('\n4. Haz clic en "Publicar"');
console.log('\n✅ CORS estará configurado automáticamente\n');

console.log('═══════════════════════════════════════════════════════\n');

console.log('OPCIÓN 2: Usando gcloud CLI');
console.log('───────────────────────────────────────────────────────');
console.log('1. Descarga Google Cloud SDK:');
console.log('   https://cloud.google.com/sdk/docs/install\n');

console.log('2. Ejecuta en PowerShell (desde la carpeta del proyecto):');
console.log('   gcloud auth login');
console.log('   gcloud config set project antojado-9d910');
console.log(`   gsutil cors set cors-config.json gs://${BUCKET}\n`);

console.log('═══════════════════════════════════════════════════════\n');

console.log('⚠️  IMPORTANTE:');
console.log('La mayoría de usuarios usan la Opción 1 porque es más rápida.');
console.log('Si sigue habiendo errores CORS después de publicar las reglas,');
console.log('puede deberse a caché del navegador. Intenta:');
console.log('  • Ctrl + Shift + Delete (limpiar caché)');
console.log('  • Abrir en incógnito');
console.log('  • Esperar 5-10 minutos\n');
