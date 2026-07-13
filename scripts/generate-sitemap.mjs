import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllSitemapUrls } from './sitemap-urls.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const urls = getAllSitemapUrls();

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

writeFileSync(resolve(ROOT, 'public/sitemap.xml'), xml, 'utf8');
console.log(`[generate-sitemap] Wrote ${urls.length} URLs to public/sitemap.xml`);
