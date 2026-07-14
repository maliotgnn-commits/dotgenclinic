const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const DEFAULT_LOCALE = 'tr';

export function doctorUrlForLocale(slug, locale, hash = '') {
  const safeLocale = LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const params = new URLSearchParams();
  if (slug) params.set('slug', slug);
  const query = params.toString();
  return `/${safeLocale}/doctor.html${query ? `?${query}` : ''}${hash || ''}`;
}
