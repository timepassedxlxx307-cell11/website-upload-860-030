(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        var open = mobilePanel.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(open));
        mobilePanel.setAttribute('aria-hidden', String(!open));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('.empty-state');

    function getText(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-region') || ''
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var keyword = searchInputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(' ');
      var selected = filterSelects.map(function (select) {
        return select.value;
      }).filter(function (value) {
        return value && value !== '全部';
      });
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = getText(card);
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var filterMatch = selected.every(function (value) {
          return haystack.indexOf(value.toLowerCase()) !== -1;
        });
        var ok = keywordMatch && filterMatch;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      searchInputs.forEach(function (input) {
        input.value = q;
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', applyFilters);
    });

    filterSelects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();

    var playerShell = document.querySelector('.player-shell');

    if (playerShell) {
      var video = playerShell.querySelector('video');
      var overlay = playerShell.querySelector('.player-overlay');
      var playButton = playerShell.querySelector('.play-button');
      var streamUrl = playerShell.getAttribute('data-stream');
      var prepared = false;
      var hlsInstance = null;

      function attachStream() {
        if (!video || !streamUrl || prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function startPlay() {
        attachStream();
        playerShell.classList.add('is-playing');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', startPlay);
      }
      if (playButton) {
        playButton.addEventListener('click', function (event) {
          event.stopPropagation();
          startPlay();
        });
      }
      if (video) {
        video.addEventListener('play', function () {
          playerShell.classList.add('is-playing');
        });
        video.addEventListener('emptied', function () {
          playerShell.classList.remove('is-playing');
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
