(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    function start(box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var button = box.querySelector('.play-button');
        var playUrl = box.getAttribute('data-play') || '';

        if (!video || !playUrl) {
            return;
        }

        function begin() {
            if (window.Hls && window.Hls.isSupported()) {
                if (!video._hlsReady) {
                    var hls = new window.Hls();
                    hls.loadSource(playUrl);
                    hls.attachMedia(video);
                    video._hlsReady = true;
                    video._hlsObject = hls;
                }
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = playUrl;
                }
            }

            if (cover) {
                cover.classList.add('hidden');
            }

            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', begin);
        }
        if (cover) {
            cover.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
    }

    boxes.forEach(start);
}());
