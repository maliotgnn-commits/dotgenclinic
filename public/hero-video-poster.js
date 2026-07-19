(() => {
  const video = document.currentScript?.previousElementSibling;
  if (!video?.classList.contains('hero-bg-video')) return;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  video.setAttribute('poster', mobile ? video.dataset.heroPosterMobile : video.dataset.heroPosterDesktop);
})();
