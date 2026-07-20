import './cookie-consent.js';
import './style.css';
import footerVideoUrl from '../kj.mp4';
import heroVideoUrl from './assets/hero-video-mobile.mp4';
import { applySubcategoryLinks } from './subpages-nav-links.js';
import { initCustomCursor } from './cursor.js';
import {
  applyPrivacyUi,
  applyRuCompactHeaderNavDom,
  applySeoLinks,
  applyStaticTranslations,
  getCurrentLocale,
  getIntlLocale,
  loadPrivacyContent,
  loadUiDictionary,
  localizeInternalLinks,
  serviceUrlForLocale,
  translate,
} from './i18n.js';
import { mountLanguageSwitcher } from './language-switcher.js';
import { initSiteHeader } from './public-header.js';
import { loadEyeHealthContent } from './eye-health-content.js';
import { upgradeLocalizedEyeHealthNav } from './tr-eye-health-nav.js';
import { initPartnersMarquee } from './partners-marquee.js';
import { initAnalyticsTracking, pushEvent } from './analytics.js';
import { buildWhatsAppUrl } from './whatsapp-links.js';
import {
  applyAppointmentReferrerToForm,
  clearAppointmentReferrer,
  readAppointmentReferrer,
} from './appointment-attribution.js';
import { initDoctorClickHandling } from './doctor-click.js';
import { heroPosterSources } from './responsive-image.js';

const locale = getCurrentLocale('home');
const footerLoopVideoUrl = '/videos/world-animation.mp4';
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = prefersReducedMotionQuery.matches;
let heroVideoSourceAttached = false;

function attachHeroVideoSource(video) {
  if (!video || heroVideoSourceAttached || video.querySelector('source')) return;
  heroVideoSourceAttached = true;

  const source = document.createElement('source');
  source.src = heroVideoUrl;
  source.type = 'video/mp4';
  video.appendChild(source);
  video.setAttribute('preload', 'auto');
  video.load();

  const retryHeroAutoplay = () => {
    if (prefersReducedMotion || !introComplete) return;
    syncHeroVideoPlayback();
  };
  video.addEventListener('canplay', retryHeroAutoplay, { once: true });
}

function setupHeroVideoPlaybackHandlers(video) {
  if (!video || video.dataset.heroPlaybackBound === 'true') return;
  video.dataset.heroPlaybackBound = 'true';

  video.addEventListener('playing', () => {
    if (video.currentTime > 0 || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      clearHeroVideoFallback(video);
    }
    syncHeroPlayButton();
  });

  ['pause', 'ended', 'waiting'].forEach((eventName) => {
    video.addEventListener(eventName, syncHeroPlayButton);
  });

  video.addEventListener('stalled', () => {
    if (!isVideoActivelyPlaying(video)) {
      applyHeroVideoFallback(video);
      syncHeroPlayButton();
    }
  });

  video.addEventListener('error', () => {
    applyHeroVideoFallback(video);
    syncHeroPlayButton();
  });
}

function bootstrapHeroVideoEarly() {
  if (prefersReducedMotion) return;
  const video = document.querySelector('.hero-bg-video');
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  setupHeroVideoPlaybackHandlers(video);
  attachHeroVideoSource(video);
}

bootstrapHeroVideoEarly();

const uiDictionary = await loadUiDictionary(locale);
const privacyContent = await loadPrivacyContent(locale);

const introOverlay = document.getElementById('intro-overlay');
const introSection = document.getElementById('intro-section');
const progressBar = document.getElementById('intro-progress-bar');
const header = document.getElementById('main-header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const formatter = new Intl.NumberFormat(getIntlLocale(locale));
const percentFormatter = new Intl.NumberFormat(getIntlLocale(locale), {
  style: 'percent',
  maximumFractionDigits: 0,
});

const INTRO_SEEN_KEY = 'dotgen_intro_seen_v1';

let introComplete = false;
let introProgress = 0;
let currentSlide = 0;
let slideInterval;
let footerVideoInitialized = false;
let footerObserver = null;
let footerLoopVideoInitialized = false;
let footerLoopObserver = null;
const pausedByVisibility = new Set();

applySubcategoryLinks(document, (slug) => serviceUrlForLocale(slug, locale));
localizeInternalLinks(locale);
applyStaticTranslations(uiDictionary);
applyPrivacyUi(locale, privacyContent);
applySeoLinks(locale);
mountLanguageSwitcher(
  document.getElementById('language-switcher-slot'),
  locale,
  'home',
  uiDictionary,
);
initAnalyticsTracking(() => locale);
initDoctorClickHandling({ pageType: 'home', locale });

function deferNonCriticalHomeInit(callback) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2500 });
    return;
  }
  window.setTimeout(callback, 1);
}

let introAnimationElements = null;

function getIntroAnimationElements() {
  if (!introOverlay) return null;
  if (!introAnimationElements) {
    introAnimationElements = {
      logoWrapper: introOverlay.querySelector('.intro-logo-wrapper'),
      logo: introOverlay.querySelector('.intro-logo'),
      scrollIndicator: introOverlay.querySelector('.intro-scroll-indicator'),
      tagline: introOverlay.querySelector('.intro-tagline'),
    };
  }
  return introAnimationElements;
}

function createParticles() {
  if (prefersReducedMotion) return;

  const container = document.getElementById('intro-particles');
  if (!container) return;

  const particleCount = introMobileQuery.matches ? 4 : 14;
  if (particleCount === 0) return;

  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement('div');
    const size = 1 + Math.random() * 3;
    particle.classList.add('particle');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 4}s`;
    particle.style.animationDuration = `${3 + Math.random() * 3}s`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    container.appendChild(particle);
  }
}

function updateIntroAnimation(progress) {
  if (!introOverlay) return;

  if (progressBar) progressBar.style.width = `${progress * 100}%`;

  const progressEl = introOverlay.querySelector('.intro-progress[role="progressbar"]');
  if (progressEl) {
    progressEl.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }

  const elements = getIntroAnimationElements();
  if (!elements) return;

  const { logoWrapper, logo, scrollIndicator, tagline } = elements;
  if (logoWrapper) {
    const scale = 1 + progress * 0.3;
    const glow = 20 + progress * 60;
    logoWrapper.style.transform = `scale(${scale})`;
    if (logo) logo.style.filter = `drop-shadow(0 0 ${glow}px rgba(201, 168, 76, ${0.3 + progress * 0.5}))`;
  }

  if (scrollIndicator) scrollIndicator.style.opacity = Math.max(0, 1 - progress * 3);

  if (tagline) tagline.style.opacity = Math.max(0, 0.8 - progress * 2);

  if (progress > 0.4) {
    const revealProgress = (progress - 0.4) / 0.6;
    const maxRadius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
    const radius = revealProgress * maxRadius;

    introOverlay.style.clipPath = `circle(${Math.max(0, maxRadius - radius)}px at 50% 50%)`;
    introOverlay.style.opacity = Math.max(0, 1 - revealProgress * 1.2);

    if (header && !header.classList.contains('visible')) {
      header.style.opacity = revealProgress;
      header.style.transform = `translateY(${-20 + revealProgress * 20}px)`;
    }
  }
}

function completeIntro() {
  if (introComplete) return;
  introComplete = true;

  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // sessionStorage may be unavailable
  }

  introOverlay?.classList.add('completed');
  document.body.style.overflow = '';
  if (introSection) introSection.style.display = 'none';

  const progressEl = document.querySelector('.intro-progress');
  if (progressEl) progressEl.style.display = 'none';

  if (header) {
    header.style.opacity = '1';
    header.style.transform = 'translateY(0)';
    header.classList.add('visible');
  }

  syncHeroVideoPlayback();
  startSlider();
  scheduleHeroVideoSourceLoad();
}

function handleVirtualScroll(event) {
  if (introComplete) return;
  event.preventDefault();

  introProgress += event.deltaY / 800;
  introProgress = Math.max(0, Math.min(1, introProgress));
  updateIntroAnimation(introProgress);

  if (introProgress >= 1) completeIntro();
}

function initIntro() {
  if (!introOverlay || !introSection || !header) return;

  if (prefersReducedMotion) {
    completeIntro();
    return;
  }

  try {
    if (sessionStorage.getItem(INTRO_SEEN_KEY) === '1') {
      completeIntro();
      return;
    }
  } catch {
    // continue with intro animation
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden';

  header.style.opacity = '0';
  header.style.transform = 'translateY(-20px)';
  header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

  createParticles();
  window.addEventListener('wheel', handleVirtualScroll, { passive: false });

  let touchStartY = 0;
  window.addEventListener('touchstart', (event) => {
    if (introComplete) return;
    touchStartY = event.touches[0].clientY;
  }, { passive: false });

  window.addEventListener('touchmove', (event) => {
    if (introComplete) return;
    event.preventDefault();
    const touchY = event.touches[0].clientY;
    const delta = touchStartY - touchY;
    touchStartY = touchY;
    introProgress = Math.max(0, Math.min(1, introProgress + delta / (introMobileQuery.matches ? 260 : 400)));
    updateIntroAnimation(introProgress);
    if (introProgress >= 1) completeIntro();
  }, { passive: false });

}

function finalizeHomeHeader() {
  initSiteHeader(document);
  if (locale === 'ru') {
    applyRuCompactHeaderNavDom(document, uiDictionary);
  }
}

function initHeader() {
  const navMenu = document.getElementById('nav-menu');
  if (navMenu && locale !== 'tr') {
    loadEyeHealthContent(locale).then(async (content) => {
      upgradeLocalizedEyeHealthNav(navMenu, locale, content);
      const { upgradeLocalizedArgeNav } = await import('./tr-arge-nav.js');
      upgradeLocalizedArgeNav(navMenu, locale);
      finalizeHomeHeader();
    });
    return;
  }
  finalizeHomeHeader();
}

function scheduleHeroVideoSourceLoad() {
  const video = document.querySelector('.hero-bg-video');
  if (!video || heroVideoSourceAttached || prefersReducedMotion) return;
  attachHeroVideoSource(video);
}

function getHeroVideoLoopThreshold(video) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return Math.max(0.05, duration - 0.05);
}

function restartHeroVideoLoop(video) {
  if (!video || prefersReducedMotion) return;
  const slide = video.closest('.hero-slide');
  if (!slide?.classList.contains('active')) {
    video.pause();
    return;
  }
  try {
    video.currentTime = 0;
  } catch {
    /* seek may fail while metadata is loading */
  }
  safePlayVideo(video);
}

function setupHeroVideoLoop() {
  document.querySelectorAll('.hero-bg-video').forEach((video) => {
    if (video.dataset.heroLoopBound === 'true') return;
    video.dataset.heroLoopBound = 'true';

    video.addEventListener('timeupdate', () => {
      const threshold = getHeroVideoLoopThreshold(video);
      if (threshold === null) return;
      if (video.currentTime >= threshold) {
        try {
          video.currentTime = 0;
        } catch {
          /* ignore seek errors during loop wrap */
        }
      }
    });

    video.addEventListener('ended', () => {
      restartHeroVideoLoop(video);
    });
  });
}

const HERO_FALLBACK_POSTER_DESKTOP = heroPosterSources(false).webp;
const HERO_FALLBACK_POSTER_MOBILE = heroPosterSources(true).webp;
const heroMobileQuery = window.matchMedia('(max-width: 768px)');
const introMobileQuery = window.matchMedia('(max-width: 768px)');

function getHeroFallbackPosterUrl() {
  return heroMobileQuery.matches
    ? HERO_FALLBACK_POSTER_MOBILE
    : HERO_FALLBACK_POSTER_DESKTOP;
}

function syncHeroVideoPoster(video) {
  if (!video) return;
  video.setAttribute('poster', getHeroFallbackPosterUrl());
}

function applyHeroVideoFallback(video) {
  const slide = video?.closest('.hero-slide-video');
  if (!slide) return;
  const poster = getHeroFallbackPosterUrl();
  slide.classList.add('video-fallback-active');
  slide.style.backgroundImage = `url('${poster}')`;
  video.pause();
  syncHeroPlayButton();
}

function clearHeroVideoFallback(video) {
  const slide = video?.closest('.hero-slide-video');
  if (!slide) return;
  slide.classList.remove('video-fallback-active');
  slide.style.backgroundImage = '';
  syncHeroPlayButton();
}

function getHeroPlayButton() {
  return document.querySelector('.hero-slide-video .hero-video-play');
}

function syncHeroPlayButton() {
  const video = document.querySelector('.hero-bg-video');
  const playButton = getHeroPlayButton();
  const slide = video?.closest('.hero-slide');
  if (!video || !playButton || !slide) return;

  const activelyPlaying = isVideoActivelyPlaying(video);
  const fallbackActive = slide.classList.contains('video-fallback-active');
  const shouldShow = slide.classList.contains('active')
    && !activelyPlaying
    && (prefersReducedMotion || fallbackActive || video.paused || video.ended || Boolean(video.error));

  playButton.hidden = !shouldShow;
}

let heroPlayGesturePending = false;
let lastHeroPlayGestureAt = 0;

async function playHeroVideoFromGesture() {
  const video = document.querySelector('.hero-bg-video');
  if (!video) return;

  const now = Date.now();
  if (heroPlayGesturePending || now - lastHeroPlayGestureAt < 400) return;
  lastHeroPlayGestureAt = now;
  heroPlayGesturePending = true;

  video.muted = true;

  try {
    await video.play();
    if (!isVideoActivelyPlaying(video)) {
      syncHeroPlayButton();
    }
  } catch {
    applyHeroVideoFallback(video);
    syncHeroPlayButton();
  } finally {
    heroPlayGesturePending = false;
  }
}

function initHeroPlayButton() {
  const playButton = getHeroPlayButton();
  const video = document.querySelector('.hero-bg-video');
  if (!playButton || !video) return;

  let touchPlayHandled = false;

  const onPlayGesture = (event) => {
    event.preventDefault();
    event.stopPropagation();
    playHeroVideoFromGesture();
  };

  playButton.addEventListener('touchend', (event) => {
    touchPlayHandled = true;
    onPlayGesture(event);
  }, { passive: false });

  playButton.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch') return;
    onPlayGesture(event);
  });

  playButton.addEventListener('click', (event) => {
    if (touchPlayHandled) {
      touchPlayHandled = false;
      return;
    }
    onPlayGesture(event);
  });

  playButton.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    onPlayGesture(event);
  });

  setupHeroVideoPlaybackHandlers(video);
}

function applyFooterVideoFallback(video) {
  const brand = video?.closest('.footer-brand');
  video?.pause();
  video?.classList.add('video-fallback-hidden');
  brand?.classList.add('video-fallback-active');
}

function clearFooterVideoFallback(video) {
  const brand = video?.closest('.footer-brand');
  video?.classList.remove('video-fallback-hidden');
  brand?.classList.remove('video-fallback-active');
}

function isFooterVideo(video) {
  return video?.classList.contains('footer-brand-video') || video?.classList.contains('footer-loop-video');
}

function syncVideoFallbacks() {
  document.querySelectorAll('.hero-bg-video').forEach((video) => {
    if (prefersReducedMotion) applyHeroVideoFallback(video);
    else clearHeroVideoFallback(video);
  });

  document.querySelectorAll('.footer-brand-video, .footer-loop-video').forEach((video) => {
    if (prefersReducedMotion) applyFooterVideoFallback(video);
    else clearFooterVideoFallback(video);
  });
}

function safePlayVideo(video) {
  video.muted = true;
  const playPromise = video.play();
  if (!playPromise || typeof playPromise.then !== 'function') return;

  playPromise.then(() => {
    if (video.classList.contains('hero-bg-video')) {
      if (!isVideoActivelyPlaying(video)) {
        applyHeroVideoFallback(video);
      }
      syncHeroPlayButton();
    }
  }).catch(() => {
    const retryPlay = () => {
      if (prefersReducedMotion || document.hidden) {
        if (video.classList.contains('hero-bg-video')) applyHeroVideoFallback(video);
        else if (isFooterVideo(video)) applyFooterVideoFallback(video);
        return;
      }
      video.muted = true;
      video.play().then(() => {
        if (video.classList.contains('hero-bg-video')) {
          if (!isVideoActivelyPlaying(video)) {
            applyHeroVideoFallback(video);
          }
          syncHeroPlayButton();
        }
      }).catch(() => {
        if (video.classList.contains('hero-bg-video')) {
          applyHeroVideoFallback(video);
          syncHeroPlayButton();
        } else if (isFooterVideo(video)) applyFooterVideoFallback(video);
      });
    };
    video.addEventListener('canplay', retryPlay, { once: true });
  });
}

function isVideoActivelyPlaying(video) {
  return !video.paused && !video.ended && !video.error && video.readyState > 2;
}

function syncHeroVideoPlayback() {
  document.querySelectorAll('.hero-bg-video').forEach((video) => {
    const slide = video.closest('.hero-slide');
    if (prefersReducedMotion) {
      applyHeroVideoFallback(video);
      return;
    }
    if (slide?.classList.contains('active')) {
      safePlayVideo(video);
    } else {
      video.pause();
    }
  });
  syncHeroPlayButton();
}

function initFooterVideoLazyLoad() {
  const setupLazyFooterVideo = (video, sourceUrl, isInitialized, markInitialized, getObserver, setObserver) => {
    if (!video || isInitialized()) return;

    if (prefersReducedMotion) {
      applyFooterVideoFallback(video);
      return;
    }

    const loadFooterVideo = () => {
      if (isInitialized() || prefersReducedMotion) return;
      markInitialized();
      getObserver()?.disconnect();
      setObserver(null);

      const source = document.createElement('source');
      source.src = sourceUrl;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.load();

      const tryPlay = () => {
        if (prefersReducedMotion || document.hidden) return;
        safePlayVideo(video);
      };

      if (video.readyState >= 2) {
        tryPlay();
      } else {
        video.addEventListener('loadeddata', tryPlay, { once: true });
      }
    };

    getObserver()?.disconnect();

    if (!('IntersectionObserver' in window)) {
      loadFooterVideo();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadFooterVideo();
      }
    }, { root: null, rootMargin: '400px 0px', threshold: 0 });

    setObserver(observer);
    observer.observe(video);
  };

  setupLazyFooterVideo(
    document.querySelector('.footer-brand-video'),
    footerVideoUrl,
    () => footerVideoInitialized,
    () => { footerVideoInitialized = true; },
    () => footerObserver,
    (observer) => { footerObserver = observer; },
  );

  setupLazyFooterVideo(
    document.querySelector('.footer-loop-video'),
    footerLoopVideoUrl,
    () => footerLoopVideoInitialized,
    () => { footerLoopVideoInitialized = true; },
    () => footerLoopObserver,
    (observer) => { footerLoopObserver = observer; },
  );
}

function tryResumeVideoAfterVisibility(video) {
  if (!pausedByVisibility.has(video)) return;

  if (prefersReducedMotion) {
    pausedByVisibility.delete(video);
    return;
  }

  if (video.classList.contains('hero-bg-video')) {
    const slide = video.closest('.hero-slide');
    if (!slide?.classList.contains('active')) {
      pausedByVisibility.delete(video);
      return;
    }
  }

  if (video.classList.contains('footer-brand-video') && (!footerVideoInitialized || !video.querySelector('source'))) {
    pausedByVisibility.delete(video);
    return;
  }

  if (video.classList.contains('footer-loop-video') && (!footerLoopVideoInitialized || !video.querySelector('source'))) {
    pausedByVisibility.delete(video);
    return;
  }

  const attemptPlay = () => {
    safePlayVideo(video);
    pausedByVisibility.delete(video);
  };

  if (video.readyState >= 2) {
    attemptPlay();
  } else {
    video.addEventListener('canplay', attemptPlay, { once: true });
  }
}

function initHeroPosterWatch() {
  const refreshHeroPoster = () => {
    const video = document.querySelector('.hero-bg-video');
    if (!video) return;
    syncHeroVideoPoster(video);
    const slide = video.closest('.hero-slide-video');
    if (slide?.classList.contains('video-fallback-active')) {
      applyHeroVideoFallback(video);
    }
  };

  let resizeTimer = null;
  heroMobileQuery.addEventListener('change', refreshHeroPoster);
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(refreshHeroPoster, 150);
  }, { passive: true });
}

function initReducedMotionWatch() {
  prefersReducedMotionQuery.addEventListener('change', (event) => {
    prefersReducedMotion = event.matches;
    if (prefersReducedMotion) {
      footerObserver?.disconnect();
      footerObserver = null;
      footerLoopObserver?.disconnect();
      footerLoopObserver = null;
      document.querySelectorAll('.hero-bg-video, .footer-brand-video, .footer-loop-video').forEach((video) => {
        video.pause();
      });
      syncVideoFallbacks();
      return;
    }
    syncVideoFallbacks();
    syncHeroVideoPlayback();
    if (!footerVideoInitialized || !footerLoopVideoInitialized) {
      initFooterVideoLazyLoad();
    }
  });
}

function syncHeroHeadingAccessibility() {
  document.querySelectorAll('.hero-slide').forEach((slide) => {
    const isActive = slide.classList.contains('active');
    slide.querySelectorAll('h1, h2').forEach((heading) => {
      heading.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  });
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.indicator');
  if (!slides.length || !indicators.length) return;

  slides[currentSlide].classList.remove('active');
  indicators[currentSlide].classList.remove('active');

  currentSlide = index;
  if (currentSlide >= slides.length) currentSlide = 0;
  if (currentSlide < 0) currentSlide = slides.length - 1;

  slides[currentSlide].classList.add('active');
  indicators[currentSlide].classList.add('active');
  syncHeroVideoPlayback();
  syncHeroHeadingAccessibility();
}

function nextSlide() {
  if (document.querySelector('.hero-slide.hero-slide-video .hero-bg-video')) return;
  goToSlide(currentSlide + 1);
}

function startSlider() {
  if (document.querySelector('.hero-slide.hero-slide-video .hero-bg-video')) return;
  window.clearInterval(slideInterval);
  slideInterval = window.setInterval(nextSlide, 5000);
}

function initHero() {
  const hasHeroVideoMode = Boolean(document.querySelector('.hero-slide.hero-slide-video .hero-bg-video'));
  const heroIndicatorsWrap = document.querySelector('.hero-indicators');

  document.querySelectorAll('.indicator').forEach((indicator) => {
    indicator.addEventListener('click', () => {
      if (hasHeroVideoMode) return;
      goToSlide(Number(indicator.dataset.slide));
      startSlider();
    });
  });

  if (hasHeroVideoMode && heroIndicatorsWrap) {
    heroIndicatorsWrap.style.display = 'none';
    heroIndicatorsWrap.setAttribute('aria-hidden', 'true');
  }
  setupHeroVideoLoop();

  const heroVideo = document.querySelector('.hero-bg-video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.playsInline = true;
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');

    if (!heroVideoSourceAttached) {
      scheduleHeroVideoSourceLoad();
    }

    syncHeroVideoPoster(heroVideo);
    const onHeroMediaReady = () => {
      syncHeroVideoPoster(heroVideo);
      if (prefersReducedMotion) applyHeroVideoFallback(heroVideo);
      syncHeroPlayButton();
    };
    heroVideo.addEventListener('loadeddata', onHeroMediaReady, { once: true });
    if (heroVideo.readyState >= 2) onHeroMediaReady();
  }

  initHeroPosterWatch();
  initHeroPlayButton();
  if (introComplete) {
    syncHeroVideoPlayback();
  }
  syncHeroHeadingAccessibility();
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (prefersReducedMotion) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

  elements.forEach((element) => observer.observe(element));
}

function animateCounter(element, target) {
  if (prefersReducedMotion) {
    element.textContent = element.dataset.format === 'percent'
      ? percentFormatter.format(target / 100)
      : `${formatter.format(target)}+`;
    return;
  }

  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(target * eased);
    element.textContent = formatter.format(current);

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    element.textContent = element.dataset.format === 'percent'
      ? percentFormatter.format(target / 100)
      : `${formatter.format(target)}+`;
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target, Number(entry.target.dataset.count || 0));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach((counter) => observer.observe(counter));
}

function initAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  applyAppointmentReferrerToForm(form);

  const getReferralContext = () => {
    const referrer = readAppointmentReferrer();
    return {
      referral_service_slug: referrer?.slug || undefined,
      referral_service_category: referrer?.category || undefined,
      referral_source: referrer?.source || undefined,
    };
  };

  const FORM_RATE_LIMIT_KEY = 'dotgen_form_last_submit';
  const FORM_RATE_LIMIT_MS = 60_000;
  const SERVICE_LABELS = {
    hair: 'Saç Ekimi',
    dental: 'Diş Estetiği',
    plastic: 'Estetik Cerrahi',
    medical: 'Medikal Estetik',
    longevity: 'Longevity',
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  const btnLabel = submitBtn?.querySelector('.btn-label');
  const statusEl = document.getElementById('form-status');
  const originalLabel = btnLabel?.textContent?.trim() || submitBtn?.getAttribute('aria-label') || '';

  const sanitizeField = (value, maxLength) => String(value ?? '').trim().slice(0, maxLength);

  const setFormStatus = (message) => {
    if (statusEl) statusEl.textContent = message;
  };

  const setButtonVisual = (text, stateClass) => {
    if (btnLabel) btnLabel.textContent = text;
    submitBtn.classList.remove('is-loading', 'is-success', 'is-error');
    if (stateClass) submitBtn.classList.add(stateClass);
  };

  let isSubmitting = false;

  const resetFormFeedback = () => {
    isSubmitting = false;
    setFormStatus('');
    setButtonVisual(originalLabel, null);
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.background = '';
  };

  const showTransientSuccess = () => {
    setButtonVisual(translate(uiDictionary, 'Gönderildi'), 'is-success');
    setFormStatus(translate(uiDictionary, 'Gönderildi'));
    submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    window.setTimeout(() => {
      resetFormFeedback();
      form.reset();
    }, 3000);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      pushEvent('form_submit', {
        page_locale: locale,
        form_id: 'appointment-form',
        service_category: sanitizeField(document.getElementById('form-service')?.value, 32) || 'not_applicable',
        status: 'validation_error',
        ...getReferralContext(),
      });
      return;
    }

    const honeypot = sanitizeField(document.getElementById('form-website')?.value, 200);
    if (honeypot) {
      showTransientSuccess();
      return;
    }

    const lastSubmit = Number(localStorage.getItem(FORM_RATE_LIMIT_KEY) || 0);
    if (Date.now() - lastSubmit < FORM_RATE_LIMIT_MS) {
      pushEvent('form_submit', {
        page_locale: locale,
        form_id: 'appointment-form',
        service_category: sanitizeField(document.getElementById('form-service')?.value, 32) || 'not_applicable',
        status: 'rate_limited',
        ...getReferralContext(),
      });
      setFormStatus(translate(uiDictionary, 'Hata Oluştu'));
      setButtonVisual(translate(uiDictionary, 'Hata Oluştu'), 'is-error');
      window.setTimeout(resetFormFeedback, 3000);
      return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    setButtonVisual(translate(uiDictionary, 'Gönderiliyor...'), 'is-loading');
    setFormStatus(translate(uiDictionary, 'Gönderiliyor...'));

    const name = sanitizeField(document.getElementById('form-name')?.value, 120);
    const phone = sanitizeField(document.getElementById('form-phone')?.value, 32);
    const email = sanitizeField(document.getElementById('form-email')?.value, 254);
    const serviceCode = sanitizeField(document.getElementById('form-service')?.value, 32);
    const message = sanitizeField(document.getElementById('form-message')?.value, 2000);
    const serviceLabel = SERVICE_LABELS[serviceCode] || '';

    if (!name || !phone) {
      form.reportValidity();
      pushEvent('form_submit', {
        page_locale: locale,
        form_id: 'appointment-form',
        service_category: serviceCode || 'not_applicable',
        status: 'validation_error',
        ...getReferralContext(),
      });
      resetFormFeedback();
      return;
    }

    fetch('https://formsubmit.co/ajax/drotgenclinic@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        'Ad Soyad': name,
        'Telefon': phone,
        'E-posta': email,
        'Hizmet': serviceLabel,
        'Mesaj': message
      })
    })
    .then((response) => {
      if (!response.ok) throw new Error('Submission failed');
      return response.json();
    })
    .then(() => {
      try {
        localStorage.setItem(FORM_RATE_LIMIT_KEY, String(Date.now()));
      } catch {
        // Storage can be unavailable in privacy modes.
      }
      pushEvent('form_submit', {
        page_locale: locale,
        form_id: 'appointment-form',
        service_category: serviceCode || 'not_applicable',
        status: 'success',
        ...getReferralContext(),
      });
      clearAppointmentReferrer();
      showTransientSuccess();
    })
    .catch((error) => {
      console.error(error);
      pushEvent('form_submit', {
        page_locale: locale,
        form_id: 'appointment-form',
        service_category: serviceCode || 'not_applicable',
        status: 'error',
        ...getReferralContext(),
      });
      setButtonVisual(translate(uiDictionary, 'Hata Oluştu'), 'is-error');
      setFormStatus(translate(uiDictionary, 'Hata Oluştu'));
      submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

      window.setTimeout(() => {
        resetFormFeedback();
      }, 3000);
    });
  });
}

function initSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  const target = document.getElementById('main-content');
  if (!skipLink || !target) return;

  skipLink.addEventListener('click', () => {
    window.requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function handleClick(event) {
      const targetId = this.getAttribute('href');
      if (!targetId || !targetId.startsWith('#') || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      event.preventDefault();
      const headerHeight = header?.offsetHeight || 0;
      window.scrollTo({
        top: targetEl.offsetTop - headerHeight,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });
}

function handleWindowScroll() {
  if (!introComplete) {
    if (window.scrollY > 50) completeIntro();
    return;
  }

  if (handleWindowScroll.rafPending) return;
  handleWindowScroll.rafPending = true;

  requestAnimationFrame(() => {
    handleWindowScroll.rafPending = false;

    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 100);
    }

    if (prefersReducedMotion) return;

    const heroSection = document.getElementById('hero');
    const scrollY = window.scrollY;
    if (!heroSection || scrollY >= window.innerHeight) return;

    const activeSlide = heroSection.querySelector('.hero-slide.active');
    if (activeSlide) activeSlide.style.transform = `scale(${1 + scrollY * 0.0003})`;

    const scrollHint = heroSection.querySelector('.hero-scroll-hint');
    if (scrollHint) scrollHint.style.opacity = Math.max(0, 0.6 - scrollY * 0.003);
  });
}
handleWindowScroll.rafPending = false;

function initVisibilityPause() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearInterval(slideInterval);
      document.querySelectorAll('.hero-bg-video, .footer-brand-video, .footer-loop-video').forEach((video) => {
        if (isVideoActivelyPlaying(video)) {
          video.pause();
          pausedByVisibility.add(video);
        }
      });
      return;
    }

    [...pausedByVisibility].forEach((video) => tryResumeVideoAfterVisibility(video));

    if (introComplete) startSlider();
  });
}

function initWhatsAppLinks() {
  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.href = buildWhatsAppUrl({ locale, category: 'default' });
  });
}

initIntro();
initHeader();
initHero();
initScrollAnimations();
initCounters();
initAppointmentForm();
initSkipLink();
initSmoothScroll();
initVisibilityPause();
initReducedMotionWatch();
initFooterVideoLazyLoad();
initWhatsAppLinks();
initPartnersMarquee();
deferNonCriticalHomeInit(() => {
  initCustomCursor();
});
window.addEventListener('scroll', handleWindowScroll, { passive: true });
