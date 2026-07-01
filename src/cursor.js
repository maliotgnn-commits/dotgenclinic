export function initCustomCursor() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (!finePointer || prefersReducedMotion) return;

  if (document.querySelector('.custom-cursor')) return;

  document.body.classList.add('custom-cursor-enabled');

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.innerHTML = '<span class="cursor-core"></span><span class="cursor-ring"></span>';
  document.body.appendChild(cursor);

  const trailCount = 12;
  const trail = [];
  const trailPositions = [];

  for (let i = 0; i < trailCount; i += 1) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    document.body.appendChild(dot);
    trail.push(dot);
    trailPositions.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }

  const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let visible = false;
  let hover = false;
  let pressed = false;
  let scale = 1;
  let targetScale = 1;

  function setVisible(nextVisible) {
    visible = nextVisible;
    cursor.classList.toggle('visible', visible);
    trail.forEach((dot) => dot.classList.toggle('visible', visible));
  }

  function syncScaleState() {
    if (pressed) {
      targetScale = 0.86;
      return;
    }
    targetScale = hover ? 1.28 : 1;
  }

  window.addEventListener('mousemove', (event) => {
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;
    if (!visible) setVisible(true);
  }, { passive: true });

  window.addEventListener('mouseenter', () => setVisible(true));
  window.addEventListener('mouseleave', () => setVisible(false));

  window.addEventListener('mousedown', () => {
    pressed = true;
    syncScaleState();
    cursor.classList.add('press');
  });
  window.addEventListener('mouseup', () => {
    pressed = false;
    syncScaleState();
    cursor.classList.remove('press');
  });

  document
    .querySelectorAll('a, button, [role="button"], input, select, textarea, label, summary, [data-cursor-hover]')
    .forEach((el) => {
    el.addEventListener('mouseenter', () => {
      hover = true;
      syncScaleState();
      cursor.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      hover = false;
      syncScaleState();
      cursor.classList.remove('hover');
    });
    });

  let rafId = null;
  let animating = false;

  function animate() {
    if (document.hidden) {
      animating = false;
      rafId = null;
      return;
    }

    cursorPos.x += (mousePos.x - cursorPos.x) * 0.28;
    cursorPos.y += (mousePos.y - cursorPos.y) * 0.28;
    scale += (targetScale - scale) * 0.22;

    cursor.style.transform = `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0) scale(${scale})`;

    trailPositions[0].x += (cursorPos.x - trailPositions[0].x) * 0.4;
    trailPositions[0].y += (cursorPos.y - trailPositions[0].y) * 0.4;

    for (let i = 1; i < trailCount; i += 1) {
      trailPositions[i].x += (trailPositions[i - 1].x - trailPositions[i].x) * 0.38;
      trailPositions[i].y += (trailPositions[i - 1].y - trailPositions[i].y) * 0.38;
    }

    trail.forEach((dot, index) => {
      const p = trailPositions[index];
      const dotScale = 1 - index / (trailCount * 1.35);
      dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${dotScale})`;
      dot.style.opacity = String((1 - index / (trailCount + 1)) * 0.95);
    });

    rafId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animating || document.hidden) return;
    animating = true;
    rafId = requestAnimationFrame(animate);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) startAnimation();
  });

  startAnimation();
}
