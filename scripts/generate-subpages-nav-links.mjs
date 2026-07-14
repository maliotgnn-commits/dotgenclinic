import { writeFile } from 'node:fs/promises';
import { NAV_LINK_MAP } from '../src/subpages-data.js';

const content = `// Lightweight nav label -> slug map for homepage link wiring.
// Full service page content lives in subpages-data.js.

export const NAV_LINK_MAP = ${JSON.stringify(NAV_LINK_MAP, null, 2)};

export function applySubcategoryLinks(root = document, urlBuilder = (slug) => \`/service.html?slug=\${encodeURIComponent(slug)}\`) {
  const links = root.querySelectorAll('.mega-dropdown a, .service-link[data-service-slug], .popular-item[data-service-slug]');

  links.forEach((link) => {
    const explicitSlug = link.getAttribute('data-service-slug');
    const label = link.textContent.trim();
    const slug = explicitSlug || NAV_LINK_MAP[label];
    if (!slug) return;
    link.setAttribute('href', urlBuilder(slug));
  });
}
`;

await writeFile(new URL('../src/subpages-nav-links.js', import.meta.url), content);
console.log(`[generate-subpages-nav-links] Wrote ${Object.keys(NAV_LINK_MAP).length} nav entries`);
