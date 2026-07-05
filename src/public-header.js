import { initDesktopNav } from './desktop-nav.js';
import { initMegaMenuA11y } from './mega-menu-a11y.js';
import { initEyeHealthNavBehavior } from './tr-eye-health-nav.js';
import {
  isMobileNavViewport,
  MOBILE_NAV_MAX_WIDTH,
  NAV_CHEVRON_SVG,
  desktopMenuIdForIndex,
} from './nav-shared.js';

export { MOBILE_NAV_MAX_WIDTH, NAV_CHEVRON_SVG, renderMobileCategoryTrigger, renderNavChevron } from './nav-shared.js';

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

function ensureMobileDrawerStructure(root, navMenu, header, hamburger) {
  let drawer = root.getElementById('nav-drawer');
  if (drawer) return drawer;

  drawer = document.createElement('div');
  drawer.id = 'nav-drawer';
  drawer.className = 'nav-drawer';
  drawer.setAttribute('aria-hidden', 'true');

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
  closeBtn.setAttribute('aria-label', hamburger.getAttribute('aria-label') || 'Close menu');
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

export function initSiteHeader(root = document, { trackScroll = false } = {}) {
  const header = root.getElementById('main-header');
  const hamburger = root.getElementById('hamburger');
  const navMenu = root.getElementById('nav-menu');
  if (!header || !hamburger || !navMenu) return;

  const drawer = ensureMobileDrawerStructure(root, navMenu, header, hamburger);
  const drawerClose = root.getElementById('nav-drawer-close');

  upgradeCategoryTriggers(navMenu);
  upgradeEyeHealthMobileTrigger(navMenu);
  bindMobileAccordions(navMenu);

  const setMobileNavOpen = (isOpen) => {
    hamburger.classList.toggle('active', isOpen);
    drawer.classList.toggle('active', isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('mobile-nav-open', isOpen);

    if (!isOpen) {
      closeAllMobileAccordions(navMenu);
    }
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
    hamburger.focus();
  });

  navMenu.querySelectorAll('.mega-dropdown a, .eh-mobile-topics a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!isMobileNavViewport()) return;
      if (link.getAttribute('href') === '#') {
        event.preventDefault();
        return;
      }
      setMobileNavOpen(false);
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
    if (event.key !== 'Escape') return;
    if (!isMobileNavViewport()) return;
    if (!drawer.classList.contains('active')) return;
    setMobileNavOpen(false);
    hamburger.focus();
  });

  const refreshMobileNav = () => {
    upgradeCategoryTriggers(navMenu);
    upgradeEyeHealthMobileTrigger(navMenu);
    bindMobileAccordions(navMenu);
  };

  window.addEventListener('resize', refreshMobileNav, { passive: true });

  const desktopNav = initDesktopNav(navMenu, root);
  initMegaMenuA11y(root, desktopNav);
  initEyeHealthNavBehavior(root);
}
