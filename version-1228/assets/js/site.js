(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = '×';
      } else {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var sideImage = hero.querySelector('[data-hero-side-image]');
    var sideTitle = hero.querySelector('[data-hero-side-title]');
    var sideMeta = hero.querySelector('[data-hero-side-meta]');
    var sideLink = hero.querySelector('[data-hero-side-link]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
      var current = slides[active];
      if (current && sideImage && sideTitle && sideMeta && sideLink) {
        sideImage.src = current.getAttribute('data-image');
        sideImage.alt = current.getAttribute('data-title');
        sideTitle.textContent = current.getAttribute('data-title');
        sideMeta.textContent = current.getAttribute('data-meta');
        sideLink.href = current.getAttribute('data-link');
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    hero.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });
    hero.addEventListener('mouseleave', restart);
    show(0);
    restart();
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var input = page.querySelector('[data-search-input]');
    var category = page.querySelector('[data-category-filter]');
    var year = page.querySelector('[data-year-filter]');
    var sort = page.querySelector('[data-sort-select]');
    var status = page.querySelector('[data-search-status]');
    var grid = page.querySelector('[data-movie-grid]');
    var cards = selectAll('.movie-card', grid);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }

    function cardText(card) {
      return (card.getAttribute('data-keywords') || '').toLowerCase();
    }

    function applySort(visibleCards) {
      if (!sort || !grid) {
        return;
      }
      var value = sort.value;
      var sorted = visibleCards.slice().sort(function (a, b) {
        if (value === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
        var by = parseInt(b.getAttribute('data-year'), 10) || 0;
        return value === 'year-asc' ? ay - by : by - ay;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var c = category ? category.value : 'all';
      var y = year ? year.value : 'all';
      var visible = [];
      cards.forEach(function (card) {
        var matchesText = !q || cardText(card).indexOf(q) !== -1;
        var matchesCategory = c === 'all' || card.getAttribute('data-category') === c;
        var cardYear = card.getAttribute('data-year') || '';
        var matchesYear = y === 'all' || cardYear.indexOf(y) === 0;
        var ok = matchesText && matchesCategory && matchesYear;
        card.hidden = !ok;
        if (ok) {
          visible.push(card);
        }
      });
      applySort(visible);
      if (status) {
        status.textContent = visible.length ? '当前结果：' + visible.length + ' 部' : '没有找到匹配影片';
      }
    }

    [input, category, year, sort].forEach(function (node) {
      if (node) {
        node.addEventListener(node === input ? 'input' : 'change', apply);
      }
    });
    apply();
  }

  function setupSortOnly() {
    var grid = document.querySelector('[data-sort-grid]');
    var sort = document.querySelector('[data-sort-select-only]');
    if (!grid || !sort) {
      return;
    }
    sort.addEventListener('change', function () {
      var cards = selectAll('.movie-card', grid);
      var value = sort.value;
      cards.sort(function (a, b) {
        if (value === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
        var by = parseInt(b.getAttribute('data-year'), 10) || 0;
        return value === 'year-asc' ? ay - by : by - ay;
      }).forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchPage();
    setupSortOnly();
  });
})();
