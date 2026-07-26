/* ==========================================================
   Labib Center — App JS
   - imgFallback: vanilla, harus tersedia sedini mungkin
   - jQuery module: filter, modal, carousel, dsb (butuh jQuery + Bootstrap)
   ========================================================== */

/* ---------- Global image fallback (vanilla, no jQuery) ---------- */
window.imgFallback = function (img) {
  if (!img || img.dataset.fbApplied) return;
  img.dataset.fbApplied = '1';
  img.onerror = null;
  var w = parseInt(img.getAttribute('width'), 10) || img.clientWidth || 400;
  var h = parseInt(img.getAttribute('height'), 10) || img.clientHeight || 300;
  var label = (img.getAttribute('alt') || 'Labib Center').replace(/[<>&]/g, '').substring(0, 46);
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice">' +
      '<defs>' +
        '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#EC4899"/>' +
          '<stop offset="25%" stop-color="#FB923C"/>' +
          '<stop offset="50%" stop-color="#FACC15"/>' +
          '<stop offset="75%" stop-color="#22D3EE"/>' +
          '<stop offset="100%" stop-color="#1A2668"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="100%" height="100%" fill="#F8FAFC"/>' +
      '<rect width="100%" height="8" fill="url(#g)"/>' +
      '<g transform="translate(' + (w / 2) + ' ' + (h / 2 - 12) + ')">' +
        '<circle r="30" fill="none" stroke="url(#g)" stroke-width="7"/>' +
        '<text text-anchor="middle" dominant-baseline="central" fill="#1A2668" font-family="Poppins,Arial,sans-serif" font-size="22" font-weight="800">L</text>' +
      '</g>' +
      '<text x="50%" y="' + (h - 24) + '" text-anchor="middle" fill="#1A2668" font-family="Poppins,Arial,sans-serif" font-size="13" font-weight="600">Labib Center</text>' +
      '<text x="50%" y="' + (h - 8) + '" text-anchor="middle" fill="#7A7A7A" font-family="Poppins,Arial,sans-serif" font-size="10">' + label + '</text>' +
    '</svg>';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

/* ---------- App logic (needs jQuery + Bootstrap) ----------
   Wrapped in DOMContentLoaded so app.js can be loaded from <head>
   before jQuery — the handler only runs after body scripts (jQuery
   + Bootstrap) have loaded. */
document.addEventListener('DOMContentLoaded', function () {
  jQuery(function ($) {
  var $items = $('.catalog-item');
  var $win = $(window);
  var $navbar = $('.navbar');
  var $backToTop = $('#backToTop');

  function onScroll() {
    var y = $win.scrollTop();
    $navbar.toggleClass('scrolled', y > 20);
    $backToTop.toggleClass('visible', y > 400);
  }
  $win.on('scroll', onScroll);
  onScroll();

  function syncNavPadding() {
    document.body.style.paddingTop = $navbar.outerHeight() + 'px';
  }
  syncNavPadding();
  $win.on('resize', syncNavPadding);

  $backToTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 400);
  });

  // Auto-close mobile/tablet navbar after a menu link is tapped
  $('#mainNav .nav-link').on('click', function () {
    var nav = document.getElementById('mainNav');
    if (nav && nav.classList.contains('show')) {
      var inst = bootstrap.Collapse.getInstance(nav) || new bootstrap.Collapse(nav, { toggle: false });
      inst.hide();
    }
  });

  // ============ Rupiah formatter ============
  function formatRp(n) {
    if (n == null || isNaN(n)) return '';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  }
  function formatRpNumber(n) {
    if (n == null || isNaN(n)) return '';
    return Number(n).toLocaleString('id-ID');
  }

  // ============ Filter state ============
  var state = { category: 'all', format: 'all', minPrice: null, maxPrice: null, search: '' };

  // ============ Populate price + inject promo ribbon on cards ============
  var promoRibbonSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
  $items.each(function () {
    var $c = $(this);
    var price = parseInt($c.attr('data-price'), 10);
    var originalPrice = parseInt($c.attr('data-original-price'), 10);
    var $priceWrap = $c.find('.cc-price').empty();
    $priceWrap.append('<span class="cc-price-new">' + formatRp(price) + '</span>');
    if (!isNaN(originalPrice) && originalPrice > price) {
      var off = Math.round((originalPrice - price) / originalPrice * 100);
      $priceWrap.append('<span class="cc-price-old">' + formatRp(originalPrice) + '</span>');
      // Inject promo ribbon on the card image
      var $imgWrap = $c.find('.card-img-wrap');
      if (!$imgWrap.find('.card-promo-ribbon').length) {
        $imgWrap.append(
          '<span class="card-promo-ribbon" aria-label="Promo diskon ' + off + ' persen">' +
            promoRibbonSVG + 'HEMAT ' + off + '%' +
          '</span>'
        );
      }
    }
  });

  // ============ Filter application (with fade transition) ============
  var filterAnimTimer;
  function applyFilters() {
    var visible = 0;
    var matches = [];
    var s = state.search.toLowerCase().trim();

    $items.each(function () {
      var $c = $(this);
      var price = parseInt($c.attr('data-price'), 10) || 0;
      var okCat = state.category === 'all' || $c.data('category') === state.category;
      var okFmt = state.format === 'all' || $c.data('format') === state.format;
      var okMin = state.minPrice == null || price >= state.minPrice;
      var okMax = state.maxPrice == null || price <= state.maxPrice;
      var okQ = !s || String($c.data('search')).toLowerCase().indexOf(s) !== -1;
      var show = okCat && okFmt && okMin && okMax && okQ;
      matches.push({ el: this, show: show });
      if (show) visible++;
    });

    // Phase 1: fade out currently visible cards
    matches.forEach(function (m) {
      if (m.el.style.display !== 'none') {
        m.el.classList.add('is-out');
        m.el.classList.remove('is-in');
      }
    });

    clearTimeout(filterAnimTimer);
    filterAnimTimer = setTimeout(function () {
      var revealIdx = 0;
      matches.forEach(function (m) {
        m.el.classList.remove('is-out', 'is-in');
        m.el.style.animationDelay = '';
        if (m.show) {
          m.el.style.display = '';
          void m.el.offsetWidth;
          m.el.style.animationDelay = (revealIdx * 40) + 'ms';
          m.el.classList.add('is-in');
          revealIdx++;
        } else {
          m.el.style.display = 'none';
        }
      });
      $('#emptyState').toggle(visible === 0);
      $('#resultCount').text(visible);
    }, 240);
  }

  // ============ Active filter badge ============
  function updateFilterBadge() {
    var count = 0;
    if (state.category !== 'all') count++;
    if (state.format !== 'all') count++;
    if (state.minPrice != null || state.maxPrice != null) count++;
    var $badge = $('#filterBadge');
    if (count > 0) $badge.text(count).addClass('is-visible');
    else $badge.removeClass('is-visible');
  }

  // ============ Search input + clear button ============
  $('#searchInput').on('input', function () {
    state.search = this.value || '';
    $('#searchClear').toggleClass('is-visible', !!state.search);
    applyFilters();
  });
  $('#searchClear').on('click', function () {
    $('#searchInput').val('').trigger('input').focus();
  });

  // ============ Filter modal — chip clicks (visual selection only) ============
  $('.filter-chip').on('click', function () {
    var $chip = $(this);
    var type = $chip.data('filter-type');
    $('.filter-chip[data-filter-type="' + type + '"]').removeClass('active');
    $chip.addClass('active');
  });

  // ============ Apply filters button (commits modal state) ============
  $('#filterApply').on('click', function () {
    state.category = $('.filter-chip[data-filter-type="category"].active').data('category') || 'all';
    state.format = $('.filter-chip[data-filter-type="format"].active').data('format') || 'all';
    var minV = $('#priceMin').val();
    var maxV = $('#priceMax').val();
    state.minPrice = minV !== '' ? parseInt(minV, 10) : null;
    state.maxPrice = maxV !== '' ? parseInt(maxV, 10) : null;
    // Guard: if min > max, swap silently
    if (state.minPrice != null && state.maxPrice != null && state.minPrice > state.maxPrice) {
      var t = state.minPrice; state.minPrice = state.maxPrice; state.maxPrice = t;
      $('#priceMin').val(state.minPrice);
      $('#priceMax').val(state.maxPrice);
    }
    updateFilterBadge();
    applyFilters();
  });

  // ============ Reset button ============
  $('#filterReset').on('click', function () {
    state.category = 'all';
    state.format = 'all';
    state.minPrice = null;
    state.maxPrice = null;
    $('.filter-chip').removeClass('active');
    $('.filter-chip[data-category="all"]').addClass('active');
    $('.filter-chip[data-format="all"]').addClass('active');
    $('#priceMin, #priceMax').val('');
    updateFilterBadge();
    applyFilters();
  });

  function escapeAttr(s) {
    return String(s).replace(/[&"<>]/g, function (c) {
      return { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  $items.on('click', function () {
    var $c = $(this);
    var title = $c.data('title');
    var desc = $c.data('description');
    var format = ($c.data('format') || '').toString();
    var category = $c.data('category');
    var drive = $c.data('drive');
    var price = parseInt($c.attr('data-price'), 10);
    var originalPrice = parseInt($c.attr('data-original-price'), 10);
    $('#modalPrice').text(formatRpNumber(price));
    var $meta = $('#modalPriceMeta');
    if (!isNaN(originalPrice) && originalPrice > price) {
      var off = Math.round((originalPrice - price) / originalPrice * 100);
      $('#modalPriceOld').text(formatRp(originalPrice));
      $('#modalPriceOff').text('HEMAT ' + off + '%');
      $meta.addClass('is-visible');
    } else {
      $meta.removeClass('is-visible');
    }

    var images;
    try { images = JSON.parse($c.attr('data-images') || '[]'); } catch (e) { images = []; }
    if (!images.length) images = ['data:,'];

    var $carousel = $('#modalCarousel');
    var $inner = $('#modalCarouselInner').empty();
    var $ind = $('#modalCarouselIndicators').empty();

    images.forEach(function (url, i) {
      var isActive = i === 0 ? ' active' : '';
      $inner.append(
        '<div class="carousel-item' + isActive + '">' +
          '<img src="' + escapeAttr(url) + '" alt="' + escapeAttr(title) + ' — preview ' + (i + 1) + '" ' +
               'width="1000" height="750" loading="lazy" onerror="imgFallback(this)">' +
        '</div>'
      );
      $ind.append(
        '<button type="button" data-bs-target="#modalCarousel" data-bs-slide-to="' + i + '"' +
          (i === 0 ? ' class="active" aria-current="true"' : '') +
          ' aria-label="Slide ' + (i + 1) + '"></button>'
      );
    });

    $carousel.toggleClass('single', images.length <= 1);
    var carouselInstance = bootstrap.Carousel.getInstance($carousel[0]);
    if (carouselInstance) carouselInstance.dispose();
    bootstrap.Carousel.getOrCreateInstance($carousel[0], { interval: false, ride: false, touch: true });

    $('#modalTitle').text(title);
    $('#modalDesc').text(desc);
    $('#modalCategory').text(category);
    $('#modalImgCount').text(images.length);

    var $mf = $('#modalFormat');
    $mf.removeClass('cdr psd').addClass(format.toLowerCase());
    $('#modalFormatText').text(format);

    $('#modalDrive').attr('href', drive);
    var waMsg = encodeURIComponent('Halo Labib Center, saya tertarik dengan template: ' + title);
    $('#modalWA').attr('href', 'https://wa.me/TODO_WA_NUMBER?text=' + waMsg);

    bootstrap.Modal.getOrCreateInstance(document.getElementById('previewModal')).show();
  });

  // Reset scroll position of preview modal content each time it opens.
  // Must run on `shown.bs.modal` (after transition + layout) — running on
  // `show.bs.modal` is a no-op because the browser restores scroll offset
  // once the modal becomes visible again.
  (function () {
    var previewModalEl = document.getElementById('previewModal');
    if (!previewModalEl) return;
    var resetScroll = function () {
      previewModalEl.querySelectorAll('.modal-info, .modal-body, .modal-content').forEach(function (el) {
        el.scrollTop = 0;
      });
    };
    previewModalEl.addEventListener('show.bs.modal', resetScroll);
    previewModalEl.addEventListener('shown.bs.modal', resetScroll);
  })();

  $(document).on('keydown', function (e) {
    if (!$('#previewModal').hasClass('show')) return;
    var $carousel = $('#modalCarousel');
    if ($carousel.hasClass('single')) return;
    var inst = bootstrap.Carousel.getInstance($carousel[0]);
    if (!inst) return;
    if (e.key === 'ArrowLeft') inst.prev();
    else if (e.key === 'ArrowRight') inst.next();
  });

  // ============ Testimoni carousel (autoplay + prev/next + dots) ============
  (function initTestimoniCarousel() {
    var $carousel = $('.testimoni-carousel');
    if (!$carousel.length) return;

    var $track = $carousel.find('.testimoni-track');
    var $cards = $track.children('.testimoni-card');
    if (!$cards.length) return;

    var $prev = $carousel.find('.tc-nav-prev');
    var $next = $carousel.find('.tc-nav-next');
    var $dotsWrap = $carousel.find('.tc-dots');
    var $toggle = $carousel.find('.tc-autoplay-toggle');
    var $iconPause = $toggle.find('.ap-icon-pause');
    var $iconPlay = $toggle.find('.ap-icon-play');
    var $label = $toggle.find('.ap-label');

    var interval = parseInt($carousel.attr('data-autoplay-interval'), 10) || 4000;
    var timer = null;
    var isPaused = false;
    var currentIndex = 0;   // index kartu paling kiri yg terlihat (0..maxIndex)

    function getPerPage() {
      var w = window.innerWidth;
      if (w < 576) return 1;
      if (w < 992) return 2;
      return 3;
    }
    function maxIndex() {
      return Math.max(0, $cards.length - getPerPage());
    }
    function totalPositions() {
      return maxIndex() + 1;
    }

    function goTo(idx, animate) {
      var mx = maxIndex();
      // Wrap: setelah kartu terakhir kembali ke posisi 0, sebaliknya lompat ke posisi terakhir
      if (idx > mx) currentIndex = 0;
      else if (idx < 0) currentIndex = mx;
      else currentIndex = idx;

      var trackWidth = $track[0].scrollWidth;
      var viewportWidth = $carousel.find('.testimoni-viewport')[0].clientWidth;
      var cardW = $cards[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle($track[0]).columnGap || getComputedStyle($track[0]).gap) || 0;
      var maxShift = Math.max(0, trackWidth - viewportWidth);
      var offset = Math.min((cardW + gap) * currentIndex, maxShift);

      $track.css({
        transition: animate === false ? 'none' : '',
        transform: 'translateX(' + (-offset) + 'px)'
      });
      if (animate === false) {
        void $track[0].offsetWidth;
        setTimeout(function () { $track.css('transition', ''); }, 0);
      }
      renderDots();
    }

    function renderDots() {
      var tp = totalPositions();
      var html = '';
      for (var i = 0; i < tp; i++) {
        html += '<button type="button" data-page="' + i + '"' +
                (i === currentIndex ? ' class="active" aria-current="true"' : '') +
                ' aria-label="Ke kartu ' + (i + 1) + '"></button>';
      }
      $dotsWrap.html(html);
    }

    function next() { goTo(currentIndex + 1); }
    function prev() { goTo(currentIndex - 1); }

    function startAutoplay() {
      stopAutoplay();
      if (isPaused) return;
      timer = setInterval(next, interval);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function setPaused(paused) {
      isPaused = paused;
      $toggle.attr('aria-pressed', String(paused));
      $iconPause.toggle(!paused);
      $iconPlay.toggle(paused);
      $label.text(paused ? 'Auto-play jeda' : 'Auto-play aktif');
      if (paused) stopAutoplay();
      else startAutoplay();
    }

    // Event bindings
    $prev.on('click', function () { prev(); startAutoplay(); });
    $next.on('click', function () { next(); startAutoplay(); });
    $dotsWrap.on('click', 'button', function () {
      goTo(parseInt(this.getAttribute('data-page'), 10));
      startAutoplay();
    });
    $toggle.on('click', function () { setPaused(!isPaused); });

    // Pause autoplay on hover / focus inside
    $carousel.on('mouseenter', stopAutoplay);
    $carousel.on('mouseleave', function () { if (!isPaused) startAutoplay(); });
    $carousel.on('focusin', stopAutoplay);
    $carousel.on('focusout', function () { if (!isPaused) startAutoplay(); });

    // Pause when tab hidden (save battery)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoplay();
      else if (!isPaused) startAutoplay();
    });

    // Touch swipe support
    var touchStartX = null, touchStartY = null;
    $carousel.on('touchstart', function (e) {
      touchStartX = e.originalEvent.touches[0].clientX;
      touchStartY = e.originalEvent.touches[0].clientY;
    });
    $carousel.on('touchend', function (e) {
      if (touchStartX == null) return;
      var dx = e.originalEvent.changedTouches[0].clientX - touchStartX;
      var dy = e.originalEvent.changedTouches[0].clientY - touchStartY;
      // Only trigger swipe if horizontal movement dominant + significant
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else prev();
        startAutoplay();
      }
      touchStartX = touchStartY = null;
    });

    // Recalc on resize (clamp currentIndex to new maxIndex)
    var resizeTimer;
    $(window).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var mx = maxIndex();
        if (currentIndex > mx) currentIndex = mx;
        goTo(currentIndex, false);
      }, 120);
    });

    // Initial render
    goTo(0, false);
    setPaused(false); // starts autoplay
  })();

  // ============ Testimoni lightbox ============
  var AVATAR_COLORS = {
    'a-cyan':    '#0891B2',
    'a-magenta': '#EC4899',
    'a-blue':    '#2E3ED6',
    'a-orange':  '#EA580C',
    'a-violet':  '#7C3AED',
    'a-navy':    '#1A2668'
  };

  $('.tc-screenshot').on('click keydown', function (e) {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    if (e.type === 'keydown') e.preventDefault();
    var $trigger = $(this);
    var full = $trigger.attr('data-full');
    if (!full) return;

    var $card = $trigger.closest('.testimoni-card');
    var $srcAvatar = $card.find('.tc-avatar');
    var name = $card.find('.tc-author-info strong').text().trim();
    var role = $card.find('.tc-author-info span').text().trim();
    var avatarText = $srcAvatar.text().trim();
    var starsText = $card.find('.tc-stars').text() || '★★★★★';
    var alt = $trigger.find('img').attr('alt') || (name + ' - screenshot chat');

    // Pick matching avatar color class
    var colorKey = 'a-navy';
    for (var k in AVATAR_COLORS) {
      if ($srcAvatar.hasClass(k)) { colorKey = k; break; }
    }

    $('#testimoniModalName').text(name || 'Customer');
    $('#testimoniModalRole').text(role || '');
    $('#testimoniModalStars').text(starsText);
    $('#testimoniModalAvatar')
      .text(avatarText)
      .css('background', AVATAR_COLORS[colorKey]);

    var imgEl = document.getElementById('testimoniModalImg');
    delete imgEl.dataset.fbApplied;
    imgEl.onerror = function () { window.imgFallback(imgEl); };
    imgEl.alt = alt;
    imgEl.src = full;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('testimoniModal')).show();
  });

  $('#year').text(new Date().getFullYear());
  });
});
