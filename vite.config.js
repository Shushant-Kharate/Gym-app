import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IP addresses (0.0.0.0)
    port: 5173,
    allowedHosts: ['all', '.lhr.life', '.loca.lt', '.pinggy.link'],
  },
  build: {
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('recharts')) return 'charts';
          if (id.includes('lucide-react')) return 'icons';
        },
      },
    },
  },
})
