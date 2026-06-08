(function () {
    window.initMoviePlayer = function (src) {
        var video = document.getElementById("movie-video");
        var layer = document.querySelector(".play-layer");
        var button = document.querySelector(".play-button");
        var ready = false;
        var started = false;

        function attach() {
            if (ready || !video) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function begin() {
            if (!video) {
                return;
            }
            attach();
            started = true;
            video.controls = true;
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var play = video.play();
            if (play && typeof play.catch === "function") {
                play.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", begin);
        }
        if (button) {
            button.addEventListener("click", begin);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!started) {
                    begin();
                }
            });
        }
    };
})();
