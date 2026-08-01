import { initDesktopNav } from './desktop-nav.js';
import { initMegaMenuA11y } from './mega-menu-a11y.js';
import { ensureFloatingSocialStackMounted } from './floating-social-stack.js';
import { initEyeHealthNavBehavior } from './tr-eye-health-nav.js';
import {
  isMobileNavViewport,
  MOBILE_NAV_MAX_WIDTH,
  NAV_CHEVRON_SVG,
  desktopMenuIdForIndex,
} from './nav-shared.js';

export { MOBILE_NAV_MAX_WIDTH, NAV_CHEVRON_SVG, renderMobileCategoryTrigger, renderNavChevron } from './nav-shared.js';

const MOBILE_NAV_LABELS = {
  tr: { open: 'Menüyü aç', close: 'Menüyü kapat', dialog: 'Site menüsü' },
  en: { open: 'Open menu', close: 'Close menu', dialog: 'Site menu' },
  ar: { open: 'افتح القائمة', close: 'أغلق القائمة', dialog: 'قائمة الموقع' },
  es: { open: 'Abrir menú', close: 'Cerrar menú', dialog: 'Menú del sitio' },
  fr: { open: 'Ouvrir le menu', close: 'Fermer le menu', dialog: 'Menu du site' },
  it: { open: 'Apri il menu', close: 'Chiudi il menu', dialog: 'Menu del sito' },
  ru: { open: 'Открыть меню', close: 'Закрыть меню', dialog: 'Меню сайта' },
  de: { open: 'Menü öffnen', close: 'Menü schließen', dialog: 'Website-Menü' },
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function mobileNavLabels(root) {
  const locale = root.documentElement?.lang?.split('-')[0] || 'tr';
  return MOBILE_NAV_LABELS[locale] || MOBILE_NAV_LABELS.tr;
}

function focusableElementsWithin(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    if (element.closest('[hidden], [inert]')) return false;
    return element.getClientRects().length > 0;
  });
}

export function closeAllMobileAccordions(navMenu) {
  if (!navMenu) return;

  navMenu.querySelectorAll('.has-dropdown.open').forEach((item) => {
    item.classList.remove('open');
    item.querySelector('.mobile-nav-trigger')?.setAttribute('aria-expanded', 'false');
    item.querySelector('.eh-nav-toggle')?.setAttribute('aria-expanded', 'false');
  });

  navMenu.querySelectorAll('[data-eye-health-nav] .eh-mobile-group.open').forEach((group) => {
    group.classList.remove('open');
    group.querySelector('.eh-mobile-group-toggle')?.setAttribute('aria-expanded', 'false');
    group.querySelector('.eh-mobile-topics')?.setAttribute('hidden', '');
  });
}

function ensurePanelId(panel, fallbackId) {
  if (!panel.id) panel.id = fallbackId;
  return panel.id;
}

function upgradeEyeHealthMobileTrigger(navMenu) {
  const item = navMenu.querySelector('[data-eye-health-nav]');
  if (!item) return;

  if (!item.dataset.desktopMenuId) {
    item.dataset.desktopMenuId = 'eye-health';
  }

  if (item.querySelector('.eh-mobile-nav-trigger')) return;

  const head = item.querySelector('.eh-nav-item-head');
  const link = item.querySelector('.eh-nav-primary-link');
  const dropdown = item.querySelector('.mega-dropdown');
  if (!head || !dropdown) return;

  const panelId = ensurePanelId(dropdown, dropdown.id || 'eye-health-mega-menu');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mobile-nav-trigger eh-mobile-nav-trigger';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panelId);

  const ariaLabel = link?.getAttribute('aria-label') || link?.textContent?.trim() || '';
  if (ariaLabel) button.setAttribute('aria-label', ariaLabel);

  const labelSpan = document.createElement('span');
  labelSpan.className = 'mobile-nav-label';
  labelSpan.textContent = link?.textContent?.trim() || '';

  button.append(labelSpan);
  button.insertAdjacentHTML('beforeend', NAV_CHEVRON_SVG);
  item.insertBefore(button, head);
}

function upgradeCategoryTriggers(navMenu) {
  navMenu.querySelectorAll('.has-dropdown:not([data-eye-health-nav])').forEach((item, index) => {
    if (!item.dataset.desktopMenuId) {
      item.dataset.desktopMenuId = desktopMenuIdForIndex(index);
    }

    const panel = item.querySelector(':scope > .mega-dropdown');
    const anchor = item.querySelector(':scope > a.desktop-nav-trigger, :scope > a');
    if (!panel || !anchor || item.querySelector(':scope > .mobile-nav-trigger')) return;

    const panelId = ensurePanelId(panel, `nav-mobile-panel-${index}`);
    anchor.classList.add('desktop-nav-trigger');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-nav-trigger';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panelId);

    const ariaLabel = anchor.getAttribute('aria-label');
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'mobile-nav-label';
    labelSpan.textContent = anchor.textContent.replace(/\s+/g, ' ').trim();

    button.append(labelSpan);
    button.insertAdjacentHTML('beforeend', NAV_CHEVRON_SVG);
    item.insertBefore(button, anchor);
  });
}

function ensureMobileDrawerStructure(root, navMenu, header, labels) {
  let drawer = root.getElementById('nav-drawer');
  if (drawer) return drawer;

  drawer = document.createElement('div');
  drawer.id = 'nav-drawer';
  drawer.className = 'nav-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', labels.dialog);
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('tabindex', '-1');

  const topBar = document.createElement('div');
  topBar.className = 'nav-drawer-top';

  const logoLink = header.querySelector('.nav-logo');
  if (logoLink) {
    const drawerLogo = logoLink.cloneNode(true);
    drawerLogo.classList.add('nav-drawer-logo');
    topBar.appendChild(drawerLogo);
  }

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nav-drawer-close';
  closeBtn.id = 'nav-drawer-close';
  closeBtn.setAttribute('aria-label', labels.close);
  closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
  topBar.appendChild(closeBtn);

  const scrollArea = document.createElement('div');
  scrollArea.className = 'nav-drawer-scroll';

  navMenu.parentNode.insertBefore(drawer, navMenu);
  drawer.append(topBar, scrollArea);
  scrollArea.appendChild(navMenu);

  return drawer;
}

function bindMobileAccordions(navMenu) {
  navMenu.querySelectorAll('.mobile-nav-trigger').forEach((trigger) => {
    if (trigger.dataset.accordionBound === 'true') return;
    trigger.dataset.accordionBound = 'true';

    const onActivate = (event) => {
      if (!isMobileNavViewport()) return;
      event.preventDefault();
      event.stopPropagation();

      const item = trigger.closest('.has-dropdown');
      if (!item) return;

      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId
        ? navMenu.querySelector(`#${CSS.escape(panelId)}`)
        : item.querySelector('.mega-dropdown');
      const willOpen = !item.classList.contains('open');

      closeAllMobileAccordions(navMenu);

      if (willOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        panel?.removeAttribute('hidden');
      }
    };

    trigger.addEventListener('click', onActivate);
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') onActivate(event);
    });
  });
}

export function initSiteHeader(root = document, { trackScroll = false, whatsapp } = {}) {
  void ensureFloatingSocialStackMounted({ whatsapp });

  const header = root.getElementById('main-header');
  const hamburger = root.getElementById('hamburger');
  const navMenu = root.getElementById('nav-menu');
  if (!header || !hamburger || !navMenu) return;

  const labels = mobileNavLabels(root);
  hamburger.setAttribute('aria-label', labels.open);
  hamburger.setAttribute('aria-controls', 'nav-drawer');
  hamburger.setAttribute('aria-haspopup', 'dialog');

  const drawer = ensureMobileDrawerStructure(root, navMenu, header, labels);
  const drawerClose = root.getElementById('nav-drawer-close');
  let previouslyFocused = null;
  let inertElements = [];

  upgradeCategoryTriggers(navMenu);
  upgradeEyeHealthMobileTrigger(navMenu);
  bindMobileAccordions(navMenu);

  const setOutsideContentInert = (isInert) => {
    if (!isInert) {
      inertElements.forEach((element) => element.removeAttribute('inert'));
      inertElements = [];
      return;
    }

    let current = drawer;
    const body = root.body || document.body;
    while (current?.parentElement) {
      const parent = current.parentElement;
      [...parent.children].forEach((sibling) => {
        if (sibling === current || sibling.hasAttribute('inert')) return;
        sibling.setAttribute('inert', '');
        inertElements.push(sibling);
      });
      if (parent === body) break;
      current = parent;
    }
  };

  const setMobileNavOpen = (isOpen, { restoreFocus = true } = {}) => {
    if (isOpen) {
      previouslyFocused = root.activeElement || hamburger;
    }

    hamburger.classList.toggle('active', isOpen);
    drawer.classList.toggle('active', isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? labels.close : labels.open);
    document.body.classList.toggle('mobile-nav-open', isOpen);
    setOutsideContentInert(isOpen);

    if (isOpen) {
      window.requestAnimationFrame(() => {
        if (!drawer.classList.contains('active')) return;
        (drawerClose || drawer).focus({ preventScroll: true });
      });
      return;
    }

    closeAllMobileAccordions(navMenu);
    if (restoreFocus && previouslyFocused?.isConnected) {
      previouslyFocused.focus({ preventScroll: true });
    }
    previouslyFocused = null;
  };

  if (trackScroll) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });
  }

  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
    setMobileNavOpen(!drawer.classList.contains('active'));
  });

  drawerClose?.addEventListener('click', (event) => {
    event.stopPropagation();
    setMobileNavOpen(false);
  });

  navMenu.querySelectorAll('.mega-dropdown a, .eh-mobile-topics a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!isMobileNavViewport()) return;
      if (link.getAttribute('href') === '#') {
        event.preventDefault();
        return;
      }
      setMobileNavOpen(false, { restoreFocus: false });
    });
  });

  navMenu.querySelectorAll('a.desktop-nav-trigger').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!isMobileNavViewport()) return;
      event.preventDefault();
    });
  });

  document.addEventListener('click', (event) => {
    if (!isMobileNavViewport()) return;
    if (!drawer.classList.contains('active')) return;
    if (event.target.closest('#nav-drawer')) return;
    if (event.target.closest('#hamburger')) return;
    setMobileNavOpen(false);
  });

  root.addEventListener('keydown', (event) => {
    if (!isMobileNavViewport()) return;
    if (!drawer.classList.contains('active')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setMobileNavOpen(false);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = focusableElementsWithin(drawer);
    if (!focusableElements.length) {
      event.preventDefault();
      drawer.focus({ preventScroll: true });
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = root.activeElement;

    if (event.shiftKey && (activeElement === firstElement || !drawer.contains(activeElement))) {
      event.preventDefault();
      lastElement.focus({ preventScroll: true });
    } else if (!event.shiftKey && (activeElement === lastElement || !drawer.contains(activeElement))) {
      event.preventDefault();
      firstElement.focus({ preventScroll: true });
    }
  });

  const refreshMobileNav = () => {
    upgradeCategoryTriggers(navMenu);
    upgradeEyeHealthMobileTrigger(navMenu);
    bindMobileAccordions(navMenu);
    if (!isMobileNavViewport() && drawer.classList.contains('active')) {
      setMobileNavOpen(false, { restoreFocus: false });
    }
  };

  window.addEventListener('resize', refreshMobileNav, { passive: true });

  const desktopNav = initDesktopNav(navMenu, root);
  initMegaMenuA11y(root, desktopNav);
  initEyeHealthNavBehavior(root);
}
