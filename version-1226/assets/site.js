(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setSlide(activeSlide + 1);
        }, 5200);
    }

    var pageSearch = document.querySelector('[data-page-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(pageSearch ? pageSearch.value : '');
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var type = normalize(card.getAttribute('data-type'));
            var region = normalize(card.getAttribute('data-region'));
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesFilter = activeFilter === 'all' || type === activeFilter || region === activeFilter;
            var visible = matchesKeyword && matchesFilter;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.style.display = shown ? 'none' : 'block';
        }
    }

    if (pageSearch) {
        pageSearch.addEventListener('input', filterCards);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial) {
            pageSearch.value = initial;
        }
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = normalize(chip.getAttribute('data-filter-chip'));
            chips.forEach(function (item) {
                item.classList.toggle('is-active', item === chip);
            });
            filterCards();
        });
    });

    filterCards();
})();
