import { chromium } from 'playwright';

const BASE = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:4187';
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
];
const PAGES = [
  '/tr/',
  '/tr/goz-hastaliklari.html',
  '/en/',
  '/de/',
  '/fr/',
  '/ru/',
  '/ru/%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5-%D0%B3%D0%BB%D0%B0%D0%B7.html',
  '/ar/',
  '/ar/%D8%B5%D8%AD%D8%A9-%D8%A7%D9%84%D8%B9%D9%8A%D9%86.html',
];

const EYE_HEALTH_PATHS = {
  tr: '/tr/goz-hastaliklari.html',
  en: '/en/eye-health.html',
  de: '/de/augengesundheit.html',
  fr: '/fr/sante-oculaire.html',
  ru: '/ru/%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5-%D0%B3%D0%BB%D0%B0%D0%B7.html',
  ar: '/ar/%D8%B5%D8%AD%D8%A9-%D8%A7%D9%84%D8%B9%D9%8A%D9%86.html',
  es: '/es/salud-ocular.html',
  it: '/it/salute-oculare.html',
};

const failures = [];

function fail(message) {
  failures.push(message);
}

function localeFromPath(path) {
  const match = path.match(/^\/([a-z]{2})\//);
  return match?.[1] || 'tr';
}

async function runPageChecks(page, path, viewport) {
  const tag = `${path}@${viewport.width}x${viewport.height}`;
  const locale = localeFromPath(path);
  const expectedEyePath = EYE_HEALTH_PATHS[locale];

  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    (expectedEyePath) => {
      const triggers = document.querySelectorAll(
        '#nav-menu > li > .mobile-nav-trigger, #nav-menu > li > .eh-mobile-nav-trigger',
      );
      if (triggers.length < 7) return false;
      if (!expectedEyePath) return true;
      const primary = document.querySelector('#nav-menu [data-eye-health-nav] .eh-nav-primary-link');
      const href = primary?.getAttribute('href') || '';
      return decodeURIComponent(href.split('#')[0]) === decodeURIComponent(expectedEyePath);
    },
    expectedEyePath || null,
    { timeout: 15000 },
  );

  const markupState = await page.evaluate(() => {
    const triggers = [
      ...document.querySelectorAll('#nav-menu > li > .mobile-nav-trigger, #nav-menu > li > .eh-mobile-nav-trigger'),
    ];
    const labels = triggers.map((el) => (el.querySelector('.mobile-nav-label') || el).textContent.trim());
    const desktopLinks = [...document.querySelectorAll('#nav-menu > li > a.desktop-nav-trigger')];
    const visibleDesktop = desktopLinks.filter((el) => getComputedStyle(el).display !== 'none');
    const panelIds = triggers.map((el) => el.getAttribute('aria-controls')).filter(Boolean);
    const uniquePanelIds = new Set(panelIds);
    const ariaExpanded = triggers.map((el) => el.getAttribute('aria-expanded'));
    const drawer = document.getElementById('nav-drawer');
    const scroll = document.querySelector('.nav-drawer-scroll');
    const drawerTop = drawer?.querySelector('.nav-drawer-top')?.getBoundingClientRect();
    const firstTrigger = triggers[0];
    const firstRow = firstTrigger?.getBoundingClientRect();
    const eyeItem = document.querySelector('#nav-menu [data-eye-health-nav]');
    const eyeLinks = eyeItem
      ? [...eyeItem.querySelectorAll('.eh-nav-primary-link[href], .mega-dropdown a[href]')].map((a) =>
          a.getAttribute('href'),
        )
      : [];
    const closeBtn = document.getElementById('nav-drawer-close');
    const hamburger = document.getElementById('hamburger');

    return {
      triggerCount: triggers.length,
      labels,
      duplicateLabels: labels.filter((label, index) => labels.indexOf(label) !== index),
      visibleDesktopCount: visibleDesktop.length,
      panelIds,
      panelIdDuplicates: panelIds.length !== uniquePanelIds.size,
      missingAriaExpanded: ariaExpanded.some((value) => value !== 'false' && value !== 'true'),
      hasDrawer: Boolean(drawer),
      hasScroll: Boolean(scroll),
      hasMobileCta: Boolean(document.querySelector('.nav-mobile-cta, .nav-mobile-cta-item')),
      hasCloseHandler: Boolean(closeBtn),
      hasHamburger: Boolean(hamburger),
      drawerRole: drawer?.getAttribute('role'),
      drawerAriaModal: drawer?.getAttribute('aria-modal'),
      drawerLabel: drawer?.getAttribute('aria-label'),
      closeLabel: closeBtn?.getAttribute('aria-label'),
      hamburgerLabel: hamburger?.getAttribute('aria-label'),
      hamburgerControls: hamburger?.getAttribute('aria-controls'),
      hamburgerHasPopup: hamburger?.getAttribute('aria-haspopup'),
      firstTop: firstRow && drawerTop ? Math.round(firstRow.top - drawerTop.bottom) : null,
      rowStyles: triggers.slice(0, 8).map((el) => {
        const cs = getComputedStyle(el);
        return {
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          minHeight: cs.minHeight,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
        };
      }),
      eyeLinks,
      desktopNavVisible: getComputedStyle(document.querySelector('.nav-primary .nav-menu') || document.body).display,
    };
  });

  if (!markupState.hasDrawer) fail(`[${tag}] nav-drawer missing`);
  if (!markupState.hasScroll) fail(`[${tag}] nav-drawer-scroll missing`);
  if (!markupState.hasCloseHandler) fail(`[${tag}] nav-drawer-close missing`);
  if (!markupState.hasHamburger) fail(`[${tag}] hamburger missing`);
  if (markupState.drawerRole !== 'dialog') fail(`[${tag}] nav-drawer role must be dialog`);
  if (markupState.drawerAriaModal !== 'true') fail(`[${tag}] nav-drawer aria-modal must be true`);
  if (!markupState.drawerLabel) fail(`[${tag}] nav-drawer accessible label missing`);
  if (!markupState.closeLabel || markupState.closeLabel === markupState.hamburgerLabel) {
    fail(`[${tag}] open and close controls need distinct accessible labels`);
  }
  if (markupState.hamburgerControls !== 'nav-drawer') fail(`[${tag}] hamburger aria-controls mismatch`);
  if (markupState.hamburgerHasPopup !== 'dialog') fail(`[${tag}] hamburger aria-haspopup must be dialog`);
  if (markupState.hasMobileCta) fail(`[${tag}] mobile drawer CTA still present`);
  if (markupState.triggerCount !== 8) {
    fail(`[${tag}] expected exactly 8 top-level mobile triggers, found ${markupState.triggerCount}`);
  }
  if (markupState.duplicateLabels.length) {
    fail(`[${tag}] duplicate top-level labels: ${markupState.duplicateLabels.join(', ')}`);
  }
  if (markupState.visibleDesktopCount > 0) {
    fail(`[${tag}] ${markupState.visibleDesktopCount} desktop-nav-trigger link(s) visible on mobile`);
  }
  if (markupState.panelIdDuplicates) {
    fail(`[${tag}] duplicate aria-controls panel ids`);
  }
  if (markupState.missingAriaExpanded) {
    fail(`[${tag}] mobile trigger missing aria-expanded`);
  }
  if (markupState.firstTop == null || markupState.firstTop < 8 || markupState.firstTop > 48) {
    fail(`[${tag}] first menu row not aligned under drawer top bar (gap ${markupState.firstTop}px)`);
  }
  if (markupState.rowStyles.length < 8) {
    fail(`[${tag}] expected 8 styled mobile rows, found ${markupState.rowStyles.length}`);
  } else {
    const ref = markupState.rowStyles[0];
    markupState.rowStyles.forEach((row, index) => {
      Object.keys(ref).forEach((key) => {
        if (row[key] !== ref[key]) fail(`[${tag}] row ${index} ${key} mismatch (${row[key]} vs ${ref[key]})`);
      });
    });
  }

  if (expectedEyePath && markupState.eyeLinks.length) {
    const normalizedExpected = decodeURIComponent(expectedEyePath);
    markupState.eyeLinks.forEach((href, index) => {
      if (!href || href.includes('#')) {
        fail(`[${tag}] eye health link ${index} contains hash or is empty: ${href}`);
      }
      const normalizedHref = decodeURIComponent(href.split('#')[0]);
      if (normalizedHref !== normalizedExpected) {
        fail(`[${tag}] eye health link ${index} expected ${normalizedExpected}, got ${normalizedHref}`);
      }
    });
  }

  await page.click('#hamburger');
  await page.waitForSelector('#nav-drawer.active');
  await page.waitForFunction(() => document.activeElement?.id === 'nav-drawer-close');

  const openState = await page.evaluate(() => ({
    drawerOpen: document.getElementById('nav-drawer')?.classList.contains('active'),
    bodyOverflow: document.body.classList.contains('mobile-nav-open'),
    activeId: document.activeElement?.id,
    inertOutsideCount: [...document.querySelectorAll('[inert]')].filter(
      (element) => !document.getElementById('nav-drawer')?.contains(element),
    ).length,
  }));

  if (!openState.drawerOpen) fail(`[${tag}] drawer did not open`);
  if (!openState.bodyOverflow) fail(`[${tag}] body scroll lock missing`);
  if (openState.activeId !== 'nav-drawer-close') fail(`[${tag}] focus did not move into drawer`);
  if (openState.inertOutsideCount < 1) fail(`[${tag}] content outside drawer was not made inert`);

  await page.keyboard.press('Shift+Tab');
  const focusStayedInside = await page.evaluate(() => {
    const drawer = document.getElementById('nav-drawer');
    return Boolean(drawer?.contains(document.activeElement));
  });
  if (!focusStayedInside) fail(`[${tag}] Shift+Tab escaped the open drawer`);

  const firstTrigger = page.locator('#nav-menu > li:first-child .mobile-nav-trigger, #nav-menu > li:first-child .eh-mobile-nav-trigger').first();
  await firstTrigger.click();

  const accordionOpen = await page.evaluate(() => {
    const firstItem = document.querySelector('#nav-menu > li:first-child.has-dropdown');
    const panel = firstItem?.querySelector('.mega-dropdown');
    const trigger = firstItem?.querySelector('.mobile-nav-trigger, .eh-mobile-nav-trigger');
    return {
      open: firstItem?.classList.contains('open'),
      aria: trigger?.getAttribute('aria-expanded'),
      panelDisplay: panel ? getComputedStyle(panel).display : null,
    };
  });

  if (!accordionOpen.open) fail(`[${tag}] first accordion did not open`);
  if (accordionOpen.aria !== 'true') fail(`[${tag}] aria-expanded not true after open`);
  if (!accordionOpen.panelDisplay || accordionOpen.panelDisplay === 'none') {
    fail(`[${tag}] submenu panel hidden after open`);
  }

  await firstTrigger.click();

  const accordionClosed = await page.evaluate(() => {
    const firstItem = document.querySelector('#nav-menu > li:first-child.has-dropdown');
    const trigger = firstItem?.querySelector('.mobile-nav-trigger, .eh-mobile-nav-trigger');
    return {
      open: firstItem?.classList.contains('open'),
      aria: trigger?.getAttribute('aria-expanded'),
    };
  });

  if (accordionClosed.open) fail(`[${tag}] first accordion did not close on second click`);
  if (accordionClosed.aria !== 'false') fail(`[${tag}] aria-expanded not false after close`);

  await firstTrigger.click();

  const secondTrigger = page.locator('#nav-menu > li:nth-child(2) .mobile-nav-trigger, #nav-menu > li:nth-child(2) .eh-mobile-nav-trigger').first();
  await secondTrigger.click();

  const singleOpen = await page.evaluate(() => ({
    firstOpen: document.querySelector('#nav-menu > li:first-child.has-dropdown')?.classList.contains('open'),
    secondOpen: document.querySelector('#nav-menu > li:nth-child(2).has-dropdown')?.classList.contains('open'),
  }));

  if (singleOpen.firstOpen) fail(`[${tag}] first accordion stayed open when second opened`);
  if (!singleOpen.secondOpen) fail(`[${tag}] second accordion did not open`);

  const eyeTrigger = page.locator('#nav-menu [data-eye-health-nav] .mobile-nav-trigger, #nav-menu [data-eye-health-nav] .eh-mobile-nav-trigger').first();
  if (await eyeTrigger.count()) {
    await eyeTrigger.click();
    const eyeOpen = await page.evaluate(() => {
      const item = document.querySelector('#nav-menu [data-eye-health-nav]');
      const panel = item?.querySelector('.mega-dropdown');
      return {
        open: item?.classList.contains('open'),
        panelDisplay: panel ? getComputedStyle(panel).display : null,
        linkCount: item ? item.querySelectorAll('.mega-dropdown a[href]').length : 0,
      };
    });
    if (!eyeOpen.open) fail(`[${tag}] eye health accordion did not open`);
    if (!eyeOpen.panelDisplay || eyeOpen.panelDisplay === 'none') {
      fail(`[${tag}] eye health submenu hidden after open`);
    }
    if (eyeOpen.linkCount < 1) fail(`[${tag}] eye health submenu has no links`);
  }

  await page.click('#nav-drawer-close', { force: true });
  await page.waitForFunction(() => !document.getElementById('nav-drawer')?.classList.contains('active'));

  const resetState = await page.evaluate(() => ({
    anyOpen: Boolean(document.querySelector('#nav-menu .has-dropdown.open')),
    drawerClosed: !document.getElementById('nav-drawer')?.classList.contains('active'),
    bodyLockCleared: !document.body.classList.contains('mobile-nav-open'),
    activeId: document.activeElement?.id,
    inertCount: document.querySelectorAll('[inert]').length,
  }));
  if (resetState.anyOpen) fail(`[${tag}] accordions not reset after drawer close`);
  if (!resetState.drawerClosed) fail(`[${tag}] drawer did not close`);
  if (!resetState.bodyLockCleared) fail(`[${tag}] body scroll lock not cleared after close`);
  if (resetState.activeId !== 'hamburger') fail(`[${tag}] focus did not return to hamburger`);
  if (resetState.inertCount !== 0) fail(`[${tag}] inert state was not cleared after close`);
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const path of PAGES) {
      try {
        await runPageChecks(page, path, viewport);
      } catch (error) {
        fail(`[${path}@${viewport.width}] ${error.message}`);
      }
    }
    await context.close();
  }
  await browser.close();

  if (failures.length) {
    console.error('[verify-mobile-drawer-qa] Failed:');
    failures.forEach((item) => console.error(`  - ${item}`));
    process.exit(1);
  }

  console.log('[verify-mobile-drawer-qa] Passed mobile drawer QA across viewports and locales');
}

main();
