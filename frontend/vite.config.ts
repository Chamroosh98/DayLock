
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@pkg': path.resolve(__dirname, '../backend/worker/pkg'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    
    build: {
      chunkSizeWarningLimit: 600,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  };
});