import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCategoryGroups,
  CATEGORY_NAV_UI_KEYS,
  RU_HEADER_NAV_LABELS,
  translate,
} from '../src/i18n.js';
import { EYE_HEALTH_ROUTES, eyeHealthHeaderNavLabelForLocale } from '../src/eye-health-routes.js';
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
    const groups = buildCategoryGroups(catalog, uiDictionary, locale);
    const hair = groups.find((group) => group.key === 'hair');
    const corporate = groups.find((group) => group.key === 'corporate');

    assert(hair, `[${locale}] hair category group missing`);
    if (!hair) continue;

    if (locale === 'ru') {
      assert(
        corporate?.navLabel === RU_HEADER_NAV_LABELS.corporate,
        `[ru] corporate header nav must be "${RU_HEADER_NAV_LABELS.corporate}", got ${corporate?.navLabel}`,
      );
      assert(
        hair.navLabel === RU_HEADER_NAV_LABELS.hair,
        `[ru] hair header nav must be "${RU_HEADER_NAV_LABELS.hair}", got ${hair.navLabel}`,
      );
      assert(
        hair.label.includes('лечение'),
        '[ru] mega menu must keep full hair category label',
      );
      assert(
        hair.navLabel !== hair.label,
        '[ru] header nav label must stay shorter than mega menu category label',
      );
      continue;
    }

    const expectedNav = translate(uiDictionary, CATEGORY_NAV_UI_KEYS.hair);
    assert(
      hair.navLabel === expectedNav,
      `[${locale}] hair navLabel must match home nav ui key (${expectedNav}, got ${hair.navLabel})`,
    );
    assert(
      hair.navLabel.length <= hair.label.length,
      `[${locale}] hair navLabel should not be longer than category label`,
    );
  }
}

function validateNoRuntimeNavFit() {
  const publicHeaderJs = readFileSync(resolve(ROOT, 'src/public-header.js'), 'utf8');
  const styleCss = readFileSync(resolve(ROOT, 'src/style.css'), 'utf8');

  assert(
    !publicHeaderJs.includes('fitHeaderNavigation'),
    'public-header.js must not use runtime nav fit scaling',
  );
  assert(
    !publicHeaderJs.includes('ResizeObserver'),
    'public-header.js must not use ResizeObserver for header density',
  );
  assert(
    !styleCss.includes('--nav-fit-scale'),
    'style.css must not use runtime --nav-fit-scale',
  );
  assert(
    !styleCss.includes('is-nav-fitting'),
    'style.css must not use is-nav-fitting density class',
  );
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
      await page.waitForTimeout(1500);

      const metrics = await page.evaluate(() => {
        const navMenu = document.getElementById('nav-menu');
        const actions = document.querySelector('.nav-actions');
        const logo = document.querySelector('.nav-logo');
        const container = document.querySelector('.nav-container');
        const actionsRect = actions.getBoundingClientRect();
        const menuRect = navMenu.getBoundingClientRect();
        const logoRect = logo.getBoundingClientRect();
        const isRtl = document.documentElement.dir === 'rtl';
        const gapToActions = isRtl
          ? menuRect.left - actionsRect.right
          : actionsRect.left - menuRect.right;
        const gapToLogo = isRtl
          ? logoRect.left - menuRect.right
          : menuRect.left - logoRect.right;
        const first = document.querySelector('#nav-menu > li:first-child > a, #nav-menu > li:first-child .eh-nav-item-head');
        const navItems = [...document.querySelectorAll('#nav-menu > li:not(.nav-mobile-cta-item)')];
        const lastItem = navItems[navItems.length - 1];
        const last = lastItem?.querySelector(':scope > a, :scope .eh-nav-item-head, :scope .eh-nav-primary-link');
        const firstRect = first?.getBoundingClientRect();
        const lastRect = last?.getBoundingClientRect();
        const links = [...document.querySelectorAll('#nav-menu > li > a, #nav-menu > li .eh-nav-primary-link')];
        return {
          fitScale: getComputedStyle(container).getPropertyValue('--nav-fit-scale').trim(),
          needed: Math.round(menuRect.width),
          overflow: gapToActions < 8 || gapToLogo < 8,
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
          corporateText: document.querySelector('#nav-menu > li:first-child > a')?.textContent.trim() ?? '',
          hairText: document.querySelector('#nav-menu > li:nth-child(2) > a')?.textContent.trim() ?? '',
          eyeText: document.querySelector('[data-eye-health-nav] .eh-nav-primary-link')?.textContent.trim()
            ?? navItems[navItems.length - 1]?.querySelector(':scope > a, :scope .eh-nav-primary-link')?.textContent.trim()
            ?? '',
          ctaVisible: Boolean(document.querySelector('.nav-actions > .nav-cta')?.getBoundingClientRect().width),
        };
      });

      const vpLabel = `${viewport.width}px`;
      assert(!metrics.fitScale, `[${locale}@${vpLabel}] runtime --nav-fit-scale must not be applied`);
      assert(!metrics.overflow, `[${locale}@${vpLabel}] nav-menu exceeds logo/actions corridor (gaps logo ${Math.round(metrics.gapToLogo)} / actions ${Math.round(metrics.gapToActions)})`);
      assert(metrics.gapToActions >= 8, `[${locale}@${vpLabel}] nav-menu overlaps language bar (gap ${metrics.gapToActions}px)`);
      assert(metrics.gapToLogo >= 8, `[${locale}@${vpLabel}] nav-menu overlaps logo (gap ${metrics.gapToLogo}px)`);
      assert(metrics.firstVisible, `[${locale}@${vpLabel}] first nav item clipped by logo`);
      assert(metrics.lastVisible, `[${locale}@${vpLabel}] last nav item clipped by language bar`);
      assert(!metrics.linkOverflow, `[${locale}@${vpLabel}] a header category link overflowed its box`);
      assert(metrics.pageOverflow <= 1, `[${locale}@${vpLabel}] eye-health page horizontal overflow (${metrics.pageOverflow}px)`);
      assert(metrics.ctaVisible, `[${locale}@${vpLabel}] CTA must remain visible`);

      if (locale === 'ru') {
        assert(
          metrics.corporateText.startsWith(RU_HEADER_NAV_LABELS.corporate),
          `[ru@${vpLabel}] corporate header nav must be "${RU_HEADER_NAV_LABELS.corporate}", got "${metrics.corporateText}"`,
        );
        assert(
          metrics.hairText.startsWith(RU_HEADER_NAV_LABELS.hair),
          `[ru@${vpLabel}] hair header nav must be "${RU_HEADER_NAV_LABELS.hair}", got "${metrics.hairText}"`,
        );
        assert(
          metrics.eyeText.startsWith(eyeHealthHeaderNavLabelForLocale('ru')),
          `[ru@${vpLabel}] eye health header nav must be "${eyeHealthHeaderNavLabelForLocale('ru')}", got "${metrics.eyeText}"`,
        );
      }
    }

    await context.close();
  }

  await browser.close();
}

validateNoRuntimeNavFit();
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
