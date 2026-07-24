import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      output: {
        // Separa las librerias pesadas para que el arranque no cargue todo de golpe.
        manualChunks: {
          pdf: ['pdfjs-dist'],
          docx: ['mammoth'],
        },
      },
    },
  },
})
