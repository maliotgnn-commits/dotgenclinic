export const ARGE_MENU_LABEL = 'Ar-Ge';

export const ARGE_PAGES = [
  {
    id: 'ilac-ar-ge',
    navLabel: 'İlaç Ar-Ge',
    path: '/tr/ilac-ar-ge.html',
    file: 'ilac-ar-ge.html',
  },
];

export function argeLandingPath() {
  return ARGE_PAGES[0]?.path || '/tr/ilac-ar-ge.html';
}

export function argePageByFile(file) {
  return ARGE_PAGES.find((page) => page.file === file) || null;
}

export function argePagePathForId(id) {
  return ARGE_PAGES.find((page) => page.id === id)?.path || argeLandingPath();
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectArgePage(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  return ARGE_PAGES.find(
    (page) => normalized.endsWith(`/${page.file}`) || normalized === page.path,
  ) || null;
}

export function isArgePagePath(pathname = window.location.pathname) {
  return Boolean(detectArgePage(pathname));
}
