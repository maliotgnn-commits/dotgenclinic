import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCTORS, MISSING_DATA, isDoctorProfileComplete } from '../src/doctors-data.js';
import { SEO_CLUSTERS, ORPHAN_INBOUND_LINKS, ORPHAN_SERVICE_SLUGS } from '../src/seo-content-clusters.js';
import { SUBPAGES } from '../src/subpages-data.js';
import { getAllSitemapUrls } from './sitemap-urls.mjs';
import { canEmitDoctorSchema } from '../src/doctor-schema.js';
import { SEO_PILLAR_PAGES } from '../src/seo-pillar-pages.js';

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
  ['education', 'experience', 'interests', 'publications', 'conferences', 'congresses', 'memberships', 'approach', 'certifications'].forEach((field) => {
    assert(doctor[field] === MISSING_DATA, `Doctor ${doctor.slug}.${field} must use MISSING_DATA placeholder`);
  });
});

const clusterKeys = Object.keys(SEO_CLUSTERS);
assert(clusterKeys.length === 6, `Expected 6 SEO clusters, found ${clusterKeys.length}`);
clusterKeys.forEach((key) => {
  const cluster = SEO_CLUSTERS[key];
  assert(cluster.pillar?.title, `Cluster ${key} pillar title missing`);
  assert(Array.isArray(cluster.clusters) && cluster.clusters.length > 0, `Cluster ${key} must define cluster topics`);
  assert(Array.isArray(cluster.serviceLinkOrder), `Cluster ${key} serviceLinkOrder missing`);
  if (key !== 'eye-health') {
    assert(cluster.serviceLinkOrder.length > 0, `Cluster ${key} serviceLinkOrder must not be empty`);
  }
});

Object.entries(ORPHAN_INBOUND_LINKS).forEach(([orphanSlug, sources]) => {
  assert(ORPHAN_SERVICE_SLUGS.includes(orphanSlug), `Orphan inbound target must be orphan slug: ${orphanSlug}`);
  assert(Array.isArray(sources) && sources.length > 0, `Orphan inbound sources missing for ${orphanSlug}`);
  sources.forEach((sourceSlug) => {
    assert(SUBPAGES.some((page) => page.slug === sourceSlug), `Orphan inbound source not found: ${sourceSlug}`);
  });
});

DOCTORS.forEach((doctor) => {
  assert(canEmitDoctorSchema(doctor) === false, `Doctor ${doctor.slug} must not emit schema until verified`);
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

assert(SEO_PILLAR_PAGES.length >= 5, 'SEO pillar pages registry missing entries');
SEO_PILLAR_PAGES.forEach((pillar) => {
  assert(pillar.id && pillar.title, 'Pillar page id/title required');
  assert(Array.isArray(pillar.linkedServices) && pillar.linkedServices.length > 0, `Pillar ${pillar.id} linkedServices missing`);
  if (pillar.status === 'published') {
    assert(
      SUBPAGES.some((page) => page.slug === pillar.id),
      `Published pillar ${pillar.id} must exist in SUBPAGES`,
    );
  }
});

Object.entries(SEO_CLUSTERS).forEach(([key, cluster]) => {
  if (key === 'eye-health') return;
  if (cluster.pillar?.status === 'published') {
    assert(
      SUBPAGES.some((page) => page.slug === cluster.pillar.slug),
      `Published cluster pillar ${cluster.pillar.slug} must exist in SUBPAGES`,
    );
    assert(
      (cluster.serviceLinkOrder || []).includes(cluster.pillar.slug),
      `Cluster ${key} serviceLinkOrder must include published pillar slug`,
    );
  }
});

if (failures.length) {
  console.error('[verify-seo-growth-infra] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-seo-growth-infra] SEO growth infrastructure validation passed');
