(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var start = box.querySelector('.player-start');
    var stream = box.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return true;
      }

      if (!video || !stream) {
        box.classList.add('player-unavailable');
        return false;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        box.classList.add('player-unavailable');
        return false;
      }

      loaded = true;
      return true;
    }

    function play() {
      if (!load()) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      video.controls = true;
      var action = video.play();

      if (action && action.catch) {
        action.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
