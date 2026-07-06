import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export default defineConfig({
  publicDir: resolve(ROOT, 'public'),
  build: {
    outDir: resolve(ROOT, 'dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(ROOT, 'yazilim-ar-ge.html'),
    },
  },
});
