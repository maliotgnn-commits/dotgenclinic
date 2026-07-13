import { FINANCE_ROUTES, FINANCE_LOCALES } from '../src/finance-routes.js';
import { LEGAL_ROUTES, LEGAL_LOCALES } from '../src/legal-routes.js';
import { PHARMA_RD_ROUTES, PHARMA_RD_LOCALES } from '../src/pharma-rd-routes.js';
import { MEDIKAL_RD_ROUTES, MEDIKAL_RD_LOCALES } from '../src/medikal-rd-routes.js';
import { YAZILIM_RD_ROUTES, YAZILIM_RD_LOCALES } from '../src/yazilim-rd-routes.js';
import { BLOCKCHAIN_RD_ROUTES, BLOCKCHAIN_RD_LOCALES } from '../src/blockchain-rd-routes.js';
import { ECOMMERCE_RD_ROUTES, ECOMMERCE_RD_LOCALES } from '../src/ecommerce-rd-routes.js';
import { getFinanceContentSync } from './finance-content-node.mjs';
import { getLegalContentSync } from './legal-content-node.mjs';
import { getPharmaRdContentSync } from './pharma-rd-content-node.mjs';
import { getMedikalRdContentSync } from './medikal-rd-content-node.mjs';
import { getYazilimRdContentSync } from './yazilim-rd-content-node.mjs';
import { getBlockchainRdContentSync } from './blockchain-rd-content-node.mjs';
import { getEcommerceRdContentSync } from './ecommerce-rd-content-node.mjs';
import { SITE_ORIGIN } from './seo-shared.mjs';

const HOME_BREADCRUMB_LABELS = {
  tr: 'Ana Sayfa',
  en: 'Home',
  ar: 'الرئيسية',
  es: 'Inicio',
  fr: 'Accueil',
  it: 'Home',
  ru: 'Главная',
  de: 'Startseite',
};

export function departmentUrlForLocale(routes, locale) {
  return `${SITE_ORIGIN}${routes[locale].path}`;
}

export function departmentBreadcrumbs(content, locale) {
  return {
    home: HOME_BREADCRUMB_LABELS[locale] ?? HOME_BREADCRUMB_LABELS.en,
    page: content.nav?.menuLabel ?? content.page.hero?.title ?? content.page.title,
  };
}

export const DEPARTMENT_SEO_PAGES = [
  {
    key: 'finance',
    routes: FINANCE_ROUTES,
    locales: FINANCE_LOCALES,
    appMountId: 'finance-app',
    getContent: getFinanceContentSync,
  },
  {
    key: 'legal',
    routes: LEGAL_ROUTES,
    locales: LEGAL_LOCALES,
    appMountId: 'legal-app',
    getContent: getLegalContentSync,
  },
  {
    key: 'pharma-rd',
    routes: PHARMA_RD_ROUTES,
    locales: PHARMA_RD_LOCALES,
    appMountId: 'pharma-rd-app',
    getContent: getPharmaRdContentSync,
  },
  {
    key: 'medikal-rd',
    routes: MEDIKAL_RD_ROUTES,
    locales: MEDIKAL_RD_LOCALES,
    appMountId: 'medikal-rd-app',
    getContent: getMedikalRdContentSync,
  },
  {
    key: 'yazilim-rd',
    routes: YAZILIM_RD_ROUTES,
    locales: YAZILIM_RD_LOCALES,
    appMountId: 'yazilim-rd-app',
    getContent: getYazilimRdContentSync,
  },
  {
    key: 'blockchain-rd',
    routes: BLOCKCHAIN_RD_ROUTES,
    locales: BLOCKCHAIN_RD_LOCALES,
    appMountId: 'blockchain-rd-app',
    getContent: getBlockchainRdContentSync,
  },
  {
    key: 'ecommerce-rd',
    routes: ECOMMERCE_RD_ROUTES,
    locales: ECOMMERCE_RD_LOCALES,
    appMountId: 'ecommerce-rd-app',
    getContent: getEcommerceRdContentSync,
  },
];

export function buildDepartmentSeoRewrites() {
  const rewrites = [];

  for (const department of DEPARTMENT_SEO_PAGES) {
    for (const locale of department.locales) {
      const route = department.routes[locale];
      rewrites.push({
        source: `/${locale}/${route.file}`,
        destination: `/_seo/${locale}/${route.file}`,
      });
    }
  }

  return rewrites;
}
