import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Aumentar el límite a 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar dependencias grandes en chunks separados
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'lucide': ['lucide-react']
        }
      }
    }
  }
})