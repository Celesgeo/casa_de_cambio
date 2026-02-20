import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { copyFileSync, existsSync } from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-index-to-404',
      closeBundle() {
        const outDir = path.resolve(__dirname, 'dist');
        const index = path.join(outDir, 'index.html');
        const fallback = path.join(outDir, '404.html');
        if (existsSync(index)) copyFileSync(index, fallback);
      }
    }
  ],
  server: {
    port: 5173
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});

