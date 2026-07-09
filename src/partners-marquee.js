const DEBUG_ENDPOINT = 'http://127.0.0.1:7351/ingest/978326e2-ed1a-492b-ba34-cad4578e33a0';
const DEBUG_SESSION = 'a82467';

function debugLog(hypothesisId, location, message, data = {}, runId = 'pre-fix') {
  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION,
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

function getMarqueeMetrics(wrap) {
  const wrapRect = wrap.getBoundingClientRect();
  return {
    wrapWidth: wrapRect.width,
    animationPlayState: getComputedStyle(wrap).animationPlayState,
    isReady: wrap.classList.contains('is-ready'),
  };
}

function whenImageReady(image) {
  if (image.complete) return Promise.resolve();
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
  const logos = [...document.querySelectorAll('.partners-marquee-track .partner-logo')];
  const startedAt = performance.now();
  let initialWrapWidth = wrap.getBoundingClientRect().width;

  const activateMarquee = (runId = 'pre-fix') => {
    if (wrap.classList.contains('is-ready')) return;

    wrap.classList.add('is-ready');
    section.classList.add('is-ready');

    debugLog('D', 'partners-marquee.js:activate', 'marquee animation started after assets ready', {
      elapsedMs: Math.round(performance.now() - startedAt),
      incompleteImages: logos.filter((logo) => !logo.complete).length,
      prefersReducedMotion,
      ...getMarqueeMetrics(wrap),
    }, runId);
  };

  if (prefersReducedMotion) {
    activateMarquee('post-fix');
    return;
  }

  debugLog('A', 'partners-marquee.js:init', 'marquee init snapshot', {
    elapsedMs: 0,
    logoCount: logos.length,
    incompleteImages: logos.filter((logo) => !logo.complete).length,
    initialWrapWidth,
    ...getMarqueeMetrics(wrap),
  });

  logos.forEach((logo, index) => {
    if (logo.complete) return;
    logo.addEventListener('load', () => {
      const wrapWidth = wrap.getBoundingClientRect().width;
      debugLog('A', 'partners-marquee.js:image-load', 'logo loaded while marquee idle', {
        index,
        alt: logo.alt || '(duplicate)',
        elapsedMs: Math.round(performance.now() - startedAt),
        wrapWidth,
        widthDeltaPx: Number((wrapWidth - initialWrapWidth).toFixed(2)),
        animationPlayState: getComputedStyle(wrap).animationPlayState,
      });
      initialWrapWidth = wrapWidth;
    }, { once: true });
  });

  if ('PerformanceObserver' in window) {
    try {
      const layoutObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.hadRecentInput) return;
          debugLog('B', 'partners-marquee.js:layout-shift', 'layout shift near marquee', {
            value: entry.value,
            elapsedMs: Math.round(performance.now() - startedAt),
            isReady: wrap.classList.contains('is-ready'),
          });
        });
      });
      layoutObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Layout shift API unavailable
    }
  }

  Promise.all(logos.map(whenImageReady)).then(() => {
    activateMarquee('post-fix');
  });
}
