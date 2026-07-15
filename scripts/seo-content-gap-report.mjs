import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import { SEO_CLUSTERS, ORPHAN_SERVICE_SLUGS } from '../src/seo-content-clusters.js';
import { listPlannedPillarGaps, SEO_PILLAR_PAGES } from '../src/seo-pillar-pages.js';
import { DOCTORS, isDoctorProfileComplete } from '../src/doctors-data.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_PATH = resolve(ROOT, 'reports/content-gap-report.md');

function groupGaps(items) {
  return {
    high: items.filter((item) => item.impact === 'high'),
    medium: items.filter((item) => item.impact === 'medium'),
    low: items.filter((item) => item.impact === 'low'),
  };
}

function renderSection(title, items) {
  if (!items.length) return `### ${title}\n\n- Yok\n`;
  return `### ${title}\n\n${items.map((item) => `- **${item.title}** — ${item.detail}`).join('\n')}\n`;
}

export function buildContentGapReport() {
  const gaps = [];

  listPlannedPillarGaps().forEach((pillar) => {
    gaps.push({
      impact: 'high',
      title: pillar.title,
      detail: `Pillar status: ${pillar.status}. Cluster: ${pillar.clusterKey}.`,
    });
  });

  Object.entries(SEO_CLUSTERS).forEach(([key, cluster]) => {
    if (cluster.pillar?.status === 'planned') {
      gaps.push({
        impact: 'high',
        title: `${cluster.label} pillar content`,
        detail: `Pillar "${cluster.pillar.title}" is planned but not published.`,
      });
    }

    const linkedSlugs = new Set(cluster.serviceLinkOrder || []);
    const missingClusterLinks = (cluster.serviceLinkOrder || []).filter((slug) => {
      const page = SUBPAGES.find((entry) => entry.slug === slug);
      return !page || !Array.isArray(page.faqs) || page.faqs.length < 3;
    });

    if (missingClusterLinks.length) {
      gaps.push({
        impact: 'medium',
        title: `${cluster.label} FAQ depth`,
        detail: `${missingClusterLinks.length} service pages have thin FAQ coverage.`,
      });
    }

    if (key !== 'eye-health' && linkedSlugs.size < 3) {
      gaps.push({
        impact: 'medium',
        title: `${cluster.label} internal link density`,
        detail: 'Cluster serviceLinkOrder is too small for strong internal linking.',
      });
    }
  });

  ORPHAN_SERVICE_SLUGS.forEach((slug) => {
    gaps.push({
      impact: 'medium',
      title: `Orphan service: ${slug}`,
      detail: 'Requires inbound links from mapped source pages.',
    });
  });

  DOCTORS.filter((doctor) => !isDoctorProfileComplete(doctor)).forEach((doctor) => {
    gaps.push({
      impact: 'high',
      title: `Doctor E-E-A-T: ${doctor.name}`,
      detail: 'Profile incomplete — schema blocked, noindex preserved.',
    });
  });

  if (SEO_PILLAR_PAGES.every((pillar) => pillar.status === 'planned')) {
    gaps.push({
      impact: 'high',
      title: 'Pillar content system',
      detail: 'All pillar guides remain in planned state.',
    });
  }

  gaps.push({
    impact: 'low',
    title: 'Multilingual parity audit',
    detail: 'Run verify-home-static-i18n and service static SEO checks each release.',
  });

  const grouped = groupGaps(gaps);

  return `# Content Gap Report

Generated: ${new Date().toISOString()}

## Summary

- Total gaps: ${gaps.length}
- High impact: ${grouped.high.length}
- Medium impact: ${grouped.medium.length}
- Low impact: ${grouped.low.length}

## High impact

${renderSection('High impact', grouped.high)}

## Medium impact

${renderSection('Medium impact', grouped.medium)}

## Low impact

${renderSection('Low impact', grouped.low)}
`;
}

export function writeContentGapReport() {
  mkdirSync(resolve(ROOT, 'reports'), { recursive: true });
  writeFileSync(REPORT_PATH, buildContentGapReport(), 'utf8');
  console.log(`[seo-content-gap-report] Wrote ${REPORT_PATH}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeContentGapReport();
}
