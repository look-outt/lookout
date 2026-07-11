import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to Django backend during development
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/questionnaire': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/generate_post': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
