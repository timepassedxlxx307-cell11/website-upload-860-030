(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupInlineFilter() {
        var input = document.querySelector("[data-filter-input]");
        var select = document.querySelector("[data-filter-select]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        var noResult = document.querySelector(".no-result");
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            input.value = q;
        }
        function filter() {
            var keyword = input.value.trim().toLowerCase();
            var type = select ? select.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-search") || "";
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !type || haystack.indexOf(type.toLowerCase()) !== -1;
                var show = matchKeyword && matchType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (noResult) {
                noResult.style.display = visible ? "none" : "block";
            }
        }
        input.addEventListener("input", filter);
        if (select) {
            select.addEventListener("change", filter);
        }
        filter();
    }

    window.initMoviePlayer = function (videoId, buttonId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var cover = document.getElementById(coverId);
        if (!video || !button || !cover || !streamUrl) {
            return;
        }
        var attached = false;
        function attachStream() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            attached = true;
        }
        function startPlayback() {
            attachStream();
            cover.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    cover.classList.remove("is-hidden");
                });
            }
        }
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            startPlayback();
        });
        cover.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!attached) {
                startPlayback();
            }
        });
    };

    onReady(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupInlineFilter();
    });
})();
