import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const VERCEL_PATH = resolve(ROOT, 'vercel.json');

function buildServiceSeoRewrites() {
  const slugs = SUBPAGES.map((page) => page.slug);
  const rewrites = [];

  for (const locale of LOCALES) {
    for (const slug of slugs) {
      rewrites.push({
        source: `/${locale}/service.html`,
        has: [
          {
            type: 'query',
            key: 'slug',
            value: slug,
          },
        ],
        destination: `/_seo/${locale}/service/${slug}.html`,
      });
    }
  }

  return rewrites;
}

function updateVercelConfig() {
  const config = JSON.parse(readFileSync(VERCEL_PATH, 'utf8'));
  const serviceSeoRewrites = buildServiceSeoRewrites();
  const trailingRewrites = (config.rewrites || []).filter(
    (rewrite) => !rewrite.destination?.startsWith('/_seo/'),
  );

  config.rewrites = [...serviceSeoRewrites, ...trailingRewrites];
  writeFileSync(VERCEL_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  console.log(
    `[generate-vercel-service-rewrites] Wrote ${serviceSeoRewrites.length} service SEO rewrites to vercel.json`,
  );
}

updateVercelConfig();
