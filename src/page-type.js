const LOCALE_HOME_RE = /^\/(tr|en|ar|es|fr|it|ru|de)\/?$/;
const LOCALE_HOME_INDEX_RE = /^\/(tr|en|ar|es|fr|it|ru|de)\/index\.html$/;
const LOCALE_SERVICE_RE = /^\/(tr|en|ar|es|fr|it|ru|de)\/service\.html$/;

export function isHomePage(pathname = window.location.pathname) {
  return (
    pathname === '/'
    || pathname === '/index.html'
    || LOCALE_HOME_RE.test(pathname)
    || LOCALE_HOME_INDEX_RE.test(pathname)
  );
}

export function isServicePage(pathname = window.location.pathname) {
  return pathname === '/service.html' || LOCALE_SERVICE_RE.test(pathname);
}
