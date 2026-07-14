import { getDoctorsForCategory } from './doctors-data.js';
import { ORPHAN_SERVICE_SLUGS, getClusterLinksForServiceSlug } from './seo-content-clusters.js';

/**
 * Prefer same-category pages, then cluster-linked services, then fill remaining slots.
 */
export function enhanceRelatedPages(catalog, page, limit = 4) {
  if (!page) return [];

  const pagesBySlug = Object.fromEntries(catalog.pages.map((entry) => [entry.slug, entry]));
  const chosen = [];
  const seen = new Set([page.slug]);

  const addSlug = (slug) => {
    if (!slug || seen.has(slug) || !pagesBySlug[slug]) return;
    seen.add(slug);
    chosen.push(pagesBySlug[slug]);
  };

  const clusterInfo = getClusterLinksForServiceSlug(page.slug);
  clusterInfo?.pillar?.targetServiceSlugs?.forEach(addSlug);
  clusterInfo?.clusters?.forEach((cluster) => cluster.targetServiceSlugs.forEach(addSlug));

  const sameCategory = catalog.pages.filter(
    (candidate) => candidate.category === page.category && candidate.slug !== page.slug,
  );
  sameCategory.forEach((candidate) => addSlug(candidate.slug));

  catalog.pages.forEach((candidate) => addSlug(candidate.slug));

  return chosen.slice(0, limit);
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
