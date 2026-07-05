import { MOBILE_NAV_MAX_WIDTH } from './nav-shared.js';

export const DESKTOP_NAV_MIN_WIDTH = MOBILE_NAV_MAX_WIDTH;

function isDesktopNavViewport() {
  return window.innerWidth > DESKTOP_NAV_MIN_WIDTH;
}

function resolveMenuId(item, index) {
  if (item.dataset.desktopMenuId) return item.dataset.desktopMenuId;
  if (item.hasAttribute('data-eye-health-nav')) {
    item.dataset.desktopMenuId = 'eye-health';
    return 'eye-health';
  }
  const label = item.querySelector(':scope > a.desktop-nav-trigger, :scope > a, .eh-nav-primary-link')
    ?.textContent
    ?.replace(/\s+/g, ' ')
    .trim();
  const menuId = label ? `nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : `nav-menu-${index}`;
  item.dataset.desktopMenuId = menuId;
  return menuId;
}

export function getDesktopMenuRegistry(navMenu) {
  if (!navMenu) return [];

  return [...navMenu.querySelectorAll(':scope > li.has-dropdown')].map((item, index) => {
    const menuId = resolveMenuId(item, index);
    const isEyeHealth = item.hasAttribute('data-eye-health-nav');
    const trigger = isEyeHealth
      ? item.querySelector('.eh-nav-item-head')
      : item.querySelector(':scope > a.desktop-nav-trigger, :scope > a');
    const panel = item.querySelector(':scope > .mega-dropdown');
    const ariaTrigger = isEyeHealth
      ? item.querySelector('.eh-nav-toggle')
      : trigger;

    if (ariaTrigger && !ariaTrigger.hasAttribute('aria-expanded')) {
      ariaTrigger.setAttribute('aria-expanded', 'false');
    }
    if (ariaTrigger && panel?.id && !ariaTrigger.hasAttribute('aria-controls')) {
      ariaTrigger.setAttribute('aria-controls', panel.id);
    }

    return { menuId, item, trigger, panel, ariaTrigger, isEyeHealth };
  });
}

export function closeAllDesktopMenus(registry, exceptMenuId = null) {
  registry.forEach(({ menuId, item, ariaTrigger }) => {
    if (menuId === exceptMenuId) return;
    item.classList.remove('open');
    ariaTrigger?.setAttribute('aria-expanded', 'false');
  });

  // #region agent log
  const expandedCount = registry.filter(({ ariaTrigger }) => ariaTrigger?.getAttribute('aria-expanded') === 'true').length;
  const openCount = registry.filter(({ item }) => item.classList.contains('open')).length;
  fetch('http://127.0.0.1:7351/ingest/978326e2-ed1a-492b-ba34-cad4578e33a0', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '834132' }, body: JSON.stringify({ sessionId: '834132', location: 'desktop-nav.js:closeAllDesktopMenus', message: 'closeAllDesktopMenus', data: { exceptMenuId, expandedCount, openCount }, timestamp: Date.now(), hypothesisId: 'A', runId: 'pre-fix' }) }).catch(() => {});
  // #endregion
}

export function openDesktopMenu(registry, menuId) {
  const previousOpen = registry
    .filter(({ item }) => item.classList.contains('open'))
    .map(({ menuId: id }) => id);

  closeAllDesktopMenus(registry, menuId);

  const entry = registry.find(({ menuId: id }) => id === menuId);
  if (!entry) return;

  entry.item.classList.add('open');
  entry.ariaTrigger?.setAttribute('aria-expanded', 'true');
  entry.panel?.removeAttribute('hidden');

  // #region agent log
  fetch('http://127.0.0.1:7351/ingest/978326e2-ed1a-492b-ba34-cad4578e33a0', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '834132' }, body: JSON.stringify({ sessionId: '834132', location: 'desktop-nav.js:openDesktopMenu', message: 'openDesktopMenu', data: { menuId, previousOpen, expandedAfter: registry.filter(({ ariaTrigger }) => ariaTrigger?.getAttribute('aria-expanded') === 'true').map(({ menuId: id }) => id) }, timestamp: Date.now(), hypothesisId: 'B', runId: 'pre-fix' }) }).catch(() => {});
  // #endregion
}

function isWithinNode(node, container) {
  return node instanceof Node && container.contains(node);
}

function findMenuEntryForNode(registry, node) {
  if (!(node instanceof Node)) return null;
  return registry.find(({ item }) => item.contains(node)) ?? null;
}

export function initDesktopNav(navMenu, root = document) {
  const registry = getDesktopMenuRegistry(navMenu);
  if (!registry.length) return null;

  const navGroup = navMenu.closest('.nav-primary') || navMenu;
  let closeTimer = null;

  const clearCloseTimer = () => {
    if (closeTimer === null) return;
    window.clearTimeout(closeTimer);
    closeTimer = null;
  };

  const scheduleClose = () => {
    if (!isDesktopNavViewport()) return;
    clearCloseTimer();
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : 150;
    closeTimer = window.setTimeout(() => {
      closeAllDesktopMenus(registry);
      closeTimer = null;
    }, delay);
  };

  const bindMenuGroup = (entry) => {
    const { item, menuId, ariaTrigger } = entry;
    if (item.dataset.desktopNavBound === 'true') return;
    item.dataset.desktopNavBound = 'true';

    item.addEventListener('pointerenter', () => {
      if (!isDesktopNavViewport()) return;
      clearCloseTimer();
      openDesktopMenu(registry, menuId);
    });

    item.addEventListener('pointerleave', (event) => {
      if (!isDesktopNavViewport()) return;

      const related = event.relatedTarget;
      if (isWithinNode(related, item)) return;

      const otherEntry = findMenuEntryForNode(registry, related);
      if (otherEntry) {
        clearCloseTimer();
        closeAllDesktopMenus(registry, otherEntry.menuId);
        return;
      }

      if (!isWithinNode(related, navGroup)) {
        scheduleClose();
      }
    });

    ariaTrigger?.addEventListener('click', (event) => {
      if (!isDesktopNavViewport()) return;
      event.preventDefault();
      event.stopPropagation();

      const isOpen = item.classList.contains('open');
      clearCloseTimer();
      if (isOpen) {
        closeAllDesktopMenus(registry);
      } else {
        openDesktopMenu(registry, menuId);
      }
    });
  };

  registry.forEach(bindMenuGroup);

  if (navGroup.dataset.desktopNavGroupBound !== 'true') {
    navGroup.dataset.desktopNavGroupBound = 'true';
    navGroup.addEventListener('pointerleave', (event) => {
      if (!isDesktopNavViewport()) return;
      if (isWithinNode(event.relatedTarget, navGroup)) return;
      scheduleClose();
    });
  }

  root.addEventListener('pointerdown', (event) => {
    if (!isDesktopNavViewport()) return;
    if (event.target.closest('.nav-primary')) return;
    clearCloseTimer();
    closeAllDesktopMenus(registry);
  });

  const controller = {
    registry,
    openDesktopMenu: (menuId) => openDesktopMenu(registry, menuId),
    closeAllDesktopMenus: (exceptMenuId = null) => closeAllDesktopMenus(registry, exceptMenuId),
    clearCloseTimer,
    scheduleClose,
  };

  window.__desktopNavController = controller;
  return controller;
}
