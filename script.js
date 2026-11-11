
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js');
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const links = document.querySelectorAll('.site-header nav a, .side-dots a');
const sections = document.querySelectorAll('main section');
const story = document.body.classList.contains('story');

// PROJECT KPI COUNT-UP FUNCTION

function animateStat(element) {
  const match = element.textContent.trim().match(/^([\d,]+)\s*(K\+)?$/i);

  if (!match) return;

  const target = Number(match[1].replace(/,/g, ''));
  const suffix = match[2] || '';
  const duration = suffix ? 1700 : 800;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = target.toLocaleString('en-US') + suffix;
    return;
  }

  const startTime = performance.now();

  element.textContent = '1' + suffix;

  function updateCounter(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const value = 1 + (target - 1) * progress;

    element.textContent =
      Math.floor(progress === 1 ? target : value)
        .toLocaleString('en-US') + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

// EXISTING SECTION OBSERVER + KPI ANIMATION

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const stat = entry.target.querySelector('.result .stat');

    if (stat && !stat.dataset.counted) {
      stat.dataset.counted = 'true';
      animateStat(stat);
    }

    const key = entry.target.dataset.nav || entry.target.id;

    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      link.classList.toggle('active', href === '#' + key);
    });
  });
}, {
  rootMargin: story ? '-45% 0px -45% 0px' : '-40% 0px -55% 0px',
  threshold: story ? 0.01 : 0
});

sections.forEach((section) => sectionObserver.observe(section));

const progress = document.getElementById('progress');

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = 'scaleX(' + ratio + ')';
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const videos = document.querySelectorAll('video.demo');

videos.forEach((video) => {
  video.controls = false;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.addEventListener('click', () => {
    if (video.paused) {
      delete video.dataset.hold;
      video.play().catch(() => {});
    } else {
      video.dataset.hold = '1';
      video.pause();
    }
  });
});

const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting && !video.dataset.hold) {
      video.play().catch(() => {});
    } else if (!entry.isIntersecting) {
      video.pause();
    }
  });
}, { threshold: 0.35 });

videos.forEach((video) => videoObserver.observe(video));

const homeChart = document.querySelector('.home-chart');
const homeScreen = document.getElementById('home');

if (homeChart && homeScreen && 'IntersectionObserver' in window) {
  const homeChartObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      homeChart.classList.toggle('is-in', entry.isIntersecting);
    });
  }, { threshold: 0.6 });

  homeChartObserver.observe(homeScreen);
}
