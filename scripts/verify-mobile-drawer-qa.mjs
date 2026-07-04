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
  '/ru/',
  '/ru/%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5-%D0%B3%D0%BB%D0%B0%D0%B7.html',
  '/de/',
  '/fr/',
  '/ar/',
  '/ar/%D8%B5%D8%AD%D8%A9-%D8%A7%D9%84%D8%B9%D9%8A%D9%86.html',
];

const failures = [];

function fail(message) {
  failures.push(message);
}

async function runPageChecks(page, path, viewport) {
  const tag = `${path}@${viewport.width}x${viewport.height}`;
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#nav-drawer, #nav-menu', { timeout: 15000 });
  await page.waitForTimeout(500);

  const beforeOpen = await page.evaluate(() => {
    const drawer = document.getElementById('nav-drawer');
    const scroll = document.querySelector('.nav-drawer-scroll');
    const firstTrigger = document.querySelector('#nav-menu .mobile-nav-trigger');
    const drawerTop = drawer?.querySelector('.nav-drawer-top')?.getBoundingClientRect();
    const firstRow = firstTrigger?.getBoundingClientRect();
    return {
      hasDrawer: Boolean(drawer),
      hasScroll: Boolean(scroll),
      hasMobileCta: Boolean(document.querySelector('.nav-mobile-cta, .nav-mobile-cta-item')),
      bodyOverflow: getComputedStyle(document.body).overflow,
      firstTop: firstRow && drawerTop ? Math.round(firstRow.top - drawerTop.bottom) : null,
      rowStyles: [...document.querySelectorAll('#nav-menu > li > .mobile-nav-trigger, #nav-menu > li > .eh-mobile-nav-trigger')].slice(0, 7).map((el) => {
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
    };
  });

  if (!beforeOpen.hasDrawer) fail(`[${tag}] nav-drawer missing`);
  if (!beforeOpen.hasScroll) fail(`[${tag}] nav-drawer-scroll missing`);
  if (beforeOpen.hasMobileCta) fail(`[${tag}] mobile drawer CTA still present`);
  if (beforeOpen.firstTop == null || beforeOpen.firstTop < 8 || beforeOpen.firstTop > 48) {
    fail(`[${tag}] first menu row not aligned under drawer top bar (gap ${beforeOpen.firstTop}px)`);
  }
  if (beforeOpen.rowStyles.length < 7) {
    fail(`[${tag}] expected 7 mobile triggers, found ${beforeOpen.rowStyles.length}`);
  } else {
    const ref = beforeOpen.rowStyles[0];
    beforeOpen.rowStyles.forEach((row, index) => {
      Object.keys(ref).forEach((key) => {
        if (row[key] !== ref[key]) fail(`[${tag}] row ${index} ${key} mismatch (${row[key]} vs ${ref[key]})`);
      });
    });
  }

  await page.click('#hamburger');
  await page.waitForSelector('#nav-drawer.active');

  const openState = await page.evaluate(() => ({
    drawerOpen: document.getElementById('nav-drawer')?.classList.contains('active'),
    bodyOverflow: document.body.classList.contains('mobile-nav-open'),
    bodyScroll: document.body.scrollHeight > window.innerHeight ? getComputedStyle(document.body).overflow : 'ok',
  }));

  if (!openState.drawerOpen) fail(`[${tag}] drawer did not open`);
  if (!openState.bodyOverflow) fail(`[${tag}] body scroll lock missing`);

  const firstTrigger = page.locator('#nav-menu > li:first-child .mobile-nav-trigger').first();
  await firstTrigger.click();

  const accordionState = await page.evaluate(() => {
    const firstItem = document.querySelector('#nav-menu > li:first-child.has-dropdown');
    const panel = firstItem?.querySelector('.mega-dropdown');
    const trigger = firstItem?.querySelector('.mobile-nav-trigger');
    return {
      open: firstItem?.classList.contains('open'),
      aria: trigger?.getAttribute('aria-expanded'),
      panelDisplay: panel ? getComputedStyle(panel).display : null,
      chevronTransform: trigger?.querySelector('svg') ? getComputedStyle(trigger.querySelector('svg')).transform : null,
    };
  });

  if (!accordionState.open) fail(`[${tag}] first accordion did not open`);
  if (accordionState.aria !== 'true') fail(`[${tag}] aria-expanded not true after open`);
  if (!accordionState.panelDisplay || accordionState.panelDisplay === 'none') fail(`[${tag}] submenu panel hidden after open`);

  const secondTrigger = page.locator('#nav-menu > li:nth-child(2) .mobile-nav-trigger').first();
  await secondTrigger.click();

  const singleOpen = await page.evaluate(() => ({
    firstOpen: document.querySelector('#nav-menu > li:first-child.has-dropdown')?.classList.contains('open'),
    secondOpen: document.querySelector('#nav-menu > li:nth-child(2).has-dropdown')?.classList.contains('open'),
  }));

  if (singleOpen.firstOpen) fail(`[${tag}] first accordion stayed open when second opened`);
  if (!singleOpen.secondOpen) fail(`[${tag}] second accordion did not open`);

  await page.click('#nav-drawer-close');
  await page.waitForFunction(() => !document.getElementById('nav-drawer')?.classList.contains('active'));

  const resetState = await page.evaluate(() => ({
    anyOpen: Boolean(document.querySelector('#nav-menu .has-dropdown.open')),
  }));
  if (resetState.anyOpen) fail(`[${tag}] accordions not reset after drawer close`);
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
