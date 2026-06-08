(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    const show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));
  scopes.forEach(function (scope) {
    const textInput = scope.querySelector('[data-filter-text]');
    const categoryInput = scope.querySelector('[data-filter-category]');
    const yearInput = scope.querySelector('[data-filter-year]');
    const resetButton = scope.querySelector('[data-filter-reset]');
    const list = document.querySelector('[data-filter-list]');
    const empty = document.querySelector('[data-filter-empty]');
    if (!list) {
      return;
    }
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const apply = function () {
      const keyword = textInput ? textInput.value.trim().toLowerCase() : '';
      const category = categoryInput ? categoryInput.value : '';
      const year = yearInput ? yearInput.value : '';
      let visible = 0;
      cards.forEach(function (card) {
        const hay = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.tags || ''
        ].join(' ').toLowerCase();
        const okKeyword = !keyword || hay.indexOf(keyword) !== -1;
        const okCategory = !category || card.dataset.category === category;
        const okYear = !year || card.dataset.year === year;
        const showCard = okKeyword && okCategory && okYear;
        card.hidden = !showCard;
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    };
    if (query && textInput) {
      textInput.value = query;
    }
    [textInput, categoryInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        if (categoryInput) {
          categoryInput.value = '';
        }
        if (yearInput) {
          yearInput.value = '';
        }
        apply();
      });
    }
    apply();
  });

  window.initMoviePlayer = function (source) {
    const video = document.getElementById('movieVideo');
    const start = document.querySelector('[data-player-start]');
    const shell = document.querySelector('.player-shell');
    if (!video || !source) {
      return;
    }
    let hls = null;
    let initialized = false;
    const prepare = function () {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    const play = function () {
      prepare();
      if (shell) {
        shell.classList.add('is-playing');
      }
      const request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    };
    if (start) {
      start.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });
    video.addEventListener('pause', function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
