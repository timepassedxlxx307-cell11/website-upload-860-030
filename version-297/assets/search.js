(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.href) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span>" +
            "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>" +
            "<span class=\"poster-play\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h3><a href=\"" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function render() {
        var results = document.getElementById("searchResults");
        var heading = document.querySelector("[data-search-heading]");
        var form = document.querySelector("[data-search-page-form]");
        if (!results) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        if (form && q) {
            var input = form.querySelector("input[name='q']");
            if (input) {
                input.value = q;
            }
        }
        if (!q) {
            return;
        }
        var query = q.toLowerCase();
        var movies = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
        var matched = movies.filter(function (movie) {
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            return text.indexOf(query) !== -1;
        }).slice(0, 120);
        if (heading) {
            heading.textContent = "搜索结果：" + q;
        }
        if (matched.length === 0) {
            results.innerHTML = "<div class=\"empty-state\"><h2>未找到匹配影片</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>";
            return;
        }
        results.innerHTML = matched.map(card).join("");
    }

    ready(render);
})();
