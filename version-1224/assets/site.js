(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    var regionSelect = document.querySelector('[data-region-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

    var applyFilters = function () {
        if (!cards.length) {
            return;
        }
        var query = searchInputs.map(function (input) {
            return input.value.trim().toLowerCase();
        }).filter(Boolean).pop() || '';
        var region = regionSelect ? regionSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search-card') || '').toLowerCase();
            var cardRegion = card.getAttribute('data-region') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var matched = true;
            if (query && text.indexOf(query) === -1) {
                matched = false;
            }
            if (region && cardRegion !== region) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            card.classList.toggle('hidden-card', !matched);
        });
    };

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });
    if (regionSelect) {
        regionSelect.addEventListener('change', applyFilters);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }
})();
