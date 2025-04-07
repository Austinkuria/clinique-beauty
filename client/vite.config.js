import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    css: {
        postcss: './postcss.config.js',
    },
    server: {
        hmr: {
            overlay: false, // Temporarily disable overlay to allow development
        },
    },
});
