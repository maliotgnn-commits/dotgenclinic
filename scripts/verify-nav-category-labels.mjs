import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCategoryGroups, CATEGORY_NAV_UI_KEYS, translate } from '../src/i18n.js';
import { EYE_HEALTH_ROUTES } from '../src/eye-health-routes.js';
import { CATEGORY_CONFIG, CATEGORY_ORDER, SUBPAGES } from '../src/subpages-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const BASE_URL = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:4177';

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function loadUiDictionary(locale) {
  if (locale === 'tr') return { text: {}, html: {} };
  return JSON.parse(readFileSync(resolve(ROOT, `src/i18n/ui/${locale}.json`), 'utf8'));
}

async function loadContentCatalog(locale) {
  if (locale === 'tr') {
    return {
      categoryConfig: CATEGORY_CONFIG,
      categoryOrder: CATEGORY_ORDER,
      pages: SUBPAGES,
    };
  }
  return (await import(`../src/i18n/content/${locale}.json`, { with: { type: 'json' } })).default;
}

async function validateStaticNavLabels() {
  for (const locale of LOCALES) {
    const catalog = await loadContentCatalog(locale);
    const uiDictionary = loadUiDictionary(locale);
    const groups = buildCategoryGroups(catalog, uiDictionary);
    const hair = groups.find((group) => group.key === 'hair');

    assert(hair, `[${locale}] hair category group missing`);
    if (!hair) continue;

    const expectedNav = translate(uiDictionary, CATEGORY_NAV_UI_KEYS.hair);
    assert(
      hair.navLabel === expectedNav,
      `[${locale}] hair navLabel must match home nav ui key (${expectedNav}, got ${hair.navLabel})`,
    );
    assert(
      hair.navLabel.length <= hair.label.length,
      `[${locale}] hair navLabel should not be longer than category label`,
    );

    if (locale === 'ru') {
      assert(
        hair.navLabel === 'Трансплантация волос',
        `[ru] hair nav bar must use short label, got ${hair.navLabel}`,
      );
      assert(
        hair.label.includes('лечение'),
        '[ru] mega menu should keep full hair category label',
      );
    }
  }
}

async function validateRenderedNavFit() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const viewports = [
    { width: 1280, height: 900 },
    { width: 1366, height: 900 },
  ];

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    for (const locale of LOCALES) {
      const eyePath = EYE_HEALTH_ROUTES[locale]?.path;
      assert(eyePath, `[${locale}] missing eye health route`);

      await page.goto(`${BASE_URL}${eyePath}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#nav-menu');

      const metrics = await page.evaluate(() => {
        const primary = document.querySelector('.nav-primary');
        const navMenu = document.getElementById('nav-menu');
        const actions = document.querySelector('.nav-actions');
        const logo = document.querySelector('.nav-logo');
        const actionsRect = actions.getBoundingClientRect();
        const menuRect = navMenu.getBoundingClientRect();
        const logoRect = logo.getBoundingClientRect();
        const primaryRect = primary.getBoundingClientRect();
        const isRtl = document.documentElement.dir === 'rtl';
        const gapToActions = isRtl
          ? menuRect.left - actionsRect.right
          : actionsRect.left - menuRect.right;
        const gapToLogo = isRtl
          ? logoRect.left - menuRect.right
          : menuRect.left - logoRect.right;
        const first = document.querySelector('#nav-menu > li:first-child > a, #nav-menu > li:first-child .eh-nav-item-head');
        const last = document.querySelector('#nav-menu > li:last-child > a, #nav-menu > li:last-child .eh-nav-item-head');
        const firstRect = first?.getBoundingClientRect();
        const lastRect = last?.getBoundingClientRect();
        const links = [...document.querySelectorAll('#nav-menu > li > a, #nav-menu > li .eh-nav-primary-link')];
        return {
          scale: getComputedStyle(document.querySelector('.nav-container')).getPropertyValue('--nav-fit-scale').trim() || '1',
          needed: Math.round(menuRect.width),
          overflow: gapToActions < 16 || gapToLogo < 16,
          gapToActions,
          gapToLogo,
        firstVisible: firstRect
          ? (isRtl ? firstRect.right <= logoRect.left - 8 : firstRect.left >= logoRect.right + 8)
          : false,
        lastVisible: lastRect
          ? (isRtl ? lastRect.left >= actionsRect.right + 8 : lastRect.right <= actionsRect.left - 8)
          : false,
          linkOverflow: links.some((link) => link.scrollWidth > link.clientWidth + 1),
          pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
          hairText: document.querySelector('#nav-menu > li:nth-child(2) > a')?.textContent.trim() ?? '',
        };
      });

      const vpLabel = `${viewport.width}px`;
      assert(!metrics.overflow, `[${locale}@${vpLabel}] nav-menu exceeds logo/actions corridor (${metrics.needed}px, scale ${metrics.scale}, gaps logo ${Math.round(metrics.gapToLogo)} / actions ${Math.round(metrics.gapToActions)})`);
      assert(metrics.gapToActions >= 16, `[${locale}@${vpLabel}] nav-menu overlaps language bar (gap ${metrics.gapToActions}px)`);
      assert(metrics.gapToLogo >= 16, `[${locale}@${vpLabel}] nav-menu overlaps logo (gap ${metrics.gapToLogo}px)`);
      assert(metrics.firstVisible, `[${locale}@${vpLabel}] first nav item clipped by logo`);
      assert(metrics.lastVisible, `[${locale}@${vpLabel}] last nav item clipped by language bar`);
      assert(!metrics.linkOverflow, `[${locale}@${vpLabel}] a header category link overflowed its box`);
      assert(metrics.pageOverflow <= 1, `[${locale}@${vpLabel}] eye-health page horizontal overflow (${metrics.pageOverflow}px)`);

      if (locale === 'ru') {
        assert(
          metrics.hairText.startsWith('Трансплантация волос'),
          `[ru@${vpLabel}] rendered hair nav must use short label, got "${metrics.hairText}"`,
        );
        assert(
          !metrics.hairText.includes('лечение волос'),
          `[ru@${vpLabel}] rendered hair nav must not include long category suffix`,
        );
      }
    }

    await context.close();
  }

  await browser.close();
}

await validateStaticNavLabels();

if (process.env.VERIFY_NAV_BROWSER === '1') {
  await validateRenderedNavFit();
} else {
  console.log('[verify-nav-category-labels] Static checks passed; browser checks skipped (set VERIFY_NAV_BROWSER=1)');
}

if (failures.length) {
  console.error('[verify-nav-category-labels] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-nav-category-labels] Verified short nav labels for all locales');
