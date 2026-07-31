import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

const pages = [
  {
    file: 'denizli.html',
    canonical: 'https://www.drotgenclinic.com/tr/denizli.html',
    city: 'Denizli',
    latitude: 37.77796,
    longitude: 29.05676,
    counterpart: '/tr/izmir.html',
    address: 'Merkezefendi mahallesi, 226/21 sokak no:157',
  },
  {
    file: 'izmir.html',
    canonical: 'https://www.drotgenclinic.com/tr/izmir.html',
    city: 'İzmir',
    latitude: 38.4576,
    longitude: 27.1089,
    counterpart: '/tr/denizli.html',
    address: 'Anadolu Plaza No:23',
  },
  {
    file: 'leverkusen.html',
    canonical: 'https://www.drotgenclinic.com/tr/leverkusen.html',
    city: 'Leverkusen',
    latitude: 51.0345809,
    longitude: 7.0490208,
    counterpart: '/tr/izmir.html',
    address: 'Münsters Gäßchen 14',
  },
];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function parseJsonLd(html, file) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(match, `[${file}] JSON-LD missing`);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    failures.push(`[${file}] invalid JSON-LD: ${error.message}`);
    return null;
  }
}

for (const page of pages) {
  const filePath = resolve(DIST, page.file);
  assert(existsSync(filePath), `[${page.file}] build output missing`);
  if (!existsSync(filePath)) continue;

  const html = readFileSync(filePath, 'utf8');
  const jsonLd = parseJsonLd(html, page.file);
  const graph = jsonLd?.['@graph'] || [];
  const clinic = graph.find((node) => {
    const type = node?.['@type'];
    return type === 'MedicalClinic' || (Array.isArray(type) && type.includes('MedicalClinic'));
  });

  assert(html.includes(`<link rel="canonical" href="${page.canonical}"`), `[${page.file}] canonical mismatch`);
  assert((html.match(/GeoCoordinates/g) || []).length === 1, `[${page.file}] expected one GeoCoordinates block`);
  assert(html.includes('<h1>'), `[${page.file}] visible H1 missing`);
  assert(html.includes('location-page'), `[${page.file}] shared location stylesheet missing`);
  assert(html.includes('class="nav-logo"'), `[${page.file}] shared service header logo missing`);
  assert(html.includes('class="footer-logo"'), `[${page.file}] shared service footer logo missing`);
  assert(/\/assets\/location-page-[^"]+\.js/.test(html), `[${page.file}] shared location behavior missing`);
  assert(html.includes('action="https://formsubmit.co/drotgenclinic@gmail.com"'), `[${page.file}] appointment form missing`);
  assert(html.includes(page.counterpart), `[${page.file}] counterpart location link missing`);
  assert(html.includes(page.address), `[${page.file}] visible address mismatch`);
  assert(clinic?.name?.includes(page.city), `[${page.file}] clinic city mismatch`);
  assert(clinic?.geo?.latitude === page.latitude, `[${page.file}] latitude mismatch`);
  assert(clinic?.geo?.longitude === page.longitude, `[${page.file}] longitude mismatch`);
  assert(clinic?.openingHours === 'Mon-Sat 09:00-18:00', `[${page.file}] opening hours mismatch`);
}

if (failures.length) {
  console.error('[verify-location-pages] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-location-pages] Verified Denizli, Izmir and Leverkusen location pages');
