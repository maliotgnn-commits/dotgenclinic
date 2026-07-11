import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

import { buildFinancePreviewPage } from './build-finance-preview-page.mjs';
import { buildLegalPreviewPage } from './build-legal-preview-page.mjs';
import { buildPharmaRdPreviewPage } from './build-pharma-rd-preview-page.mjs';
import { buildMedikalRdPreviewPage } from './build-medikal-rd-preview-page.mjs';
import { buildYazilimRdPreviewPage } from './build-yazilim-rd-preview-page.mjs';
import { buildBlockchainRdPreviewPage } from './build-blockchain-rd-preview-page.mjs';
import { buildEcommerceRdPreviewPage } from './build-ecommerce-rd-preview-page.mjs';

const steps = [
  ['node', ['scripts/verify-favicon-assets.mjs']],
  ['node', ['scripts/verify-service-static-seo.mjs']],
  ['node', ['scripts/verify-privacy-content.mjs']],
  ['node', ['scripts/verify-privacy-static-seo.mjs']],
  ['node', ['scripts/verify-schema.mjs']],
  ['node', ['scripts/verify-og-social-image.mjs']],
  ['node', ['scripts/verify-og-metadata.mjs']],
  ['node', ['scripts/verify-vercel-rewrites.mjs']],
  ['node', ['scripts/verify-vercel-headers.mjs']],
  ['node', ['scripts/verify-sitemap.mjs']],
  ['node', ['scripts/verify-home-static-i18n.mjs']],
  ['node', ['scripts/verify-home-static-seo.mjs']],
  ['node', ['scripts/verify-tr-eye-health-page.mjs']],
  ['node', ['scripts/verify-multilingual-eye-health-page.mjs']],
  ['node', ['scripts/verify-locale-route-rewrite.mjs']],
  ['node', ['scripts/verify-tr-eye-navigation.mjs']],
  ['node', ['scripts/verify-tr-finance-preview-page.mjs']],
  ['node', ['scripts/verify-tr-legal-preview-page.mjs']],
  ['node', ['scripts/verify-tr-pharma-rd-page.mjs']],
  ['node', ['scripts/verify-multilingual-pharma-rd-page.mjs']],
  ['node', ['scripts/verify-tr-medikal-rd-page.mjs']],
  ['node', ['scripts/verify-multilingual-medikal-rd-page.mjs']],
  ['node', ['scripts/verify-tr-yazilim-rd-page.mjs']],
  ['node', ['scripts/verify-multilingual-yazilim-rd-page.mjs']],
  ['node', ['scripts/verify-tr-blockchain-rd-page.mjs']],
  ['node', ['scripts/verify-multilingual-blockchain-rd-page.mjs']],
  ['node', ['scripts/verify-tr-ecommerce-rd-page.mjs']],
  ['node', ['scripts/verify-multilingual-ecommerce-rd-page.mjs']],
  ['node', ['scripts/verify-multilingual-legal-page.mjs']],
  ['node', ['scripts/verify-multilingual-finance-page.mjs']],
  ['node', ['scripts/verify-header-controls.mjs']],
  ['node', ['scripts/verify-nav-breakpoint-alignment.mjs']],
  ['node', ['scripts/verify-desktop-nav-exclusive-open.mjs']],
  ['node', ['scripts/verify-nav-category-labels.mjs']],
  ['node', ['scripts/verify-form-privacy.mjs']],
];

export function runBuildValidations() {
  JSON.parse(readFileSync(resolve(ROOT, 'vercel.json'), 'utf8'));
  buildFinancePreviewPage();
  buildLegalPreviewPage();
  buildPharmaRdPreviewPage();
  buildMedikalRdPreviewPage();
  buildYazilimRdPreviewPage();
  buildBlockchainRdPreviewPage();
  buildEcommerceRdPreviewPage();

  for (const [command, args] of steps) {
    const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  }

  const diff = spawnSync('git', ['diff', '--check'], { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' });
  if (diff.status !== 0) {
    console.error('[run-build-validations] git diff --check failed');
    if (diff.stdout) console.error(diff.stdout);
    if (diff.stderr) console.error(diff.stderr);
    process.exit(diff.status || 1);
  }

  console.log('[run-build-validations] All post-build validations passed');
}
