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
        medicalAccount: resolve(projectRoot, 'medical/account.html'),
        medicalCart: resolve(projectRoot, 'medical/cart.html'),
        medicalCheckout: resolve(projectRoot, 'medical/checkout.html'),
        medicalInventory: resolve(projectRoot, 'medical/inventory.html'),
        medicalPrivacy: resolve(projectRoot, 'medical/privacy.html'),
        medicalProduct: resolve(projectRoot, 'medical/product.html'),
        medicalVerification: resolve(
          projectRoot,
          'medical/professional-verification.html',
        ),
      },
    },
  },
});
