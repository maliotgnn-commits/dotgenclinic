import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  publicDir: resolve(projectRoot, 'public'),
  build: {
    outDir: resolve(projectRoot, 'dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        medical: resolve(projectRoot, 'medical/index.html'),
        medicalVerification: resolve(
          projectRoot,
          'medical/professional-verification.html',
        ),
      },
    },
  },
});
