(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var active = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });
        if (slides.length) {
            showSlide(0);
            setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        var localSearch = document.querySelector("[data-local-search]");
        if (localSearch) {
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            localSearch.addEventListener("input", function () {
                var q = localSearch.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var hay = ((card.dataset.title || "") + " " + (card.dataset.key || "")).toLowerCase();
                    card.classList.toggle("hidden-card", q && hay.indexOf(q) === -1);
                });
            });
        }

        var searchInput = document.querySelector("[data-site-search]");
        var searchResults = document.querySelector("[data-search-results]");
        if (searchInput && searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
            function render(list) {
                searchResults.innerHTML = list.slice(0, 80).map(function (item) {
                    return '<article class="movie-card">' +
                        '<a class="poster-link" href="details/' + item.file + '">' +
                        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
                        '<span class="score">' + item.score + '</span>' +
                        '</a>' +
                        '<div class="card-body">' +
                        '<a class="card-title" href="details/' + item.file + '">' + item.title + '</a>' +
                        '<div class="card-meta">' + item.year + ' · ' + item.region + ' · ' + item.type + '</div>' +
                        '<p>' + item.desc + '</p>' +
                        '<div class="tag-row">' + item.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>' +
                        '</div>' +
                        '</article>';
                }).join('');
            }
            function perform() {
                var q = searchInput.value.trim().toLowerCase();
                if (!q) {
                    render(window.MOVIE_SEARCH_DATA.slice(0, 24));
                    return;
                }
                render(window.MOVIE_SEARCH_DATA.filter(function (item) {
                    return item.key.indexOf(q) !== -1;
                }));
            }
            searchInput.addEventListener("input", perform);
            perform();
        }

        var video = document.querySelector("[data-video-player]");
        var cover = document.querySelector("[data-play-cover]");
        var button = document.querySelector("[data-play-button]");
        if (video) {
            var src = video.getAttribute("data-src");
            var started = false;
            function loadVideo() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
            }
            function startVideo(event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                loadVideo();
                if (cover) {
                    cover.classList.add("hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener("click", startVideo);
            }
            if (button) {
                button.addEventListener("click", startVideo);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    startVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("hidden");
                }
            });
        }
    });
})();
