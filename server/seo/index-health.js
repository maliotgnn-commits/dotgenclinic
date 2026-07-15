import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOCTORS } from '../../src/doctors-data.js';
import { LOCALES } from '../../scripts/seo-shared.mjs';
import { getAllSitemapUrls } from '../../scripts/sitemap-urls.mjs';

const ADMIN_NOINDEX_PATHS = ['/admin/analytics', '/admin/seo'];
const DOCTOR_TEMPLATE_PATH = '/doctor.html';

function countSitemapUrlsFromFile() {
  try {
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    const xml = readFileSync(sitemapPath, 'utf8');
    return (xml.match(/<loc>/g) || []).length;
  } catch {
    return getAllSitemapUrls().length;
  }
}

export function getIndexHealthReport(indexingReport = {}) {
  const canonicalUrlCount = getAllSitemapUrls().length;
  const sitemapFileUrlCount = countSitemapUrlsFromFile();

  const adminNoindexCount = ADMIN_NOINDEX_PATHS.length;
  const doctorProfileCount = DOCTORS.filter((doctor) => !doctor.indexed).length * LOCALES.length;
  const noindexUrlCount = adminNoindexCount + 1 + doctorProfileCount;

  return {
    sitemapUrlCount: indexingReport.sitemapUrlCount ?? sitemapFileUrlCount,
    indexCandidates: indexingReport.indexCandidates ?? canonicalUrlCount,
    canonicalUrlCount,
    noindexUrlCount,
    adminNoindexPaths: ADMIN_NOINDEX_PATHS,
    doctorTemplatePath: DOCTOR_TEMPLATE_PATH,
    doctorNoindexProfiles: doctorProfileCount,
    sitemapFileUrlCount,
    note: 'Canonical count from sitemap-urls registry. Noindex includes admin pages, doctor.html template, and unindexed doctor profiles.',
  };
}
