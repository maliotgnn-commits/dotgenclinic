import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import { buildDepartmentSeoRewrites } from './department-seo-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const VERCEL_PATH = resolve(ROOT, 'vercel.json');
const LOCATION_REWRITES = [
  { source: '/tr/denizli.html', destination: '/denizli.html' },
  { source: '/tr/izmir.html', destination: '/izmir.html' },
  { source: '/tr/leverkusen.html', destination: '/leverkusen.html' },
  { source: '/denizli', destination: '/denizli.html' },
  { source: '/izmir', destination: '/izmir.html' },
  { source: '/leverkusen', destination: '/leverkusen.html' },
];
const LOCATION_SOURCES = new Set(LOCATION_REWRITES.map((rewrite) => rewrite.source));

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
  const departmentSeoRewrites = buildDepartmentSeoRewrites();
  const trailingRewrites = (config.rewrites || []).filter(
    (rewrite) =>
      !rewrite.destination?.startsWith('/_seo/')
      && !LOCATION_SOURCES.has(rewrite.source),
  );

  config.rewrites = [
    ...LOCATION_REWRITES,
    ...serviceSeoRewrites,
    ...departmentSeoRewrites,
    ...trailingRewrites,
  ];
  writeFileSync(VERCEL_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  console.log(
    `[generate-vercel-service-rewrites] Wrote ${serviceSeoRewrites.length} service and ${departmentSeoRewrites.length} department SEO rewrites to vercel.json`,
  );
}

updateVercelConfig();
