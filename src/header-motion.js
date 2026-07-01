export function initHeaderLogoMotion() {
  const videos = document.querySelectorAll('.nav-logo-motion');
  if (!videos.length) return;

  videos.forEach((video) => {
    if (video.dataset.motionInit === 'true') return;
    video.dataset.motionInit = 'true';

    const wrap = video.closest('.nav-logo-motion-wrap');
    if (!wrap) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'nav-logo-motion-canvas';
    wrap.appendChild(canvas);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx || !offCtx) return;

    function resizeCanvases() {
      const width = Math.max(1, Math.round(wrap.clientWidth));
      const height = Math.max(1, Math.round(wrap.clientHeight));
      canvas.width = width;
      canvas.height = height;
      offscreen.width = width;
      offscreen.height = height;
    }

    let rafId = null;
    let animating = false;

    function renderFrame() {
      if (document.hidden) {
        animating = false;
        rafId = null;
        return;
      }

      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const sourceWidth = video.videoWidth;
        const sourceHeight = video.videoHeight;

        // Zoom into the center so the animation looks larger in the header.
        const zoom = 2.6;
        const cropWidth = sourceWidth / zoom;
        const cropHeight = sourceHeight / zoom;
        const sx = (sourceWidth - cropWidth) / 2;
        const sy = (sourceHeight - cropHeight) / 2;

        offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
        offCtx.drawImage(video, sx, sy, cropWidth, cropHeight, 0, 0, offscreen.width, offscreen.height);

        const frame = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
        const pixels = frame.data;

        // Chroma-key near-black pixels to true transparency.
        const threshold = 34;
        const softness = 26;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const max = Math.max(r, g, b);

          if (max <= threshold) {
            pixels[i + 3] = 0;
          } else if (max <= threshold + softness) {
            const alphaScale = (max - threshold) / softness;
            pixels[i + 3] = Math.round(pixels[i + 3] * alphaScale);
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(frame, 0, 0);
      }

      rafId = requestAnimationFrame(renderFrame);
    }

    function startRenderLoop() {
      if (animating || document.hidden) return;
      animating = true;
      rafId = requestAnimationFrame(renderFrame);
    }

    resizeCanvases();
    window.addEventListener('resize', resizeCanvases, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) startRenderLoop();
    });

    video.play().catch(() => {});
    startRenderLoop();
  });
}
