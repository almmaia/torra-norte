import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relativa: o build roda de qualquer pasta ou subdomínio
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 600 },
})
