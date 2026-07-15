function whenImageReady(image) {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  });
}

export function initPartnersMarquee() {
  const section = document.querySelector('.partners-marquee-section');
  const wrap = document.querySelector('.partners-marquee-wrap');
  if (!section || !wrap) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const firstTrack = wrap.querySelector('.partners-marquee-track');
  const primaryLogos = firstTrack ? [...firstTrack.querySelectorAll('.partner-logo')] : [];

  const activateMarquee = () => {
    if (wrap.classList.contains('is-ready')) return;
    wrap.classList.add('is-ready');
    section.classList.add('is-ready');
  };

  if (prefersReducedMotion) {
    activateMarquee();
    return;
  }

  if (!primaryLogos.length) {
    activateMarquee();
    return;
  }

  Promise.all(primaryLogos.map(whenImageReady)).then(activateMarquee);
}
