(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('is-open');
            });
        }

        var slider = document.querySelector('[data-hero-slider]');
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
            var prev = slider.querySelector('[data-hero-prev]');
            var next = slider.querySelector('[data-hero-next]');
            var index = 0;
            var timer;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function restart() {
                window.clearInterval(timer);
                start();
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-slide')) || 0);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    restart();
                });
            }

            show(0);
            start();
        }

        var filterInput = document.querySelector('[data-filter-input]');
        var filterList = document.querySelector('[data-filter-list]');
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

        function applyFilter(extra) {
            if (!filterList) {
                return;
            }
            var query = '';
            if (filterInput) {
                query = filterInput.value.trim().toLowerCase();
            }
            var extraQuery = (extra || '').trim().toLowerCase();
            var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var matched = (!query || text.indexOf(query) !== -1) && (!extraQuery || text.indexOf(extraQuery) !== -1);
                card.classList.toggle('is-hidden', !matched);
            });
        }

        if (filterInput) {
            var queryName = filterInput.getAttribute('data-url-query');
            if (queryName) {
                var params = new URLSearchParams(window.location.search);
                var value = params.get(queryName);
                if (value) {
                    filterInput.value = value;
                }
            }
            filterInput.addEventListener('input', function () {
                var active = document.querySelector('[data-filter].is-active');
                applyFilter(active ? active.getAttribute('data-filter') : '');
            });
            applyFilter('');
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                applyFilter(button.getAttribute('data-filter'));
            });
        });

        var player = document.querySelector('[data-player]');
        if (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var hlsInstance = null;
            var loaded = false;

            function begin() {
                if (!video) {
                    return;
                }
                var source = video.getAttribute('data-src');
                if (!source) {
                    return;
                }
                if (!loaded) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.src = source;
                        video.addEventListener('loadedmetadata', function () {
                            video.play().catch(function () {});
                        }, { once: true });
                    }
                    loaded = true;
                } else {
                    video.play().catch(function () {});
                }
                player.classList.add('is-playing');
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    begin();
                });
            }

            player.addEventListener('click', function (event) {
                if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                    return;
                }
                begin();
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
