export function avifPathFromWebp(webpPath) {
  return String(webpPath).replace(/\.webp$/i, '.avif');
}

export function renderResponsivePicture({
  webpSrc,
  avifSrc,
  webpSrcset,
  avifSrcset,
  sizes,
  width,
  height,
  alt = '',
  loading,
  decoding = 'async',
  fetchpriority,
  className = '',
}) {
  const avif = avifSrc || avifPathFromWebp(webpSrc);
  const avifSet = avifSrcset || (webpSrcset ? webpSrcset.replace(/\.webp/g, '.avif') : '');
  const classAttr = className ? ` class="${className}"` : '';
  const loadingAttr = loading ? ` loading="${loading}"` : '';
  const fetchAttr = fetchpriority ? ` fetchpriority="${fetchpriority}"` : '';
  const sizesAttr = sizes ? ` sizes="${sizes}"` : '';
  const widthAttr = width ? ` width="${width}"` : '';
  const heightAttr = height ? ` height="${height}"` : '';

  return `
    <picture>
      <source srcset="${avifSet || avif}" type="image/avif"${sizesAttr} />
      <source srcset="${webpSrcset || webpSrc}" type="image/webp"${sizesAttr} />
      <img src="${webpSrc}" alt="${alt}" decoding="${decoding}"${widthAttr}${heightAttr}${loadingAttr}${fetchAttr}${classAttr} />
    </picture>
  `.trim();
}

export function heroPosterSources(isMobile) {
  const base = isMobile ? '/images/mobil' : '/images/hero-world-map';
  return {
    avif: `${base}.avif`,
    webp: `${base}.webp`,
  };
}
