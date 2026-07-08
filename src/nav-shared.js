export const MOBILE_NAV_MAX_WIDTH = 1280;

export function isMobileNavViewport(width = window.innerWidth) {
  return width < MOBILE_NAV_MAX_WIDTH;
}

export function isDesktopNavViewport(width = window.innerWidth) {
  return width >= MOBILE_NAV_MAX_WIDTH;
}
export const NAV_CHEVRON_SVG =
  '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>';

export const DESKTOP_MENU_CATEGORY_ORDER = [
  'corporate',
  'medical',
  'plastic',
  'hair',
  'dental',
  'longevity',
];

export function desktopMenuIdForCategory(categoryKey) {
  if (categoryKey === 'medical') return 'medical-aesthetics';
  if (categoryKey === 'longevity') return 'functional-health';
  if (categoryKey === 'eye-health') return 'eye-health';
  return categoryKey;
}

export function desktopMenuIdForIndex(index) {
  const categoryKey = DESKTOP_MENU_CATEGORY_ORDER[index];
  return categoryKey ? desktopMenuIdForCategory(categoryKey) : `nav-menu-${index}`;
}

export function renderNavChevron() {
  return NAV_CHEVRON_SVG;
}

export function insertNavItemBeforeDesktopMenuId(navHtml, desktopMenuId, navItemHtml) {
  const marker = `<li class="has-dropdown" data-desktop-menu-id="${desktopMenuId}"`;
  const markerIndex = navHtml.indexOf(marker);
  if (markerIndex === -1) return `${navHtml}${navItemHtml}`;
  return `${navHtml.slice(0, markerIndex)}${navItemHtml}${navHtml.slice(markerIndex)}`;
}

export function renderMobileCategoryTrigger({ label, panelId, fullLabel }) {
  const safeLabel = String(label ?? '');
  const safeFullLabel = String(fullLabel ?? safeLabel);
  const safePanelId = String(panelId ?? '');
  return `
    <button type="button" class="mobile-nav-trigger" aria-expanded="false" aria-controls="${safePanelId}" aria-label="${safeFullLabel}">
      <span class="mobile-nav-label">${safeLabel}</span>
      ${NAV_CHEVRON_SVG}
    </button>
    <a href="#" class="desktop-nav-trigger" aria-label="${safeFullLabel}">${safeLabel} ${NAV_CHEVRON_SVG}</a>
  `;
}
