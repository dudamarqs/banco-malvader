import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redireciona requisições que começam com /api
      '/api': {
        target: 'http://localhost:3001', // O endereço do seu backend
        changeOrigin: true,
        secure: false,      
      }
    }
  }
})
