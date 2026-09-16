import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable HMR only when explicitly requested for non-interactive runs.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching alongside explicitly disabled HMR.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
