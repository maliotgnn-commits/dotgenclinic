export const SITE_ORIGIN = 'https://www.drotgenclinic.com';
export const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
export const DEFAULT_LOCALE = 'tr';
export const OG_IMAGE_PATH = '/images/og/dr-otgen-clinic-social-card.png';
export const LOGO_PATH = '/images/logo-transparent.png';

export const CLINIC = {
  publicName: 'Dr Otgen Clinic',
  legalName: 'Dr Otgen Clinic A.Ş.',
  phone: '+905411595636',
  whatsapp: 'https://wa.me/905411595636',
  email: 'info@drotgenclinic.com',
  kvkkEmail: 'kvkk@drotgenclinic.com',
  kvkkAddress: 'Anadolu Plaza No:23, Karşıyaka, İzmir, 35560, Türkiye',
  instagram: 'https://www.instagram.com/drotgenclinic/',
  logoUrl: `${SITE_ORIGIN}${LOGO_PATH}`,
  ogImageUrl: `${SITE_ORIGIN}${OG_IMAGE_PATH}`,
  locations: [
    {
      id: 'izmir',
      name: 'İzmir',
      address: 'Anadolu Plaza No:23, Karşıyaka, İzmir, 35560, Türkiye',
    },
    {
      id: 'denizli',
      name: 'Denizli',
      address: 'Sırakapılar Mah. 495. Sok. No:22, Merkezefendi, Denizli, 20010, Türkiye',
    },
    {
      id: 'leverkusen',
      name: 'Leverkusen',
      address: 'Wiesdorfer Str. 3, Wiesdorf, Leverkusen, 51373, Almanya',
    },
  ],
};

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function organizationId() {
  return `${SITE_ORIGIN}/#organization`;
}

export function websiteId() {
  return `${SITE_ORIGIN}/#website`;
}

export function locationId(locationKey) {
  return `${SITE_ORIGIN}/#clinic-${locationKey}`;
}

export function buildHreflangBlock(urlForLocale) {
  const hreflangLinks = LOCALES.map(
    (code) =>
      `    <link data-i18n-seo="true" rel="alternate" hreflang="${code}" href="${urlForLocale(code)}" />`,
  ).join('\n');
  const xDefault = `    <link data-i18n-seo="true" rel="alternate" hreflang="x-default" href="${urlForLocale(DEFAULT_LOCALE)}" />`;
  return { hreflangLinks, xDefault };
}

export function buildCanonicalAndHreflang(canonical, urlForLocale) {
  const { hreflangLinks, xDefault } = buildHreflangBlock(urlForLocale);
  const canonicalLink = `    <link data-i18n-seo="true" rel="canonical" href="${canonical}" />`;
  return `${canonicalLink}\n${hreflangLinks}\n${xDefault}`;
}

export function buildOgTwitterTags({ title, description, url, type = 'website' }) {
  const image = CLINIC.ogImageUrl;
  return [
    `    <meta data-i18n-seo="true" property="og:type" content="${escapeHtml(type)}" />`,
    `    <meta data-i18n-seo="true" property="og:title" content="${escapeHtml(title)}" />`,
    `    <meta data-i18n-seo="true" property="og:description" content="${escapeHtml(description)}" />`,
    `    <meta data-i18n-seo="true" property="og:url" content="${escapeHtml(url)}" />`,
    `    <meta data-i18n-seo="true" property="og:image" content="${escapeHtml(image)}" />`,
    `    <meta data-i18n-seo="true" name="twitter:card" content="summary_large_image" />`,
    `    <meta data-i18n-seo="true" name="twitter:title" content="${escapeHtml(title)}" />`,
    `    <meta data-i18n-seo="true" name="twitter:description" content="${escapeHtml(description)}" />`,
    `    <meta data-i18n-seo="true" name="twitter:image" content="${escapeHtml(image)}" />`,
  ].join('\n');
}

export function buildJsonLdScript(graph) {
  const payload = Array.isArray(graph)
    ? { '@context': 'https://schema.org', '@graph': graph }
    : graph;
  return `    <script data-i18n-seo="true" type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

export function buildIzmirMedicalClinicEntity() {
  const izmir = CLINIC.locations.find((location) => location.id === 'izmir');
  return {
    '@type': 'MedicalClinic',
    '@id': locationId('izmir'),
    name: `${CLINIC.publicName} – ${izmir.name}`,
    legalName: CLINIC.legalName,
    url: `${SITE_ORIGIN}/`,
    parentOrganization: { '@id': organizationId() },
    logo: CLINIC.logoUrl,
    image: CLINIC.ogImageUrl,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Anadolu Plaza No:23',
      addressLocality: 'Karşıyaka',
      addressRegion: 'İzmir',
      postalCode: '35560',
      addressCountry: 'TR',
    },
    sameAs: [CLINIC.instagram],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'https://schema.org/Monday',
        'https://schema.org/Tuesday',
        'https://schema.org/Wednesday',
        'https://schema.org/Thursday',
        'https://schema.org/Friday',
        'https://schema.org/Saturday',
      ],
      opens: '08:00',
      closes: '17:00',
    },
  };
}

export function buildHomeSchema(locale, title) {
  const pageUrl = `${SITE_ORIGIN}/${locale}/`;
  return buildJsonLdScript([
    {
      '@type': 'Organization',
      '@id': organizationId(),
      name: CLINIC.publicName,
      url: `${SITE_ORIGIN}/`,
      logo: CLINIC.logoUrl,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: CLINIC.whatsapp,
      },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId(),
      url: `${SITE_ORIGIN}/`,
      name: CLINIC.publicName,
      publisher: { '@id': organizationId() },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      isPartOf: { '@id': websiteId() },
      about: { '@id': organizationId() },
    },
    buildIzmirMedicalClinicEntity(),
  ]);
}

export function buildServiceSchema(page, locale, slug) {
  const pageUrl = `${SITE_ORIGIN}/${locale}/service.html?slug=${encodeURIComponent(slug)}`;
  const homeUrl = `${SITE_ORIGIN}/${locale}/`;
  return buildJsonLdScript([
    {
      '@type': 'Organization',
      '@id': organizationId(),
      name: CLINIC.publicName,
      url: `${SITE_ORIGIN}/`,
      logo: CLINIC.logoUrl,
    },
    {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: page.title,
      description: page.summary,
      url: pageUrl,
      provider: { '@id': organizationId() },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: `${page.title} | ${CLINIC.publicName}`,
      description: `${page.title}: ${page.summary}`,
      isPartOf: { '@id': websiteId() },
      about: { '@id': `${pageUrl}#service` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: CLINIC.publicName,
          item: homeUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.title,
          item: pageUrl,
        },
      ],
    },
  ]);
}

export function buildPrivacySchema(locale, title, description) {
  const pageUrl = `${SITE_ORIGIN}/${locale}/privacy.html`;
  const locationEntities = CLINIC.locations.map((location) => {
    if (location.id === 'izmir') {
      return buildIzmirMedicalClinicEntity();
    }
    return {
      '@type': 'MedicalClinic',
      '@id': locationId(location.id),
      name: `${CLINIC.publicName} – ${location.name}`,
      parentOrganization: { '@id': organizationId() },
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressCountry: location.id === 'leverkusen' ? 'DE' : 'TR',
      },
      telephone: CLINIC.phone,
      email: CLINIC.email,
      url: pageUrl,
    };
  });

  return buildJsonLdScript([
    {
      '@type': 'Organization',
      '@id': organizationId(),
      name: CLINIC.publicName,
      legalName: CLINIC.legalName,
      url: `${SITE_ORIGIN}/`,
      logo: CLINIC.logoUrl,
      email: CLINIC.email,
      telephone: CLINIC.phone,
      sameAs: [CLINIC.instagram],
    },
    ...locationEntities,
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      isPartOf: { '@id': websiteId() },
      about: { '@id': organizationId() },
    },
  ]);
}

export function buildEyeHealthSchema(locale, page, breadcrumbs) {
  const pageUrl = `${SITE_ORIGIN}${page.canonicalPath}`;
  const pageName = page.title.replace(/\s*\|\s*Dr Otgen Clinic\s*$/, '');
  return buildJsonLdScript([
    {
      '@type': 'MedicalWebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageName,
      description: page.description,
      inLanguage: locale,
      isPartOf: { '@id': websiteId() },
      publisher: { '@id': locationId('izmir') },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: breadcrumbs.home,
          item: `${SITE_ORIGIN}/${locale}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: breadcrumbs.page,
          item: pageUrl,
        },
      ],
    },
  ]);
}

export function buildDepartmentSchema(locale, page, pageUrl, breadcrumbs) {
  const pageName = page.title.replace(/\s*\|\s*Dr Otgen Clinic\s*$/, '');
  return buildJsonLdScript([
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageName,
      description: page.description,
      inLanguage: locale,
      isPartOf: { '@id': websiteId() },
      about: { '@id': organizationId() },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: breadcrumbs.home,
          item: `${SITE_ORIGIN}/${locale}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: breadcrumbs.page,
          item: pageUrl,
        },
      ],
    },
  ]);
}

export function injectSeoBundle(html, { title, description, seoBlock, ogTwitter, jsonLd }) {
  let result = html;
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  result = result.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  result = result.replace(
    /(<meta name="description" content="[^"]*" \/>)/,
    `$1\n${seoBlock}\n${ogTwitter}\n${jsonLd}`,
  );
  return result;
}
