import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/register': 'http://localhost:8000',
      '/login': 'http://localhost:8000',
      '/me': 'http://localhost:8000',
      '/organizations': 'http://localhost:8000',
      '/workspaces': 'http://localhost:8000',
      '/knowledge-bases': 'http://localhost:8000',
      '/api-keys': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
    },
  },
})
