(() => {
  const locale = location.pathname.match(/^\/(tr|en|ar|es|fr|it|ru|de)(?:\/|$)/)?.[1] || 'tr';
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
})();
