export const BLOCKCHAIN_RD_ROUTES = {
  tr: {
    path: '/tr/blockchain-ar-ge.html',
    file: 'blockchain-ar-ge.html',
    pageNavLabel: 'Blockchain Ar-Ge',
  },
  en: {
    path: '/en/blockchain-r-d.html',
    file: 'blockchain-r-d.html',
    pageNavLabel: 'Blockchain R&D',
  },
  ar: {
    path: '/ar/البحث-والتطوير-البلوكشين.html',
    file: 'البحث-والتطوير-البلوكشين.html',
    pageNavLabel: 'البحث والتطوير في البلوكشين',
  },
  es: {
    path: '/es/i-d-blockchain.html',
    file: 'i-d-blockchain.html',
    pageNavLabel: 'I+D Blockchain',
  },
  fr: {
    path: '/fr/r-d-blockchain.html',
    file: 'r-d-blockchain.html',
    pageNavLabel: 'R&D Blockchain',
  },
  it: {
    path: '/it/r-s-blockchain.html',
    file: 'r-s-blockchain.html',
    pageNavLabel: 'R&S Blockchain',
  },
  ru: {
    path: '/ru/блокчейн-разработки.html',
    file: 'блокчейн-разработки.html',
    pageNavLabel: 'Блокчейн-разработки',
  },
  de: {
    path: '/de/blockchain-forschung.html',
    file: 'blockchain-forschung.html',
    pageNavLabel: 'Blockchain F&E',
  },
};

export const BLOCKCHAIN_RD_LOCALES = Object.keys(BLOCKCHAIN_RD_ROUTES);

export function blockchainRdPathForLocale(locale) {
  return BLOCKCHAIN_RD_ROUTES[locale]?.path || BLOCKCHAIN_RD_ROUTES.tr.path;
}

export function blockchainRdFileForLocale(locale) {
  return BLOCKCHAIN_RD_ROUTES[locale]?.file || BLOCKCHAIN_RD_ROUTES.tr.file;
}

export function blockchainRdPageNavLabelForLocale(locale) {
  return BLOCKCHAIN_RD_ROUTES[locale]?.pageNavLabel || BLOCKCHAIN_RD_ROUTES.tr.pageNavLabel;
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectBlockchainRdLocale(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  for (const [locale, route] of Object.entries(BLOCKCHAIN_RD_ROUTES)) {
    if (normalized.endsWith(`/${route.file}`) || normalized === route.path) {
      return locale;
    }
  }
  return null;
}

export function isBlockchainRdPath(pathname = window.location.pathname) {
  return Boolean(detectBlockchainRdLocale(pathname));
}
