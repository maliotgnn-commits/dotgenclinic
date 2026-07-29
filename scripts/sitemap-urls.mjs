import { SUBPAGES } from '../src/subpages-data.js';
import { FINANCE_ROUTES } from '../src/finance-routes.js';
import { LEGAL_ROUTES } from '../src/legal-routes.js';
import { PHARMA_RD_ROUTES } from '../src/pharma-rd-routes.js';
import { MEDIKAL_RD_ROUTES } from '../src/medikal-rd-routes.js';
import { YAZILIM_RD_ROUTES } from '../src/yazilim-rd-routes.js';
import { BLOCKCHAIN_RD_ROUTES } from '../src/blockchain-rd-routes.js';
import { ECOMMERCE_RD_ROUTES } from '../src/ecommerce-rd-routes.js';
import { EYE_HEALTH_ROUTES } from '../src/eye-health-routes.js';
import { LOCALES, SITE_ORIGIN } from './seo-shared.mjs';

export const DEPARTMENT_ROUTE_GROUPS = [
  { key: 'finance', routes: FINANCE_ROUTES },
  { key: 'legal', routes: LEGAL_ROUTES },
  { key: 'pharma-rd', routes: PHARMA_RD_ROUTES },
  { key: 'medikal-rd', routes: MEDIKAL_RD_ROUTES },
  { key: 'yazilim-rd', routes: YAZILIM_RD_ROUTES },
  { key: 'blockchain-rd', routes: BLOCKCHAIN_RD_ROUTES },
  { key: 'ecommerce-rd', routes: ECOMMERCE_RD_ROUTES },
];

function routePathsToUrls(routes, siteOrigin = SITE_ORIGIN) {
  return Object.values(routes).map((route) => `${siteOrigin}${route.path}`);
}

export function getEyeHealthUrls(siteOrigin = SITE_ORIGIN) {
  return routePathsToUrls(EYE_HEALTH_ROUTES, siteOrigin);
}

export function getDepartmentUrls(siteOrigin = SITE_ORIGIN) {
  return DEPARTMENT_ROUTE_GROUPS.flatMap(({ routes }) => routePathsToUrls(routes, siteOrigin));
}

export function getHomeUrls(siteOrigin = SITE_ORIGIN) {
  return LOCALES.map((locale) => `${siteOrigin}/${locale}/`);
}

export function getPrivacyUrls(siteOrigin = SITE_ORIGIN) {
  return LOCALES.map((locale) => `${siteOrigin}/${locale}/privacy.html`);
}

export function getLocationUrls(siteOrigin = SITE_ORIGIN) {
  return [
    `${siteOrigin}/tr/denizli.html`,
    `${siteOrigin}/tr/izmir.html`,
  ];
}

export function getServiceUrls(siteOrigin = SITE_ORIGIN) {
  const urls = [];
  for (const locale of LOCALES) {
    for (const page of SUBPAGES) {
      urls.push(`${siteOrigin}/${locale}/service.html?slug=${page.slug}`);
    }
  }
  return urls;
}

export function getAllSitemapUrls(siteOrigin = SITE_ORIGIN) {
  return [
    ...getHomeUrls(siteOrigin),
    ...getPrivacyUrls(siteOrigin),
    ...getLocationUrls(siteOrigin),
    ...getEyeHealthUrls(siteOrigin),
    ...getDepartmentUrls(siteOrigin),
    ...getServiceUrls(siteOrigin),
  ];
}
