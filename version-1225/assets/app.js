const SELECTORS = {
  navToggle: '.nav-toggle',
  mobileNav: '.mobile-nav',
  playButton: '[data-play-button]',
  player: '#movie-player',
  filterScope: '[data-filter-scope]',
  cardList: '[data-card-list]',
  searchResults: '[data-search-results]',
  searchStatus: '[data-search-status]',
  rankTable: '[data-rank-table]'
};

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function setupNavigation() {
  const button = document.querySelector(SELECTORS.navToggle);
  const menu = document.querySelector(SELECTORS.mobileNav);

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

async function initializeHlsPlayer(video, sourceUrl) {
  if (!video || !sourceUrl) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
    await video.play().catch(() => {});
    return;
  }

  try {
    const hlsModule = await import('./hls-dru42stk.js');
    const Hls = hlsModule.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return;
    }
  } catch (error) {
    console.warn('HLS 初始化失败，尝试直接绑定播放源。', error);
  }

  video.src = sourceUrl;
  await video.play().catch(() => {});
}

function setupPlayer() {
  const video = document.querySelector(SELECTORS.player);
  const button = document.querySelector(SELECTORS.playButton);

  if (!video || !button) {
    return;
  }

  button.addEventListener('click', async () => {
    button.classList.add('is-hidden');
    await initializeHlsPlayer(video, video.dataset.src);
  });
}

function setupCategoryFilters() {
  const scope = document.querySelector(SELECTORS.filterScope);

  if (!scope) {
    return;
  }

  const input = scope.querySelector('[data-filter-text]');
  const yearSelect = scope.querySelector('[data-filter-year]');
  const sortSelect = scope.querySelector('[data-sort-mode]');
  const list = document.querySelector(SELECTORS.cardList);

  if (!list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll('.movie-card'));

  function applyFilters() {
    const keyword = normalizeText(input && input.value);
    const year = yearSelect ? yearSelect.value : '';

    cards.forEach((card) => {
      const text = normalizeText(card.textContent);
      const cardYear = (card.querySelector('.year-badge') || {}).textContent || '';
      const visibleByKeyword = !keyword || text.includes(keyword);
      const visibleByYear = !year || cardYear.includes(year);
      card.classList.toggle('is-hidden-card', !(visibleByKeyword && visibleByYear));
    });

    const mode = sortSelect ? sortSelect.value : 'year-desc';
    const sortedCards = cards.slice().sort((a, b) => {
      const yearA = Number((a.querySelector('.year-badge') || {}).textContent || 0);
      const yearB = Number((b.querySelector('.year-badge') || {}).textContent || 0);
      const titleA = normalizeText((a.querySelector('h3') || {}).textContent);
      const titleB = normalizeText((b.querySelector('h3') || {}).textContent);

      if (mode === 'year-asc') {
        return yearA - yearB || titleA.localeCompare(titleB, 'zh-CN');
      }

      if (mode === 'title-asc') {
        return titleA.localeCompare(titleB, 'zh-CN');
      }

      return yearB - yearA || titleA.localeCompare(titleB, 'zh-CN');
    });

    sortedCards.forEach((card) => list.appendChild(card));
  }

  [input, yearSelect, sortSelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
}

function cardTemplate(movie) {
  const tags = (movie.tags || '').split(/[,，/、\s]+/).filter(Boolean).slice(0, 3);
  const tagHtml = tags.map((tag) => `<span>${tag}</span>`).join('');

  return `
    <article class="movie-card">
      <a class="poster-link" href="${movie.url}" aria-label="查看 ${movie.title}">
        <img src="${movie.image}" alt="${movie.title}" loading="lazy">
        <span class="year-badge">${movie.year}</span>
        <span class="type-badge">${movie.type}</span>
      </a>
      <div class="movie-card-body">
        <h3><a href="${movie.url}">${movie.title}</a></h3>
        <p class="movie-meta">${movie.region} · ${movie.genre}</p>
        <p class="movie-line">${movie.oneLine}</p>
        <div class="tag-row">${tagHtml}</div>
      </div>
    </article>`;
}

function setupSearchPage() {
  const params = new URLSearchParams(window.location.search);
  const query = normalizeText(params.get('q'));
  const resultsNode = document.querySelector(SELECTORS.searchResults);
  const statusNode = document.querySelector(SELECTORS.searchStatus);

  if (!resultsNode || !statusNode || !window.MOVIE_INDEX || !query) {
    return;
  }

  const results = window.MOVIE_INDEX.filter((movie) => {
    return normalizeText([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.tags,
      movie.oneLine
    ].join(' ')).includes(query);
  });

  statusNode.innerHTML = `
    <h2>搜索结果：“${params.get('q')}”</h2>
    <p>找到 ${results.length} 部相关影片。</p>`;
  resultsNode.innerHTML = results.slice(0, 300).map(cardTemplate).join('');

  if (results.length > 300) {
    statusNode.innerHTML += '<p>结果较多，当前显示前 300 部，可继续输入更精确关键词筛选。</p>';
  }
}

function setupRankTable() {
  const table = document.querySelector(SELECTORS.rankTable);
  const input = document.querySelector('[data-rank-search]');
  const sort = document.querySelector('[data-rank-sort]');

  if (!table) {
    return;
  }

  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));

  function applyRankFilter() {
    const keyword = normalizeText(input && input.value);
    const mode = sort ? sort.value : 'score';

    rows.forEach((row) => {
      const text = normalizeText(row.dataset.keywords || row.textContent);
      row.classList.toggle('is-hidden-card', keyword && !text.includes(keyword));
    });

    const sortedRows = rows.slice().sort((a, b) => {
      const rankA = Number((a.querySelector('.table-rank') || {}).textContent || 0);
      const rankB = Number((b.querySelector('.table-rank') || {}).textContent || 0);
      const yearA = Number(a.dataset.year || 0);
      const yearB = Number(b.dataset.year || 0);

      if (mode === 'year-desc') {
        return yearB - yearA || rankA - rankB;
      }

      if (mode === 'year-asc') {
        return yearA - yearB || rankA - rankB;
      }

      return rankA - rankB;
    });

    sortedRows.forEach((row) => tbody.appendChild(row));
  }

  [input, sort].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyRankFilter);
      control.addEventListener('change', applyRankFilter);
    }
  });
}

setupNavigation();
setupPlayer();
setupCategoryFilters();
setupSearchPage();
setupRankTable();
