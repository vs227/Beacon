import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Force reload comment to pick up newly installed node_modules
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/register': 'http://127.0.0.1:8000',
      '/login': 'http://127.0.0.1:8000',
      '/me': 'http://127.0.0.1:8000',
      '/organizations': 'http://127.0.0.1:8000',
      '/workspaces': 'http://127.0.0.1:8000',
      '/knowledge-bases': 'http://127.0.0.1:8000',
      '/api-keys': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000',
      '/activity': 'http://127.0.0.1:8000',
      '/projects': 'http://127.0.0.1:8000',
      '/documents': 'http://127.0.0.1:8000',
      '/search': 'http://127.0.0.1:8000',
      '/webhooks': 'http://127.0.0.1:8000',
      '/query': 'http://127.0.0.1:8000',
    },
  },
})
