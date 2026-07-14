(() => {
  const locale = location.pathname.match(/^\/(tr|en|ar|es|fr|it|ru|de)(?:\/|$)/)?.[1] || 'tr';
  const latin = 'family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap';
  const arabic = '&family=Noto+Naskh+Arabic:wght@500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700';
  const href = locale === 'ar'
    ? `https://fonts.googleapis.com/css2?${latin}${arabic}`
    : `https://fonts.googleapis.com/css2?${latin}`;

  const loadFonts = () => {
    if (document.querySelector('link[data-dotgen-fonts]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.setAttribute('data-dotgen-fonts', 'true');
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadFonts, { timeout: 2000 });
  } else {
    window.addEventListener('load', loadFonts, { once: true });
  }
})();
