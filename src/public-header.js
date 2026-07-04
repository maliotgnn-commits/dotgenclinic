import { initMegaMenuA11y } from './mega-menu-a11y.js';
import { initEyeHealthNavBehavior } from './tr-eye-health-nav.js';

const DESKTOP_NAV_BREAKPOINT = 1280;
const NAV_FIT_MIN_SCALE = 0.72;

export function fitHeaderNavigation(root = document) {
  const container = root.querySelector('.nav-container');
  const primary = root.querySelector('.nav-primary');
  const navMenu = root.getElementById('nav-menu');
  if (!container || !primary || !navMenu) return;

  if (window.innerWidth <= DESKTOP_NAV_BREAKPOINT) {
    container.style.removeProperty('--nav-fit-scale');
    return;
  }

  container.style.setProperty('--nav-fit-scale', '1');
  const available = primary.clientWidth;
  if (!available) return;

  if (navMenu.scrollWidth <= available) return;

  let low = NAV_FIT_MIN_SCALE;
  let high = 1;
  container.style.setProperty('--nav-fit-scale', String(low));
  if (navMenu.scrollWidth > available) {
    container.style.setProperty('--nav-fit-scale', String(low));
    return;
  }

  for (let step = 0; step < 8; step += 1) {
    const mid = (low + high) / 2;
    container.style.setProperty('--nav-fit-scale', String(mid));
    if (navMenu.scrollWidth > available) {
      high = mid;
    } else {
      low = mid;
    }
  }

  container.style.setProperty('--nav-fit-scale', String(low));
}

export function initSiteHeader(root = document, { trackScroll = false } = {}) {
  const header = root.getElementById('main-header');
  const hamburger = root.getElementById('hamburger');
  const navMenu = root.getElementById('nav-menu');
  if (!header || !hamburger || !navMenu) return;

  const setMobileNavOpen = (isOpen) => {
    hamburger.classList.toggle('active', isOpen);
    navMenu.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) {
      navMenu.querySelectorAll('.has-dropdown.open').forEach((item) => {
        item.classList.remove('open');
        item.querySelector('.eh-nav-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  };

  if (trackScroll) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });
  }

  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
    setMobileNavOpen(!navMenu.classList.contains('active'));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1280 && link.closest('.eh-nav-item-head')) {
        return;
      }
      if (window.innerWidth <= 1280 && link.parentElement?.classList.contains('has-dropdown')) {
        return;
      }
      if (window.innerWidth <= 1280 && link.closest('[data-eye-health-nav]')) {
        setMobileNavOpen(false);
        return;
      }
      setMobileNavOpen(false);
    });
  });

  root.addEventListener('click', (event) => {
    if (window.innerWidth > 1280) return;
    if (!navMenu.classList.contains('active')) return;
    if (event.target.closest('#main-header')) return;
    setMobileNavOpen(false);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (window.innerWidth > 1280) return;
    if (!navMenu.classList.contains('active')) return;
    setMobileNavOpen(false);
    hamburger.focus();
  });

  const bindMobileDropdowns = () => {
    if (window.innerWidth > 1280) return;

    navMenu.querySelectorAll('.has-dropdown:not([data-eye-health-nav]) > a').forEach((trigger) => {
      if (trigger.dataset.mobileBound === 'true') return;
      trigger.dataset.mobileBound = 'true';
      trigger.addEventListener('click', (event) => {
        if (window.innerWidth > 1280) return;
        event.preventDefault();
        trigger.parentElement.classList.toggle('open');
      });
    });
  };

  bindMobileDropdowns();
  window.addEventListener('resize', bindMobileDropdowns, { passive: true });
  initMegaMenuA11y(root);
  initEyeHealthNavBehavior(root);

  fitHeaderNavigation(root);
  window.addEventListener('resize', () => fitHeaderNavigation(root), { passive: true });
  if (typeof ResizeObserver !== 'undefined') {
    const primary = root.querySelector('.nav-primary');
    if (primary) {
      const observer = new ResizeObserver(() => fitHeaderNavigation(root));
      observer.observe(primary);
      observer.observe(navMenu);
    }
  }
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => fitHeaderNavigation(root)).catch(() => {});
  }
  window.addEventListener('load', () => fitHeaderNavigation(root), { once: true, passive: true });
}
