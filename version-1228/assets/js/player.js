(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-button]');
    var stage = document.querySelector('[data-player-stage]');
    if (!video || !button || !stage || !streamUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.setAttribute('controls', 'controls');
      video.setAttribute('playsinline', 'playsinline');
      loaded = true;
    }

    function start() {
      loadStream();
      stage.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          stage.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', start);
    stage.addEventListener('click', function (event) {
      if (event.target === video && !loaded) {
        start();
      }
    });
    video.addEventListener('play', function () {
      stage.classList.add('is-playing');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
