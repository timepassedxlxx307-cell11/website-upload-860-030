(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var links = document.querySelector('[data-nav-links]');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('.movie-grid'));
        if (!grids.length) {
            return;
        }
        var searchFields = Array.prototype.slice.call(document.querySelectorAll('.search-field'));
        var yearFilters = Array.prototype.slice.call(document.querySelectorAll('.year-filter'));
        var regionFilters = Array.prototype.slice.call(document.querySelectorAll('.region-filter'));
        var empty = document.querySelector('[data-empty-state]');

        function currentValue(list) {
            return list.length ? String(list[0].value || '').trim().toLowerCase() : '';
        }

        function filter() {
            var query = currentValue(searchFields);
            var year = currentValue(yearFilters);
            var region = currentValue(regionFilters);
            var visible = 0;
            var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' ').toLowerCase();
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesYear = !year || String(card.getAttribute('data-year') || '').toLowerCase() === year;
                var matchesRegion = !region || String(card.getAttribute('data-region') || '').toLowerCase() === region;
                var show = matchesQuery && matchesYear && matchesRegion;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        searchFields.concat(yearFilters, regionFilters).forEach(function (field) {
            field.addEventListener('input', filter);
            field.addEventListener('change', filter);
        });
    }

    function setupPlayer() {
        var shell = document.querySelector('[data-player]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-trigger');
        var status = shell.querySelector('.player-status');
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute('data-stream') || '';
        var loaded = false;
        var player = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function playVideo() {
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {
                    setStatus('点击视频继续播放');
                });
            }
        }

        function loadStream() {
            if (!stream) {
                setStatus('影片暂时无法播放，请稍后重试');
                return;
            }
            if (loaded) {
                playVideo();
                return;
            }
            loaded = true;
            setStatus('正在加载影片');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                player.loadSource(stream);
                player.attachMedia(video);
                player.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                player.on(window.Hls.Events.ERROR, function () {
                    setStatus('播放遇到问题，请稍后重试');
                });
            } else {
                setStatus('当前设备无法直接播放此影片');
            }
        }

        button.addEventListener('click', loadStream);
        video.addEventListener('click', function () {
            if (video.paused) {
                loadStream();
            }
        });
        video.addEventListener('playing', function () {
            shell.classList.add('is-playing');
            setStatus('');
        });
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (player) {
                player.destroy();
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
