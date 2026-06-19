(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      var target = document.querySelector(form.getAttribute("data-target"));
      var empty = form.parentElement.querySelector("[data-empty-state]");
      if (!target) return;
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));

      function apply() {
        var q = (form.querySelector('[name="q"]') || {}).value || "";
        var year = (form.querySelector('[name="year"]') || {}).value || "";
        var type = (form.querySelector('[name="type"]') || {}).value || "";
        var keyword = q.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) ok = false;
          if (year && card.getAttribute("data-year") !== year) ok = false;
          if (type && (card.getAttribute("data-type") || "").indexOf(type) === -1) ok = false;
          card.hidden = !ok;
          if (ok) visible += 1;
        });

        if (empty) empty.classList.toggle("is-visible", visible === 0);
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      Array.prototype.slice.call(form.querySelectorAll("input, select")).forEach(function (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      });
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell[data-stream]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      var stream = shell.getAttribute("data-stream");
      var loaded = false;
      var hls = null;
      if (!video || !button || !stream) return;

      function load() {
        if (loaded) return;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function play() {
        load();
        shell.classList.add("is-playing");
        video.controls = true;
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!loaded) play();
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") hls.destroy();
      });
    });
  }
})();
