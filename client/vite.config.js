import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the server during development
      '/api': {
        target: 'http://localhost:3001', // Your Express server URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
