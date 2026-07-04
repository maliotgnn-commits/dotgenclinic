export function initMegaMenuA11y(root = document) {
  const items = [...root.querySelectorAll('.has-dropdown[data-eye-health-nav], .has-dropdown[data-tr-only-nav]')];
  if (!items.length) return;

  const closeAll = (except = null) => {
    items.forEach((item) => {
      if (item === except) return;
      item.classList.remove('open');
      const trigger = item.querySelector(':scope > a');
      trigger?.setAttribute('aria-expanded', 'false');
    });
  };

  items.forEach((item) => {
    const trigger = item.querySelector(':scope > a');
    if (!trigger) return;

    trigger.addEventListener('click', (event) => {
      if (window.innerWidth <= 1360) return;
      const href = trigger.getAttribute('href') || '';
      const isEyeHealthPage = href.includes('goz-hastaliklari');
      if (isEyeHealthPage && trigger.getAttribute('aria-haspopup') === 'true') {
        if (window.location.pathname.includes('goz-hastaliklari')) {
          event.preventDefault();
          const willOpen = !item.classList.contains('open');
          closeAll(willOpen ? item : null);
          item.classList.toggle('open', willOpen);
          trigger.setAttribute('aria-expanded', String(willOpen));
        }
        return;
      }
      if (window.innerWidth > 1360 && trigger.getAttribute('aria-haspopup') === 'true') {
        event.preventDefault();
        const willOpen = !item.classList.contains('open');
        closeAll(willOpen ? item : null);
        item.classList.toggle('open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
      }
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
      if (event.key === 'Enter' || event.key === ' ') {
        if (window.innerWidth <= 1360) return;
        if (trigger.getAttribute('aria-haspopup') !== 'true') return;
        event.preventDefault();
        const willOpen = !item.classList.contains('open');
        closeAll(willOpen ? item : null);
        item.classList.toggle('open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (window.innerWidth <= 1360) return;
    closeAll();
  });

  document.addEventListener('click', (event) => {
    if (window.innerWidth <= 1360) return;
    if (event.target.closest('.has-dropdown[data-eye-health-nav], .has-dropdown[data-tr-only-nav]')) return;
    closeAll();
  });
}
