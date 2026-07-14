import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCTORS, MISSING_DATA, isDoctorProfileComplete } from '../src/doctors-data.js';
import { SEO_CLUSTERS, ORPHAN_SERVICE_SLUGS } from '../src/seo-content-clusters.js';
import { SUBPAGES } from '../src/subpages-data.js';
import { getAllSitemapUrls } from './sitemap-urls.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(DOCTORS.length === 3, `Expected 3 doctor scaffolds, found ${DOCTORS.length}`);
DOCTORS.forEach((doctor) => {
  assert(doctor.slug, 'Doctor slug is required');
  assert(doctor.name, `Doctor name required for ${doctor.slug}`);
  assert(doctor.specialty, `Doctor specialty required for ${doctor.slug}`);
  assert(doctor.indexed === false, `Doctor ${doctor.slug} must remain noindex until verified`);
  assert(!isDoctorProfileComplete(doctor), `Doctor ${doctor.slug} must not be marked complete without verified data`);
  ['education', 'experience', 'interests', 'publications', 'conferences', 'memberships', 'approach'].forEach((field) => {
    assert(doctor[field] === MISSING_DATA, `Doctor ${doctor.slug}.${field} must use MISSING_DATA placeholder`);
  });
});

const clusterKeys = Object.keys(SEO_CLUSTERS);
assert(clusterKeys.length === 6, `Expected 6 SEO clusters, found ${clusterKeys.length}`);
clusterKeys.forEach((key) => {
  const cluster = SEO_CLUSTERS[key];
  assert(cluster.pillar?.title, `Cluster ${key} pillar title missing`);
  assert(Array.isArray(cluster.clusters) && cluster.clusters.length > 0, `Cluster ${key} must define cluster topics`);
});

ORPHAN_SERVICE_SLUGS.forEach((slug) => {
  assert(SUBPAGES.some((page) => page.slug === slug), `Orphan slug not found in SUBPAGES: ${slug}`);
});

const sitemapXml = readFileSync(resolve(ROOT, 'public/sitemap.xml'), 'utf8');
const sitemapUrls = getAllSitemapUrls();
assert(sitemapXml.includes('<lastmod>'), 'Sitemap must include lastmod entries');
assert((sitemapXml.match(/<lastmod>/g) || []).length === sitemapUrls.length, 'Every sitemap URL must include lastmod');
assert(!sitemapXml.includes('/doctor.html'), 'Doctor profile pages must not be in sitemap until indexed');

const doctorHtml = readFileSync(resolve(ROOT, 'doctor.html'), 'utf8');
assert(doctorHtml.includes('noindex'), 'doctor.html must default to noindex');

const checklist = JSON.parse(readFileSync(resolve(ROOT, 'scripts/seo-operations-checklist.json'), 'utf8'));
assert(Array.isArray(checklist.weekly) && checklist.weekly.length >= 4, 'SEO weekly checklist missing');
assert(Array.isArray(checklist.searchConsoleSetup) && checklist.searchConsoleSetup.length >= 3, 'GSC setup checklist missing');

if (failures.length) {
  console.error('[verify-seo-growth-infra] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-seo-growth-infra] SEO growth infrastructure validation passed');
