import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the frontend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to the backend
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
