(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var navButton = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (navButton && mobileNav) {
            navButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
                navButton.setAttribute("aria-expanded", mobileNav.classList.contains("is-open") ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
                dot.setAttribute("aria-current", i === current ? "true" : "false");
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });
        if (slides.length > 1) {
            showSlide(0);
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-page-filter]"));
        filters.forEach(function (input) {
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-text]"));
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-card-text").toLowerCase();
                    card.style.display = text.indexOf(query) === -1 ? "none" : "";
                });
            });
        });

        var searchRoot = document.querySelector("[data-search-root]");
        if (searchRoot && Array.isArray(window.SITE_MOVIES)) {
            var params = new URLSearchParams(window.location.search);
            var q = (params.get("q") || "").trim();
            var input = document.querySelector("#search-page-input");
            if (input) {
                input.value = q;
            }
            renderSearch(q);
        }

        function renderSearch(query) {
            var searchRoot = document.querySelector("[data-search-root]");
            if (!searchRoot) {
                return;
            }
            if (!query) {
                searchRoot.innerHTML = '<p class="search-empty">输入片名、地区、类型或标签进行检索。</p>';
                return;
            }
            var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
            var results = window.SITE_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
                return terms.every(function (term) {
                    return text.indexOf(term) !== -1;
                });
            }).slice(0, 80);
            if (!results.length) {
                searchRoot.innerHTML = '<p class="search-empty">没有找到匹配影片。</p>';
                return;
            }
            searchRoot.innerHTML = '<div class="movie-grid">' + results.map(function (movie) {
                return '<article class="movie-card">'
                    + '<a class="movie-cover" href="' + movie.url + '">'
                    + '<img loading="lazy" src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '">'
                    + '<span class="cover-ribbon">' + escapeHtml(String(movie.year || movie.type)) + '</span>'
                    + '</a>'
                    + '<div class="card-body">'
                    + '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>'
                    + '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>'
                    + '<p class="card-line">' + escapeHtml(movie.oneLine) + '</p>'
                    + '</div>'
                    + '</article>';
            }).join("") + '</div>';
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    });
})();
