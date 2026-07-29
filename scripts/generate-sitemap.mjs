import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllSitemapUrls, getLocationUrls } from './sitemap-urls.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP_PATH = resolve(ROOT, 'public/sitemap.xml');
const urls = getAllSitemapUrls();
const locationUrls = new Set(getLocationUrls());
const buildDate = new Date().toISOString().slice(0, 10);

let subpagesMtime = buildDate;
try {
  subpagesMtime = statSync(resolve(ROOT, 'src/subpages-data.js')).mtime.toISOString().slice(0, 10);
} catch {
  // fallback to build date
}

const existingLastmods = new Map();
if (existsSync(SITEMAP_PATH)) {
  const existingXml = readFileSync(SITEMAP_PATH, 'utf8');
  for (const match of existingXml.matchAll(
    /<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g,
  )) {
    existingLastmods.set(match[1], match[2]);
  }
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => {
    const fallbackLastmod = url.includes('/service.html?slug=') ? subpagesMtime : buildDate;
    const lastmod = existingLastmods.get(url) || fallbackLastmod;
    if (locationUrls.has(url)) {
      return [
        '  <url>',
        `    <loc>${url}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '    <changefreq>monthly</changefreq>',
        '    <priority>0.9</priority>',
        '  </url>',
      ].join('\n');
    }
    return `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`;
  }),
  '</urlset>',
  '',
].join('\n');

writeFileSync(SITEMAP_PATH, xml, 'utf8');
console.log(`[generate-sitemap] Wrote ${urls.length} URLs to public/sitemap.xml`);
