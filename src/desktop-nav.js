import { MOBILE_NAV_MAX_WIDTH, desktopMenuIdForCategory } from './nav-shared.js';

export const DESKTOP_NAV_MIN_WIDTH = MOBILE_NAV_MAX_WIDTH;

function isDesktopNavViewport() {
  return window.innerWidth > DESKTOP_NAV_MIN_WIDTH;
}

function resolveMenuId(item, index) {
  const fromAttr = item.dataset.desktopMenuId?.trim();
  if (fromAttr) return fromAttr;

  if (item.hasAttribute('data-eye-health-nav')) {
    item.dataset.desktopMenuId = 'eye-health';
    return 'eye-health';
  }

  const fallbackId = `nav-menu-${index}`;
  item.dataset.desktopMenuId = fallbackId;
  return fallbackId;
}

export function getDesktopMenuRegistry(navMenu) {
  if (!navMenu) return [];

  const entries = [...navMenu.querySelectorAll(':scope > li.has-dropdown')].map((item, index) => {
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

  const duplicateIds = entries
    .map(({ menuId }) => menuId)
    .filter((menuId, index, ids) => ids.indexOf(menuId) !== index);
  if (duplicateIds.length) {
    console.error('[desktop-nav] duplicate data-desktop-menu-id values:', [...new Set(duplicateIds)]);
  }

  return entries;
}

export function closeAllDesktopMenus(registry, exceptMenuId = null) {
  registry.forEach(({ menuId, item, ariaTrigger }) => {
    if (menuId === exceptMenuId) return;
    item.classList.remove('open');
    ariaTrigger?.setAttribute('aria-expanded', 'false');
  });
}

export function openDesktopMenu(registry, menuId) {
  closeAllDesktopMenus(registry, menuId);

  const entry = registry.find(({ menuId: id }) => id === menuId);
  if (!entry) return;

  entry.item.classList.add('open');
  entry.ariaTrigger?.setAttribute('aria-expanded', 'true');
  entry.panel?.removeAttribute('hidden');
}

function isWithinNode(node, container) {
  return node instanceof Node && container.contains(node);
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

  const resolveMenuItem = (node) => {
    if (!(node instanceof Element)) return null;
    const item = node.closest('li.has-dropdown[data-desktop-menu-id]');
    if (!item || !navMenu.contains(item)) return null;
    return item;
  };

  const bindMenuGroup = (entry) => {
    const { item, menuId, ariaTrigger } = entry;
    if (item.dataset.desktopNavBound === 'true') return;
    item.dataset.desktopNavBound = 'true';

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

  if (navGroup.dataset.desktopNavDelegated !== 'true') {
    navGroup.dataset.desktopNavDelegated = 'true';

    navGroup.addEventListener('pointerover', (event) => {
      if (!isDesktopNavViewport()) return;
      const item = resolveMenuItem(event.target);
      if (!item) return;
      const menuId = item.dataset.desktopMenuId;
      if (!menuId) return;
      clearCloseTimer();
      openDesktopMenu(registry, menuId);
    });

    navGroup.addEventListener('pointerleave', (event) => {
      if (!isDesktopNavViewport()) return;
      if (isWithinNode(event.relatedTarget, navGroup)) return;
      scheduleClose();
    });
  }

  if (navGroup.dataset.desktopNavGroupBound !== 'true') {
    navGroup.dataset.desktopNavGroupBound = 'true';
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

  return controller;
}
