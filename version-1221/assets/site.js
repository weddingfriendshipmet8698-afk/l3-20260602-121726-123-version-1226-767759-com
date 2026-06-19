(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    var prevButton = document.querySelector('[data-hero-prev]');
    var nextButton = document.querySelector('[data-hero-next]');

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(current - 1);
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(current + 1);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var searchInput = document.querySelector('[data-filter-search]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var emptyState = document.querySelector('.empty-state');

    function applyFilters() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var cardType = card.getAttribute('data-type') || '';
            var matched = (!keyword || title.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });
    }

    [searchInput, yearSelect, typeSelect].forEach(function (element) {
        if (element) {
            element.addEventListener('input', applyFilters);
            element.addEventListener('change', applyFilters);
        }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && searchInput) {
        searchInput.value = query;
        applyFilters();
    }
}());
