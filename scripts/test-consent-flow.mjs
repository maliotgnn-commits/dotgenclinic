import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173/tr/';
const CONSENT_KEY = 'dotgen_cookie_consent_v1';

function readConsentEntries(dataLayer) {
  return (dataLayer || []).flatMap((entry) => {
    if (!entry) return [];
    if (entry[0] === 'consent') {
      return [{ type: entry[1], state: entry[2] }];
    }
    if (entry.event) {
      return [{ type: 'event', name: entry.event, payload: entry }];
    }
    return [];
  });
}

async function inspectState(page) {
  return page.evaluate((key) => {
    const gtmScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
    const consentEntries = (window.dataLayer || []).flatMap((entry) => {
      if (!entry) return [];
      if (entry[0] === 'consent') return [{ phase: entry[1], analytics: entry[2]?.analytics_storage }];
      if (entry.event) return [{ phase: 'event', name: entry.event }];
      return [];
    });
    return {
      gtmScriptPresent: Boolean(gtmScript),
      gtmScriptSrc: gtmScript?.src || null,
      gtmLoadedFlag: window.__dotgenGtmLoaded === true,
      dataLayerExists: Array.isArray(window.dataLayer),
      dataLayerLength: window.dataLayer?.length ?? 0,
      consentEntries,
      storedConsent: localStorage.getItem(key),
      widgetVisible: Boolean(document.getElementById('cookie-consent')),
    };
  }, CONSENT_KEY);
}

async function resetStorage(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    location.reload();
  }, CONSENT_KEY);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  await dismissIntro(page);
}

async function dismissIntro(page) {
  await page.evaluate(() => {
    const overlay = document.getElementById('intro-overlay');
    const section = document.getElementById('intro-section');
    if (overlay) {
      overlay.classList.add('completed');
      overlay.style.display = 'none';
    }
    if (section) section.style.display = 'none';
    document.body.style.overflow = '';
  });
}

async function openConsentPanel(page) {
  await page.locator('.cookie-consent__trigger').click({ force: true });
  await page.locator('#cookie-consent-panel').waitFor({ state: 'visible' });
}

async function triggerGtmSchedule(page) {
  await page.mouse.click(10, 10);
  await page.waitForTimeout(3000);
}

async function runScenario(name, fn) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    const result = await fn(page);
    return { name, ...result };
  } finally {
    await browser.close();
  }
}

const results = [];

results.push(await runScenario('first-visit', async (page) => {
  await resetStorage(page);
  await page.waitForTimeout(1500);
  const state = await inspectState(page);
  const defaultConsent = state.consentEntries.find((e) => e.phase === 'default');
  return {
    pass: !state.gtmScriptPresent
      && !state.gtmLoadedFlag
      && state.dataLayerExists
      && defaultConsent?.analytics === 'denied',
    state,
    checks: {
      gtmNotLoaded: !state.gtmScriptPresent && !state.gtmLoadedFlag,
      dataLayerExists: state.dataLayerExists,
      consentDefaultDenied: defaultConsent?.analytics === 'denied',
    },
  };
}));

results.push(await runScenario('accept-flow', async (page) => {
  await resetStorage(page);
  await openConsentPanel(page);
  await page.locator('[data-cookie-consent="accept"]').click({ force: true });
  await triggerGtmSchedule(page);
  const state = await inspectState(page);
  await page.locator('a[href*="wa.me"]').first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(500);
  const afterClick = await inspectState(page);
  const updateConsent = afterClick.consentEntries.find((e) => e.phase === 'update' && e.analytics === 'granted');
  const whatsappEvent = afterClick.consentEntries.find((e) => e.phase === 'event' && e.name === 'whatsapp_click');
  return {
    pass: state.gtmScriptPresent
      && state.gtmLoadedFlag
      && updateConsent
      && Boolean(whatsappEvent),
    state,
    afterClick,
    checks: {
      gtmScriptAdded: state.gtmScriptPresent && state.gtmLoadedFlag,
      consentUpdateGranted: Boolean(updateConsent),
      whatsappEventPushed: Boolean(whatsappEvent),
    },
  };
}));

results.push(await runScenario('reject-flow', async (page) => {
  await resetStorage(page);
  await openConsentPanel(page);
  await page.locator('[data-cookie-consent="reject"]').click({ force: true });
  await triggerGtmSchedule(page);
  const state = await inspectState(page);
  const stored = state.storedConsent ? JSON.parse(state.storedConsent) : null;
  return {
    pass: !state.gtmScriptPresent
      && !state.gtmLoadedFlag
      && stored?.analytics === false,
    state,
    checks: {
      gtmNeverLoaded: !state.gtmScriptPresent && !state.gtmLoadedFlag,
      storedReject: stored?.analytics === false,
    },
  };
}));

console.log(JSON.stringify({ results }, null, 2));

const failed = results.filter((r) => !r.pass);
process.exit(failed.length ? 1 : 0);
