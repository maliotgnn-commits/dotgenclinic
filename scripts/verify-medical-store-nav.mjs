import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  injectArgeNavForLocale,
  MEDICAL_STORE_PATH,
  renderMedicalStoreNavItem,
} from '../src/tr-arge-nav.js';

const homeHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const styleCss = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');
const navItem = renderMedicalStoreNavItem();

assert.equal(MEDICAL_STORE_PATH, 'https://medical.drotgenclinic.com/');
assert.match(navItem, /data-medical-store-nav/);
assert.match(navItem, /href="https:\/\/medical\.drotgenclinic\.com\/"/);
assert.match(navItem, />E-Medical<\/a>/);
assert.match(navItem, /aria-label="DrOtgenMedical E-Medical"/);

const localizedNav = injectArgeNavForLocale(homeHtml, 'en');
assert.match(
  localizedNav,
  /data-arge-nav[\s\S]*data-medical-store-nav/,
  'Localized navigation must keep E-Medical after Ar-Ge.',
);

assert.match(
  homeHtml,
  /data-arge-nav[\s\S]*data-medical-store-nav[\s\S]*<\/ul>/,
  'DrOtgenMedical must follow Ar-Ge in the main navigation.',
);
assert.match(
  homeHtml,
  /class="footer-links"[\s\S]*href="https:\/\/medical\.drotgenclinic\.com\/"[\s\S]*DrOtgenMedical/,
  'DrOtgenMedical must be linked from the homepage footer.',
);
assert.match(
  styleCss,
  /\.nav-menu>li>a\.medical-store-nav-link/,
  'Desktop navigation styling is missing.',
);
assert.match(
  styleCss,
  /\.nav-menu > li > a\.medical-store-nav-link/,
  'Mobile navigation styling is missing.',
);

console.log('DrOtgenMedical navigation and footer links verified.');
