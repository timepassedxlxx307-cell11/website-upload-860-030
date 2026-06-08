(function () {
  var toggles = document.querySelectorAll('.mobile-nav-toggle');
  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var menu = document.querySelector('.mobile-menu');
      var opened = menu && menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filters = document.querySelectorAll('[data-catalog-filter]');
  filters.forEach(function (filter) {
    var target = filter.getAttribute('data-filter-target') || '[data-card]';
    var cards = Array.prototype.slice.call(document.querySelectorAll(target));
    var queryInput = filter.querySelector('[data-filter-query]');
    var yearInput = filter.querySelector('[data-filter-year]');
    var regionInput = filter.querySelector('[data-filter-region]');
    var categoryInput = filter.querySelector('[data-filter-category]');
    var apply = function () {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var year = yearInput ? yearInput.value : '';
      var region = regionInput ? regionInput.value : '';
      var category = categoryInput ? categoryInput.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-category') || ''
        ].join(' ').toLowerCase();
        var visible = true;
        if (query && haystack.indexOf(query) === -1) {
          visible = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          visible = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          visible = false;
        }
        if (category && card.getAttribute('data-category') !== category) {
          visible = false;
        }
        card.classList.toggle('is-hidden', !visible);
      });
    };
    [queryInput, yearInput, regionInput, categoryInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });
    var params = new URLSearchParams(window.location.search);
    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }
    apply();
  });
})();
