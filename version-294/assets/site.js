(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileMenu = qs('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('.searchable').forEach(function (scope) {
    var container = scope.closest('section') || document;
    var input = qs('[data-search]', container);
    var filters = qsa('[data-filter]', container);
    var empty = qs('[data-empty]', container);
    var items = qsa('.movie-card, .category-overview-card, .h-card', scope);
    var activeFilter = '';

    function itemText(item) {
      return [
        item.getAttribute('data-title'),
        item.getAttribute('data-region'),
        item.getAttribute('data-year'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-tags'),
        item.textContent
      ].join(' ').toLowerCase();
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      items.forEach(function (item) {
        var text = itemText(item);
        var okQuery = !query || text.indexOf(query) !== -1;
        var okFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
        var ok = okQuery && okFilter;
        item.classList.toggle('is-hidden', !ok);
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('show', visible === 0);
    }

    if (input) input.addEventListener('input', apply);
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || '';
        filters.forEach(function (b) {
          b.classList.toggle('active', b === button);
        });
        apply();
      });
    });
  });

  qsa('.js-player').forEach(function (shell) {
    var video = qs('video', shell);
    var overlay = qs('.player-overlay', shell);
    var error = qs('[data-player-error]', shell);
    var stream = shell.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function setError(message) {
      if (error) error.textContent = message || '';
    }

    function load() {
      if (!video || !stream || loaded) return;
      loaded = true;
      setError('');
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) setError('播放暂不可用，请稍后再试');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        setError('播放暂不可用，请稍后再试');
      }
    }

    function play() {
      load();
      if (!video) return;
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (overlay) overlay.classList.add('hidden');
        }).catch(function () {
          setError('点击视频区域继续播放');
        });
      } else if (overlay) {
        overlay.classList.add('hidden');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) overlay.classList.add('hidden');
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) overlay.classList.remove('hidden');
      });
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  });
})();
