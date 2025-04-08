import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    css: {
        postcss: './postcss.config.js',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        hmr: {
            overlay: false, // Disable error overlay during development
        }
    },
    build: {
        sourcemap: true,
        cssCodeSplit: true
    },
    optimizeDeps: {
        include: ['@mui/material', '@emotion/react', '@emotion/styled']
    }
});
