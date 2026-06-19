(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    var instances = new WeakMap();

    function playVideo(video) {
        var request = video.play();
        if (request && typeof request.catch === 'function') {
            request.catch(function () {});
        }
    }

    function preparePlayer(player) {
        if (player.classList.contains('is-ready')) {
            var readyVideo = player.querySelector('video');
            if (readyVideo) {
                playVideo(readyVideo);
            }
            return;
        }

        var source = player.getAttribute('data-video');
        var video = player.querySelector('video');

        if (!source || !video) {
            return;
        }

        player.classList.add('is-ready');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            playVideo(video);
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            instances.set(video, hls);
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on('hlsManifestParsed', function () {
                playVideo(video);
            });
            return;
        }

        video.src = source;
        playVideo(video);
    }

    players.forEach(function (player) {
        var trigger = player.querySelector('[data-play-trigger]');
        var video = player.querySelector('video');

        if (trigger) {
            trigger.addEventListener('click', function (event) {
                event.preventDefault();
                preparePlayer(player);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                preparePlayer(player);
            });
        }
    });

    window.addEventListener('pagehide', function () {
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var hls = video ? instances.get(video) : null;
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
