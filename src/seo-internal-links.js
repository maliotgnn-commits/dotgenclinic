import { getDoctorsForCategory } from './doctors-data.js';
import {
  ORPHAN_INBOUND_LINKS,
  ORPHAN_SERVICE_SLUGS,
  getClusterLinksForServiceSlug,
  getClusterServiceLinkOrder,
} from './seo-content-clusters.js';

function pagesBySlugMap(catalog) {
  return Object.fromEntries(catalog.pages.map((entry) => [entry.slug, entry]));
}

function addSlug(slug, pagesBySlug, chosen, seen) {
  if (!slug || seen.has(slug) || !pagesBySlug[slug]) return;
  seen.add(slug);
  chosen.push(pagesBySlug[slug]);
}

/**
 * Prefer cluster link order, orphan backlink targets, same-category, then fill.
 */
export function enhanceRelatedPages(catalog, page, limit = 6) {
  if (!page) return [];

  const pagesBySlug = pagesBySlugMap(catalog);
  const chosen = [];
  const seen = new Set([page.slug]);

  const clusterInfo = getClusterLinksForServiceSlug(page.slug);
  // Prefer the published pillar guide, then cluster order, then orphan backlinks.
  if (clusterInfo?.pillar?.slug) addSlug(clusterInfo.pillar.slug, pagesBySlug, chosen, seen);

  getClusterServiceLinkOrder(page.category).forEach((slug) => addSlug(slug, pagesBySlug, chosen, seen));

  Object.entries(ORPHAN_INBOUND_LINKS).forEach(([orphanSlug, sources]) => {
    if (sources.includes(page.slug)) addSlug(orphanSlug, pagesBySlug, chosen, seen);
  });

  clusterInfo?.pillar?.targetServiceSlugs?.forEach((slug) => addSlug(slug, pagesBySlug, chosen, seen));
  clusterInfo?.clusters?.forEach((cluster) =>
    cluster.targetServiceSlugs.forEach((slug) => addSlug(slug, pagesBySlug, chosen, seen)),
  );

  catalog.pages
    .filter((candidate) => candidate.category === page.category && candidate.slug !== page.slug)
    .forEach((candidate) => addSlug(candidate.slug, pagesBySlug, chosen, seen));

  catalog.pages.forEach((candidate) => addSlug(candidate.slug, pagesBySlug, chosen, seen));

  return chosen.slice(0, limit);
}

export function getClusterNavLinks(catalog, page, limit = 6) {
  if (!page) return [];
  const pagesBySlug = pagesBySlugMap(catalog);
  const order = getClusterServiceLinkOrder(page.category);
  return order
    .filter((slug) => slug !== page.slug)
    .map((slug) => pagesBySlug[slug])
    .filter(Boolean)
    .slice(0, limit);
}

export function getDoctorsForServicePage(page) {
  if (!page) return [];
  return getDoctorsForCategory(page.category);
}

export function isOrphanServiceSlug(slug) {
  return ORPHAN_SERVICE_SLUGS.includes(slug);
}

export function listOrphanPages(catalog) {
  return catalog.pages.filter((page) => ORPHAN_SERVICE_SLUGS.includes(page.slug));
}
