import { Storage } from '@google-cloud/storage';
import fs from 'fs';

// 1. Configuración
const BUCKET_NAME = 'antojado-9d910.appspot.com'; // Tu bucket (lo saqué de tu error anterior)
const KEY_FILENAME = './service-account.json'; // El archivo que descargaste

async function fixCors() {
  try {
    // Verificamos que el archivo de clave exista
    if (!fs.existsSync(KEY_FILENAME)) {
      throw new Error('No encuentro el archivo service-account.json. ¿Lo pusiste en la raíz?');
    }

    console.log('🔌 Conectando a Google Cloud Storage...');
    
    // Inicializamos el cliente de almacenamiento con la llave
    const storage = new Storage({ keyFilename: KEY_FILENAME });
    
    // Configuración CORS que permite todo
    const corsConfiguration = [
      {
        origin: ["*"], // Permitir todos los orígenes (localhost, vercel, etc.)
        method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        responseHeader: ["Content-Type", "x-goog-resumable"],
        maxAgeSeconds: 3600
      }
    ];

    console.log(`⚙️  Aplicando reglas CORS al bucket: ${BUCKET_NAME}...`);

    // Aplicamos la configuración
    await storage.bucket(BUCKET_NAME).setCorsConfiguration(corsConfiguration);

    console.log('✅ ¡ÉXITO! Las reglas CORS han sido actualizadas.');
    console.log('🔄 Ahora puedes volver a intentar subir la imagen en tu app.');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.message.includes('Cannot find module')) {
      console.log('💡 TIP: Te falta instalar la librería. Ejecuta: npm install @google-cloud/storage');
    }
  }
}

fixCors();