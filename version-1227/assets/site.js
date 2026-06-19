import { H as Hls } from "./hls.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initNavigation() {
    const toggle = $('[data-nav-toggle]');
    const links = $('[data-nav-links]');

    if (!toggle || !links) {
        return;
    }

    toggle.addEventListener('click', () => {
        links.classList.toggle('is-open');
    });
}

function initHero() {
    const hero = $('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    const start = () => {
        if (timer || slides.length <= 1) {
            return;
        }

        timer = window.setInterval(() => {
            show(index + 1);
        }, 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            show(dotIndex);
            stop();
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
}

function initFiltering() {
    $$('[data-filter-root]').forEach((root) => {
        const input = $('[data-search-input]', root);
        const yearSelect = $('[data-year-filter]', root);
        const regionSelect = $('[data-region-filter]', root);
        const typeSelect = $('[data-type-filter]', root);
        const cards = $$('[data-card]', root);
        const count = $('[data-result-count]', root);
        const noResults = $('[data-no-results]', root);

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        const apply = () => {
            const q = normalize(input ? input.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            const region = normalize(regionSelect ? regionSelect.value : '');
            const type = normalize(typeSelect ? typeSelect.value : '');
            let visible = 0;

            cards.forEach((card) => {
                const text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre
                ].join(' '));

                const matchesQuery = !q || text.includes(q);
                const matchesYear = !year || normalize(card.dataset.year).includes(year);
                const matchesRegion = !region || normalize(card.dataset.region).includes(region);
                const matchesType = !type || normalize(card.dataset.genre).includes(type) || text.includes(type);
                const match = matchesQuery && matchesYear && matchesRegion && matchesType;

                card.style.display = match ? '' : 'none';

                if (match) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `当前显示 ${visible} / ${cards.length} 部影片`;
            }

            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        };

        [input, yearSelect, regionSelect, typeSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
}

function initPlayer() {
    const video = $('[data-video-player]');
    const button = $('[data-player-start]');

    if (!video || !button) {
        return;
    }

    const source = video.dataset.playSource;
    let hls = null;
    let started = false;

    const play = async () => {
        if (!source) {
            button.textContent = '暂无可用播放源';
            return;
        }

        if (!started) {
            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        button.hidden = true;
        video.controls = true;

        try {
            await video.play();
        } catch (error) {
            button.hidden = false;
            button.innerHTML = '<span>▶</span>';
        }
    };

    button.addEventListener('click', play);

    window.addEventListener('pagehide', () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

initNavigation();
initHero();
initFiltering();
initPlayer();
