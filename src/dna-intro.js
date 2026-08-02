const TAU = Math.PI * 2;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

const CYAN_STRAND = [
  [8, 28, 46],
  [111, 227, 255],
  [222, 250, 255],
];

const GOLD_STRAND = [
  [64, 42, 10],
  [201, 168, 76],
  [255, 231, 178],
];

const DATA_TAGS = ['0x2C', 'SEQ//04', '0xA3F1', 'LOCI-9', '0x77E2', 'NODE-12'];

function smoothstep(from, to, value) {
  const normalized = clamp((value - from) / (to - from));
  return normalized * normalized * (3 - 2 * normalized);
}

function seededNoise(index, seed) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function gradientColor(position, colors) {
  const firstHalf = position < 0.5;
  const amount = firstHalf ? position * 2 : (position - 0.5) * 2;
  const from = colors[firstHalf ? 0 : 1];
  const to = colors[firstHalf ? 1 : 2];

  return from.map((channel, index) => Math.round(lerp(channel, to[index], amount)));
}

export function createDnaIntro(canvas, { mobileQuery } = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  const context = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true,
  });

  if (!context) return null;

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let progress = 0;
  let elapsed = 0;
  let previousTime = 0;
  let animationFrameId = 0;
  let destroyed = false;
  let pointerX = 0;
  let pointerY = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;

  const isMobile = () => mobileQuery?.matches ?? window.innerWidth <= 768;
  const dustParticles = Array.from({ length: 240 }, (_, index) => ({
    x: seededNoise(index, 1.4) - 0.5,
    y: seededNoise(index, 3.7) - 0.5,
    depth: seededNoise(index, 6.2),
    warm: seededNoise(index, 9.8),
    phase: seededNoise(index, 12.1) * TAU,
  }));

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.35 : 1.75);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function projectPoint(position, phase, turns, radius, helixHeight, rotation) {
    const angle = position * turns * TAU + phase + rotation;
    const depth = Math.sin(angle) * radius;
    const perspective = 720 / (720 + depth);

    return {
      x: width / 2 + Math.cos(angle) * radius * perspective + pointerX * 24,
      y: height / 2 + (position - 0.5) * helixHeight * perspective + pointerY * 14,
      depth,
      perspective,
    };
  }

  function drawBackgroundGlow(alpha) {
    const glowRadius = Math.min(width, height) * 0.56;
    const glow = context.createRadialGradient(
      width / 2 + pointerX * 18,
      height * 0.46 + pointerY * 10,
      0,
      width / 2,
      height * 0.46,
      glowRadius,
    );

    glow.addColorStop(0, `rgba(90, 180, 220, ${0.07 * alpha})`);
    glow.addColorStop(0.48, `rgba(20, 45, 60, ${0.045 * alpha})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
  }

  function drawScanlines(alpha) {
    const spacing = 42;
    context.strokeStyle = `rgba(111, 227, 255, ${0.03 * alpha})`;
    context.lineWidth = 1;
    for (let y = (elapsed * 26) % spacing; y < height; y += spacing) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  }

  function drawScanSweep(alpha) {
    const period = 3.4;
    const t = (elapsed % period) / period;
    const y = t * height;
    const gradient = context.createLinearGradient(0, y - 60, 0, y + 60);
    gradient.addColorStop(0, 'rgba(111, 227, 255, 0)');
    gradient.addColorStop(0.5, `rgba(111, 227, 255, ${0.07 * alpha})`);
    gradient.addColorStop(1, 'rgba(111, 227, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, y - 60, width, 120);
  }

  function drawDust(alpha) {
    const particleCount = isMobile() ? 110 : dustParticles.length;

    for (let index = 0; index < particleCount; index += 1) {
      const particle = dustParticles[index];
      const drift = Math.sin(elapsed * 0.2 + particle.phase) * 8;
      const twinkle = 0.35 + Math.abs(Math.sin(elapsed * 0.8 + particle.phase)) ** 3 * 0.65;
      const x = width / 2 + particle.x * Math.max(width, 960) + pointerX * 8 * particle.depth;
      const y = height / 2 + particle.y * Math.max(height, 720) + drift;
      const size = lerp(0.35, 1.35, particle.depth) * (isMobile() ? 0.8 : 1);
      const color = particle.warm > 0.5 ? '111, 227, 255' : '255, 248, 230';

      context.beginPath();
      context.arc(x, y, size, 0, TAU);
      context.fillStyle = `rgba(${color}, ${twinkle * alpha * 0.42})`;
      context.fill();
    }
  }

  function drawRings(alpha) {
    const baseRadius = Math.min(width, height);
    const rings = [
      [baseRadius * 0.31, 0.09],
      [baseRadius * 0.39, 0.055],
      [baseRadius * 0.47, 0.03],
    ];

    context.save();
    context.translate(width / 2 + pointerX * 8, height / 2 + pointerY * 5);
    context.rotate(elapsed * 0.03);
    context.lineWidth = 0.7;
    rings.forEach(([radius, opacity]) => {
      context.beginPath();
      context.arc(0, 0, radius, 0, TAU);
      context.strokeStyle = `rgba(111, 227, 255, ${opacity * alpha})`;
      context.stroke();
    });
    context.restore();
  }

  function drawReticle(radius, alpha) {
    context.save();
    context.translate(width / 2 + pointerX * 8, height / 2 + pointerY * 5);
    context.rotate(-elapsed * 0.18);
    context.setLineDash([6, 10]);
    context.lineWidth = 1;
    context.strokeStyle = `rgba(111, 227, 255, ${0.26 * alpha})`;
    context.beginPath();
    context.arc(0, 0, radius, 0, TAU);
    context.stroke();
    context.setLineDash([]);
    context.restore();
  }

  function drawRungs(turns, radius, helixHeight, rotation, alpha) {
    const rungCount = isMobile() ? 46 : 74;

    for (let index = 0; index < rungCount; index += 1) {
      const position = index / (rungCount - 1);
      const first = projectPoint(position, 0, turns, radius, helixHeight, rotation);
      const second = projectPoint(position, Math.PI, turns, radius, helixHeight, rotation);
      const depthAlpha = clamp(0.28 + (first.depth + radius) / (radius * 2) * 0.45);

      context.beginPath();
      context.moveTo(first.x, first.y);
      context.lineTo(second.x, second.y);
      context.strokeStyle = `rgba(210, 226, 240, ${0.16 * alpha * depthAlpha})`;
      context.lineWidth = 0.7;
      context.stroke();
    }
  }

  function drawStrand(phase, colors, strandIndex, turns, radius, helixHeight, rotation, alpha) {
    const pointCount = isMobile() ? 520 : 900;

    for (let index = 0; index < pointCount; index += 1) {
      const position = index / (pointCount - 1);
      const point = projectPoint(position, phase, turns, radius, helixHeight, rotation);
      const noise = seededNoise(index, strandIndex + 1);
      const twinkle = 0.72 + Math.sin(elapsed * (1.1 + noise) + noise * TAU) * 0.28;
      const depthAmount = clamp((point.depth + radius) / (radius * 2));
      const pointAlpha = alpha * twinkle * lerp(0.24, 0.92, depthAmount);
      const pointSize = (isMobile() ? 0.9 : 1.18) * point.perspective * lerp(0.65, 1.55, noise);
      const [red, green, blue] = gradientColor(position, colors);

      context.beginPath();
      context.arc(point.x, point.y, pointSize, 0, TAU);
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${pointAlpha})`;
      context.fill();

      if (noise > 0.992) {
        context.beginPath();
        context.arc(point.x, point.y, pointSize * 3.6, 0, TAU);
        context.fillStyle = `rgba(235, 251, 255, ${pointAlpha * 0.18})`;
        context.fill();
      }
    }
  }

  function drawDataTags(alpha) {
    if (alpha <= 0.02 || isMobile()) return;

    context.font = '9px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
    for (let index = 0; index < DATA_TAGS.length; index += 1) {
      const angle = index * 3.1 + elapsed * 0.05;
      const radius = Math.min(width, height) * (0.3 + seededNoise(index, 4) * 0.14);
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius * 0.6;

      context.fillStyle = `rgba(111, 227, 255, ${0.38 * alpha})`;
      context.fillText(DATA_TAGS[index], x, y);
    }
  }

  function draw(time) {
    if (destroyed) return;

    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    elapsed += delta;
    pointerX += (pointerTargetX - pointerX) * 0.045;
    pointerY += (pointerTargetY - pointerY) * 0.045;

    context.clearRect(0, 0, width, height);

    const openAmount = smoothstep(0.02, 0.72, progress);
    const fadeAmount = 1 - smoothstep(0.82, 1, progress);
    const turns = lerp(6, 0.36, openAmount);
    const baseRadius = Math.min(width * (isMobile() ? 0.13 : 0.09), isMobile() ? 52 : 74);
    const radius = baseRadius * lerp(1, 2.1, openAmount);
    const helixHeight = Math.min(height * (isMobile() ? 0.76 : 0.9), isMobile() ? 620 : 820);
    const rotation = elapsed * 0.12 + openAmount * 0.18;

    drawBackgroundGlow(fadeAmount);
    drawScanlines(fadeAmount);
    drawScanSweep(fadeAmount);
    context.globalCompositeOperation = 'lighter';
    drawDust(fadeAmount);
    drawRings(fadeAmount);
    drawReticle(radius * 2.2, fadeAmount);
    drawRungs(turns, radius, helixHeight, rotation, fadeAmount);
    drawStrand(0, CYAN_STRAND, 0, turns, radius, helixHeight, rotation, fadeAmount);
    drawStrand(Math.PI, GOLD_STRAND, 1, turns, radius, helixHeight, rotation, fadeAmount);
    drawDataTags(fadeAmount * smoothstep(0.35, 0.6, progress));
    context.globalCompositeOperation = 'source-over';

    animationFrameId = window.requestAnimationFrame(draw);
  }

  function handlePointerMove(event) {
    pointerTargetX = clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
    pointerTargetY = clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
      previousTime = 0;
      return;
    }

    if (!animationFrameId && !destroyed) {
      animationFrameId = window.requestAnimationFrame(draw);
    }
  }

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(resize)
    : null;

  resizeObserver?.observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);

  resize();
  animationFrameId = window.requestAnimationFrame(draw);

  return {
    setProgress(nextProgress) {
      progress = clamp(nextProgress);
    },
    destroy() {
      destroyed = true;
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      context.clearRect(0, 0, width, height);
    },
  };
}
