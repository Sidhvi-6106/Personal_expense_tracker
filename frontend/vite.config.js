import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth-api': 'http://localhost:4000',
      '/transactions-api': 'http://localhost:4000',
      '/emi-api': 'http://localhost:4000',
      '/ai-api': 'http://localhost:4000',
    }
  }
})