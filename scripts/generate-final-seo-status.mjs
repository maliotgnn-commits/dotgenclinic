import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DOCTORS, isDoctorProfileComplete } from '../src/doctors-data.js';
import { SEO_PILLAR_PAGES } from '../src/seo-pillar-pages.js';
import { getAllSitemapUrls } from './sitemap-urls.mjs';
import { CLINIC } from './seo-shared.mjs';
import { isGoogleBusinessConfigured } from '../server/seo/google-business/client.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_PATH = resolve(ROOT, 'reports/final-seo-status.md');

function score(value) {
  return Math.max(0, Math.min(10, Number(value.toFixed(1))));
}

function renderScoreLine(label, value, notes) {
  return `- **${label}:** ${value}/10 — ${notes}`;
}

export function buildFinalSeoStatusReport(options = {}) {
  const sitemapCount = getAllSitemapUrls().length;
  const sitemapHasLastmod = existsSync(resolve(ROOT, 'public/sitemap.xml'))
    ? readFileSync(resolve(ROOT, 'public/sitemap.xml'), 'utf8').includes('<lastmod>')
    : false;

  const doctorReady = DOCTORS.filter((doctor) => isDoctorProfileComplete(doctor)).length;
  const pillarReady = SEO_PILLAR_PAGES.filter((pillar) => pillar.status !== 'planned').length;
  const gscReady = Boolean(options.searchConsoleReady);
  const gbpReady = isGoogleBusinessConfigured();

  const technicalSeo = score(sitemapHasLastmod ? 9 : 7);
  const indexReadiness = score(gscReady ? 8 : 6);
  const schemaReadiness = score(8);
  const eeatReadiness = score(doctorReady > 0 ? 6 : 3);
  const localSeoReadiness = score(gbpReady ? 7 : 4);
  const contentReadiness = score(pillarReady > 0 ? 7 : 4);
  const authorityReadiness = score(3);

  return `# Final SEO Status

Generated: ${new Date().toISOString()}

## Score overview (0-10)

${renderScoreLine('Technical SEO', technicalSeo, `Sitemap ${sitemapCount} URL, canonical/hreflang/schema pipeline active.`)}
${renderScoreLine('Index readiness', indexReadiness, gscReady ? 'Search Console API connected.' : 'Search Console automation pending credentials/runtime.')}
${renderScoreLine('Schema readiness', schemaReadiness, 'Organization, Service, MedicalClinic, FAQ validators active.')}
${renderScoreLine('E-E-A-T readiness', eeatReadiness, `${doctorReady}/${DOCTORS.length} doctor profiles complete.`)}
${renderScoreLine('Local SEO readiness', localSeoReadiness, gbpReady ? 'GBP API configured.' : 'GBP API scaffold ready; manual/local setup required.')}
${renderScoreLine('Content readiness', contentReadiness, `${pillarReady}/${SEO_PILLAR_PAGES.length} pillar guides published.`)}
${renderScoreLine('Authority readiness', authorityReadiness, 'Backlink/PR strategy documented; execution manual.')}

## Technical SEO

- Sitemap URLs: ${sitemapCount}
- Locales: ${CLINIC.locations.length} clinic locations in schema data model
- Admin pages excluded from index checks

## Index readiness

- Search Console service account integration: ${gscReady ? 'ready' : 'pending'}
- Canonical registry aligned with sitemap-urls

## Schema readiness

- MedicalClinic canonical Izmir entity enforced
- Doctor schema gated by profileCompleted + indexed

## E-E-A-T readiness

- Doctor scaffolds: ${DOCTORS.length}
- Completed profiles: ${doctorReady}
- Schema emission blocked until verified data supplied

## Local SEO readiness

- Locations: ${CLINIC.locations.map((location) => location.name).join(', ')}
- GBP API: ${gbpReady ? 'configured' : 'not configured'}

## Content readiness

- Pillar guides planned: ${SEO_PILLAR_PAGES.length}
- Published pillar guides: ${pillarReady}

## Authority readiness

- See reports/authority-plan.md for outreach and PR strategy
`;
}

export async function writeFinalSeoStatusReport() {
  mkdirSync(resolve(ROOT, 'reports'), { recursive: true });

  let searchConsoleReady = false;
  try {
    const { getSearchConsoleConfigSummary } = await import(
      pathToFileURL(resolve(ROOT, 'server/seo/search-console/seo-report.js')).href
    );
    searchConsoleReady = getSearchConsoleConfigSummary().ready;
  } catch {
    searchConsoleReady = false;
  }

  writeFileSync(REPORT_PATH, buildFinalSeoStatusReport({ searchConsoleReady }), 'utf8');
  console.log(`[generate-final-seo-status] Wrote ${REPORT_PATH}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFinalSeoStatusReport().catch((error) => {
    console.error('[generate-final-seo-status] Failed:', error?.message || error);
    process.exit(1);
  });
}
