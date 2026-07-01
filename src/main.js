import './style.css';
import { applySubcategoryLinks } from './subpages-data.js';
import { initCustomCursor } from './cursor.js';
import {
  applySeoLinks,
  applyStaticTranslations,
  getCurrentLocale,
  getIntlLocale,
  loadUiDictionary,
  localizeInternalLinks,
  serviceUrlForLocale,
  translate,
} from './i18n.js';
import { mountLanguageSwitcher } from './language-switcher.js';

const locale = getCurrentLocale('home');
const uiDictionary = await loadUiDictionary(locale);

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

let introComplete = false;
let introProgress = 0;
let currentSlide = 0;
let slideInterval;

applySubcategoryLinks(document, (slug) => serviceUrlForLocale(slug, locale));
localizeInternalLinks(locale);
applyStaticTranslations(uiDictionary);
applySeoLinks(locale);
mountLanguageSwitcher(
  document.getElementById('language-switcher-slot'),
  locale,
  'home',
  uiDictionary,
);
initCustomCursor();

function createParticles() {
  const container = document.getElementById('intro-particles');
  if (!container) return;

  for (let i = 0; i < 40; i += 1) {
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

  const logoWrapper = introOverlay.querySelector('.intro-logo-wrapper');
  if (logoWrapper) {
    const scale = 1 + progress * 0.3;
    const glow = 20 + progress * 60;
    logoWrapper.style.transform = `scale(${scale})`;
    logoWrapper.querySelector('.intro-logo').style.filter = `drop-shadow(0 0 ${glow}px rgba(201, 168, 76, ${0.3 + progress * 0.5}))`;
  }

  const scrollIndicator = introOverlay.querySelector('.intro-scroll-indicator');
  if (scrollIndicator) scrollIndicator.style.opacity = Math.max(0, 1 - progress * 3);

  const tagline = introOverlay.querySelector('.intro-tagline');
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

  startSlider();
}

function handleVirtualScroll(event) {
  if (introComplete) return;
  event.preventDefault();

  introProgress += event.deltaY / 1000;
  introProgress = Math.max(0, Math.min(1, introProgress));
  updateIntroAnimation(introProgress);

  if (introProgress >= 1) completeIntro();
}

function initIntro() {
  if (!introOverlay || !introSection || !header) return;

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
    introProgress = Math.max(0, Math.min(1, introProgress + delta / 500));
    updateIntroAnimation(introProgress);
    if (introProgress >= 1) completeIntro();
  }, { passive: false });

  window.addEventListener('scroll', () => {
    if (!introComplete && window.scrollY > 50) completeIntro();
  });
}

function initHeader() {
  if (!header || !hamburger || !navMenu) return;

  const setMobileNavOpen = (isOpen) => {
    hamburger.classList.toggle('active', isOpen);
    navMenu.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
    setMobileNavOpen(!navMenu.classList.contains('active'));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1360 && link.parentElement?.classList.contains('has-dropdown')) {
        return;
      }
      setMobileNavOpen(false);
    });
  });

  document.addEventListener('click', (event) => {
    if (window.innerWidth > 1360) return;
    if (!navMenu.classList.contains('active')) return;
    if (event.target.closest('#main-header')) return;
    setMobileNavOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (window.innerWidth > 1360) return;
    if (!navMenu.classList.contains('active')) return;
    setMobileNavOpen(false);
    hamburger.focus();
  });

  document.querySelectorAll('.has-dropdown > a').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (window.innerWidth > 1360) return;
      event.preventDefault();
      trigger.parentElement.classList.toggle('open');
    });
  });

  window.addEventListener('scroll', () => {
    if (!introComplete) return;
    header.classList.toggle('scrolled', window.scrollY > 100);
  });
}

function setupHeroVideoLoop() {
  document.querySelectorAll('.hero-bg-video').forEach((video) => {
    const loopEnd = Math.max(1, Number(video.dataset.loopEnd) || 30);
    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= loopEnd) video.currentTime = 0;
    });
  });
}

function syncHeroVideoPlayback() {
  document.querySelectorAll('.hero-bg-video').forEach((video) => {
    const slide = video.closest('.hero-slide');
    if (slide?.classList.contains('active')) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

function syncHeroHeadingAccessibility() {
  document.querySelectorAll('.hero-slide').forEach((slide) => {
    const isActive = slide.classList.contains('active');
    slide.querySelectorAll('h1').forEach((heading) => {
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

  if (hasHeroVideoMode && heroIndicatorsWrap) heroIndicatorsWrap.style.display = 'none';
  setupHeroVideoLoop();
  syncHeroVideoPlayback();
  syncHeroHeadingAccessibility();
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach((element) => observer.observe(element));
}

function animateCounter(element, target) {
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

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = translate(uiDictionary, 'Gönderiliyor...');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    const name = document.getElementById('form-name')?.value || '';
    const phone = document.getElementById('form-phone')?.value || '';
    const email = document.getElementById('form-email')?.value || '';
    const service = document.getElementById('form-service')?.value || '';
    const message = document.getElementById('form-message')?.value || '';

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
        'Hizmet': service,
        'Mesaj': message
      })
    })
    .then((response) => {
      if (!response.ok) throw new Error('Submission failed');
      return response.json();
    })
    .then(() => {
      submitBtn.textContent = translate(uiDictionary, 'Gönderildi');
      submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

      window.setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.background = '';
        form.reset();
      }, 3000);
    })
    .catch((error) => {
      console.error(error);
      submitBtn.textContent = translate(uiDictionary, 'Hata Oluştu');
      submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

      window.setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.background = '';
      }, 3000);
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
      window.scrollTo({ top: targetEl.offsetTop - headerHeight, behavior: 'smooth' });
    });
  });
}

function initHeroParallax() {
  window.addEventListener('scroll', () => {
    if (!introComplete) return;

    const heroSection = document.getElementById('hero');
    const scrollY = window.scrollY;
    if (!heroSection || scrollY >= window.innerHeight) return;

    const activeSlide = heroSection.querySelector('.hero-slide.active');
    if (activeSlide) activeSlide.style.transform = `scale(${1 + scrollY * 0.0003})`;

    const scrollHint = heroSection.querySelector('.hero-scroll-hint');
    if (scrollHint) scrollHint.style.opacity = Math.max(0, 0.6 - scrollY * 0.003);
  });
}

initIntro();
initHeader();
initHero();
initScrollAnimations();
initCounters();
initAppointmentForm();
initSmoothScroll();
initHeroParallax();
