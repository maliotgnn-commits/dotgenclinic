import {
  LOCALES,
  currentPageUrlForLocale,
  localeConfig,
  storeLocale,
  translate,
} from './i18n.js';
import { pushEvent } from './analytics.js';

function chevronIcon() {
  return `
    <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.5" />
    </svg>
  `;
}

function globeIcon() {
  return `
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path d="M3 12h18M12 3c2.4 2.5 3.7 5.5 3.7 9S14.4 18.5 12 21M12 3C9.6 5.5 8.3 8.5 8.3 12S9.6 18.5 12 21" fill="none" stroke="currentColor" stroke-width="1.4" />
    </svg>
  `;
}

export function renderLanguageSwitcher(locale, pageType, dictionary) {
  const current = localeConfig(locale);
  const label = translate(dictionary, 'Dil seçin');
  const options = LOCALES.map((option) => `
    <a
      href="${currentPageUrlForLocale(option.code, pageType)}"
      class="language-option${option.code === locale ? ' active' : ''}"
      lang="${option.code}"
      dir="${option.dir}"
      hreflang="${option.code}"
      role="menuitem"
      data-locale="${option.code}"
      ${option.code === locale ? 'aria-current="true"' : ''}
    >
      <span>${option.name}</span>
      <small>${option.code.toUpperCase()}</small>
    </a>
  `).join('');

  return `
    <div class="language-switcher" data-language-switcher>
      <button
        type="button"
        class="language-trigger"
        aria-label="${label}"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        ${globeIcon()}
        <span>${current.code.toUpperCase()}</span>
        ${chevronIcon()}
      </button>
      <div class="language-menu" role="menu" aria-label="${label}">
        ${options}
      </div>
    </div>
  `;
}

export function mountLanguageSwitcher(slot, locale, pageType, dictionary) {
  if (!slot) return;
  slot.innerHTML = renderLanguageSwitcher(locale, pageType, dictionary);
  initLanguageSwitchers(slot);
}

export function initLanguageSwitchers(root = document) {
  const switchers = [...root.querySelectorAll('[data-language-switcher]')];
  if (!switchers.length) return;

  const closeAll = (except = null) => {
    switchers.forEach((switcher) => {
      if (switcher === except) return;
      switcher.classList.remove('open');
      switcher.querySelector('.language-trigger')?.setAttribute('aria-expanded', 'false');
    });
  };

  switchers.forEach((switcher) => {
    const trigger = switcher.querySelector('.language-trigger');
    trigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !switcher.classList.contains('open');
      closeAll(switcher);
      switcher.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) switcher.querySelector('.language-option')?.focus();
    });

    switcher.querySelectorAll('.language-option').forEach((option) => {
      option.addEventListener('click', () => {
        const fromLocale = switcher.querySelector('.language-option.active')?.dataset.locale;
        const toLocale = option.dataset.locale;
        if (fromLocale && toLocale && fromLocale !== toLocale) {
          pushEvent('language_switch', {
            from_locale: fromLocale,
            to_locale: toLocale,
          });
        }
        storeLocale(toLocale);
      });
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-language-switcher]')) closeAll();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeAll();
    switchers.forEach((switcher) => switcher.querySelector('.language-trigger')?.focus());
  });
}
