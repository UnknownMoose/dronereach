export function initHero() {
// Keep the transparent header inside the first screen, including expanded navigation.
const header = document.querySelector('.site-header');
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--hero-header-height', `${header.getBoundingClientRect().height}px`);
}).observe(header);

const hero = document.querySelector('.hero-band');
const video = document.querySelector('.hero-video');
const videoToggle = document.querySelector('.video-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let videoSrc = '';
let playbackAttempt = 0;
function showImage() {
  hero.classList.remove('video-active');
  videoToggle.hidden = true;
}
function updateVideoControl() {
  videoToggle.textContent = video.paused ? 'Play video' : 'Pause video';
  videoToggle.setAttribute('aria-label', video.paused ? 'Play background video' : 'Pause background video');
}
async function startBackgroundVideo() {
  const attempt = ++playbackAttempt;
  showImage();
  video.pause();
  if (!videoSrc || reducedMotion.matches) return;
  if (video.getAttribute('src') !== videoSrc) video.src = videoSrc;
  video.muted = true;
  try {
    await video.play();
    if (attempt !== playbackAttempt || reducedMotion.matches) return;
    hero.classList.add('video-active');
    videoToggle.hidden = false;
    updateVideoControl();
  } catch {
    if (attempt === playbackAttempt) showImage();
  }
}
video.addEventListener('error', showImage);
video.addEventListener('pause', updateVideoControl);
video.addEventListener('playing', updateVideoControl);
videoToggle.addEventListener('click', async () => {
  if (!video.paused) video.pause();
  else {
    try { await video.play(); } catch { showImage(); }
  }
  updateVideoControl();
});
reducedMotion.addEventListener('change', startBackgroundVideo);
fetch('/hero-config.json', { cache: 'no-cache' })
  .then(response => response.ok ? response.json() : {})
  .then(config => {
    videoSrc = typeof config.videoSrc === 'string' ? config.videoSrc.trim() : '';
    startBackgroundVideo();
  })
  .catch(showImage);

}
