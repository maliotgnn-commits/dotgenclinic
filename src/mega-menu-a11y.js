export function initMegaMenuA11y(root = document, desktopNav = null) {
  const closeAll = () => {
    if (desktopNav) {
      desktopNav.clearCloseTimer?.();
      desktopNav.closeAllDesktopMenus();
      return;
    }

    const items = [...root.querySelectorAll('.has-dropdown[data-eye-health-nav], .has-dropdown[data-tr-only-nav]')];
    items.forEach((item) => {
      item.classList.remove('open');
      item.querySelector('.eh-nav-toggle')?.setAttribute('aria-expanded', 'false');
      const dropdown = item.querySelector('.mega-dropdown');
      if (window.innerWidth <= 1280) {
        dropdown?.setAttribute('hidden', '');
      } else {
        dropdown?.removeAttribute('hidden');
      }
    });
  };

  const items = desktopNav?.registry?.map(({ item }) => item)
    ?? [...root.querySelectorAll('.has-dropdown[data-eye-health-nav], .has-dropdown[data-tr-only-nav]')];

  items.forEach((item) => {
    const toggle = item.querySelector('.eh-nav-toggle');
    if (!toggle) return;

    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAll();
        toggle.focus();
      }
      if (event.key === 'Enter' || event.key === ' ') {
        if (window.innerWidth <= 1280) return;
        event.preventDefault();
        toggle.click();
      }
    });
  });

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (window.innerWidth <= 1280) return;
    closeAll();
  });

  root.addEventListener('click', (event) => {
    if (window.innerWidth <= 1280) return;
    if (event.target.closest('.nav-primary')) return;
    closeAll();
  });
}
